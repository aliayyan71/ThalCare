import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  Auth,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';
import { toAuthEmail } from '../utils/validation';

export class AuthConfigurationError extends Error {
  constructor() {
    super(
      'Firebase is not configured. Copy .env.example to .env and add your Firebase keys.',
    );
    this.name = 'AuthConfigurationError';
  }
}

function getConfiguredAuth(): Auth {
  if (!isFirebaseConfigured || !auth) {
    throw new AuthConfigurationError();
  }

  return auth;
}

function mapFirebaseError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    default:
      return 'Something went wrong. Please try again';
  }
}

function handleAuthError(error: unknown): never {
  const code = (error as { code?: string })?.code ?? '';
  throw new Error(mapFirebaseError(code));
}

export async function login(identifier: string, password: string): Promise<User> {
  const configuredAuth = getConfiguredAuth();
  try {
    const email = toAuthEmail(identifier);
    const result = await signInWithEmailAndPassword(configuredAuth, email, password);
    return result.user;
  } catch (error) {
    handleAuthError(error);
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const configuredAuth = getConfiguredAuth();
  try {
    const result = await createUserWithEmailAndPassword(
      configuredAuth,
      email.trim().toLowerCase(),
      password,
    );
    await updateProfile(result.user, { displayName: name.trim() });
    return result.user;
  } catch (error) {
    handleAuthError(error);
  }
}

export async function resetPassword(email: string): Promise<void> {
  const configuredAuth = getConfiguredAuth();
  try {
    await sendPasswordResetEmail(configuredAuth, email.trim().toLowerCase());
  } catch (error) {
    handleAuthError(error);
  }
}

export async function logout(): Promise<void> {
  await signOut(getConfiguredAuth());
}
