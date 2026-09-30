import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  BudgetLimit,
  RateLimitTier,
  BudgetScope,
  BudgetPeriod,
  BudgetBreachAction,
  BudgetStatus
} from '../types/database';

export type { BudgetLimit, RateLimitTier, BudgetScope, BudgetPeriod, BudgetBreachAction, BudgetStatus };

export const DEFAULT_INITIAL_BUDGETS: Omit<BudgetLimit, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [];

export const DEFAULT_RATE_LIMITS: Omit<RateLimitTier, 'id' | 'user_id' | 'updated_at'>[] = [
  {
    model: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    rpm_limit: 4000,
    rpm_current: 0,
    tpm_limit: 400000,
    tpm_current: 0,
    concurrency_limit: 80,
    concurrency_current: 0,
    queue_burst_allowed: true,
    status: 'optimal',
  },
  {
    model: 'GPT-4o',
    provider: 'OpenAI',
    rpm_limit: 10000,
    rpm_current: 0,
    tpm_limit: 800000,
    tpm_current: 0,
    concurrency_limit: 120,
    concurrency_current: 0,
    queue_burst_allowed: true,
    status: 'optimal',
  },
  {
    model: 'DeepSeek R1',
    provider: 'DeepSeek',
    rpm_limit: 3000,
    rpm_current: 0,
    tpm_limit: 250000,
    tpm_current: 0,
    concurrency_limit: 50,
    concurrency_current: 0,
    queue_burst_allowed: false,
    status: 'optimal',
  },
  {
    model: 'Gemini 2.5 Pro',
    provider: 'Google Vertex AI',
    rpm_limit: 2000,
    rpm_current: 0,
    tpm_limit: 2000000,
    tpm_current: 0,
    concurrency_limit: 60,
    concurrency_current: 0,
    queue_burst_allowed: true,
    status: 'optimal',
  },
];

/**
 * Fetch all budgets for a user (Real data only)
 */
export const fetchUserBudgets = async (userId: string): Promise<BudgetLimit[]> => {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'budgets'), where('user_id', '==', userId));
    const snap = await getDocs(q);
    if (snap.empty) {
      const cached = localStorage.getItem(`ostraops_budgets_${userId}`);
      return cached ? JSON.parse(cached) : [];
    }
    const items = snap.docs.map((d) => d.data() as BudgetLimit);
    try { localStorage.setItem(`ostraops_budgets_${userId}`, JSON.stringify(items)); } catch {}
    return items;
  } catch (err) {
    try {
      const cached = localStorage.getItem(`ostraops_budgets_${userId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }
};

/**
 * Real-time listener for user budgets
 */
export const subscribeToUserBudgets = (
  userId: string,
  callback: (budgets: BudgetLimit[]) => void
): (() => void) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  try {
    const q = query(collection(db, 'budgets'), where('user_id', '==', userId));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as BudgetLimit);
        callback(list);
      },
      () => {
        try {
          const raw = localStorage.getItem(`ostraops_budgets_${userId}`);
          callback(raw ? JSON.parse(raw) : []);
        } catch {
          callback([]);
        }
      }
    );
  } catch {
    callback([]);
    return () => {};
  }
};

/**
 * Create or save a budget limit
 */
export const createBudget = async (
  userId: string,
  budget: Omit<BudgetLimit, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<BudgetLimit> => {
  const budgetId = `bdg_${Date.now()}`;
  const now = new Date().toISOString();
  const fullBudget: BudgetLimit = {
    ...budget,
    id: budgetId,
    user_id: userId,
    created_at: now,
    updated_at: now,
  };

  try {
    await setDoc(doc(db, 'budgets', `${userId}_${budgetId}`), fullBudget);
  } catch {}

  try {
    const raw = localStorage.getItem(`ostraops_budgets_${userId}`);
    const list = raw ? JSON.parse(raw) : [];
    list.push(fullBudget);
    localStorage.setItem(`ostraops_budgets_${userId}`, JSON.stringify(list));
  } catch {}

  return fullBudget;
};

/**
 * Update an existing budget limit
 */
export const updateBudget = async (
  userId: string,
  budgetId: string,
  updates: Partial<BudgetLimit>
): Promise<void> => {
  const now = new Date().toISOString();
  try {
    await updateDoc(doc(db, 'budgets', `${userId}_${budgetId}`), {
      ...updates,
      updated_at: now,
    });
  } catch {}

  try {
    const raw = localStorage.getItem(`ostraops_budgets_${userId}`);
    if (raw) {
      const list = JSON.parse(raw) as BudgetLimit[];
      const updated = list.map((b) => (b.id === budgetId ? { ...b, ...updates, updated_at: now } : b));
      localStorage.setItem(`ostraops_budgets_${userId}`, JSON.stringify(updated));
    }
  } catch {}
};

/**
 * Delete a budget limit
 */
export const deleteBudget = async (userId: string, budgetId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'budgets', `${userId}_${budgetId}`));
  } catch {}

  try {
    const raw = localStorage.getItem(`ostraops_budgets_${userId}`);
    if (raw) {
      const list = JSON.parse(raw) as BudgetLimit[];
      const filtered = list.filter((b) => b.id !== budgetId);
      localStorage.setItem(`ostraops_budgets_${userId}`, JSON.stringify(filtered));
    }
  } catch {}
};

/**
 * Fetch rate limits and capacity tiers for models
 */
export const fetchRateLimits = async (userId: string): Promise<RateLimitTier[]> => {
  const now = new Date().toISOString();
  return DEFAULT_RATE_LIMITS.map((r, i) => ({
    ...r,
    id: `rl_${100 + i}`,
    user_id: userId,
    updated_at: now,
  }));
};
