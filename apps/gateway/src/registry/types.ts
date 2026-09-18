export type WireAdapter = 'openai_chat' | 'anthropic_messages';

export type Provider =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'deepseek'
  | 'grok'
  | 'kimi'
  | 'qwen'
  | 'glm';

export interface ModelSpec {
  id: string;
  provider: Provider;
  wireAdapter: WireAdapter;
  maxInputTokens: number;
  maxOutputTokens: number;
  inputCostPerMillion: number;
  outputCostPerMillion: number;
  isReasoningModel: boolean;
  family: string;
}

export interface FailoverCandidateResult {
  compatible: boolean;
  candidate?: ModelSpec;
  reason?: string;
  outputClamped: boolean;
  clampedLimit?: number;
}

export interface SanitizationResult {
  sanitizedPayload: Record<string, unknown>;
  outputClamped: boolean;
  clampedLimit?: number;
  strippedParameters: string[];
  injectedParameters: string[];
}

export interface RoutingTelemetry {
  originalModel: string;
  routedModel: string;
  fallbackTriggered: boolean;
  outputClamped: boolean;
  clampedLimit?: number;
}
