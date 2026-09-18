/**
 * Fixed-capacity circular ring buffer with auto-incrementing IDs for zero-loss
 * SSE reconnection and Last-Event-ID replay.
 */
export class RingBuffer {
    buffer;
    capacitySize;
    head = 0;
    totalCount = 0;
    nextId = 1;
    constructor(capacity = 200) {
        this.capacitySize = Math.max(10, capacity);
        this.buffer = new Array(this.capacitySize).fill(null);
    }
    /**
     * Appends an event to the ring buffer, assigning a monotonic sequential integer ID.
     */
    push(event, data) {
        const item = {
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
    getOldestId() {
        if (this.totalCount === 0)
            return null;
        if (this.totalCount < this.capacitySize) {
            return this.buffer[0]?.id ?? null;
        }
        return this.buffer[this.head]?.id ?? null;
    }
    /**
     * Returns the latest event ID assigned.
     */
    getLatestId() {
        return this.nextId - 1;
    }
    /**
     * Replays missed events for a client reconnecting with `Last-Event-ID`.
     * If the client was disconnected so long that the gap exceeds buffer capacity,
     * flags `gapExceeded: true` to trigger an atomic full sync.
     */
    replayFrom(lastEventId) {
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
        const items = [];
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
    size() {
        return Math.min(this.totalCount, this.capacitySize);
    }
    capacity() {
        return this.capacitySize;
    }
    clear() {
        this.buffer.fill(null);
        this.head = 0;
        this.totalCount = 0;
    }
}
