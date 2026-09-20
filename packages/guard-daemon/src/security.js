import { randomBytes, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
/**
 * Normalizes loopback host strings (handles IPv4, IPv6, localhost, and trailing dot).
 */
export function isLoopbackHost(hostname) {
    const clean = hostname.replace(/^\[|\]$/g, '').toLowerCase().replace(/\.$/, '');
    return clean === '127.0.0.1' || clean === 'localhost' || clean === '::1';
}
/**
 * Generates a cryptographically random 16-byte hex token.
 */
export function generateDaemonToken() {
    return randomBytes(16).toString('hex');
}
/**
 * Persists token to local disk with 0600 permissions so other unprivileged users cannot read it.
 */
export function saveDaemonToken(tokenPath, token) {
    const dir = path.dirname(tokenPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    }
    fs.writeFileSync(tokenPath, token.trim(), { encoding: 'utf-8', mode: 0o600 });
    try {
        fs.chmodSync(tokenPath, 0o600);
    }
    catch {
        // Windows chmod may be partial; mode on write covers permissions
    }
}
/**
 * Reads existing token from disk or generates & persists a new one to keep sessions stable across restarts.
 */
export function readOrCreateDaemonToken(tokenPath) {
    if (fs.existsSync(tokenPath)) {
        try {
            const existing = fs.readFileSync(tokenPath, 'utf-8').trim();
            if (/^[a-f0-9]{32}$/i.test(existing)) {
                return existing;
            }
        }
        catch {
            // Fallback to regenerate
        }
    }
    const newToken = generateDaemonToken();
    try {
        saveDaemonToken(tokenPath, newToken);
    }
    catch (err) {
        console.warn(`[Security] Could not persist token to ${tokenPath}:`, err);
    }
    return newToken;
}
/**
 * Validates the Host header against local loopback to prevent DNS rebinding attacks.
 */
export function validateHost(host, allowedPort) {
    if (!host)
        return false;
    // Handle IPv6 host format [::1]:4040
    let hostname = host;
    let portStr;
    if (host.startsWith('[')) {
        const closeBracketIdx = host.indexOf(']');
        if (closeBracketIdx === -1)
            return false;
        hostname = host.substring(0, closeBracketIdx + 1);
        if (host.length > closeBracketIdx + 1 && host[closeBracketIdx + 1] === ':') {
            portStr = host.substring(closeBracketIdx + 2);
        }
    }
    else {
        const parts = host.split(':');
        hostname = parts[0];
        portStr = parts[1];
    }
    if (!isLoopbackHost(hostname))
        return false;
    if (allowedPort !== undefined && portStr !== undefined) {
        return parseInt(portStr, 10) === allowedPort;
    }
    return true;
}
/**
 * Validates the Origin header to prevent CSRF from malicious browser pages.
 * Requests without Origin (same-origin navigation, direct CLI curl) are allowed.
 */
export function validateOrigin(origin, allowedPort) {
    if (!origin)
        return true; // Direct/same-origin or non-browser request
    try {
        const parsed = new URL(origin);
        if (!isLoopbackHost(parsed.hostname))
            return false;
        if (allowedPort !== undefined && parsed.port) {
            return parseInt(parsed.port, 10) === allowedPort;
        }
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Performs constant-time comparison of auth tokens to prevent timing attacks.
 */
export function verifyDaemonToken(providedToken, expectedToken) {
    if (!providedToken || typeof providedToken !== 'string') {
        return false;
    }
    const provBuf = Buffer.from(providedToken.trim(), 'utf-8');
    const expBuf = Buffer.from(expectedToken.trim(), 'utf-8');
    if (provBuf.length !== expBuf.length) {
        return false;
    }
    return timingSafeEqual(provBuf, expBuf);
}
function extractCookieToken(cookieHeader) {
    if (!cookieHeader)
        return undefined;
    const match = cookieHeader.match(/(?:^|;\s*)ostraops_token=([a-f0-9]{32})(?:;|$)/i);
    return match ? match[1] : undefined;
}
/**
 * Comprehensive security check for local daemon HTTP requests:
 * 1. Host header validation (DNS rebinding prevention)
 * 2. Origin validation (CSRF prevention)
 * 3. Token validation (via Authorization header, X-OstraOps-Daemon-Token, Cookie, or URL query param)
 */
export function authorizeRequest(req, expectedToken, allowedPort) {
    const host = req.headers['host'];
    if (!validateHost(host, allowedPort)) {
        return { authorized: false, statusCode: 403, reason: 'Invalid Host header' };
    }
    const origin = req.headers['origin'];
    if (!validateOrigin(origin, allowedPort)) {
        return { authorized: false, statusCode: 403, reason: 'Untrusted Origin' };
    }
    // Token extraction hierarchy:
    // 1. Authorization: Bearer <token>
    // 2. X-OstraOps-Daemon-Token header
    // 3. HttpOnly Cookie `ostraops_token`
    // 4. URL query param `?token=`
    let token;
    const authHeader = req.headers['authorization'];
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    }
    if (!token) {
        const headerToken = req.headers['x-ostraops-daemon-token'];
        if (typeof headerToken === 'string') {
            token = headerToken;
        }
    }
    if (!token) {
        token = extractCookieToken(req.headers['cookie']);
    }
    if (!token && req.url) {
        try {
            const parsedUrl = new URL(req.url, `http://${host || '127.0.0.1'}`);
            const queryToken = parsedUrl.searchParams.get('token');
            if (queryToken) {
                token = queryToken;
            }
        }
        catch {
            // Invalid URL
        }
    }
    if (!verifyDaemonToken(token, expectedToken)) {
        return { authorized: false, statusCode: 401, reason: 'Unauthorized: invalid or missing daemon token' };
    }
    return { authorized: true };
}
