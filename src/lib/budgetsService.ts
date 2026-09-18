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

export const DEFAULT_INITIAL_BUDGETS: Omit<BudgetLimit, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Global Monthly Hard Cap',
    scope: 'organization',
    target_name: 'All Workspaces (Production & Staging)',
    limit_amount: 5000,
    current_spend: 3840.20,
    currency: 'USD',
    period: 'monthly',
    action_on_breach: 'hard_block',
    notify_threshold_percent: 80,
    status: 'warning',
  },
  {
    name: 'Autonomous Coder Agent Pool',
    scope: 'project',
    target_name: 'Project: autonomous-swe-bench',
    limit_amount: 1500,
    current_spend: 920.45,
    currency: 'USD',
    period: 'monthly',
    action_on_breach: 'throttle_rate',
    notify_threshold_percent: 85,
    status: 'active',
  },
  {
    name: 'OpenAI Reasoning Models (o1 / o3)',
    scope: 'model',
    target_name: 'Models: o1-preview, o1-mini',
    limit_amount: 800,
    current_spend: 785.10,
    currency: 'USD',
    period: 'monthly',
    action_on_breach: 'downgrade_model',
    notify_threshold_percent: 90,
    status: 'warning',
  },
  {
    name: 'Staging Environment Daily Safety Cap',
    scope: 'project',
    target_name: 'Environment: Staging Edge',
    limit_amount: 50,
    current_spend: 18.30,
    currency: 'USD',
    period: 'daily',
    action_on_breach: 'hard_block',
    notify_threshold_percent: 75,
    status: 'active',
  },
  {
    name: 'Virtual Key ost_live_indexer',
    scope: 'key',
    target_name: 'Key: dev-indexer-background',
    limit_amount: 250,
    current_spend: 264.80,
    currency: 'USD',
    period: 'monthly',
    action_on_breach: 'hard_block',
    notify_threshold_percent: 100,
    status: 'breached',
  },
  {
    name: 'Customer Support Bot Fleet',
    scope: 'project',
    target_name: 'Project: customer-chat-rag',
    limit_amount: 600,
    current_spend: 210.00,
    currency: 'USD',
    period: 'monthly',
    action_on_breach: 'soft_alert',
    notify_threshold_percent: 80,
    status: 'active',
  },
];

export const DEFAULT_RATE_LIMITS: Omit<RateLimitTier, 'id' | 'user_id' | 'updated_at'>[] = [
  {
    model: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    rpm_limit: 4000,
    rpm_current: 2840,
    tpm_limit: 400000,
    tpm_current: 376000,
    concurrency_limit: 80,
    concurrency_current: 54,
    queue_burst_allowed: true,
    status: 'warning',
  },
  {
    model: 'GPT-4o',
    provider: 'OpenAI',
    rpm_limit: 10000,
    rpm_current: 4120,
    tpm_limit: 800000,
    tpm_current: 320000,
    concurrency_limit: 120,
    concurrency_current: 38,
    queue_burst_allowed: true,
    status: 'optimal',
  },
  {
    model: 'DeepSeek-Coder-V2',
    provider: 'DeepSeek (via Router)',
    rpm_limit: 3000,
    rpm_current: 1450,
    tpm_limit: 250000,
    tpm_current: 198000,
    concurrency_limit: 50,
    concurrency_current: 32,
    queue_burst_allowed: false,
    status: 'optimal',
  },
  {
    model: 'Llama 3.3 70B Instruct',
    provider: 'Groq LPUs',
    rpm_limit: 5000,
    rpm_current: 4890,
    tpm_limit: 300000,
    tpm_current: 295000,
    concurrency_limit: 100,
    concurrency_current: 94,
    queue_burst_allowed: true,
    status: 'throttling',
  },
  {
    model: 'Gemini 1.5 Pro',
    provider: 'Google Vertex AI',
    rpm_limit: 2000,
    rpm_current: 620,
    tpm_limit: 2000000,
    tpm_current: 410000,
    concurrency_limit: 60,
    concurrency_current: 18,
    queue_burst_allowed: true,
    status: 'optimal',
  },
];

/**
 * Fetch all budgets for a user
 */
export const fetchUserBudgets = async (userId: string): Promise<BudgetLimit[]> => {
  try {
    const q = query(collection(db, 'budgets'), where('user_id', '==', userId));
    const snap = await getDocs(q);
    if (snap.empty) {
      return await seedInitialBudgets(userId);
    }
    return snap.docs.map((d) => d.data() as BudgetLimit);
  } catch (err) {
    console.warn('Could not query Firestore budgets, returning seeded defaults:', err);
    return DEFAULT_INITIAL_BUDGETS.map((b, i) => ({
      ...b,
      id: `bdg_${100 + i}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }
};

/**
 * Seed initial budgets
 */
export const seedInitialBudgets = async (userId: string): Promise<BudgetLimit[]> => {
  const seeded: BudgetLimit[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < DEFAULT_INITIAL_BUDGETS.length; i++) {
    const template = DEFAULT_INITIAL_BUDGETS[i];
    const budgetId = `bdg_${100 + i}`;
    const fullBudget: BudgetLimit = {
      ...template,
      id: budgetId,
      user_id: userId,
      created_at: now,
      updated_at: now,
    };
    try {
      await setDoc(doc(db, 'budgets', `${userId}_${budgetId}`), fullBudget, { merge: true });
    } catch {
      // Graceful fallback
    }
    seeded.push(fullBudget);
  }
  return seeded;
};

/**
 * Real-time listener for user budgets
 */
export const subscribeToUserBudgets = (
  userId: string,
  onUpdate: (budgets: BudgetLimit[]) => void
): (() => void) => {
  const q = query(collection(db, 'budgets'), where('user_id', '==', userId));

  return onSnapshot(
    q,
    async (snapshot) => {
      if (snapshot.empty) {
        const seeded = await seedInitialBudgets(userId);
        onUpdate(seeded);
      } else {
        const list = snapshot.docs.map((d) => d.data() as BudgetLimit);
        onUpdate(list);
      }
    },
    (error) => {
      console.warn('Budgets onSnapshot warning:', error);
      onUpdate(
        DEFAULT_INITIAL_BUDGETS.map((b, i) => ({
          ...b,
          id: `bdg_${100 + i}`,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      );
    }
  );
};

/**
 * Create a new budget cap
 */
export const createBudget = async (
  userId: string,
  budget: Omit<BudgetLimit, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<BudgetLimit> => {
  const budgetId = `bdg_${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newBudget: BudgetLimit = {
    ...budget,
    id: budgetId,
    user_id: userId,
    created_at: now,
    updated_at: now,
  };

  await setDoc(doc(db, 'budgets', `${userId}_${budgetId}`), newBudget);
  return newBudget;
};

/**
 * Update existing budget
 */
export const updateBudget = async (
  userId: string,
  budgetId: string,
  updates: Partial<BudgetLimit>
): Promise<void> => {
  const docId = budgetId.includes(userId) ? budgetId : `${userId}_${budgetId}`;
  const budgetRef = doc(db, 'budgets', docId);
  await updateDoc(budgetRef, {
    ...updates,
    updated_at: new Date().toISOString(),
  });
};

/**
 * Delete a budget
 */
export const deleteBudget = async (userId: string, budgetId: string): Promise<void> => {
  const docId = budgetId.includes(userId) ? budgetId : `${userId}_${budgetId}`;
  await deleteDoc(doc(db, 'budgets', docId));
};

/**
 * Fetch rate limits
 */
export const fetchRateLimits = async (userId: string): Promise<RateLimitTier[]> => {
  try {
    const q = query(collection(db, 'rate_limits'), where('user_id', '==', userId));
    const snap = await getDocs(q);
    if (snap.empty) {
      return DEFAULT_RATE_LIMITS.map((r, i) => ({
        ...r,
        id: `rl_${100 + i}`,
        user_id: userId,
        updated_at: new Date().toISOString(),
      }));
    }
    return snap.docs.map((d) => d.data() as RateLimitTier);
  } catch {
    return DEFAULT_RATE_LIMITS.map((r, i) => ({
      ...r,
      id: `rl_${100 + i}`,
      user_id: userId,
      updated_at: new Date().toISOString(),
    }));
  }
};

/**
 * Update rate limit tier
 */
export const updateRateLimit = async (
  userId: string,
  limitId: string,
  updates: Partial<RateLimitTier>
): Promise<void> => {
  const docId = limitId.includes(userId) ? limitId : `${userId}_${limitId}`;
  await updateDoc(doc(db, 'rate_limits', docId), {
    ...updates,
    updated_at: new Date().toISOString(),
  });
};
