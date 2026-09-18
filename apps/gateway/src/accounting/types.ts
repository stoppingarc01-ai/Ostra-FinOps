export interface ExtractedTokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  isEstimated: boolean;
}

export interface CostCalculationResult {
  inputCostUsd: number;
  outputCostUsd: number;
  cacheReadCostUsd: number;
  totalCostUsd: number;
}

export interface TelemetryLogRecord {
  requestId: string;
  organizationId: string;
  projectId: string;
  environmentId: string;
  virtualKeyId: string;
  provider: string;
  requestedModel: string;
  routedModel: string;
  fallbackUsed: boolean;
  fallbackFromModel: string | null;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
  statusCode: number;
  errorType: string | null;
  errorCode: string | null;
  createdAt: string;
  completedAt: string;
}

export interface SpendSyncResult {
  success: boolean;
  currentSpendUsd: number;
  monthlyLimitUsd: number;
  isFrozen: boolean;
  error?: string;
}

export interface WebhookAlertPayload {
  event: 'key_milestone_80' | 'key_budget_frozen_100';
  organizationId: string;
  virtualKeyId: string;
  keyPrefix: string;
  currentSpendUsd: number;
  monthlyLimitUsd: number;
  utilizationPercentage: number;
  timestamp: string;
}
