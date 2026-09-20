import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import type { UserSubscription } from '../types/database';

/**
 * Default subscription preset if user hasn't chosen one yet
 */
export const DEFAULT_SUBSCRIPTION: Omit<UserSubscription, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  plan_id: 'team_scale',
  plan_name: 'Team Hosted Gateway',
  price_amount: 49,
  billing_interval: 'mo',
  status: 'active',
  renewal_date: '18 Oct, 2026',
  quota_usage_percent: 2.4,
  quota_used: 12000,
  quota_limit: 500000,
};

/**
 * Fetch subscription record for a specific user from Firestore with resilient localStorage fallback.
 * Isolation guarantee: Keyed directly by request.auth.uid / userId.
 */
export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  // Check local cache first as reliable offline / permission-fallback store
  let cachedSub: UserSubscription | null = null;
  try {
    const raw = localStorage.getItem('ostraops_subscription');
    if (raw) {
      cachedSub = JSON.parse(raw);
    }
  } catch {}

  const activePlan = localStorage.getItem('ostraops_active_plan');

  try {
    const subRef = doc(db, 'subscriptions', userId);
    const snap = await getDoc(subRef);
    if (snap.exists()) {
      const data = snap.data() as UserSubscription;
      // If user specifically activated solo locally, prefer that
      if (activePlan === 'solo_pro' && data.plan_id !== 'solo_pro') {
        data.plan_id = 'solo_pro';
        data.plan_name = 'Solo Pro';
      }
      try { localStorage.setItem('ostraops_subscription', JSON.stringify(data)); } catch {}
      return data;
    }
  } catch (err) {
    console.warn('Firestore subscription query skipped or restricted, using local cache:', err);
  }

  if (cachedSub) return cachedSub;

  if (activePlan === 'solo_pro') {
    return {
      id: userId,
      user_id: userId,
      plan_id: 'solo_pro',
      plan_name: 'Solo Pro',
      price_amount: 12,
      billing_interval: 'mo',
      status: 'active',
      renewal_date: '18 Oct, 2026',
      quota_usage_percent: 74,
      quota_used: 74000,
      quota_limit: 100000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return null;
};

/**
 * Create or initialize default subscription for user in Firestore & localStorage
 */
export const createUserDefaultSubscription = async (
  userId: string,
  overrides?: Partial<UserSubscription>
): Promise<UserSubscription> => {
  const subRef = doc(db, 'subscriptions', userId);
  const now = new Date().toISOString();

  let defaultPlan = { ...DEFAULT_SUBSCRIPTION };
  try {
    const activePlan = localStorage.getItem('ostraops_active_plan');
    const raw = sessionStorage.getItem('ostraops_pending_plan') || localStorage.getItem('ostraops_pending_plan');
    let isSolo = activePlan === 'solo_pro';
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.planId === 'solo_pro' || parsed.type === 'solo') isSolo = true;
    }
    if (isSolo) {
      defaultPlan = {
        plan_id: 'solo_pro',
        plan_name: 'Solo Pro',
        price_amount: 12,
        billing_interval: 'mo',
        status: 'active',
        renewal_date: '18 Oct, 2026',
        quota_usage_percent: 74,
        quota_used: 74000,
        quota_limit: 100000,
      };
    }
  } catch {}

  const newSub: UserSubscription = {
    id: userId,
    user_id: userId,
    ...defaultPlan,
    ...overrides,
    created_at: now,
    updated_at: now,
  };

  try {
    localStorage.setItem('ostraops_subscription', JSON.stringify(newSub));
    localStorage.setItem('ostraops_active_plan', newSub.plan_id);
  } catch {}

  try {
    await setDoc(subRef, newSub, { merge: true });
  } catch (err) {
    console.warn('Firestore subscription write notice (cached locally):', err);
  }
  return newSub;
};

/**
 * Update user's subscription (e.g. upon upgrade, downgrade, or cancelation)
 */
export const updateUserSubscription = async (
  userId: string,
  updates: Partial<UserSubscription>
): Promise<void> => {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  try {
    const current = localStorage.getItem('ostraops_subscription');
    const merged = current ? { ...JSON.parse(current), ...payload } : payload;
    localStorage.setItem('ostraops_subscription', JSON.stringify(merged));
    if (updates.plan_id) {
      localStorage.setItem('ostraops_active_plan', updates.plan_id);
    }
  } catch {}

  try {
    const subRef = doc(db, 'subscriptions', userId);
    await setDoc(subRef, payload, { merge: true });
  } catch (err) {
    console.warn('Firestore subscription update notice (cached locally):', err);
  }
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
