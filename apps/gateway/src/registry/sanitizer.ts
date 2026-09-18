import type { ModelSpec, SanitizationResult, RoutingTelemetry } from './types';

// Parameters exclusive to reasoning/thinking models that must be stripped on standard downgrade
const REASONING_DENYLIST = new Set([
  'thinking',
  'reasoning_effort',
  'budget_tokens',
]);

// Sampling parameters forbidden or restricted by strict reasoning models (e.g. OpenAI o1)
const SAMPLING_OVERRIDE_DENYLIST = new Set([
  'temperature',
  'top_p',
  'presence_penalty',
  'frequency_penalty',
]);

/**
 * Hybrid Capability Parameter Sanitizer.
 * Applies capability-denylisting when cascading across model families while
 * passing through unrecognized arbitrary parameters for forward SDK compatibility.
 */
export function sanitizePayloadForModel(
  originalPayload: Record<string, unknown>,
  sourceModel: ModelSpec,
  targetModel: ModelSpec,
  clampedLimit?: number
): SanitizationResult {
  const sanitized = { ...originalPayload };
  const strippedParameters: string[] = [];
  const injectedParameters: string[] = [];

  // 1. Update routed model name
  sanitized.model = targetModel.id;

  // 2. Output Clamping
  let outputClamped = false;
  if (clampedLimit !== undefined) {
    outputClamped = true;
    if ('max_completion_tokens' in sanitized) {
      sanitized.max_completion_tokens = clampedLimit;
    } else {
      sanitized.max_tokens = clampedLimit;
    }
  }

  // 3. Scenario A: Reasoning -> Standard Downgrade
  if (sourceModel.isReasoningModel && !targetModel.isReasoningModel) {
    // Strip reasoning-only directives
    for (const key of Object.keys(sanitized)) {
      if (REASONING_DENYLIST.has(key)) {
        delete sanitized[key];
        strippedParameters.push(key);
      }
    }

    // Inject sensible sampling defaults if omitted
    if (sanitized.temperature === undefined) {
      sanitized.temperature = 0.7;
      injectedParameters.push('temperature=0.7');
    }
  }

  // 4. Scenario B: Standard -> Reasoning Upgrade
  if (!sourceModel.isReasoningModel && targetModel.isReasoningModel) {
    // OpenAI o1 / o1-mini forbid temperature, top_p, etc.
    if (targetModel.family === 'openai_reasoning') {
      for (const key of Object.keys(sanitized)) {
        if (SAMPLING_OVERRIDE_DENYLIST.has(key)) {
          delete sanitized[key];
          strippedParameters.push(key);
        }
      }
    }
  }

  return {
    sanitizedPayload: sanitized,
    outputClamped,
    clampedLimit,
    strippedParameters,
    injectedParameters,
  };
}

/**
 * Generates transparent diagnostic telemetry HTTP headers.
 */
export function buildRoutingHeaders(telemetry: RoutingTelemetry): Record<string, string> {
  return {
    'X-OsterdOps-Original-Model': telemetry.originalModel,
    'X-OsterdOps-Routed-Model': telemetry.routedModel,
    'X-OsterdOps-Fallback-Triggered': telemetry.fallbackTriggered ? 'true' : 'false',
    'X-OsterdOps-Output-Clamped': telemetry.outputClamped
      ? String(telemetry.clampedLimit ?? 'true')
      : 'none',
  };
}

/**
 * Generates an SSE stream comment line for IDE agents (Cursor, Cline, Windsurf)
 * that discard HTTP headers.
 */
export function buildRoutingSseComment(telemetry: RoutingTelemetry): string {
  const payload = JSON.stringify({
    original: telemetry.originalModel,
    routed: telemetry.routedModel,
    fallback: telemetry.fallbackTriggered,
    clamped: telemetry.outputClamped,
    clamped_limit: telemetry.clampedLimit ?? null,
  });
  return `: osterdops-routing: ${payload}\n\n`;
}
