export interface VelocityMetrics {
  velocity5mTPM: number;
  velocity5mRPM: number;
  currentBucketTPM: number;
  peakTPM: number;
  totalTokens5m: number;
  totalRequests5m: number;
  windowSeconds: number;
}

interface VelocityBucket {
  bucketStartMs: number;
  inputTokens: number;
  outputTokens: number;
  requestCount: number;
}

const BUCKET_WIDTH_MS = 10_000; // 10 seconds per bucket
const DEFAULT_WINDOW_SECONDS = 300; // 5 minutes

/**
 * High-performance, zero-drift rolling velocity calculator.
 * Maintains a fixed array of time-quantized buckets tracking token velocity
 * computed entirely on the daemon side so the client main thread remains idle.
 */
export class RollingVelocityEngine {
  private buckets: VelocityBucket[] = [];
  private readonly windowMs: number;
  private peakTPM = 0;

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
      };
      this.buckets.push(bucket);
      // Keep buckets sorted chronologically
      this.buckets.sort((a, b) => a.bucketStartMs - b.bucketStartMs);
    }

    return bucket;
  }

  /**
   * Ingests token usage from a completed or streamed trace.
   */
  public record(inputTokens: number, outputTokens: number, timestamp = Date.now()): VelocityMetrics {
    this.pruneExpired(timestamp);
    const bucket = this.getOrCreateBucket(timestamp);
    bucket.inputTokens += inputTokens;
    bucket.outputTokens += outputTokens;
    bucket.requestCount += 1;

    return this.getMetrics(timestamp);
  }

  /**
   * Computes real-time rolling metrics for the active session.
   */
  public getMetrics(now = Date.now()): VelocityMetrics {
    this.pruneExpired(now);

    let totalTokens = 0;
    let totalRequests = 0;

    for (const b of this.buckets) {
      totalTokens += b.inputTokens + b.outputTokens;
      totalRequests += b.requestCount;
    }

    const windowMinutes = this.windowMs / 60_000;
    const velocity5mTPM = Math.round(totalTokens / windowMinutes);
    const velocity5mRPM = Math.round(totalRequests / windowMinutes);

    // Current immediate bucket rate scaled to per-minute
    const currentBucket = this.buckets.find(
      (b) => b.bucketStartMs === Math.floor(now / BUCKET_WIDTH_MS) * BUCKET_WIDTH_MS
    );
    const currentBucketTokens = currentBucket
      ? currentBucket.inputTokens + currentBucket.outputTokens
      : 0;
    const currentBucketTPM = Math.round((currentBucketTokens / (BUCKET_WIDTH_MS / 1000)) * 60);

    if (velocity5mTPM > this.peakTPM) {
      this.peakTPM = velocity5mTPM;
    }

    return {
      velocity5mTPM,
      velocity5mRPM,
      currentBucketTPM,
      peakTPM: this.peakTPM,
      totalTokens5m: totalTokens,
      totalRequests5m: totalRequests,
      windowSeconds: this.windowMs / 1000,
    };
  }

  public reset(): void {
    this.buckets = [];
    this.peakTPM = 0;
  }
}
