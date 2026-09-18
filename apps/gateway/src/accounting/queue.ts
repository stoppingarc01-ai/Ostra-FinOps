import type { TelemetryLogRecord } from './types';

export type BatchLogWriter = (records: TelemetryLogRecord[]) => Promise<void>;

export interface QueueOptions {
  flushIntervalMs?: number;
  maxBatchSize?: number;
  writer?: BatchLogWriter;
}

/**
 * Micro-Batched Ingestion Queue for High-Throughput Telemetry Logs.
 * Eliminates per-request database point inserts and connection pool contention
 * by buffering records in memory and flushing in bulk.
 */
export class TelemetryBatchQueue {
  private buffer: TelemetryLogRecord[] = [];
  private flushIntervalMs: number;
  private maxBatchSize: number;
  private writer: BatchLogWriter;
  private timer: NodeJS.Timeout | null = null;
  private isFlushing = false;

  constructor(options?: QueueOptions) {
    this.flushIntervalMs = options?.flushIntervalMs ?? 2000;
    this.maxBatchSize = options?.maxBatchSize ?? 250;
    this.writer = options?.writer ?? (async () => {});

    this.startTimer();
  }

  private startTimer(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.flush();
    }, this.flushIntervalMs);

    if (this.timer.unref) {
      this.timer.unref();
    }
  }

  /**
   * Pushes a completed telemetry trace into the buffer asynchronously.
   */
  public enqueue(record: TelemetryLogRecord): void {
    this.buffer.push(record);
    if (this.buffer.length >= this.maxBatchSize) {
      this.flush();
    }
  }

  /**
   * Flushes the current buffer in a single batch insert.
   */
  public async flush(): Promise<void> {
    if (this.buffer.length === 0 || this.isFlushing) {
      return;
    }

    this.isFlushing = true;
    const batchToFlush = [...this.buffer];
    this.buffer = [];

    try {
      await this.writer(batchToFlush);
    } catch (err: unknown) {
      console.error('[TelemetryBatchQueue] Batch write failed, re-queuing records:', err);
      // Prepend failed batch back to buffer for retry (capped to 1000 items to prevent OOM)
      if (this.buffer.length + batchToFlush.length <= 1000) {
        this.buffer = [...batchToFlush, ...this.buffer];
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Graceful Drain Hook.
   * Flushes all remaining records immediately before process termination.
   */
  public async drain(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    await this.flush();
  }

  public size(): number {
    return this.buffer.length;
  }

  public setWriter(writer: BatchLogWriter): void {
    this.writer = writer;
  }
}

// Global singleton queue
export const telemetryQueue = new TelemetryBatchQueue();
