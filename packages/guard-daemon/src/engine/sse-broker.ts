import type { IncomingMessage, ServerResponse } from 'node:http';
import { RingBuffer } from './ring-buffer.js';

export interface SseClient {
  id: string;
  res: ServerResponse;
  isDraining: boolean;
  stalledSince: number | null;
  pendingChunks: string[];
  droppedChunksCount: number;
}

export interface SseEnvelope<T = unknown> {
  v: 1;
  id: number;
  event: string;
  payload: T;
  timestamp: number;
}

const MAX_PENDING_CHUNKS_PER_CLIENT = 500;
const MAX_STALL_TIMEOUT_MS = 5000;

export class SseBroker {
  private clients = new Map<string, SseClient>();
  private ringBuffer: RingBuffer<unknown>;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private stallCheckInterval: NodeJS.Timeout | null = null;
  private clientIdCounter = 0;

  constructor(ringBufferCapacity = 1000, heartbeatIntervalMs = 15000) {
    this.ringBuffer = new RingBuffer<unknown>(ringBufferCapacity);

    if (heartbeatIntervalMs > 0) {
      this.heartbeatInterval = setInterval(() => {
        this.sendHeartbeat();
      }, heartbeatIntervalMs);
      this.heartbeatInterval.unref();

      // Monitor and cull stalled/dead clients
      this.stallCheckInterval = setInterval(() => {
        this.pruneStalledClients();
      }, 2500);
      this.stallCheckInterval.unref();
    }
  }

  /**
   * Registers a new SSE HTTP client, sends headers, replays missed events if Last-Event-ID is passed,
   * and handles connection lifecycle.
   */
  public handleConnection(req: IncomingMessage, res: ServerResponse): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': req.headers['origin'] || '*',
      'Access-Control-Allow-Credentials': 'true',
    });

    const clientId = `client_${++this.clientIdCounter}_${Date.now()}`;
    const client: SseClient = {
      id: clientId,
      res,
      isDraining: false,
      stalledSince: null,
      pendingChunks: [],
      droppedChunksCount: 0,
    };

    this.clients.set(clientId, client);

    res.on('close', () => {
      this.clients.delete(clientId);
    });

    // Send initial connection comment
    res.write(`: connected (clientId: ${clientId})\n\n`);

    // Check for Last-Event-ID header or query param
    let lastEventIdHeader = req.headers['last-event-id'];
    let lastEventId: number | undefined;

    if (typeof lastEventIdHeader === 'string' && lastEventIdHeader.trim() !== '') {
      lastEventId = parseInt(lastEventIdHeader, 10);
    } else if (req.url) {
      try {
        const parsed = new URL(req.url, 'http://127.0.0.1');
        const qId = parsed.searchParams.get('lastEventId');
        if (qId) {
          lastEventId = parseInt(qId, 10);
        }
      } catch {
        // Ignore URL parse error
      }
    }

    if (lastEventId !== undefined && !Number.isNaN(lastEventId)) {
      const replay = this.ringBuffer.replayFrom(lastEventId);
      if (replay.gapExceeded) {
        // Client missed more events than ring buffer capacity: instruct client to full re-sync
        this.writeToClient(
          client,
          this.formatChunk('full_sync_required', { missedFrom: lastEventId, capacity: this.ringBuffer.capacity() }, 0)
        );
      } else {
        for (const item of replay.events) {
          this.writeToClient(client, this.formatChunk(item.event, item.data, item.id));
        }
      }
    }
  }

  /**
   * Broadcasts an event to all active clients and stores it in the ring buffer for replay.
   */
  public broadcast(event: string, data: unknown): number {
    const entry = this.ringBuffer.push(event, data);
    const formatted = this.formatChunk(event, data, entry.id);

    for (const client of this.clients.values()) {
      this.writeToClient(client, formatted);
    }

    return entry.id;
  }

  /**
   * Writes data chunks with strict backpressure and queue bounding.
   */
  private writeToClient(client: SseClient, chunk: string): void {
    if (client.res.destroyed || client.res.writableEnded) {
      this.clients.delete(client.id);
      return;
    }

    if (client.isDraining) {
      if (client.pendingChunks.length >= MAX_PENDING_CHUNKS_PER_CLIENT) {
        // Drop oldest chunk to prevent unbounded memory growth
        client.pendingChunks.shift();
        client.droppedChunksCount++;
      }
      client.pendingChunks.push(chunk);
      return;
    }

    const canWrite = client.res.write(chunk);
    if (!canWrite) {
      this.attachDrainHandler(client);
    }
  }

  private attachDrainHandler(client: SseClient): void {
    client.isDraining = true;
    client.stalledSince = Date.now();

    client.res.once('drain', () => {
      client.isDraining = false;
      client.stalledSince = null;

      while (client.pendingChunks.length > 0) {
        const next = client.pendingChunks.shift()!;
        const canWrite = client.res.write(next);
        if (!canWrite) {
          // Socket buffer saturated again while draining: re-attach drain listener
          this.attachDrainHandler(client);
          return;
        }
      }
    });
  }

  /**
   * Culls unresponsive or dead clients whose sockets haven't drained within MAX_STALL_TIMEOUT_MS.
   */
  private pruneStalledClients(): void {
    const now = Date.now();
    for (const [clientId, client] of this.clients.entries()) {
      if (client.isDraining && client.stalledSince && now - client.stalledSince > MAX_STALL_TIMEOUT_MS) {
        try {
          client.res.destroy(new Error('SSE Client stalled exceeded max drain timeout'));
        } catch {
          // Socket already dead
        }
        this.clients.delete(clientId);
      }
    }
  }

  private formatChunk(event: string, payload: unknown, id: number): string {
    const envelope: SseEnvelope = {
      v: 1,
      id,
      event,
      payload,
      timestamp: Date.now(),
    };
    return `id: ${id}\nevent: ${event}\ndata: ${JSON.stringify(envelope)}\n\n`;
  }

  private sendHeartbeat(): void {
    const comment = `: ostraops-heartbeat ${Date.now()}\n\n`;
    for (const client of this.clients.values()) {
      if (!client.res.destroyed && !client.res.writableEnded && !client.isDraining) {
        client.res.write(comment);
      }
    }
  }

  public getClientCount(): number {
    return this.clients.size;
  }

  public getRingBuffer(): RingBuffer<unknown> {
    return this.ringBuffer;
  }

  public close(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.stallCheckInterval) {
      clearInterval(this.stallCheckInterval);
      this.stallCheckInterval = null;
    }
    for (const client of this.clients.values()) {
      if (!client.res.destroyed && !client.res.writableEnded) {
        client.res.end();
      }
    }
    this.clients.clear();
  }
}
