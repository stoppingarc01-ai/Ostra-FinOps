import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import type { SystemAlert, AlertRule, AlertStatus, AlertSeverity, AlertCategory } from '../types/database';

export type { SystemAlert, AlertRule, AlertStatus, AlertSeverity, AlertCategory };

export const DEFAULT_INITIAL_ALERTS: Omit<SystemAlert, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [];

export const DEFAULT_ALERT_RULES: Omit<AlertRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'TPM Rate Limit Capacity Ceiling',
    category: 'ratelimit',
    severity: 'critical',
    threshold: 'TPM > 90% of model quota',
    channel: '#alerts-prod-ai (Slack)',
    enabled: true,
  },
  {
    name: 'Daily Burn Rate Safety Cap',
    category: 'cost',
    severity: 'warning',
    threshold: 'Spend > Daily Cap Limit',
    channel: 'billing@workspace (Email)',
    enabled: true,
  },
  {
    name: 'P99 Latency SLA Guard',
    category: 'latency',
    severity: 'warning',
    threshold: 'P99 > 2000ms for 10 mins',
    channel: '#dev-oncall (PagerDuty)',
    enabled: true,
  },
  {
    name: 'Zero-Downtime Provider 5xx Circuit Breaker',
    category: 'provider',
    severity: 'critical',
    threshold: 'Consecutive 5xx errors > 3',
    channel: '#alerts-prod-ai (Slack)',
    enabled: true,
  },
  {
    name: 'Heuristic Prompt Injection Blocker',
    category: 'security',
    severity: 'warning',
    threshold: 'Threat Risk Score > 0.85',
    channel: 'security-alerts@workspace',
    enabled: true,
  },
];

/**
 * Fetch all alerts belonging strictly to the current user (Real data only)
 */
export const fetchUserAlerts = async (userId: string): Promise<SystemAlert[]> => {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'alerts'),
      where('user_id', '==', userId)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      const raw = localStorage.getItem(`ostraops_alerts_${userId}`);
      return raw ? JSON.parse(raw) : [];
    }

    const items = snap.docs.map((doc) => doc.data() as SystemAlert);
    items.sort((a, b) => new Date(b.created_at || b.timestamp).getTime() - new Date(a.created_at || a.timestamp).getTime());
    try { localStorage.setItem(`ostraops_alerts_${userId}`, JSON.stringify(items)); } catch {}
    return items;
  } catch {
    try {
      const raw = localStorage.getItem(`ostraops_alerts_${userId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
};

/**
 * Acknowledge an active alert
 */
export const acknowledgeAlert = async (alertId: string, userId: string): Promise<void> => {
  const now = new Date().toISOString();
  try {
    const ref = doc(db, 'alerts', `${userId}_${alertId}`);
    await updateDoc(ref, {
      status: 'acknowledged',
      acknowledged_at: now,
      updated_at: now,
    });
  } catch {}

  try {
    const raw = localStorage.getItem(`ostraops_alerts_${userId}`);
    if (raw) {
      const list = JSON.parse(raw) as SystemAlert[];
      const updated = list.map((a) =>
        a.id === alertId ? { ...a, status: 'acknowledged' as AlertStatus, acknowledged_at: now } : a
      );
      localStorage.setItem(`ostraops_alerts_${userId}`, JSON.stringify(updated));
    }
  } catch {}
};

/**
 * Resolve an alert
 */
export const resolveAlert = async (alertId: string, userId: string): Promise<void> => {
  const now = new Date().toISOString();
  try {
    const ref = doc(db, 'alerts', `${userId}_${alertId}`);
    await updateDoc(ref, {
      status: 'resolved',
      resolved_at: now,
      updated_at: now,
    });
  } catch {}

  try {
    const raw = localStorage.getItem(`ostraops_alerts_${userId}`);
    if (raw) {
      const list = JSON.parse(raw) as SystemAlert[];
      const updated = list.map((a) =>
        a.id === alertId ? { ...a, status: 'resolved' as AlertStatus, resolved_at: now } : a
      );
      localStorage.setItem(`ostraops_alerts_${userId}`, JSON.stringify(updated));
    }
  } catch {}
};

/**
 * Real-time listener for user alerts
 */
export const subscribeToUserAlerts = (
  userId: string,
  callback: (alerts: SystemAlert[]) => void
): (() => void) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  try {
    const q = query(collection(db, 'alerts'), where('user_id', '==', userId));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as SystemAlert);
        callback(list);
      },
      () => {
        try {
          const raw = localStorage.getItem(`ostraops_alerts_${userId}`);
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
 * Update alert status (active / acknowledged / resolved)
 */
export const updateAlertStatus = async (
  userId: string,
  alertId: string,
  status: AlertStatus
): Promise<void> => {
  if (status === 'resolved') {
    await resolveAlert(alertId, userId);
  } else if (status === 'acknowledged') {
    await acknowledgeAlert(alertId, userId);
  }
};

/**
 * Create a new triggered alert
 */
export const createAlert = async (userId: string, alert: SystemAlert): Promise<void> => {
  try {
    await setDoc(doc(db, 'alerts', `${userId}_${alert.id}`), alert);
  } catch {}

  try {
    const raw = localStorage.getItem(`ostraops_alerts_${userId}`);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(alert);
    localStorage.setItem(`ostraops_alerts_${userId}`, JSON.stringify(list));
  } catch {}
};

/**
 * Fetch alert rules
 */
export const fetchUserAlertRules = async (userId: string): Promise<AlertRule[]> => {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'alert_rules'), where('user_id', '==', userId));
    const snap = await getDocs(q);
    if (snap.empty) {
      return await seedInitialAlertRules(userId);
    }
    return snap.docs.map((doc) => doc.data() as AlertRule);
  } catch {
    const now = new Date().toISOString();
    return DEFAULT_ALERT_RULES.map((r, i) => ({
      ...r,
      id: `rule_${100 + i}`,
      user_id: userId,
      created_at: now,
      updated_at: now,
    }));
  }
};

/**
 * Seed initial rules for fresh user
 */
export const seedInitialAlertRules = async (userId: string): Promise<AlertRule[]> => {
  const seeded: AlertRule[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < DEFAULT_ALERT_RULES.length; i++) {
    const template = DEFAULT_ALERT_RULES[i];
    const ruleId = `rule_${100 + i}`;
    const fullRule: AlertRule = {
      ...template,
      id: ruleId,
      user_id: userId,
      created_at: now,
      updated_at: now,
    };
    try {
      await setDoc(doc(db, 'alert_rules', `${userId}_${ruleId}`), fullRule, { merge: true });
    } catch {}
    seeded.push(fullRule);
  }
  return seeded;
};

/**
 * Toggle or update an alert rule
 */
export const updateAlertRule = async (
  ruleId: string,
  userId: string,
  updates: Partial<AlertRule>
): Promise<void> => {
  const payload = { ...updates, updated_at: new Date().toISOString() };
  try {
    const ref = doc(db, 'alert_rules', `${userId}_${ruleId}`);
    await setDoc(ref, payload, { merge: true });
  } catch {}
};

/**
 * Create a new custom alert rule
 */
export const createAlertRule = async (
  userId: string,
  ruleData: Omit<AlertRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<AlertRule> => {
  const ruleId = `rule_${Date.now()}`;
  const now = new Date().toISOString();
  const newRule: AlertRule = {
    ...ruleData,
    id: ruleId,
    user_id: userId,
    created_at: now,
    updated_at: now,
  };
  try {
    await setDoc(doc(db, 'alert_rules', `${userId}_${ruleId}`), newRule);
  } catch {}
  return newRule;
};
