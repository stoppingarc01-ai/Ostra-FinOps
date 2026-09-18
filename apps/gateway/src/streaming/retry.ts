/**
 * Explicit list of upstream HTTP statuses that qualify for automatic failover.
 * General 5xx (e.g. 501 Not Implemented, 505 Version Not Supported) are intentionally excluded.
 */
export const RETRYABLE_UPSTREAM_STATUSES = [429, 500, 502, 503, 504] as const;

export type RetryableStatusCode = (typeof RETRYABLE_UPSTREAM_STATUSES)[number];

export const MAX_FAILOVER_ATTEMPTS = 2;

export function isRetryableStatus(statusCode: number): boolean {
  return (RETRYABLE_UPSTREAM_STATUSES as readonly number[]).includes(statusCode);
}

export class RetryController {
  private _attempts = 0;
  private readonly _maxAttempts: number;

  constructor(maxAttempts = MAX_FAILOVER_ATTEMPTS) {
    this._maxAttempts = maxAttempts;
  }

  public get attempts(): number {
    return this._attempts;
  }

  public get maxAttempts(): number {
    return this._maxAttempts;
  }

  public get canRetry(): boolean {
    return this._attempts < this._maxAttempts;
  }

  /**
   * Increments and returns whether the retry is authorized within budget.
   */
  public recordAttempt(): boolean {
    if (this._attempts >= this._maxAttempts) {
      return false;
    }
    this._attempts++;
    return true;
  }
}
