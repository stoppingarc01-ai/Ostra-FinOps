import { virtualKeyCache } from '../middleware/cache';
import type { SpendSyncResult } from './types';

export type IncrementSpendRpc = (
  virtualKeyId: string,
  spendDeltaUsd: number
) => Promise<SpendSyncResult>;

/**
 * Atomic Spend Synchronizer.
 * Commits token spend deltas to PostgreSQL without row serialization deadlocks
 * and synchronizes the Phase 2 hot-path cache.
 */
export class AtomicSpendSync {
  private rpcExecutor?: IncrementSpendRpc;

  constructor(rpcExecutor?: IncrementSpendRpc) {
    this.rpcExecutor = rpcExecutor;
  }

  /**
   * Commits an incremental spend amount for a virtual key.
   * If the key crosses its monthly limit and freezes, purges it from the cache.
   */
  public async commitSpend(
    virtualKeyId: string,
    keyHash: string,
    spendDeltaUsd: number
  ): Promise<SpendSyncResult> {
    // 1. Update in-memory cache spend immediately
    virtualKeyCache.recordSpendDelta(keyHash, spendDeltaUsd);

    // 2. Default in-memory simulation if database RPC executor is not registered
    if (!this.rpcExecutor) {
      const cached = await virtualKeyCache.get(keyHash);
      const isFrozen = cached ? cached.status === 'frozen' : false;
      return {
        success: true,
        currentSpendUsd: cached?.currentSpendUsd ?? spendDeltaUsd,
        monthlyLimitUsd: cached?.monthlyLimitUsd ?? 100.0,
        isFrozen,
      };
    }

    // 3. Commit delta to PostgreSQL via non-blocking increment_key_spend
    try {
      const result = await this.rpcExecutor(virtualKeyId, spendDeltaUsd);

      if (result.isFrozen) {
        // Purge immediately from hot-path cache so subsequent pre-flights reject with 402
        virtualKeyCache.invalidate(keyHash);
      }

      return result;
    } catch (err: unknown) {
      console.error('[AtomicSpendSync] Failed to commit spend to database:', err);
      return {
        success: false,
        currentSpendUsd: 0,
        monthlyLimitUsd: 0,
        isFrozen: false,
        error: err instanceof Error ? err.message : 'Database RPC failed',
      };
    }
  }

  public setRpcExecutor(executor: IncrementSpendRpc): void {
    this.rpcExecutor = executor;
  }
}

// Global singleton spend synchronizer
export const spendSync = new AtomicSpendSync();
