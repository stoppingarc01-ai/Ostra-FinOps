export interface ModelPrice {
  inputPerMillion: number;
  outputPerMillion: number;
}

export const MODEL_PRICING_TABLE: Record<string, ModelPrice> = {
  // Anthropic Models
  'claude-3-7-sonnet': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  'claude-3-7-sonnet-20250219': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  'claude-3-5-sonnet': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  'claude-3-5-sonnet-20241022': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  'claude-3-5-sonnet-20240620': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  'claude-3-5-haiku': { inputPerMillion: 0.8, outputPerMillion: 4.0 },
  'claude-3-5-haiku-20241022': { inputPerMillion: 0.8, outputPerMillion: 4.0 },
  'claude-3-opus': { inputPerMillion: 15.0, outputPerMillion: 75.0 },
  'claude-3-opus-20240229': { inputPerMillion: 15.0, outputPerMillion: 75.0 },
  'claude-3-haiku': { inputPerMillion: 0.25, outputPerMillion: 1.25 },
  'claude-3-haiku-20240307': { inputPerMillion: 0.25, outputPerMillion: 1.25 },

  // OpenAI Models
  'gpt-4o': { inputPerMillion: 2.5, outputPerMillion: 10.0 },
  'gpt-4o-2024-11-20': { inputPerMillion: 2.5, outputPerMillion: 10.0 },
  'gpt-4o-2024-08-06': { inputPerMillion: 2.5, outputPerMillion: 10.0 },
  'gpt-4o-mini': { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  'gpt-4o-mini-2024-07-18': { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  'o1': { inputPerMillion: 15.0, outputPerMillion: 60.0 },
  'o1-preview': { inputPerMillion: 15.0, outputPerMillion: 60.0 },
  'o1-mini': { inputPerMillion: 3.0, outputPerMillion: 12.0 },
  'o3-mini': { inputPerMillion: 1.1, outputPerMillion: 4.4 },
  'gpt-4-turbo': { inputPerMillion: 10.0, outputPerMillion: 30.0 },
  'gpt-4': { inputPerMillion: 30.0, outputPerMillion: 60.0 },
  'gpt-3.5-turbo': { inputPerMillion: 0.5, outputPerMillion: 1.5 },
  'text-embedding-3-small': { inputPerMillion: 0.02, outputPerMillion: 0.0 },
  'text-embedding-3-large': { inputPerMillion: 0.13, outputPerMillion: 0.0 },
  'text-embedding-ada-002': { inputPerMillion: 0.10, outputPerMillion: 0.0 },

  // Google Gemini Models
  'gemini-2.5-pro': { inputPerMillion: 1.25, outputPerMillion: 5.0 },
  'gemini-2.5-flash': { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  'gemini-2.0-flash': { inputPerMillion: 0.10, outputPerMillion: 0.4 },
  'gemini-2.0-flash-exp': { inputPerMillion: 0.10, outputPerMillion: 0.4 },
  'gemini-2.0-pro-exp': { inputPerMillion: 1.25, outputPerMillion: 5.0 },
  'gemini-1.5-pro': { inputPerMillion: 1.25, outputPerMillion: 5.0 },
  'gemini-1.5-flash': { inputPerMillion: 0.075, outputPerMillion: 0.3 },
  'gemini-1.5-flash-8b': { inputPerMillion: 0.0375, outputPerMillion: 0.15 },

  // DeepSeek Models
  'deepseek-chat': { inputPerMillion: 0.14, outputPerMillion: 0.28 },
  'deepseek-v3': { inputPerMillion: 0.14, outputPerMillion: 0.28 },
  'deepseek-reasoner': { inputPerMillion: 0.55, outputPerMillion: 2.19 },
  'deepseek-r1': { inputPerMillion: 0.55, outputPerMillion: 2.19 },

  // xAI Grok Models
  'grok-2': { inputPerMillion: 2.0, outputPerMillion: 10.0 },
  'grok-2-1212': { inputPerMillion: 2.0, outputPerMillion: 10.0 },
  'grok-2-vision': { inputPerMillion: 2.0, outputPerMillion: 10.0 },
  'grok-beta': { inputPerMillion: 5.0, outputPerMillion: 15.0 },

  // Mistral AI Models
  'mistral-large-latest': { inputPerMillion: 2.0, outputPerMillion: 6.0 },
  'mistral-large-2411': { inputPerMillion: 2.0, outputPerMillion: 6.0 },
  'mistral-small-latest': { inputPerMillion: 0.2, outputPerMillion: 0.6 },
  'codestral-latest': { inputPerMillion: 0.3, outputPerMillion: 0.9 },
  'ministral-8b-latest': { inputPerMillion: 0.1, outputPerMillion: 0.1 },
  'mistral-embed': { inputPerMillion: 0.1, outputPerMillion: 0.0 },

  // Open Weights / Meta Llama / Qwen (OpenRouter / Groq / Together)
  'meta-llama/llama-3.3-70b-instruct': { inputPerMillion: 0.70, outputPerMillion: 0.80 },
  'meta-llama/llama-3.1-405b-instruct': { inputPerMillion: 2.50, outputPerMillion: 2.50 },
  'meta-llama/llama-3.1-70b-instruct': { inputPerMillion: 0.60, outputPerMillion: 0.70 },
  'meta-llama/llama-3.1-8b-instruct': { inputPerMillion: 0.08, outputPerMillion: 0.08 },
  'llama-3.3-70b': { inputPerMillion: 0.70, outputPerMillion: 0.80 },
  'llama-3.1-70b': { inputPerMillion: 0.60, outputPerMillion: 0.70 },
  'llama-3.1-8b': { inputPerMillion: 0.08, outputPerMillion: 0.08 },
  'qwen/qwen-2.5-coder-32b-instruct': { inputPerMillion: 0.30, outputPerMillion: 0.40 },
};

/** Dynamic user or sheet registered pricing overrides */
const CUSTOM_PRICING_OVERRIDES: Record<string, ModelPrice> = {};

export function registerCustomModelPrice(modelName: string, price: ModelPrice): void {
  CUSTOM_PRICING_OVERRIDES[modelName.trim().toLowerCase()] = price;
}

/**
 * Intelligent tier-based fallback price calculator when exact model name is unrecognized.
 * Infers appropriate cost tier from model family / size signals.
 */
function inferFallbackPrice(modelName: string): ModelPrice {
  const lower = modelName.toLowerCase();

  // Tier 1: Small / Fast / Sub-1B to 8B models & Embeddings
  if (
    lower.includes('mini') ||
    lower.includes('flash') ||
    lower.includes('haiku') ||
    lower.includes('small') ||
    lower.includes('8b') ||
    lower.includes('nano') ||
    lower.includes('embed')
  ) {
    return { inputPerMillion: 0.15, outputPerMillion: 0.60 };
  }

  // Tier 2: Heavy reasoning / ultra-large models (Opus, 405B, o1, R1)
  if (
    lower.includes('opus') ||
    lower.includes('405b') ||
    lower.includes('reasoner') ||
    lower.includes('o1') ||
    lower.includes('large')
  ) {
    return { inputPerMillion: 5.0, outputPerMillion: 20.0 };
  }

  // Tier 3: Standard Tier (GPT-4o class / Sonnet class general models)
  return { inputPerMillion: 1.5, outputPerMillion: 6.0 };
}

/**
 * Resolves pricing for a given model string, checking custom overrides,
 * exact table matches, prefix matches, and intelligent tiered heuristics.
 */
export function getModelPricing(modelName: string): ModelPrice {
  if (!modelName) return inferFallbackPrice('default');
  const normalized = modelName.trim().toLowerCase();

  if (CUSTOM_PRICING_OVERRIDES[normalized]) {
    return CUSTOM_PRICING_OVERRIDES[normalized];
  }

  if (MODEL_PRICING_TABLE[normalized]) {
    return MODEL_PRICING_TABLE[normalized];
  }

  // Prefix match (e.g. "gpt-4o-mini-2024-07-18" or "claude-3-5-sonnet@20241022")
  for (const [key, price] of Object.entries(MODEL_PRICING_TABLE)) {
    if (normalized.startsWith(key) || key.startsWith(normalized)) {
      return price;
    }
  }

  return inferFallbackPrice(normalized);
}

/**
 * Computes exact USD cost from token counts, accurate to 6 decimal places.
 */
export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = getModelPricing(model);
  const inputCost = (Math.max(0, inputTokens) / 1_000_000) * pricing.inputPerMillion;
  const outputCost = (Math.max(0, outputTokens) / 1_000_000) * pricing.outputPerMillion;
  const total = inputCost + outputCost;
  return Math.round(total * 1_000_000) / 1_000_000;
}
