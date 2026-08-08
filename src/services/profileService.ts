import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { getCompatibleRedCellDonors } from '../constants/bloodCompatibility';
import { DonorDirectoryEntry, UserProfile } from '../types/profile';

const profileKey = (uid: string) => `@thalcare/profile/${uid}`;
const profileCollection = 'profiles';
const donorDirectoryCollection = 'donorDirectory';

function isProfile(value: unknown, uid: string): value is UserProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<UserProfile>;
  return profile.uid === uid
    && (profile.accountType === 'patient' || profile.accountType === 'donor')
    && typeof profile.age === 'number'
    && typeof profile.bloodGroup === 'string'
    && typeof profile.phoneNumber === 'string'
    && typeof profile.completedAt === 'string'
    && (profile.isAvailable === undefined || typeof profile.isAvailable === 'boolean');
}

function normalizeProfile(profile: UserProfile): UserProfile {
  return profile.accountType === 'donor'
    ? { ...profile, isAvailable: profile.isAvailable ?? false }
    : profile;
}

async function getLocalProfile(uid: string): Promise<UserProfile | null> {
  const storedProfile = await AsyncStorage.getItem(profileKey(uid));
  if (!storedProfile) return null;
  try {
    const profile = JSON.parse(storedProfile) as unknown;
    return isProfile(profile, uid) ? normalizeProfile(profile) : null;
  } catch {
    return null;
  }
}

function requireFirestore() {
  if (!firestore) throw new Error('Firestore is not configured. Check your Firebase setup.');
  return firestore;
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const localProfile = await getLocalProfile(uid);
  if (!firestore) return localProfile;

  try {
    const remoteProfile = await getDoc(doc(firestore, profileCollection, uid));
    if (remoteProfile.exists() && isProfile(remoteProfile.data(), uid)) {
      const profile = normalizeProfile(remoteProfile.data() as UserProfile);
      await AsyncStorage.setItem(profileKey(uid), JSON.stringify(profile));
      if (profile.isAvailable !== remoteProfile.data().isAvailable) await saveProfile(profile);
      return profile;
    }
    if (localProfile) await saveProfile(localProfile);
  } catch {
    // Existing users keep their local profile if a remote migration cannot complete.
  }
  return localProfile;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = requireFirestore();
  const normalizedProfile = normalizeProfile(profile);
  const batch = writeBatch(db);
  batch.set(doc(db, profileCollection, normalizedProfile.uid), normalizedProfile);

  if (normalizedProfile.accountType === 'donor') {
    batch.set(doc(db, donorDirectoryCollection, normalizedProfile.uid), {
      uid: normalizedProfile.uid,
      accountType: 'donor',
      bloodGroup: normalizedProfile.bloodGroup,
      isAvailable: normalizedProfile.isAvailable,
      updatedAt: serverTimestamp(),
    });
  } else {
    batch.delete(doc(db, donorDirectoryCollection, normalizedProfile.uid));
  }

  await batch.commit();
  await AsyncStorage.setItem(profileKey(normalizedProfile.uid), JSON.stringify(normalizedProfile));
}

export async function setDonorAvailability(uid: string, isAvailable: boolean): Promise<void> {
  const db = requireFirestore();
  const batch = writeBatch(db);
  batch.update(doc(db, profileCollection, uid), { isAvailable });
  batch.update(doc(db, donorDirectoryCollection, uid), { isAvailable, updatedAt: serverTimestamp() });
  await batch.commit();

  const localProfile = await getLocalProfile(uid);
  if (localProfile?.accountType === 'donor') {
    await AsyncStorage.setItem(profileKey(uid), JSON.stringify({ ...localProfile, isAvailable }));
  }
}

export async function findCompatibleDonors(recipientBloodGroup: string): Promise<DonorDirectoryEntry[]> {
  const db = requireFirestore();
  const compatibleDonorGroups = getCompatibleRedCellDonors(recipientBloodGroup);
  if (compatibleDonorGroups.length === 0) return [];

  const donors = await getDocs(query(
    collection(db, donorDirectoryCollection),
    where('bloodGroup', 'in', compatibleDonorGroups),
  ));

  return donors.docs.flatMap((donor) => {
    const data = donor.data() as Partial<DonorDirectoryEntry>;
    return data.accountType === 'donor'
      && typeof data.uid === 'string'
      && typeof data.bloodGroup === 'string'
      && typeof data.isAvailable === 'boolean'
      ? [{ uid: data.uid, accountType: 'donor' as const, bloodGroup: data.bloodGroup, isAvailable: data.isAvailable }]
      : [];
  });
}
