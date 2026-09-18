import type { ModelSpec, Provider } from './types';

/**
 * Curated 40-Model Registry across 8 Premier AI Providers.
 * Defines exact input/output boundaries, pricing per million tokens, wire adapter schemas,
 * reasoning capability classifications, and fallback affinity families.
 */
export const MODEL_CATALOG: Record<string, ModelSpec> = {
  // ============================================================================
  // 1. OpenAI (wireAdapter: 'openai_chat')
  // ============================================================================
  'o1': {
    id: 'o1',
    provider: 'openai',
    wireAdapter: 'openai_chat',
    maxInputTokens: 200_000,
    maxOutputTokens: 100_000,
    inputCostPerMillion: 15.0,
    outputCostPerMillion: 60.0,
    isReasoningModel: true,
    family: 'openai_reasoning',
  },
  'o1-mini': {
    id: 'o1-mini',
    provider: 'openai',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 65_536,
    inputCostPerMillion: 3.0,
    outputCostPerMillion: 12.0,
    isReasoningModel: true,
    family: 'openai_reasoning',
  },
  'o3-mini': {
    id: 'o3-mini',
    provider: 'openai',
    wireAdapter: 'openai_chat',
    maxInputTokens: 200_000,
    maxOutputTokens: 100_000,
    inputCostPerMillion: 1.1,
    outputCostPerMillion: 4.4,
    isReasoningModel: true,
    family: 'openai_reasoning',
  },
  'gpt-4o': {
    id: 'gpt-4o',
    provider: 'openai',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 16_384,
    inputCostPerMillion: 2.5,
    outputCostPerMillion: 10.0,
    isReasoningModel: false,
    family: 'openai_flagship',
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    provider: 'openai',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 16_384,
    inputCostPerMillion: 0.15,
    outputCostPerMillion: 0.6,
    isReasoningModel: false,
    family: 'openai_economy',
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    provider: 'openai',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 10.0,
    outputCostPerMillion: 30.0,
    isReasoningModel: false,
    family: 'openai_flagship',
  },

  // ============================================================================
  // 2. Anthropic (wireAdapter: 'anthropic_messages')
  // ============================================================================
  'claude-3-7-sonnet': {
    id: 'claude-3-7-sonnet',
    provider: 'anthropic',
    wireAdapter: 'anthropic_messages',
    maxInputTokens: 200_000,
    maxOutputTokens: 64_000,
    inputCostPerMillion: 3.0,
    outputCostPerMillion: 15.0,
    isReasoningModel: true,
    family: 'anthropic_sonnet',
  },
  'claude-3-5-sonnet': {
    id: 'claude-3-5-sonnet',
    provider: 'anthropic',
    wireAdapter: 'anthropic_messages',
    maxInputTokens: 200_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 3.0,
    outputCostPerMillion: 15.0,
    isReasoningModel: false,
    family: 'anthropic_sonnet',
  },
  'claude-3-5-haiku': {
    id: 'claude-3-5-haiku',
    provider: 'anthropic',
    wireAdapter: 'anthropic_messages',
    maxInputTokens: 200_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 0.8,
    outputCostPerMillion: 4.0,
    isReasoningModel: false,
    family: 'anthropic_haiku',
  },
  'claude-3-opus': {
    id: 'claude-3-opus',
    provider: 'anthropic',
    wireAdapter: 'anthropic_messages',
    maxInputTokens: 200_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 15.0,
    outputCostPerMillion: 75.0,
    isReasoningModel: false,
    family: 'anthropic_flagship',
  },
  'claude-3-sonnet': {
    id: 'claude-3-sonnet',
    provider: 'anthropic',
    wireAdapter: 'anthropic_messages',
    maxInputTokens: 200_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 3.0,
    outputCostPerMillion: 15.0,
    isReasoningModel: false,
    family: 'anthropic_sonnet',
  },
  'claude-3-haiku': {
    id: 'claude-3-haiku',
    provider: 'anthropic',
    wireAdapter: 'anthropic_messages',
    maxInputTokens: 200_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 0.25,
    outputCostPerMillion: 1.25,
    isReasoningModel: false,
    family: 'anthropic_haiku',
  },

  // ============================================================================
  // 3. Gemini / Google (wireAdapter: 'openai_chat')
  // ============================================================================
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    provider: 'gemini',
    wireAdapter: 'openai_chat',
    maxInputTokens: 1_000_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 1.25,
    outputCostPerMillion: 5.0,
    isReasoningModel: true,
    family: 'gemini_flagship',
  },
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    provider: 'gemini',
    wireAdapter: 'openai_chat',
    maxInputTokens: 1_000_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 0.1,
    outputCostPerMillion: 0.4,
    isReasoningModel: false,
    family: 'gemini_flash',
  },
  'gemini-2.0-flash-thinking': {
    id: 'gemini-2.0-flash-thinking',
    provider: 'gemini',
    wireAdapter: 'openai_chat',
    maxInputTokens: 1_000_000,
    maxOutputTokens: 64_000,
    inputCostPerMillion: 0.15,
    outputCostPerMillion: 0.6,
    isReasoningModel: true,
    family: 'gemini_flash',
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    provider: 'gemini',
    wireAdapter: 'openai_chat',
    maxInputTokens: 1_000_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 1.25,
    outputCostPerMillion: 5.0,
    isReasoningModel: false,
    family: 'gemini_flagship',
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    provider: 'gemini',
    wireAdapter: 'openai_chat',
    maxInputTokens: 1_000_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 0.075,
    outputCostPerMillion: 0.3,
    isReasoningModel: false,
    family: 'gemini_flash',
  },

  // ============================================================================
  // 4. DeepSeek (wireAdapter: 'openai_chat')
  // ============================================================================
  'deepseek-reasoner': {
    id: 'deepseek-reasoner',
    provider: 'deepseek',
    wireAdapter: 'openai_chat',
    maxInputTokens: 64_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 0.55,
    outputCostPerMillion: 2.19,
    isReasoningModel: true,
    family: 'deepseek_r1',
  },
  'deepseek-chat': {
    id: 'deepseek-chat',
    provider: 'deepseek',
    wireAdapter: 'openai_chat',
    maxInputTokens: 64_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 0.14,
    outputCostPerMillion: 0.28,
    isReasoningModel: false,
    family: 'deepseek_v3',
  },
  'deepseek-coder': {
    id: 'deepseek-coder',
    provider: 'deepseek',
    wireAdapter: 'openai_chat',
    maxInputTokens: 64_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 0.14,
    outputCostPerMillion: 0.28,
    isReasoningModel: false,
    family: 'deepseek_v3',
  },

  // ============================================================================
  // 5. Grok / xAI (wireAdapter: 'openai_chat')
  // ============================================================================
  'grok-2': {
    id: 'grok-2',
    provider: 'grok',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 2.0,
    outputCostPerMillion: 10.0,
    isReasoningModel: false,
    family: 'grok_flagship',
  },
  'grok-2-vision': {
    id: 'grok-2-vision',
    provider: 'grok',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 2.0,
    outputCostPerMillion: 10.0,
    isReasoningModel: false,
    family: 'grok_flagship',
  },
  'grok-beta': {
    id: 'grok-beta',
    provider: 'grok',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 5.0,
    outputCostPerMillion: 15.0,
    isReasoningModel: false,
    family: 'grok_flagship',
  },

  // ============================================================================
  // 6. Kimi / Moonshot (wireAdapter: 'openai_chat')
  // ============================================================================
  'kimi-k1.5': {
    id: 'kimi-k1.5',
    provider: 'kimi',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 1.5,
    outputCostPerMillion: 3.5,
    isReasoningModel: true,
    family: 'kimi_reasoning',
  },
  'moonshot-v1-128k': {
    id: 'moonshot-v1-128k',
    provider: 'kimi',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 1.2,
    outputCostPerMillion: 2.5,
    isReasoningModel: false,
    family: 'kimi_general',
  },
  'moonshot-v1-32k': {
    id: 'moonshot-v1-32k',
    provider: 'kimi',
    wireAdapter: 'openai_chat',
    maxInputTokens: 32_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 0.8,
    outputCostPerMillion: 1.8,
    isReasoningModel: false,
    family: 'kimi_general',
  },
  'moonshot-v1-8k': {
    id: 'moonshot-v1-8k',
    provider: 'kimi',
    wireAdapter: 'openai_chat',
    maxInputTokens: 8_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 0.5,
    outputCostPerMillion: 1.2,
    isReasoningModel: false,
    family: 'kimi_general',
  },

  // ============================================================================
  // 7. Qwen / Alibaba (wireAdapter: 'openai_chat')
  // ============================================================================
  'qwen-2.5-max': {
    id: 'qwen-2.5-max',
    provider: 'qwen',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 1.6,
    outputCostPerMillion: 6.4,
    isReasoningModel: true,
    family: 'qwen_max',
  },
  'qwen-2.5-72b': {
    id: 'qwen-2.5-72b',
    provider: 'qwen',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 0.4,
    outputCostPerMillion: 1.2,
    isReasoningModel: false,
    family: 'qwen_flagship',
  },
  'qwen-2.5-32b': {
    id: 'qwen-2.5-32b',
    provider: 'qwen',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 0.2,
    outputCostPerMillion: 0.6,
    isReasoningModel: false,
    family: 'qwen_mid',
  },
  'qwen-2.5-coder-32b': {
    id: 'qwen-2.5-coder-32b',
    provider: 'qwen',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 0.2,
    outputCostPerMillion: 0.6,
    isReasoningModel: false,
    family: 'qwen_mid',
  },
  'qwen-turbo': {
    id: 'qwen-turbo',
    provider: 'qwen',
    wireAdapter: 'openai_chat',
    maxInputTokens: 1_000_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 0.05,
    outputCostPerMillion: 0.2,
    isReasoningModel: false,
    family: 'qwen_economy',
  },
  'qwen-plus': {
    id: 'qwen-plus',
    provider: 'qwen',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 0.2,
    outputCostPerMillion: 0.8,
    isReasoningModel: false,
    family: 'qwen_mid',
  },

  // ============================================================================
  // 8. GLM / Zhipu (wireAdapter: 'openai_chat')
  // ============================================================================
  'glm-4-plus': {
    id: 'glm-4-plus',
    provider: 'glm',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 1.4,
    outputCostPerMillion: 1.4,
    isReasoningModel: false,
    family: 'glm_flagship',
  },
  'glm-4-air': {
    id: 'glm-4-air',
    provider: 'glm',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 0.14,
    outputCostPerMillion: 0.14,
    isReasoningModel: false,
    family: 'glm_economy',
  },
  'glm-4-flash': {
    id: 'glm-4-flash',
    provider: 'glm',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 0.01,
    outputCostPerMillion: 0.01,
    isReasoningModel: false,
    family: 'glm_economy',
  },
  'glm-4-long': {
    id: 'glm-4-long',
    provider: 'glm',
    wireAdapter: 'openai_chat',
    maxInputTokens: 1_000_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 0.14,
    outputCostPerMillion: 0.14,
    isReasoningModel: false,
    family: 'glm_flagship',
  },
  'glm-4-0520': {
    id: 'glm-4-0520',
    provider: 'glm',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 1.0,
    outputCostPerMillion: 1.0,
    isReasoningModel: false,
    family: 'glm_flagship',
  },
  'glm-zero-preview': {
    id: 'glm-zero-preview',
    provider: 'glm',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 8_192,
    inputCostPerMillion: 1.5,
    outputCostPerMillion: 2.5,
    isReasoningModel: true,
    family: 'glm_reasoning',
  },
  'glm-3-turbo': {
    id: 'glm-3-turbo',
    provider: 'glm',
    wireAdapter: 'openai_chat',
    maxInputTokens: 128_000,
    maxOutputTokens: 4_096,
    inputCostPerMillion: 0.05,
    outputCostPerMillion: 0.05,
    isReasoningModel: false,
    family: 'glm_economy',
  },
};

/**
 * Normalizes input model identifiers (stripping date prefixes or case variations)
 * and retrieves the ModelSpec from the registry.
 */
export function getModelSpec(modelId: string): ModelSpec | undefined {
  if (!modelId) return undefined;
  const normalized = modelId.toLowerCase().trim();

  // Exact match
  if (MODEL_CATALOG[normalized]) {
    return MODEL_CATALOG[normalized];
  }

  // Prefix match (e.g. gpt-4o-2024-08-06 -> gpt-4o)
  for (const [key, spec] of Object.entries(MODEL_CATALOG)) {
    if (normalized.startsWith(key)) {
      return spec;
    }
  }

  return undefined;
}

/**
 * Returns all registered models for a given provider.
 */
export function listModelsByProvider(provider: Provider): ModelSpec[] {
  return Object.values(MODEL_CATALOG).filter((m) => m.provider === provider);
}
