import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';

import {
  doc,
  setDoc,
} from 'firebase/firestore';

import { auth, db } from './firebase';

const ERROR_MESSAGES = {
  'auth/email-already-in-use':
    'An account with this email already exists.',

  'auth/invalid-email':
    'Enter a valid email address.',

  'auth/weak-password':
    'Password should be at least 8 characters.',

  'auth/user-not-found':
    'No account found with this email.',

  'auth/wrong-password':
    'Incorrect password.',

  'auth/invalid-credential':
    'Incorrect email or password.',

  'auth/too-many-requests':
    'Too many attempts. Try again later.',
};

export function friendlyAuthError(error) {
  return ERROR_MESSAGES[error?.code]
    || 'Something went wrong. Please try again.';
}

export async function registerUser({
  name,
  phone,
  email,
  password,
}) {
  const cred = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await updateProfile(cred.user, {
    displayName: name,
  });

  await setDoc(doc(db, 'users', cred.user.uid), {
    name,
    phone,
    email,
    createdAt: new Date().toISOString(),
  });

  return cred.user;
}

export function loginUser({ email, password }) {
  return signInWithEmailAndPassword(
    auth,
    email,
    password
  );
}

export function resetPassword(email) {
  return sendPasswordResetEmail(
    auth,
    email
  );
}