import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';

export interface GeneratedVirtualKey {
  rawKey: string;
  keyPrefix: string;
  keyHash: string;
}

const KEY_PREFIX = 'ost_live_';
const PREFIX_VISIBLE_LENGTH = 17; // 'ost_live_' (9) + first 8 characters

/**
 * Generates a cryptographically secure virtual key (192 bits of entropy).
 * Formatted as `ost_live_<base64url>`
 */
export function generateVirtualKey(): GeneratedVirtualKey {
  const entropy = randomBytes(24).toString('base64url');
  const rawKey = `${KEY_PREFIX}${entropy}`;
  const keyPrefix = rawKey.slice(0, PREFIX_VISIBLE_LENGTH);
  const keyHash = hashKey(rawKey);

  return {
    rawKey,
    keyPrefix,
    keyHash,
  };
}

/**
 * Computes SHA-256 hash of a raw key for deterministic, zero-plaintext storage.
 */
export function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey, 'utf8').digest('hex');
}

/**
 * Extracts the non-secret prefix from an incoming raw virtual key.
 */
export function extractKeyPrefix(rawKey: string): string {
  return rawKey.slice(0, PREFIX_VISIBLE_LENGTH);
}

/**
 * Constant-time comparison between two key hashes to prevent timing side-channel attacks.
 */
export function verifyKeyHash(computedHash: string, storedHash: string): boolean {
  if (computedHash.length !== storedHash.length) {
    return false;
  }
  const bufA = Buffer.from(computedHash, 'utf8');
  const bufB = Buffer.from(storedHash, 'utf8');
  return timingSafeEqual(bufA, bufB);
}
