import type { HeartbeatManager } from './heartbeat';

export interface DisposableResource {
  dispose: () => void | Promise<void>;
}

/**
 * Manages resource disposal across timers, stream handlers, and abort signal listeners.
 */
export class CleanupCoordinator {
  private disposables: Array<() => void> = [];

  public register(fn: () => void): void {
    this.disposables.push(fn);
  }

  public registerHeartbeat(heartbeat: HeartbeatManager): void {
    this.disposables.push(() => heartbeat.stop());
  }

  public registerAbortListener(signal: AbortSignal, listener: () => void): void {
    signal.addEventListener('abort', listener, { once: true });
    this.disposables.push(() => {
      signal.removeEventListener('abort', listener);
    });
  }

  /**
   * Executes all cleanup tasks safely, catching any individual disposal errors.
   */
  public execute(): void {
    while (this.disposables.length > 0) {
      const cleanupFn = this.disposables.pop();
      if (cleanupFn) {
        try {
          cleanupFn();
        } catch {
          // Suppress disposal errors during teardown
        }
      }
    }
  }
}
