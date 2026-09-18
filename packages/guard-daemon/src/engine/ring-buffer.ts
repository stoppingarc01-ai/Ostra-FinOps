export interface RingBufferItem<T = unknown> {
  id: number;
  event: string;
  data: T;
  timestamp: number;
}

export interface ReplayResult<T = unknown> {
  gapExceeded: boolean;
  events: RingBufferItem<T>[];
  latestEventId: number;
}

/**
 * Fixed-capacity circular ring buffer with auto-incrementing IDs for zero-loss
 * SSE reconnection and Last-Event-ID replay.
 */
export class RingBuffer<T = unknown> {
  private buffer: (RingBufferItem<T> | null)[];
  private capacitySize: number;
  private head = 0;
  private totalCount = 0;
  private nextId = 1;

  constructor(capacity = 200) {
    this.capacitySize = Math.max(10, capacity);
    this.buffer = new Array(this.capacitySize).fill(null);
  }

  /**
   * Appends an event to the ring buffer, assigning a monotonic sequential integer ID.
   */
  public push(event: string, data: T): RingBufferItem<T> {
    const item: RingBufferItem<T> = {
      id: this.nextId++,
      event,
      data,
      timestamp: Date.now(),
    };

    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacitySize;
    this.totalCount++;

    return item;
  }

  /**
   * Returns the oldest available event ID currently held in memory.
   */
  public getOldestId(): number | null {
    if (this.totalCount === 0) return null;
    if (this.totalCount < this.capacitySize) {
      return this.buffer[0]?.id ?? null;
    }
    return this.buffer[this.head]?.id ?? null;
  }

  /**
   * Returns the latest event ID assigned.
   */
  public getLatestId(): number {
    return this.nextId - 1;
  }

  /**
   * Replays missed events for a client reconnecting with `Last-Event-ID`.
   * If the client was disconnected so long that the gap exceeds buffer capacity,
   * flags `gapExceeded: true` to trigger an atomic full sync.
   */
  public replayFrom(lastEventId: number): ReplayResult<T> {
    const latestId = this.getLatestId();
    if (lastEventId >= latestId || this.totalCount === 0) {
      return { gapExceeded: false, events: [], latestEventId: latestId };
    }

    const oldestId = this.getOldestId();
    if (oldestId !== null && lastEventId < oldestId - 1) {
      // Gap exceeded: client dropped more than 200 events ago
      return { gapExceeded: true, events: [], latestEventId: latestId };
    }

    // Collect all items with id > lastEventId in ascending order
    const items: RingBufferItem<T>[] = [];
    const count = Math.min(this.totalCount, this.capacitySize);
    const startIdx = this.totalCount < this.capacitySize ? 0 : this.head;

    for (let i = 0; i < count; i++) {
      const idx = (startIdx + i) % this.capacitySize;
      const item = this.buffer[idx];
      if (item && item.id > lastEventId) {
        items.push(item);
      }
    }

    items.sort((a, b) => a.id - b.id);
    return {
      gapExceeded: false,
      events: items,
      latestEventId: latestId,
    };
  }

  public size(): number {
    return Math.min(this.totalCount, this.capacitySize);
  }

  public capacity(): number {
    return this.capacitySize;
  }

  public clear(): void {
    this.buffer.fill(null);
    this.head = 0;
    this.totalCount = 0;
  }
}
