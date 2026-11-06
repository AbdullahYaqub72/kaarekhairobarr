import { FirebaseError } from 'firebase/app'

/** Turns Firebase Auth error codes into plain-language messages. Returns null for "user closed it". */
export function authErrorMessage(error: unknown): string | null {
  const code = error instanceof FirebaseError ? error.code : ''
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
    case 'auth/user-cancelled':
      return null
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'That email and password don’t match. Try again or reset your password.'
    case 'auth/invalid-email':
      return 'That email address doesn’t look right.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Use “I already have an account” instead.'
    case 'auth/weak-password':
      return 'Choose a password with at least 8 characters.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.'
    case 'auth/network-request-failed':
      return 'No connection. Check your internet and try again.'
    case 'auth/account-exists-with-different-credential':
      return 'This email is already registered with a different sign-in method.'
    case 'auth/operation-not-allowed':
      return 'This sign-in method isn’t switched on yet. Ask an admin to enable it in Firebase.'
    case 'auth/unauthorized-domain':
      return 'Sign-in isn’t allowed from this web address yet. Ask an admin to add it in Firebase.'
    default:
      return error instanceof Error && error.message ? error.message : 'Sign-in failed. Please try again.'
  }
}
