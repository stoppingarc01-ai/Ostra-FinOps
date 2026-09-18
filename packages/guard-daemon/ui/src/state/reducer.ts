import type {
  TraceRecord,
  SessionSummary,
  VelocityMetrics,
  BudgetInfo,
  AlertItem,
  ConnectionState,
} from '../types';
import type { DashboardAction } from './actions';

export const MAX_TRACES_CAPACITY = 500;
export const MAX_ALERTS_CAPACITY = 15;

export interface DashboardState {
  traces: TraceRecord[];
  summary: SessionSummary;
  velocity: VelocityMetrics;
  budget: BudgetInfo;
  alerts: AlertItem[];
  connectionState: ConnectionState;
  lastError: string | null;
  lastEventId: number;
}

export const initialDashboardState: DashboardState = {
  traces: [],
  summary: {
    totalRequests: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCostUsd: 0,
    errorCount: 0,
    avgDurationMs: 0,
  },
  velocity: {
    velocity5mTPM: 0,
    velocity5mRPM: 0,
    currentBucketTPM: 0,
    peakTPM: 0,
    totalTokens5m: 0,
    totalRequests5m: 0,
    windowSeconds: 300,
  },
  budget: {
    ceiling: 5.0,
    spent: 0,
    spentPercent: 0,
    isOverBudget: false,
  },
  alerts: [],
  connectionState: 'CONNECTING',
  lastError: null,
  lastEventId: 0,
};

export function dashboardReducer(
  state: DashboardState,
  action: DashboardAction
): DashboardState {
  switch (action.type) {
    case 'SET_CONNECTION_STATE':
      return {
        ...state,
        connectionState: action.payload,
        lastError: action.error ?? (action.payload === 'LIVE' ? null : state.lastError),
      };

    case 'PREPEND_TRACE': {
      const trace = action.payload;
      // Deduplicate by ID
      const existingIdx = state.traces.findIndex((t) => t.id === trace.id);
      let updatedTraces: TraceRecord[];

      if (existingIdx !== -1) {
        // Replace existing
        updatedTraces = [...state.traces];
        updatedTraces[existingIdx] = trace;
      } else {
        // Prepend and cap strictly at MAX_TRACES_CAPACITY (500)
        updatedTraces = [trace, ...state.traces];
        if (updatedTraces.length > MAX_TRACES_CAPACITY) {
          updatedTraces.pop(); // Drop oldest
        }
      }

      // Check if trace triggered cost alert or failover alert
      const newAlerts = [...state.alerts];
      if (trace.statusCode >= 500) {
        newAlerts.unshift({
          id: `err_${trace.id}_${Date.now()}`,
          type: 'SYSTEM',
          severity: 'critical',
          title: `Server Error ${trace.statusCode}`,
          message: `${trace.routedModel} returned HTTP ${trace.statusCode}: ${trace.errorMessage || 'Internal Upstream Error'}`,
          timestamp: Date.now(),
        });
      } else if (trace.requestedModel.toLowerCase() !== trace.routedModel.toLowerCase()) {
        newAlerts.unshift({
          id: `failover_${trace.id}_${Date.now()}`,
          type: 'CIRCUIT_BREAKER',
          severity: 'warning',
          title: 'Model Failover Activated',
          message: `${trace.requestedModel} was rerouted to ${trace.routedModel}`,
          timestamp: Date.now(),
        });
      }

      if (newAlerts.length > MAX_ALERTS_CAPACITY) {
        newAlerts.pop();
      }

      return {
        ...state,
        traces: updatedTraces,
        alerts: newAlerts,
        lastEventId: action.eventId ?? state.lastEventId,
      };
    }

    case 'SET_TRACES': {
      let combined: TraceRecord[];
      if (action.append) {
        // Append older traces from pagination, deduplicating
        const existingIds = new Set(state.traces.map((t) => t.id));
        const newOnes = action.payload.filter((t) => !existingIds.has(t.id));
        combined = [...state.traces, ...newOnes];
      } else {
        // Full replacement on initial load or full sync
        combined = action.payload;
      }

      if (combined.length > MAX_TRACES_CAPACITY) {
        combined = combined.slice(0, MAX_TRACES_CAPACITY);
      }

      return {
        ...state,
        traces: combined,
        lastEventId: action.eventId ?? state.lastEventId,
      };
    }

    case 'UPDATE_SNAPSHOT':
      return {
        ...state,
        summary: action.payload.summary,
        velocity: action.payload.velocity,
        budget: action.payload.budget,
      };

    case 'UPDATE_METRICS': {
      const nextVelocity = action.payload.velocity ?? state.velocity;
      let nextSummary = state.summary;
      let nextBudget = state.budget;

      if (typeof action.payload.totalCostUsd === 'number') {
        const cost = action.payload.totalCostUsd;
        nextSummary = { ...state.summary, totalCostUsd: cost };
        nextBudget = {
          ...state.budget,
          spent: cost,
          spentPercent: state.budget.ceiling > 0 ? (cost / state.budget.ceiling) * 100 : 0,
          isOverBudget: cost >= state.budget.ceiling,
        };
      }

      return {
        ...state,
        velocity: nextVelocity,
        summary: nextSummary,
        budget: nextBudget,
      };
    }

    case 'PUSH_ALERT': {
      const updated = [action.payload, ...state.alerts];
      if (updated.length > MAX_ALERTS_CAPACITY) {
        updated.pop();
      }
      return {
        ...state,
        alerts: updated,
      };
    }

    case 'DISMISS_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter((a) => a.id !== action.payload),
      };

    case 'CLEAR_ALERTS':
      return {
        ...state,
        alerts: [],
      };

    default:
      return state;
  }
}
