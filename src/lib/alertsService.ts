import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import type { SystemAlert, AlertRule, AlertStatus, AlertSeverity, AlertCategory } from '../types/database';

export type { SystemAlert, AlertRule, AlertStatus, AlertSeverity, AlertCategory };

// Initial realistic alerts seed for newly onboarded user environments
export const DEFAULT_INITIAL_ALERTS: Omit<SystemAlert, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    title: 'Anthropic Claude-3.5-Sonnet TPM Rate Limit Approaching 94%',
    category: 'ratelimit',
    severity: 'critical',
    status: 'active',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    service: 'claude-3-5-sonnet',
    description: 'Current token consumption spiked to 376,000 TPM against the 400,000 TPM organization limit. Automatic fallback route to Azure OpenAI GPT-4o has been pre-warmed.',
    metric_value: '376k TPM (94%)',
    threshold: '> 90% TPM',
    impact: 'High risk of HTTP 429 throttling for production agents',
    channel: '#alerts-prod-ai (Slack)',
    trace_id: 'ost_trc_9982710a',
  },
  {
    title: 'Daily Spend Threshold Exceeded ($450 Budget Cap)',
    category: 'cost',
    severity: 'warning',
    status: 'active',
    timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    service: 'Production Gateway',
    description: 'Today spend reached $478.40, exceeding the $450 warning threshold. Heavy reasoning model usage observed in "Customer Assistant Agent".',
    metric_value: '$478.40',
    threshold: '> $450.00 / day',
    impact: 'Approaching hard monthly ceiling; cost optimization recommended',
    channel: 'billing@ostra.ai (Email)',
    trace_id: 'ost_trc_881204cf',
  },
  {
    title: 'OpenAI GPT-4o P99 Latency Degradation (> 1800ms)',
    category: 'latency',
    severity: 'warning',
    status: 'active',
    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    service: 'gpt-4o',
    description: 'P99 response latency rose to 2,140ms over the last 15-minute evaluation window. Upstream OpenAI us-east region reporting elevated queue depth.',
    metric_value: '2,140ms P99',
    threshold: '> 1,800ms P99',
    impact: 'Client facing latency degradation in interactive chat endpoints',
    channel: '#dev-oncall (PagerDuty)',
    trace_id: 'ost_trc_771923dd',
  },
  {
    title: 'Sudden Token Surge in Project "Autonomous Code Refactor"',
    category: 'cost',
    severity: 'critical',
    status: 'active',
    timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    service: 'deepseek-coder-v2',
    description: 'Worker pool generated 1.2M tokens in 10 minutes. Anomaly detection detected potential recursive agent loop in task worker thread #4.',
    metric_value: '1.2M tokens / 10m',
    threshold: '> 500k tokens / 10m',
    impact: 'Accelerated budget burn; automated rate clamp suggested',
    channel: '#alerts-prod-ai (Slack)',
    trace_id: 'ost_trc_310492ab',
  },
  {
    title: 'Virtual Key "dev-indexer-v2" Expiring in 48 Hours',
    category: 'security',
    severity: 'info',
    status: 'acknowledged',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    service: 'Key Manager',
    description: 'Automated token rotation alert: virtual API key dev-indexer-v2 will expire on scheduled lifecycle window. Secret rotation key is prepared.',
    metric_value: 'Expires in 47h',
    threshold: '< 48h to expiry',
    impact: 'Background indexing worker will require new key credentials',
    channel: 'dev-team@ostra.ai',
    trace_id: 'ost_trc_661048ba',
    acknowledged_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    title: 'Cache Invalidation Spike: Prompt Miss Ratio Reached 68%',
    category: 'latency',
    severity: 'info',
    status: 'acknowledged',
    timestamp: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString(),
    service: 'Prompt Cache Router',
    description: 'Semantic prefix cache hit rate dropped from 72% to 32% following staging deploy of system prompt v2.4. Latency increased by 140ms.',
    metric_value: '68% Cache Misses',
    threshold: '> 50% Cache Misses',
    impact: 'Slightly higher provider token fees and latency',
    channel: 'engineering@ostra.ai',
    trace_id: 'ost_trc_210948ef',
    acknowledged_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    title: 'Provider Failover: Together AI Llama-3-70B Returned 502 Bad Gateway',
    category: 'provider',
    severity: 'critical',
    status: 'resolved',
    timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    service: 'llama-3-70b-instruct',
    description: 'Upstream returned 5 consecutive 502 errors. Ostra Gateway automatically triggered fallback circuit-breaker to Groq LPUs with zero request drops.',
    metric_value: '5 failed calls',
    threshold: '> 3 errors / min',
    impact: 'Resolved automatically via zero-downtime multi-provider fallback',
    channel: '#alerts-prod-ai (Slack)',
    trace_id: 'ost_trc_554109ea',
    resolved_at: new Date(Date.now() - 5.5 * 3600 * 1000).toISOString(),
  },
  {
    title: 'Prompt Injection Pattern Intercepted on Route /v1/chat',
    category: 'security',
    severity: 'warning',
    status: 'resolved',
    timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    service: 'Ostra Guard Sentinel',
    description: 'Heuristic jailbreak filter detected repeated system prompt leak extraction attempt from IP 198.51.100.24. Request was sanitized and tagged.',
    metric_value: 'Score 0.98 (Jailbreak)',
    threshold: '> 0.85 Threat Score',
    impact: 'Request blocked safely before reaching LLM provider',
    channel: 'security-alerts@ostra.ai',
    trace_id: 'ost_trc_441298cc',
    resolved_at: new Date(Date.now() - 13.8 * 3600 * 1000).toISOString(),
  },
  {
    title: 'Mistral Large 2 Endpoint Restored to Normal Operation',
    category: 'provider',
    severity: 'info',
    status: 'resolved',
    timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    service: 'mistral-large-2407',
    description: 'Upstream Mistral AI EU-West cluster completed emergency maintenance. Health checks passing 100% of synthetic probes across 10 regions.',
    metric_value: '0% Error Rate',
    threshold: 'Synthetic probes 100%',
    impact: 'Traffic rebalanced back to primary European cluster',
    channel: '#alerts-prod-ai (Slack)',
    trace_id: 'ost_trc_110943aa',
    resolved_at: new Date(Date.now() - 19.5 * 3600 * 1000).toISOString(),
  },
];

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
    threshold: 'Spend > $450.00 / day',
    channel: 'billing@ostra.ai (Email)',
    enabled: true,
  },
  {
    name: 'P99 Latency SLA Guard',
    category: 'latency',
    severity: 'warning',
    threshold: 'P99 > 1800ms for 10 mins',
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
    channel: 'security-alerts@ostra.ai',
    enabled: true,
  },
];


/**
 * Fetch all alerts belonging strictly to the current user
 */
export const fetchUserAlerts = async (userId: string): Promise<SystemAlert[]> => {
  try {
    const q = query(
      collection(db, 'alerts'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      return await seedInitialAlerts(userId);
    }

    return snap.docs.map((doc) => doc.data() as SystemAlert);
  } catch (err) {
    console.warn('Falling back to direct user query without index:', err);
    try {
      const fallbackQuery = query(
        collection(db, 'alerts'),
        where('user_id', '==', userId)
      );
      const snap = await getDocs(fallbackQuery);
      if (snap.empty) {
        return await seedInitialAlerts(userId);
      }
      const list = snap.docs.map((d) => d.data() as SystemAlert);
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch {
      return [];
    }
  }
};

/**
 * Seed initial alerts for user when no alerts exist yet
 */
export const seedInitialAlerts = async (userId: string): Promise<SystemAlert[]> => {
  const seeded: SystemAlert[] = [];
  const now = new Date();

  for (let i = 0; i < DEFAULT_INITIAL_ALERTS.length; i++) {
    const template = DEFAULT_INITIAL_ALERTS[i];
    const alertId = `ALT-${8840 - i}`;
    const createdAt = new Date(now.getTime() - i * 15 * 60 * 1000).toISOString();

    const fullAlert: SystemAlert = {
      ...template,
      id: alertId,
      user_id: userId,
      created_at: createdAt,
      updated_at: createdAt,
    };

    await setDoc(doc(db, 'alerts', `${userId}_${alertId}`), fullAlert, { merge: true });
    seeded.push(fullAlert);
  }

  return seeded;
};

/**
 * Real-time listener for user alerts
 */
export const subscribeToUserAlerts = (
  userId: string,
  onUpdate: (alerts: SystemAlert[]) => void
): (() => void) => {
  const alertsRef = collection(db, 'alerts');
  const q = query(alertsRef, where('user_id', '==', userId));

  return onSnapshot(
    q,
    async (snapshot) => {
      if (snapshot.empty) {
        const seeded = await seedInitialAlerts(userId);
        onUpdate(seeded);
      } else {
        const list = snapshot.docs.map((doc) => doc.data() as SystemAlert);
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        onUpdate(list);
      }
    },
    (error) => {
      console.warn('Firestore alerts subscription warning:', error);
    }
  );
};

/**
 * Update alert status (active | acknowledged | resolved)
 */
export const updateAlertStatus = async (
  userId: string,
  alertId: string,
  status: AlertStatus
): Promise<void> => {
  const docId = alertId.includes(userId) ? alertId : `${userId}_${alertId}`;
  const alertRef = doc(db, 'alerts', docId);
  const now = new Date().toISOString();

  const updates: Partial<SystemAlert> = {
    status,
    updated_at: now,
  };

  if (status === 'acknowledged') {
    updates.acknowledged_at = now;
  } else if (status === 'resolved') {
    updates.resolved_at = now;
  }

  await updateDoc(alertRef, updates);
};

/**
 * Create a new live alert instance in Firestore
 */
export const createAlert = async (
  userId: string,
  alert: Omit<SystemAlert, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<SystemAlert> => {
  const alertId = `ALT-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newAlert: SystemAlert = {
    ...alert,
    id: alertId,
    user_id: userId,
    created_at: now,
    updated_at: now,
  };

  await setDoc(doc(db, 'alerts', `${userId}_${alertId}`), newAlert);
  return newAlert;
};

/**
 * Create a custom alert rule in Firestore
 */
export const createAlertRule = async (
  userId: string,
  rule: Omit<AlertRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<AlertRule> => {
  const ruleId = `rule_${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newRule: AlertRule = {
    ...rule,
    id: ruleId,
    user_id: userId,
    created_at: now,
    updated_at: now,
  };

  await setDoc(doc(db, 'alert_rules', `${userId}_${ruleId}`), newRule);
  return newRule;
};

/**
 * Fetch all configured alert rules for a user
 */
export const fetchUserAlertRules = async (userId: string): Promise<AlertRule[]> => {
  try {
    const q = query(collection(db, 'alert_rules'), where('user_id', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as AlertRule);
  } catch (err) {
    console.warn('Could not fetch alert rules:', err);
    return [];
  }
};

/**
 * Delete an alert from Firestore
 */
export const deleteAlert = async (userId: string, alertId: string): Promise<void> => {
  const docId = alertId.includes(userId) ? alertId : `${userId}_${alertId}`;
  await deleteDoc(doc(db, 'alerts', docId));
};

