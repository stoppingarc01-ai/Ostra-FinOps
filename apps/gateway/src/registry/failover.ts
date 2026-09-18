import { getModelSpec, MODEL_CATALOG } from './catalog';
import type { FailoverCandidateResult, ModelSpec } from './types';

/**
 * Fallback candidate preference chains for common flagship models.
 * Prioritizes intra-family fallback first, then cross-provider models with identical wireAdapters.
 */
const DEFAULT_FALLBACK_CHAINS: Record<string, string[]> = {
  // OpenAI
  'o1': ['o3-mini', 'o1-mini', 'gpt-4o', 'deepseek-reasoner'],
  'o3-mini': ['o1-mini', 'gpt-4o-mini', 'deepseek-reasoner'],
  'o1-mini': ['o3-mini', 'gpt-4o-mini', 'deepseek-chat'],
  'gpt-4o': ['gpt-4o-mini', 'deepseek-chat', 'gemini-2.0-flash', 'qwen-2.5-72b'],
  'gpt-4o-mini': ['deepseek-chat', 'gemini-2.0-flash', 'qwen-turbo'],
  'gpt-4-turbo': ['gpt-4o', 'gpt-4o-mini'],

  // Anthropic (All share wireAdapter: 'anthropic_messages')
  'claude-3-7-sonnet': ['claude-3-5-sonnet', 'claude-3-5-haiku', 'claude-3-sonnet'],
  'claude-3-5-sonnet': ['claude-3-5-haiku', 'claude-3-sonnet', 'claude-3-haiku'],
  'claude-3-5-haiku': ['claude-3-haiku', 'claude-3-5-sonnet'],
  'claude-3-opus': ['claude-3-sonnet', 'claude-3-haiku'],
  'claude-3-sonnet': ['claude-3-haiku'],

  // DeepSeek (wireAdapter: 'openai_chat')
  'deepseek-reasoner': ['deepseek-chat', 'qwen-2.5-max', 'o3-mini'],
  'deepseek-chat': ['deepseek-coder', 'gpt-4o-mini', 'gemini-2.0-flash'],
  'deepseek-coder': ['deepseek-chat', 'qwen-2.5-coder-32b'],

  // Gemini (wireAdapter: 'openai_chat')
  'gemini-2.5-pro': ['gemini-2.0-flash', 'gpt-4o', 'gemini-1.5-pro'],
  'gemini-2.0-flash-thinking': ['gemini-2.0-flash', 'deepseek-reasoner'],
  'gemini-2.0-flash': ['gemini-1.5-flash', 'gpt-4o-mini'],

  // Grok (wireAdapter: 'openai_chat')
  'grok-2': ['gpt-4o', 'qwen-2.5-72b', 'deepseek-chat'],
  'grok-beta': ['grok-2', 'gpt-4o'],

  // Kimi (wireAdapter: 'openai_chat')
  'kimi-k1.5': ['moonshot-v1-128k', 'qwen-2.5-max'],
  'moonshot-v1-128k': ['moonshot-v1-32k', 'gpt-4o-mini'],

  // Qwen (wireAdapter: 'openai_chat')
  'qwen-2.5-max': ['qwen-2.5-72b', 'deepseek-chat', 'gpt-4o'],
  'qwen-2.5-72b': ['qwen-2.5-32b', 'gpt-4o-mini'],

  // GLM (wireAdapter: 'openai_chat')
  'glm-4-plus': ['glm-4-air', 'glm-4-flash'],
  'glm-zero-preview': ['deepseek-reasoner', 'glm-4-plus'],
};

/**
 * 3-Step Failover Constraint Solver.
 * Evaluates candidate models against strict operational criteria:
 * 1. Wire Adapter Parity (candidate.wireAdapter === requested.wireAdapter)
 * 2. Context Window Safety (promptTokens <= candidate.maxInputTokens)
 * 3. Output Budget Validation & Clamping (requestedOutput > candidate.maxOutputTokens -> clamp)
 */
export function resolveFailoverCandidate(
  requestedModelId: string,
  promptTokens: number,
  requestedOutputTokens?: number
): FailoverCandidateResult {
  const requestedSpec = getModelSpec(requestedModelId);
  if (!requestedSpec) {
    return {
      compatible: false,
      outputClamped: false,
      reason: `Requested model '${requestedModelId}' is not registered in the catalog.`,
    };
  }

  // 1. Determine candidate chain
  const chainCandidateIds = DEFAULT_FALLBACK_CHAINS[requestedSpec.id] || [];

  // If no explicit chain, try intra-family or same-wireAdapter models
  const candidatePool: ModelSpec[] = [];
  for (const id of chainCandidateIds) {
    const spec = getModelSpec(id);
    if (spec) candidatePool.push(spec);
  }

  // Secondary pool: all models matching wireAdapter from same or compatible provider
  for (const spec of Object.values(MODEL_CATALOG)) {
    if (
      spec.id !== requestedSpec.id &&
      spec.wireAdapter === requestedSpec.wireAdapter &&
      !candidatePool.some((c) => c.id === spec.id)
    ) {
      candidatePool.push(spec);
    }
  }

  // 2. Evaluate candidates in order
  for (const candidate of candidatePool) {
    // Check 1: Strict Wire Adapter Parity
    if (candidate.wireAdapter !== requestedSpec.wireAdapter) {
      continue;
    }

    // Check 2: Context Window Safety
    if (promptTokens > candidate.maxInputTokens) {
      // Candidate's context window cannot accommodate the prompt
      continue;
    }

    // Check 3: Output Budget Validation & Clamping
    let outputClamped = false;
    let clampedLimit: number | undefined;

    if (requestedOutputTokens && requestedOutputTokens > candidate.maxOutputTokens) {
      outputClamped = true;
      clampedLimit = candidate.maxOutputTokens;
    }

    // Candidate satisfied all constraints!
    return {
      compatible: true,
      candidate,
      outputClamped,
      clampedLimit,
    };
  }

  // No candidate in the pool satisfied constraints
  return {
    compatible: false,
    outputClamped: false,
    reason: `No compatible failover candidate found matching wireAdapter '${requestedSpec.wireAdapter}' with input context >= ${promptTokens} tokens.`,
  };
}
