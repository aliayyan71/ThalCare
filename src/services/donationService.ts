import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { getCompatibleRedCellDonors } from '../constants/bloodCompatibility';
import { DonationRequest, DonationResponse, DonorResponseStatus } from '../types/donation';
import { findCompatibleDonors } from './profileService';

const requestsCollection = 'donationRequests';
const responsesCollection = 'responses';
const contactGrantsCollection = 'donationContactGrants';

export class DonationRequestAlreadyOpenError extends Error {
  constructor() {
    super('You already have an open request for this blood group.');
    this.name = 'DonationRequestAlreadyOpenError';
  }
}

function requireFirestore() {
  if (!firestore) throw new Error('Firestore is not configured. Check your Firebase setup.');
  return firestore;
}

function toDonationRequest(id: string, value: unknown): DonationRequest | null {
  if (!value || typeof value !== 'object') return null;
  const request = value as Partial<DonationRequest>;
  return typeof request.patientId === 'string'
    && typeof request.requestedBloodGroup === 'string'
    && Array.isArray(request.compatibleDonorGroups)
    && (request.status === 'open' || request.status === 'cancelled')
    ? { id, patientId: request.patientId, requestedBloodGroup: request.requestedBloodGroup, compatibleDonorGroups: request.compatibleDonorGroups, status: request.status }
    : null;
}

function toDonationResponse(value: unknown): DonationResponse | null {
  if (!value || typeof value !== 'object') return null;
  const response = value as Partial<DonationResponse>;
  return typeof response.donorId === 'string' && (response.response === 'accepted' || response.response === 'declined')
    ? { donorId: response.donorId, response: response.response }
    : null;
}

function requestDocumentId(patientId: string, requestedBloodGroup: string) {
  return `${patientId}_${requestedBloodGroup.replace('+', 'plus').replace('-', 'minus')}`;
}

export async function createDonationRequest(patientId: string, requestedBloodGroup: string): Promise<{ requestId: string; availableDonorCount: number }> {
  const db = requireFirestore();
  const compatibleDonorGroups = getCompatibleRedCellDonors(requestedBloodGroup);
  if (compatibleDonorGroups.length === 0) throw new Error('Choose a valid blood group.');

  const donors = await findCompatibleDonors(requestedBloodGroup);
  const requestRef = doc(db, requestsCollection, requestDocumentId(patientId, requestedBloodGroup));
  await runTransaction(db, async (transaction) => {
    const existingRequest = await transaction.get(requestRef);
    if (existingRequest.exists() && existingRequest.data().status === 'open') {
      throw new DonationRequestAlreadyOpenError();
    }

    transaction.set(requestRef, {
      patientId,
      requestedBloodGroup,
      compatibleDonorGroups,
      visibleToDonorGroups: compatibleDonorGroups,
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  return { requestId: requestRef.id, availableDonorCount: donors.filter((donor) => donor.isAvailable).length };
}

export async function getOpenDonationRequest(patientId: string, requestedBloodGroup: string): Promise<DonationRequest | null> {
  const db = requireFirestore();
  const snapshot = await getDoc(doc(db, requestsCollection, requestDocumentId(patientId, requestedBloodGroup)));
  const request = snapshot.exists() ? toDonationRequest(snapshot.id, snapshot.data()) : null;
  return request?.status === 'open' ? request : null;
}

export async function getPatientDonationRequests(patientId: string): Promise<DonationRequest[]> {
  const db = requireFirestore();
  const requests = await getDocs(query(collection(db, requestsCollection), where('patientId', '==', patientId), limit(20)));
  return requests.docs.flatMap((request) => {
    const result = toDonationRequest(request.id, request.data());
    return result ? [result] : [];
  });
}

export function subscribeToPatientDonationRequests(
  patientId: string,
  onChange: (requests: DonationRequest[]) => void,
  onError: () => void,
) {
  const db = requireFirestore();
  return onSnapshot(
    query(collection(db, requestsCollection), where('patientId', '==', patientId), limit(20)),
    (snapshot) => onChange(snapshot.docs.flatMap((request) => {
      const result = toDonationRequest(request.id, request.data());
      return result ? [result] : [];
    })),
    onError,
  );
}

export async function getDonorDonationRequests(donorBloodGroup: string): Promise<DonationRequest[]> {
  const db = requireFirestore();
  const requests = await getDocs(query(
    collection(db, requestsCollection),
    where('visibleToDonorGroups', 'array-contains', donorBloodGroup),
    where('status', '==', 'open'),
    limit(20),
  ));
  return requests.docs.flatMap((request) => {
    const result = toDonationRequest(request.id, request.data());
    return result ? [result] : [];
  });
}

export function subscribeToDonorDonationRequests(
  donorBloodGroup: string,
  onChange: (requests: DonationRequest[]) => void,
  onError: () => void,
) {
  const db = requireFirestore();
  return onSnapshot(
    query(
      collection(db, requestsCollection),
      where('visibleToDonorGroups', 'array-contains', donorBloodGroup),
      where('status', '==', 'open'),
      limit(20),
    ),
    (snapshot) => onChange(snapshot.docs.flatMap((request) => {
      const result = toDonationRequest(request.id, request.data());
      return result ? [result] : [];
    })),
    onError,
  );
}

export async function getDonationResponses(requestId: string): Promise<DonationResponse[]> {
  const db = requireFirestore();
  const responses = await getDocs(collection(db, requestsCollection, requestId, responsesCollection));
  return responses.docs.flatMap((response) => {
    const result = toDonationResponse(response.data());
    return result ? [result] : [];
  });
}

export function subscribeToDonationResponses(
  requestId: string,
  onChange: (responses: DonationResponse[]) => void,
  onError: () => void,
) {
  const db = requireFirestore();
  return onSnapshot(
    collection(db, requestsCollection, requestId, responsesCollection),
    (snapshot) => onChange(snapshot.docs.flatMap((response) => {
      const result = toDonationResponse(response.data());
      return result ? [result] : [];
    })),
    onError,
  );
}

export async function getDonorDonationResponse(requestId: string, donorId: string): Promise<DonationResponse | null> {
  const db = requireFirestore();
  const response = await getDoc(doc(db, requestsCollection, requestId, responsesCollection, donorId));
  return response.exists() ? toDonationResponse(response.data()) : null;
}

export async function getApprovedDonorContact(patientId: string, donorId: string): Promise<{ donorId: string; phoneNumber: string } | null> {
  const db = requireFirestore();
  const snapshot = await getDoc(doc(db, contactGrantsCollection, `${patientId}_${donorId}`));
  if (!snapshot.exists()) return null;

  const grant = snapshot.data() as { donorId?: unknown; phoneNumber?: unknown };
  return grant.donorId === donorId && typeof grant.phoneNumber === 'string'
    ? { donorId, phoneNumber: grant.phoneNumber }
    : null;
}

export async function respondToDonationRequest(requestId: string, donorId: string, response: DonorResponseStatus): Promise<void> {
  const db = requireFirestore();
  const requestRef = doc(db, requestsCollection, requestId);
  const requestSnapshot = await getDoc(requestRef);
  const request = requestSnapshot.exists() ? toDonationRequest(requestSnapshot.id, requestSnapshot.data()) : null;
  if (!request) throw new Error('This donation request is no longer available.');

  const donorProfileSnapshot = await getDoc(doc(db, 'profiles', donorId));
  const donorProfile = donorProfileSnapshot.exists()
    ? donorProfileSnapshot.data() as { accountType?: unknown; phoneNumber?: unknown }
    : null;
  if (donorProfile?.accountType !== 'donor' || typeof donorProfile.phoneNumber !== 'string') {
    throw new Error('Your donor contact details are unavailable.');
  }

  const batch = writeBatch(db);
  batch.set(doc(requestRef, responsesCollection, donorId), {
    donorId,
    response,
    respondedAt: serverTimestamp(),
  });
  const grantRef = doc(db, contactGrantsCollection, `${request.patientId}_${donorId}`);
  if (response === 'accepted') {
    batch.set(grantRef, {
      patientId: request.patientId,
      donorId,
      requestId,
      phoneNumber: donorProfile.phoneNumber,
      createdAt: serverTimestamp(),
    });
  } else {
    const existingGrant = await getDoc(grantRef);
    if (existingGrant.exists()) batch.delete(grantRef);
  }
  await batch.commit();
}

export async function cancelDonationRequest(requestId: string): Promise<void> {
  const db = requireFirestore();
  await deleteDoc(doc(db, requestsCollection, requestId));
}
