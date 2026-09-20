/**
 * Deterministic Intra-Family Cascader (Helicone & OstraOps Resilience Pattern)
 * When an upstream provider experiences transient outages or severe capacity limits (5xx, 429 overloaded),
 * automatically cascades the request to a battle-tested sibling in the SAME model family.
 */

export const INTRA_FAMILY_CASCADE: Record<string, string> = {
  // Anthropic Claude Family (Sonnet -> Haiku)
  'claude-3-7-sonnet': 'claude-3-5-sonnet',
  'claude-3-7-sonnet-20250219': 'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet': 'claude-3-5-haiku',
  'claude-3-5-sonnet-20241022': 'claude-3-5-haiku-20241022',
  'claude-3-5-sonnet-20240620': 'claude-3-5-haiku',
  'claude-3-opus': 'claude-3-5-sonnet',
  'claude-3-opus-20240229': 'claude-3-5-sonnet-20241022',

  // OpenAI Family (o1 -> o3-mini, GPT-4o -> GPT-4o-mini)
  'o1': 'o3-mini',
  'o1-preview': 'o3-mini',
  'gpt-4o': 'gpt-4o-mini',
  'gpt-4o-2024-11-20': 'gpt-4o-mini-2024-07-18',
  'gpt-4o-2024-08-06': 'gpt-4o-mini-2024-07-18',
  'gpt-4-turbo': 'gpt-4o-mini',
  'gpt-4': 'gpt-4o-mini',

  // DeepSeek Family (Reasoner -> Chat)
  'deepseek-reasoner': 'deepseek-chat',
  'deepseek-r1': 'deepseek-v3',

  // Google Gemini Family (Pro -> Flash)
  'gemini-2.5-pro': 'gemini-2.5-flash',
  'gemini-2.0-pro-exp': 'gemini-2.0-flash',
  'gemini-1.5-pro': 'gemini-1.5-flash',

  // Mistral Family (Large -> Small)
  'mistral-large-latest': 'mistral-small-latest',
  'mistral-large-2411': 'mistral-small-latest',
};

/**
 * Returns deterministic fallback model in the same family, or null if no fallback exists.
 */
export function getIntraFamilyFallback(modelName: string): string | null {
  if (!modelName) return null;
  const normalized = modelName.trim().toLowerCase();

  // Exact lookup
  if (INTRA_FAMILY_CASCADE[normalized]) {
    return INTRA_FAMILY_CASCADE[normalized];
  }

  // Prefix match
  for (const [key, fallback] of Object.entries(INTRA_FAMILY_CASCADE)) {
    if (normalized.startsWith(key)) {
      return fallback;
    }
  }

  return null;
}

/**
 * Determines whether an upstream HTTP status code or error qualifies for failover.
 */
export function isFailoverEligible(statusCode: number, errorMessage?: string): boolean {
  // Upstream server errors
  if (statusCode === 500 || statusCode === 502 || statusCode === 503 || statusCode === 504 || statusCode === 529) {
    return true;
  }

  // Upstream overloaded 429 (not a client token/credit exhaustion, but provider capacity)
  if (statusCode === 429 && errorMessage) {
    const lower = errorMessage.toLowerCase();
    if (lower.includes('overloaded') || lower.includes('capacity') || lower.includes('try again')) {
      return true;
    }
  }

  return false;
}
