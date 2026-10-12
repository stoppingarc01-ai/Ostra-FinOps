import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  updateProfile as updateAuthProfile,
  deleteUser,
  reauthenticateWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  getUserSubscription,
  updateUserSubscription,
  subscribeToUserSubscription,
  PLAN_METADATA
} from './subscriptionService';

export {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  updateAuthProfile,
  deleteUser,
  reauthenticateWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getUserSubscription,
  updateUserSubscription,
  subscribeToUserSubscription,
  PLAN_METADATA,
  type FirebaseUser
};
