import type { ServerResponse } from 'node:http';

export const HEARTBEAT_INTERVAL_MS = 5000;
export const SSE_HEARTBEAT_COMMENT = ': ostraops-heartbeat\n\n';
export const SSE_RETRY_PENDING_COMMENT = ': ostraops-retry-pending\n\n';

/**
 * Manages active SSE keepalive heartbeats and retry notifications.
 * Strictly checks `isStreaming` before emitting any SSE comments to prevent
 * corrupting non-streaming JSON responses.
 */
export class HeartbeatManager {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * Starts periodic SSE heartbeat keepalive comments while in PRE_RESPONSE.
   * Only active if the downstream request is an SSE stream.
   */
  public startKeepAlive(
    res: ServerResponse,
    isStreaming: boolean,
    intervalMs = HEARTBEAT_INTERVAL_MS
  ): void {
    if (!isStreaming || this.isRunning || res.writableEnded) {
      return;
    }

    this.isRunning = true;
    this.timer = setInterval(() => {
      if (!res.writableEnded) {
        try {
          res.write(SSE_HEARTBEAT_COMMENT);
        } catch {
          this.stop();
        }
      } else {
        this.stop();
      }
    }, intervalMs);

    // Prevent active timer from blocking node process shutdown
    if (this.timer.unref) {
      this.timer.unref();
    }
  }

  /**
   * Emits an immediate synthetic SSE heartbeat comment informing downstream
   * agents (Cursor, Cline, Windsurf) that a transparent retry/failover is underway.
   * Strictly skipped for non-streaming requests.
   */
  public sendRetryPending(res: ServerResponse, isStreaming: boolean): void {
    if (!isStreaming || res.writableEnded) {
      return;
    }

    try {
      res.write(SSE_RETRY_PENDING_COMMENT);
    } catch {
      // Ignore write errors if socket abruptly dropped
    }
  }

  /**
   * Stops the active keepalive timer and releases resources.
   */
  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }
}
