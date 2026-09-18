import type {
  TraceRecord,
  SessionSummary,
  VelocityMetrics,
  BudgetInfo,
  AlertItem,
  ConnectionState,
} from '../types';

export type DashboardAction =
  | { type: 'SET_CONNECTION_STATE'; payload: ConnectionState; error?: string }
  | { type: 'PREPEND_TRACE'; payload: TraceRecord; eventId?: number }
  | { type: 'SET_TRACES'; payload: TraceRecord[]; append?: boolean; eventId?: number }
  | { type: 'UPDATE_SNAPSHOT'; payload: { summary: SessionSummary; velocity: VelocityMetrics; budget: BudgetInfo } }
  | { type: 'UPDATE_METRICS'; payload: { velocity?: VelocityMetrics; totalCostUsd?: number } }
  | { type: 'PUSH_ALERT'; payload: AlertItem }
  | { type: 'DISMISS_ALERT'; payload: string }
  | { type: 'CLEAR_ALERTS' };
