export interface VelocityMetrics {
  velocity5mTPM: number;
  velocity5mRPM: number;
  velocity5mCostUsd: number;
  velocityCostPerMinuteUsd: number;
  currentBucketTPM: number;
  currentBucketCostPerMinUsd: number;
  peakTPM: number;
  peakCostPerMinUsd: number;
  totalTokens5m: number;
  totalRequests5m: number;
  totalCost5m: number;
  windowSeconds: number;
}

export interface VelocityLimits {
  maxCostPerMinUsd?: number;
  maxTpm?: number;
  maxRpm?: number;
}

export interface VelocityBreakerResult {
  tripped: boolean;
  metric?: 'cost_velocity' | 'tpm' | 'rpm';
  current: number;
  limit: number;
  reason?: string;
  metrics: VelocityMetrics;
}

interface VelocityBucket {
  bucketStartMs: number;
  inputTokens: number;
  outputTokens: number;
  requestCount: number;
  costUsd: number;
}

const BUCKET_WIDTH_MS = 10_000; // 10 seconds per bucket
const DEFAULT_WINDOW_SECONDS = 300; // 5 minutes

/**
 * High-performance, zero-drift rolling velocity calculator with hard circuit breaker support.
 * Maintains time-quantized buckets tracking token count, request count, and spend rate ($/min).
 */
export class RollingVelocityEngine {
  private buckets: VelocityBucket[] = [];
  private readonly windowMs: number;
  private peakTPM = 0;
  private peakCostPerMinUsd = 0;

  constructor(windowSeconds = DEFAULT_WINDOW_SECONDS) {
    this.windowMs = windowSeconds * 1000;
  }

  private pruneExpired(now: number): void {
    const cutoff = now - this.windowMs;
    this.buckets = this.buckets.filter((b) => b.bucketStartMs >= cutoff);
  }

  private getOrCreateBucket(timestamp: number): VelocityBucket {
    const bucketStartMs = Math.floor(timestamp / BUCKET_WIDTH_MS) * BUCKET_WIDTH_MS;
    let bucket = this.buckets.find((b) => b.bucketStartMs === bucketStartMs);

    if (!bucket) {
      bucket = {
        bucketStartMs,
        inputTokens: 0,
        outputTokens: 0,
        requestCount: 0,
        costUsd: 0,
      };
      this.buckets.push(bucket);
      this.buckets.sort((a, b) => a.bucketStartMs - b.bucketStartMs);
    }

    return bucket;
  }

  /**
   * Ingests token usage and cost from a completed or streamed trace.
   * Backward compatible with both (input, output, timestamp) and (input, output, costUsd, timestamp).
   */
  public record(
    inputTokens: number,
    outputTokens: number,
    costUsdOrTimestamp: number = 0,
    timestamp?: number
  ): VelocityMetrics {
    let costUsd = 0;
    let actualTimestamp = Date.now();

    if (timestamp !== undefined) {
      costUsd = Math.max(0, costUsdOrTimestamp);
      actualTimestamp = timestamp;
    } else if (costUsdOrTimestamp > 1_000_000_000) {
      // Epoch millisecond timestamp passed as 3rd argument
      actualTimestamp = costUsdOrTimestamp;
      costUsd = 0;
    } else {
      costUsd = Math.max(0, costUsdOrTimestamp);
      actualTimestamp = Date.now();
    }

    this.pruneExpired(actualTimestamp);
    const bucket = this.getOrCreateBucket(actualTimestamp);
    bucket.inputTokens += Math.max(0, inputTokens);
    bucket.outputTokens += Math.max(0, outputTokens);
    bucket.requestCount += 1;
    bucket.costUsd += costUsd;

    return this.getMetrics(actualTimestamp);
  }

  /**
   * Computes real-time rolling metrics across the active sliding window.
   */
  public getMetrics(now = Date.now()): VelocityMetrics {
    this.pruneExpired(now);

    let totalTokens = 0;
    let totalRequests = 0;
    let totalCostUsd = 0;

    for (const b of this.buckets) {
      totalTokens += b.inputTokens + b.outputTokens;
      totalRequests += b.requestCount;
      totalCostUsd += b.costUsd;
    }

    const windowMinutes = Math.max(0.1, this.windowMs / 60_000);
    const velocity5mTPM = Math.round(totalTokens / windowMinutes);
    const velocity5mRPM = Math.round(totalRequests / windowMinutes);
    const velocityCostPerMinuteUsd = Math.round((totalCostUsd / windowMinutes) * 10000) / 10000;

    // Current immediate bucket rate scaled to per-minute
    const currentBucket = this.buckets.find(
      (b) => b.bucketStartMs === Math.floor(now / BUCKET_WIDTH_MS) * BUCKET_WIDTH_MS
    );
    const currentBucketTokens = currentBucket
      ? currentBucket.inputTokens + currentBucket.outputTokens
      : 0;
    const currentBucketCost = currentBucket ? currentBucket.costUsd : 0;
    const bucketMinutes = (BUCKET_WIDTH_MS / 1000) / 60;
    const currentBucketTPM = Math.round(currentBucketTokens / bucketMinutes);
    const currentBucketCostPerMinUsd = Math.round((currentBucketCost / bucketMinutes) * 10000) / 10000;

    if (velocity5mTPM > this.peakTPM) {
      this.peakTPM = velocity5mTPM;
    }
    if (velocityCostPerMinuteUsd > this.peakCostPerMinUsd) {
      this.peakCostPerMinUsd = velocityCostPerMinuteUsd;
    }

    return {
      velocity5mTPM,
      velocity5mRPM,
      velocity5mCostUsd: Math.round(totalCostUsd * 10000) / 10000,
      velocityCostPerMinuteUsd,
      currentBucketTPM,
      currentBucketCostPerMinUsd,
      peakTPM: this.peakTPM,
      peakCostPerMinUsd: this.peakCostPerMinUsd,
      totalTokens5m: totalTokens,
      totalRequests5m: totalRequests,
      totalCost5m: Math.round(totalCostUsd * 10000) / 10000,
      windowSeconds: this.windowMs / 1000,
    };
  }

  /**
   * Hard Financial & Throughput Circuit Breaker check.
   * Returns tripped: true if rolling spend ($/min), TPM, or RPM violates configured thresholds.
   */
  public checkVelocityBreaker(limits: VelocityLimits, now = Date.now()): VelocityBreakerResult {
    const metrics = this.getMetrics(now);

    // 1. Check Spend Velocity ($/min)
    if (limits.maxCostPerMinUsd && limits.maxCostPerMinUsd > 0) {
      if (metrics.velocityCostPerMinuteUsd >= limits.maxCostPerMinUsd) {
        return {
          tripped: true,
          metric: 'cost_velocity',
          current: metrics.velocityCostPerMinuteUsd,
          limit: limits.maxCostPerMinUsd,
          reason: `Spend velocity of $${metrics.velocityCostPerMinuteUsd.toFixed(2)}/min exceeds hard safety cap of $${limits.maxCostPerMinUsd.toFixed(2)}/min`,
          metrics,
        };
      }
    }

    // 2. Check Token Velocity (TPM)
    if (limits.maxTpm && limits.maxTpm > 0) {
      if (metrics.velocity5mTPM >= limits.maxTpm) {
        return {
          tripped: true,
          metric: 'tpm',
          current: metrics.velocity5mTPM,
          limit: limits.maxTpm,
          reason: `Token velocity of ${metrics.velocity5mTPM.toLocaleString()} TPM exceeds threshold of ${limits.maxTpm.toLocaleString()} TPM`,
          metrics,
        };
      }
    }

    // 3. Check Request Velocity (RPM)
    if (limits.maxRpm && limits.maxRpm > 0) {
      if (metrics.velocity5mRPM >= limits.maxRpm) {
        return {
          tripped: true,
          metric: 'rpm',
          current: metrics.velocity5mRPM,
          limit: limits.maxRpm,
          reason: `Request rate of ${metrics.velocity5mRPM} RPM exceeds limit of ${limits.maxRpm} RPM`,
          metrics,
        };
      }
    }

    return {
      tripped: false,
      current: 0,
      limit: 0,
      metrics,
    };
  }

  public reset(): void {
    this.buckets = [];
    this.peakTPM = 0;
    this.peakCostPerMinUsd = 0;
  }
}
