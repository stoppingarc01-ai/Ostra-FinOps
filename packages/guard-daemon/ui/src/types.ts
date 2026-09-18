export type SseEventType =
  | 'trace'
  | 'session_snapshot'
  | 'metrics'
  | 'alert'
  | 'full_sync_required'
  | 'heartbeat';

export interface SseEnvelope<T = unknown> {
  v: 1;
  id: number;
  event: SseEventType;
  payload: T;
  timestamp: number;
}

export interface TraceRecord {
  id: string;
  requestId: string;
  sessionId: string;
  provider: string;
  requestedModel: string;
  routedModel: string;
  statusCode: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  durationMs: number;
  ttftMs?: number | null;
  stream: boolean;
  errorMessage?: string | null;
  timestamp: number;
  createdAt: string;
}

export interface SessionSummary {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
  errorCount: number;
  avgDurationMs: number;
}

export interface VelocityMetrics {
  velocity5mTPM: number;
  velocity5mRPM: number;
  currentBucketTPM: number;
  peakTPM: number;
  totalTokens5m: number;
  totalRequests5m: number;
  windowSeconds: number;
}

export interface BudgetInfo {
  ceiling: number;
  spent: number;
  spentPercent: number;
  isOverBudget: boolean;
}

export interface AlertItem {
  id: string;
  type: 'COST_SPIKE' | 'CONTEXT_BLOAT' | 'CIRCUIT_BREAKER' | 'RATE_LIMIT' | 'SYSTEM';
  severity: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

export type ConnectionState =
  | 'CONNECTING'
  | 'LIVE'
  | 'RECONNECTING'
  | 'FULL_SYNC'
  | 'DISCONNECTED'
  | 'AUTH_FAILED';

export interface TraceFiltersState {
  provider: string;
  status: 'all' | 'success' | 'error';
  search: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface LocalTaskRecord {
  id: string;
  title: string;
  description?: string | null;
  targetDate: string; // Format: YYYY-MM-DD
  targetTime?: string | null; // Format: HH:mm
  tokenBudgetUsd: number;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
}
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}
