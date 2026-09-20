import { randomBytes } from 'node:crypto';
import type { IncomingHttpHeaders, ServerResponse } from 'node:http';

/**
 * Generates a collision-resistant, sortable request identifier prefixed with `ost_req_`.
 * Uses high-precision millisecond timestamp encoded in base36 + 12-char cryptographically secure random suffix.
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const randomSuffix = randomBytes(8).toString('hex').slice(0, 12);
  return `ost_req_${timestamp}_${randomSuffix}`;
}

/**
 * Extracts an existing X-Request-ID header or generates a fresh `ost_req_...` identifier.
 */
export function extractOrGenerateRequestId(headers: IncomingHttpHeaders): string {
  const headerValue = headers['x-request-id'] || headers['X-Request-ID'];
  if (headerValue) {
    const candidate = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    if (candidate && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return generateRequestId();
}

/**
 * Attaches the correlation identifier to client response headers.
 */
export function attachCorrelationHeader(res: ServerResponse, requestId: string): void {
  res.setHeader('X-OstraOps-Request-ID', requestId);
}
