import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { redCellRecipientsByDonor } from '../constants/bloodCompatibility';
import { DonorDirectoryEntry, UserProfile } from '../types/profile';

const profileKey = (uid: string) => `@thalcare/profile/${uid}`;
const profileCollection = 'profiles';
const donorDirectoryCollection = 'donorDirectory';

function isProfile(value: unknown, uid: string): value is UserProfile {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const profile = value as Partial<UserProfile>;
  const validAccountType = profile.accountType === 'patient' || profile.accountType === 'donor';

  return (
    profile.uid === uid &&
    validAccountType &&
    typeof profile.age === 'number' &&
    typeof profile.bloodGroup === 'string' &&
    typeof profile.phoneNumber === 'string' &&
    typeof profile.completedAt === 'string'
  );
}

async function getLocalProfile(uid: string): Promise<UserProfile | null> {
  const storedProfile = await AsyncStorage.getItem(profileKey(uid));

  if (!storedProfile) {
    return null;
  }

  try {
    const profile = JSON.parse(storedProfile) as unknown;
    return isProfile(profile, uid) ? profile : null;
  } catch {
    return null;
  }
}

function requireFirestore() {
  if (!firestore) {
    throw new Error('Firestore is not configured. Check your Firebase setup.');
  }

  return firestore;
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const localProfile = await getLocalProfile(uid);

  if (!firestore) {
    return localProfile;
  }

  try {
    const remoteProfile = await getDoc(doc(firestore, profileCollection, uid));

    if (remoteProfile.exists() && isProfile(remoteProfile.data(), uid)) {
      const profile = remoteProfile.data() as UserProfile;
      await AsyncStorage.setItem(profileKey(uid), JSON.stringify(profile));
      return profile;
    }

    if (localProfile) {
      await saveProfile(localProfile);
    }
  } catch {
    // Existing users can still access their on-device profile while a migration retries later.
  }

  return localProfile;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = requireFirestore();
  const batch = writeBatch(db);

  batch.set(doc(db, profileCollection, profile.uid), profile);

  if (profile.accountType === 'donor') {
    batch.set(doc(db, donorDirectoryCollection, profile.uid), {
      uid: profile.uid,
      accountType: 'donor',
      bloodGroup: profile.bloodGroup,
      updatedAt: serverTimestamp(),
    });
  } else {
    batch.delete(doc(db, donorDirectoryCollection, profile.uid));
  }

  await batch.commit();
  await AsyncStorage.setItem(profileKey(profile.uid), JSON.stringify(profile));
}

export async function findCompatibleDonors(
  recipientBloodGroup: string,
): Promise<DonorDirectoryEntry[]> {
  const db = requireFirestore();
  const compatibleDonorGroups = Object.entries(redCellRecipientsByDonor)
    .filter(([, recipientGroups]) => recipientGroups.includes(recipientBloodGroup))
    .map(([donorBloodGroup]) => donorBloodGroup);

  if (compatibleDonorGroups.length === 0) {
    return [];
  }

  const donors = await getDocs(
    query(
      collection(db, donorDirectoryCollection),
      where('bloodGroup', 'in', compatibleDonorGroups),
    ),
  );

  return donors.docs.flatMap((donor) => {
    const data = donor.data() as Partial<DonorDirectoryEntry>;
    return data.accountType === 'donor' && typeof data.uid === 'string' && typeof data.bloodGroup === 'string'
      ? [{ uid: data.uid, accountType: 'donor' as const, bloodGroup: data.bloodGroup }]
      : [];
  });
}
