export interface IdempotencyRecord {
  key: string;
  status: 'IN_FLIGHT' | 'COMPLETED';
  statusCode?: number;
  headers?: Record<string, string>;
  body?: string;
  createdAt: number;
  expiresAt: number;
}

export interface IIdempotencyStore {
  acquireLock(key: string, ttlMs?: number): Promise<{ acquired: boolean; existingRecord?: IdempotencyRecord }>;
  complete(key: string, statusCode: number, headers: Record<string, string>, body: string, ttlMs?: number): Promise<void>;
  release(key: string): Promise<void>;
  get(key: string): Promise<IdempotencyRecord | null>;
}

export class InMemoryIdempotencyStore implements IIdempotencyStore {
  private records = new Map<string, IdempotencyRecord>();
  private sweepInterval: NodeJS.Timeout | null = null;

  constructor(sweepIntervalMs = 30_000) {
    this.sweepInterval = setInterval(() => this.sweep(), sweepIntervalMs);
    if (this.sweepInterval.unref) {
      this.sweepInterval.unref();
    }
  }

  async acquireLock(
    key: string,
    ttlMs = 60_000
  ): Promise<{ acquired: boolean; existingRecord?: IdempotencyRecord }> {
    const now = Date.now();
    const existing = this.records.get(key);

    if (existing && existing.expiresAt > now) {
      return { acquired: false, existingRecord: existing };
    }

    const newRecord: IdempotencyRecord = {
      key,
      status: 'IN_FLIGHT',
      createdAt: now,
      expiresAt: now + ttlMs,
    };

    this.records.set(key, newRecord);
    return { acquired: true };
  }

  async complete(
    key: string,
    statusCode: number,
    headers: Record<string, string>,
    body: string,
    ttlMs = 120_000
  ): Promise<void> {
    const now = Date.now();
    this.records.set(key, {
      key,
      status: 'COMPLETED',
      statusCode,
      headers,
      body,
      createdAt: now,
      expiresAt: now + ttlMs,
    });
  }

  async release(key: string): Promise<void> {
    this.records.delete(key);
  }

  async get(key: string): Promise<IdempotencyRecord | null> {
    const now = Date.now();
    const record = this.records.get(key);
    if (!record) return null;
    if (record.expiresAt <= now) {
      this.records.delete(key);
      return null;
    }
    return record;
  }

  private sweep(): void {
    const now = Date.now();
    for (const [k, v] of this.records.entries()) {
      if (v.expiresAt <= now) {
        this.records.delete(k);
      }
    }
  }

  destroy(): void {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = null;
    }
    this.records.clear();
  }
}

export const idempotencyStore = new InMemoryIdempotencyStore();
