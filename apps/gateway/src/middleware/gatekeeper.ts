import type { CachedVirtualKey } from './cache';

export interface OpenAIErrorResponse {
  error: {
    message: string;
    type: string;
    param: string | null;
    code: string;
  };
}

export interface GatekeeperResult {
  allowed: boolean;
  status?: number;
  errorPayload?: OpenAIErrorResponse;
}

/**
 * Baseline input token rates per token (USD).
 * Standardized to dollars per token ($ / 1,000,000).
 */
const BASELINE_INPUT_RATES: Record<string, number> = {
  // Claude family
  'claude-3-7-sonnet': 3.0 / 1_000_000,
  'claude-3-5-sonnet': 3.0 / 1_000_000,
  'claude-3-5-haiku': 0.8 / 1_000_000,
  'claude-3-opus': 15.0 / 1_000_000,
  // OpenAI family
  'gpt-4o': 2.5 / 1_000_000,
  'gpt-4o-mini': 0.15 / 1_000_000,
  'o1': 15.0 / 1_000_000,
  'o1-mini': 3.0 / 1_000_000,
  'o3-mini': 1.1 / 1_000_000,
  // DeepSeek family
  'deepseek-r1': 0.55 / 1_000_000,
  'deepseek-v3': 0.14 / 1_000_000,
};

/**
 * Conservative Flagship Fallback Rate.
 * If the incoming requested model cannot be resolved during pre-flight, default to
 * a conservative flagship rate ($15.00 / 1M tokens = $0.000015 / token).
 * This prevents cheap defaults from allowing expensive reasoning runs to blow past budget caps.
 */
export const CONSERVATIVE_FLAGSHIP_RATE_PER_TOKEN = 15.0 / 1_000_000;

/**
 * Safety buffer multiplier against token variability.
 */
export const SAFETY_BUFFER_MULTIPLIER = 1.35;

/**
 * Abstract interface for Velocity / Rate Limiting storage.
 * Allows seamless drop-in of Redis (ioredis + Lua sliding window) in multi-node clusters.
 */
export interface IRateLimitStore {
  checkLimit(key: CachedVirtualKey): Promise<GatekeeperResult> | GatekeeperResult;
  acquireSlot(keyId: string): Promise<void> | void;
  releaseSlot(keyId: string): Promise<void> | void;
  getActiveConcurrency(keyId: string): Promise<number> | number;
  reset(): Promise<void> | void;
}

/**
 * In-Memory driver for IRateLimitStore with sliding 60-second window log and active concurrency slots.
 */
export class InMemoryRateLimitStore implements IRateLimitStore {
  private requestTimestamps = new Map<string, number[]>();
  private activeConcurrency = new Map<string, number>();

  public checkLimit(key: CachedVirtualKey): GatekeeperResult {
    const now = Date.now();
    const windowStart = now - 60_000;
    const keyId = key.id;

    // 1. Check Active Concurrency Slots
    const currentConcurrency = this.activeConcurrency.get(keyId) || 0;
    if (currentConcurrency >= key.rateLimits.maxConcurrency) {
      return {
        allowed: false,
        status: 429,
        errorPayload: {
          error: {
            message: `Concurrent connection limit exceeded (${currentConcurrency}/${key.rateLimits.maxConcurrency}).`,
            type: 'osterdops_rate_limited',
            param: null,
            code: 'OSTERDOPS_RATE_LIMITED',
          },
        },
      };
    }

    // 2. Sliding Window RPM Check
    let timestamps = this.requestTimestamps.get(keyId) || [];
    timestamps = timestamps.filter((t) => t > windowStart);
    this.requestTimestamps.set(keyId, timestamps);

    if (timestamps.length >= key.rateLimits.rpm) {
      return {
        allowed: false,
        status: 429,
        errorPayload: {
          error: {
            message: `Requests per minute (RPM) threshold exceeded (${timestamps.length}/${key.rateLimits.rpm}).`,
            type: 'osterdops_rate_limited',
            param: null,
            code: 'OSTERDOPS_RATE_LIMITED',
          },
        },
      };
    }

    return { allowed: true };
  }

  public acquireSlot(keyId: string): void {
    const now = Date.now();
    const timestamps = this.requestTimestamps.get(keyId) || [];
    timestamps.push(now);
    this.requestTimestamps.set(keyId, timestamps);

    const current = this.activeConcurrency.get(keyId) || 0;
    this.activeConcurrency.set(keyId, current + 1);
  }

  public releaseSlot(keyId: string): void {
    const current = this.activeConcurrency.get(keyId) || 0;
    if (current > 0) {
      this.activeConcurrency.set(keyId, current - 1);
    }
  }

  public getActiveConcurrency(keyId: string): number {
    return this.activeConcurrency.get(keyId) || 0;
  }

  public reset(): void {
    this.requestTimestamps.clear();
    this.activeConcurrency.clear();
  }
}

/**
 * Layer 2 Gatekeeper: Pre-Flight Safety Budget Check.
 * Computes conservative upper-bound cost = ceil(Byte Length / 3) * rate * 1.35x.
 */
export class BudgetGatekeeper {
  public checkBudget(
    key: CachedVirtualKey,
    payloadByteLength: number,
    modelName?: string
  ): GatekeeperResult {
    // 1. Check Key Status
    if (key.status === 'frozen') {
      return {
        allowed: false,
        status: 402,
        errorPayload: {
          error: {
            message: 'Monthly spend cap for this virtual key has been reached. Contact your organization administrator.',
            type: 'osterdops_budget_exceeded',
            param: null,
            code: 'OSTERDOPS_BUDGET_EXCEEDED',
          },
        },
      };
    }

    if (key.status === 'revoked') {
      return {
        allowed: false,
        status: 403,
        errorPayload: {
          error: {
            message: 'Virtual key has been revoked.',
            type: 'osterdops_key_inactive',
            param: null,
            code: 'OSTERDOPS_KEY_INACTIVE',
          },
        },
      };
    }

    // 2. Token Upper-Bound Estimation: ceil(Byte Length / 3)
    const estimatedTokens = Math.max(1, Math.ceil(payloadByteLength / 3));

    // 3. Resolve Model Rate or Default to Conservative Flagship Rate
    let ratePerToken = CONSERVATIVE_FLAGSHIP_RATE_PER_TOKEN;
    if (modelName) {
      const normalized = modelName.toLowerCase().trim();
      for (const [knownModel, rate] of Object.entries(BASELINE_INPUT_RATES)) {
        if (normalized.includes(knownModel)) {
          ratePerToken = rate;
          break;
        }
      }
    }

    // 4. Calculate Upper-Bound Cost with 1.35x Safety Buffer
    const estimatedCostUsd = estimatedTokens * ratePerToken * SAFETY_BUFFER_MULTIPLIER;

    // 5. Evaluate Spend Headroom
    if (key.currentSpendUsd + estimatedCostUsd > key.monthlyLimitUsd) {
      return {
        allowed: false,
        status: 402,
        errorPayload: {
          error: {
            message: 'Monthly spend cap for this virtual key has been reached. Contact your organization administrator.',
            type: 'osterdops_budget_exceeded',
            param: null,
            code: 'OSTERDOPS_BUDGET_EXCEEDED',
          },
        },
      };
    }

    return { allowed: true };
  }
}

// Singleton instances for gateway pipeline
export const rateLimitStore: IRateLimitStore = new InMemoryRateLimitStore();
export const budgetGatekeeper = new BudgetGatekeeper();
