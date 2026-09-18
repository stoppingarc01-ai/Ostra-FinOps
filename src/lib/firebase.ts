import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA9mDnVTMJ5TCTwoDw8PMxZhh-WbSrDMrM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ostraops.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ostraops",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ostraops.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "492279326593",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:492279326593:web:e2fde4764ec2d244256a80",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JVVCGM21TV"
};

// Initialize Firebase (singleton pattern)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics is only supported in browser environments
export const analyticsPromise = typeof window !== "undefined"
  ? isSupported().then((yes) => (yes ? getAnalytics(app) : null)).catch(() => null)
  : Promise.resolve(null);

