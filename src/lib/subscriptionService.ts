import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { supabase, isSupabaseConfigured } from './supabase';
import type { UserSubscription } from '../types/database';
import { useAuth } from '../contexts/AuthContext';

export function useSubscription() {
  const { subscription } = useAuth();
  return { subscription };
}

/**
 * Default subscription preset for newly signed-up users (Community Free)
 */
export const DEFAULT_SUBSCRIPTION: Omit<UserSubscription, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  plan_id: 'free',
  plan_name: 'Community Free',
  price_amount: 0,
  billing_interval: 'mo',
  status: 'active',
  renewal_date: 'Perpetual',
  quota_usage_percent: 0,
  quota_used: 0,
  quota_limit: 10000,
};

export const PLAN_METADATA: Record<string, { name: string; price: number }> = {
  free: { name: 'Community Free', price: 0 },
  community: { name: 'Community Free', price: 0 },
  telemetry_observer: { name: 'Agent Telemetry', price: 20 },
  starter_gateway: { name: 'Starter Gateway', price: 35 },
  pro_gateway: { name: 'Pro Gateway', price: 59 },
  team_scale: { name: 'Starter Gateway', price: 35 }, // backward compat
  solo_pro: { name: 'Starter Gateway', price: 35 },    // backward compat
};

/**
 * Fetch subscription record for a specific user from Supabase / Firestore with resilient localStorage fallback.
 */
export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  // Check local cache first for instant UI responsiveness
  let cachedSub: UserSubscription | null = null;
  try {
    const raw = localStorage.getItem('ostraops_subscription');
    if (raw) {
      cachedSub = JSON.parse(raw);
    }
  } catch {}

  // 1. Try Supabase user profile / subscription if available
  if (isSupabaseConfigured && userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('org_id, full_name, email')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data?.org_id) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('plan, billing_status')
          .eq('id', data.org_id)
          .maybeSingle();

        if (orgData?.plan) {
          const planKey = orgData.plan.toLowerCase();
          const meta = PLAN_METADATA[planKey] || { name: 'Starter Gateway', price: 35 };
          const sub: UserSubscription = {
            id: userId,
            user_id: userId,
            plan_id: planKey,
            plan_name: meta.name,
            price_amount: meta.price,
            billing_interval: 'mo',
            status: 'active',
            renewal_date: new Date(Date.now() + 30 * 86_400_000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            quota_usage_percent: 0,
            quota_used: 0,
            quota_limit: planKey === 'pro_gateway' ? 10000000 : planKey === 'starter_gateway' ? 1000000 : 50000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          try { localStorage.setItem('ostraops_subscription', JSON.stringify(sub)); } catch {}
          return sub;
        }
      }
    } catch (err) {
      console.warn('Supabase subscription resolution note:', err);
    }
  }

  // 2. Try Firestore fallback
  try {
    const subRef = doc(db, 'subscriptions', userId);
    const snap = await getDoc(subRef);
    if (snap.exists()) {
      const data = snap.data() as UserSubscription;
      // Upgrade old legacy tier names
      if (data.plan_id === 'solo_pro' || data.plan_id === 'team_scale') {
        data.plan_id = 'starter_gateway';
        data.plan_name = 'Starter Gateway';
        data.price_amount = 35;
      }
      try { localStorage.setItem('ostraops_subscription', JSON.stringify(data)); } catch {}
      return data;
    }
  } catch (err) {
    console.warn('Firestore subscription query note (using local cache):', err);
  }

  if (cachedSub) {
    if (cachedSub.plan_id === 'solo_pro' || cachedSub.plan_id === 'team_scale') {
      cachedSub.plan_id = 'starter_gateway';
      cachedSub.plan_name = 'Starter Gateway';
      cachedSub.price_amount = 35;
    }
    return cachedSub;
  }

  return {
    id: userId,
    user_id: userId,
    ...DEFAULT_SUBSCRIPTION,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

/**
 * Create or initialize subscription for user in Supabase, Firestore & localStorage
 */
export const createUserDefaultSubscription = async (
  userId: string,
  overrides?: Partial<UserSubscription>
): Promise<UserSubscription> => {
  const now = new Date().toISOString();
  const defaultPlan = { ...DEFAULT_SUBSCRIPTION };

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

  // Sync to Supabase organizations table if configured
  if (isSupabaseConfigured && userId) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.org_id) {
        await supabase
          .from('organizations')
          .update({ plan: newSub.plan_id })
          .eq('id', profile.org_id);
      }
    } catch {}
  }

  try {
    const subRef = doc(db, 'subscriptions', userId);
    await setDoc(subRef, newSub, { merge: true });
  } catch (err) {
    console.warn('Firestore subscription write note (cached locally):', err);
  }

  return newSub;
};

/**
 * Update user's subscription (e.g. upon upgrade, downgrade, or tier change)
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

  // Sync to Supabase organizations table
  if (isSupabaseConfigured && userId && updates.plan_id) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.org_id) {
        await supabase
          .from('organizations')
          .update({ plan: updates.plan_id })
          .eq('id', profile.org_id);
      }
    } catch (err) {
      console.warn('Supabase organization plan update note:', err);
    }
  }

  try {
    const subRef = doc(db, 'subscriptions', userId);
    await setDoc(subRef, payload, { merge: true });
  } catch (err) {
    console.warn('Firestore subscription update note (cached locally):', err);
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
        // Fall back to localStorage
        try {
          const raw = localStorage.getItem('ostraops_subscription');
          if (raw) callback(JSON.parse(raw));
          else callback(null);
        } catch {
          callback(null);
        }
      }
    },
    () => {
      try {
        const raw = localStorage.getItem('ostraops_subscription');
        if (raw) callback(JSON.parse(raw));
        else callback(null);
      } catch {
        callback(null);
      }
    }
  );
};
