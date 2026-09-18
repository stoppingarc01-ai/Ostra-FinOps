import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import type { UserSubscription } from '../types/database';

/**
 * Default subscription preset if user hasn't chosen one yet
 */
export const DEFAULT_SUBSCRIPTION: Omit<UserSubscription, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  plan_id: 'solo_pro',
  plan_name: 'Solo Pro',
  price_amount: 149,
  billing_interval: 'mo',
  status: 'active',
  renewal_date: '25 May, 2026',
  quota_usage_percent: 74,
  quota_used: 74000,
  quota_limit: 100000,
};

/**
 * Fetch subscription record for a specific user from Firestore.
 * Isolation guarantee: Keyed directly by request.auth.uid / userId.
 */
export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  try {
    const subRef = doc(db, 'subscriptions', userId);
    const snap = await getDoc(subRef);
    if (snap.exists()) {
      return snap.data() as UserSubscription;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch user subscription from Firestore:', err);
    return null;
  }
};

/**
 * Create or initialize default subscription for user in Firestore
 */
export const createUserDefaultSubscription = async (
  userId: string,
  overrides?: Partial<UserSubscription>
): Promise<UserSubscription> => {
  const subRef = doc(db, 'subscriptions', userId);
  const now = new Date().toISOString();

  const newSub: UserSubscription = {
    id: userId,
    user_id: userId,
    ...DEFAULT_SUBSCRIPTION,
    ...overrides,
    created_at: now,
    updated_at: now,
  };

  await setDoc(subRef, newSub, { merge: true });
  return newSub;
};

/**
 * Update user's subscription (e.g. upon upgrade, downgrade, or cancelation)
 */
export const updateUserSubscription = async (
  userId: string,
  updates: Partial<UserSubscription>
): Promise<void> => {
  const subRef = doc(db, 'subscriptions', userId);
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };
  await updateDoc(subRef, payload);
};

/**
 * Real-time listener for user's subscription changes
 */
export const subscribeToUserSubscription = (
  userId: string,
  callback: (subscription: UserSubscription | null) => void
): (() => void) => {
  const subRef = doc(db, 'subscriptions', userId);
  return onSnapshot(
    subRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserSubscription);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('Subscription listener error:', err);
      callback(null);
    }
  );
};
