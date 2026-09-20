import { createHmac, timingSafeEqual } from 'node:crypto';
import type { WebhookAlertPayload } from '../accounting/types';

export interface WebhookDispatchResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  durationMs: number;
}

/**
 * Computes a standard HMAC-SHA256 signature with timestamp replay protection.
 * Formatted as: `t=<timestamp>,v1=<hex_signature>`
 */
export function signWebhookPayload(payload: string, secret: string, timestamp = Math.floor(Date.now() / 1000)): string {
  const signedData = `${timestamp}.${payload}`;
  const hmac = createHmac('sha256', secret).update(signedData, 'utf8').digest('hex');
  return `t=${timestamp},v1=${hmac}`;
}

/**
 * Verifies an incoming webhook signature against secret with tolerance replay window.
 */
export function verifyWebhookSignature(
  rawPayload: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = 300
): { valid: boolean; reason?: string } {
  const parts = signatureHeader.split(',');
  let timestampStr: string | null = null;
  let signatureHex: string | null = null;

  for (const part of parts) {
    const [key, value] = part.trim().split('=');
    if (key === 't') timestampStr = value;
    if (key === 'v1') signatureHex = value;
  }

  if (!timestampStr || !signatureHex) {
    return { valid: false, reason: 'Malformed signature header' };
  }

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return { valid: false, reason: 'Invalid timestamp' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return { valid: false, reason: 'Timestamp outside allowable tolerance window' };
  }

  const expectedSignedData = `${timestamp}.${rawPayload}`;
  const expectedHmac = createHmac('sha256', secret).update(expectedSignedData, 'utf8').digest('hex');

  if (expectedHmac.length !== signatureHex.length) {
    return { valid: false, reason: 'Signature mismatch' };
  }

  const bufExpected = Buffer.from(expectedHmac, 'utf8');
  const bufActual = Buffer.from(signatureHex, 'utf8');

  if (!timingSafeEqual(bufExpected, bufActual)) {
    return { valid: false, reason: 'Signature mismatch' };
  }

  return { valid: true };
}

/**
 * Dispatches an automated governance alert webhook with an HMAC-SHA256 signature.
 */
export async function dispatchSignedWebhook(
  url: string,
  secret: string,
  payload: WebhookAlertPayload,
  options?: { timeoutMs?: number; fetchFn?: typeof fetch }
): Promise<WebhookDispatchResult> {
  const timeoutMs = options?.timeoutMs ?? 5000;
  const fetchImpl = options?.fetchFn ?? fetch;
  const rawBody = JSON.stringify(payload);
  const signature = signWebhookPayload(rawBody, secret);
  const start = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OstraOps-Webhook-Dispatcher/2.0',
        'X-OstraOps-Signature': signature,
      },
      body: rawBody,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return {
      success: res.ok,
      statusCode: res.status,
      durationMs: Date.now() - start,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: errorMsg,
      durationMs: Date.now() - start,
    };
  }
}
