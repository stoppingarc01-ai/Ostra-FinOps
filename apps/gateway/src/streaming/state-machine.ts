import type { StreamingState } from './types';

/**
 * Deterministic State Machine governing the streaming lifecycle.
 *
 * Valid Transitions:
 * PRE_RESPONSE -> MID_STREAM (on first downstream write)
 * PRE_RESPONSE -> COMPLETED  (normal non-streaming end)
 * PRE_RESPONSE -> ABORTED    (client disconnects early)
 * PRE_RESPONSE -> ERROR      (failover exhausted / unrecoverable)
 *
 * MID_STREAM   -> COMPLETED  (clean EOF from upstream)
 * MID_STREAM   -> ABORTED    (client disconnects mid-stream)
 * MID_STREAM   -> ERROR      (upstream socket crash / error mid-stream)
 *
 * Terminal states (COMPLETED, ABORTED, ERROR) permit NO further transitions.
 */
export class StreamingStateMachine {
  private _state: StreamingState = 'PRE_RESPONSE';
  private _firstByteCommitted = false;

  public get state(): StreamingState {
    return this._state;
  }

  public get isTerminal(): boolean {
    return this._state === 'COMPLETED' || this._state === 'ABORTED' || this._state === 'ERROR';
  }

  public get isMidStream(): boolean {
    return this._state === 'MID_STREAM';
  }

  public get isPreResponse(): boolean {
    return this._state === 'PRE_RESPONSE';
  }

  /**
   * Failover is strictly permissible ONLY while in PRE_RESPONSE.
   * Zero failover after downstream commit.
   */
  public canFailover(): boolean {
    return this._state === 'PRE_RESPONSE' && !this._firstByteCommitted;
  }

  /**
   * Transition to MID_STREAM immediately before/at the first successful downstream write.
   */
  public markFirstDownstreamWrite(): void {
    if (this._state !== 'PRE_RESPONSE') {
      return;
    }
    this._firstByteCommitted = true;
    this._state = 'MID_STREAM';
  }

  public complete(): void {
    if (this.isTerminal) return;
    this._state = 'COMPLETED';
  }

  public abort(): void {
    if (this.isTerminal) return;
    this._state = 'ABORTED';
  }

  public error(): void {
    if (this.isTerminal) return;
    this._state = 'ERROR';
  }
}
