import { homedir, hostname } from 'node:os';
import { join } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

export interface TelemetryPreferences {
  syncAggregatedMetrics: boolean;
  allowPromptCaching: boolean;
  offlineSpooling: boolean;
}

export interface VirtualKeyProfile {
  id: string;
  name: string;
  key: string;
  maskedKey: string;
  tier: string;
  createdAt: string;
}

export interface StoredCredentials {
  linked: boolean;
  gatewayUrl: string;
  orgId?: string;
  orgName?: string;
  projectId?: string;
  projectName?: string;
  userEmail?: string;
  activeKeyId: string;
  virtualKeys: VirtualKeyProfile[];
  preferences: TelemetryPreferences;
  linkedAt?: string;
}

export interface AccountPayload {
  pairing: {
    linked: boolean;
    status: 'connected' | 'offline_standalone';
    gatewayUrl: string;
    orgId: string;
    orgName: string;
    projectId: string;
    projectName: string;
    userEmail: string;
    linkedAt?: string;
  };
  activeKey: {
    id: string;
    name: string;
    key: string;
    maskedKey: string;
    tier: string;
  };
  virtualKeys: Array<{
    id: string;
    name: string;
    maskedKey: string;
    tier: string;
  }>;
  preferences: TelemetryPreferences;
  runtime: {
    daemonVersion: string;
    nodeVersion: string;
    hostname: string;
    platform: string;
    bindHost: string;
    uptimeSeconds: number;
  };
}

const DEFAULT_CREDENTIALS: StoredCredentials = {
  linked: false,
  gatewayUrl: 'http://127.0.0.1:8080/v1',
  orgId: 'local_standalone',
  orgName: 'Local Daemon (Unlinked)',
  projectId: 'prj_local',
  projectName: 'Local Development',
  userEmail: 'local-dev@localhost',
  activeKeyId: 'key_local_default',
  virtualKeys: [
    {
      id: 'key_local_default',
      name: 'Local Ingress Key',
      key: 'ost_live_local_dev_key',
      maskedKey: 'ost_live_••••••••••••••••local',
      tier: 'Local First (Offline Capable)',
      createdAt: new Date().toISOString(),
    },
  ],
  preferences: {
    syncAggregatedMetrics: false,
    allowPromptCaching: true,
    offlineSpooling: true,
  },
  linkedAt: new Date().toISOString(),
};

function getCredentialsFilePath(): string {
  const dir = join(homedir(), '.ostraops');
  if (!existsSync(dir)) {
    try {
      mkdirSync(dir, { recursive: true });
    } catch {
      // Ignored
    }
  }
  return join(dir, 'credentials.json');
}

export function loadStoredCredentials(): StoredCredentials {
  const filePath = getCredentialsFilePath();
  if (existsSync(filePath)) {
    try {
      const raw = readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CREDENTIALS, ...parsed };
    } catch {
      // Fallback
    }
  }
  // Write default on first access
  saveStoredCredentials(DEFAULT_CREDENTIALS);
  return DEFAULT_CREDENTIALS;
}

export function saveStoredCredentials(creds: StoredCredentials): void {
  const filePath = getCredentialsFilePath();
  try {
    writeFileSync(filePath, JSON.stringify(creds, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Credentials] Failed to save credentials:', err);
  }
}

export function getAccountPayload(bindHost = '127.0.0.1'): AccountPayload {
  const creds = loadStoredCredentials();
  const activeKey =
    creds.virtualKeys.find((k) => k.id === creds.activeKeyId) ||
    creds.virtualKeys[0] || {
      id: 'default',
      name: 'Default Key',
      key: 'ost_live_00000000000000000000000000000000',
      maskedKey: 'ost_live_••••••••••••••••0000',
      tier: 'Local Gateway',
      createdAt: new Date().toISOString(),
    };

  return {
    pairing: {
      linked: creds.linked,
      status: creds.linked ? 'connected' : 'offline_standalone',
      gatewayUrl: creds.gatewayUrl,
      orgId: creds.linked ? creds.orgId || 'org_local' : 'N/A (Standalone)',
      orgName: creds.linked ? creds.orgName || 'Standalone Machine' : 'Standalone Mode',
      projectId: creds.linked ? creds.projectId || 'prj_local' : 'N/A',
      projectName: creds.linked ? creds.projectName || 'Local Environment' : 'Offline Mode',
      userEmail: creds.linked ? creds.userEmail || 'solo@ostraops.com' : 'unlinked',
      linkedAt: creds.linkedAt,
    },
    activeKey: {
      id: activeKey.id,
      name: activeKey.name,
      key: activeKey.key,
      maskedKey: activeKey.maskedKey,
      tier: activeKey.tier,
    },
    virtualKeys: creds.virtualKeys.map((k) => ({
      id: k.id,
      name: k.name,
      maskedKey: k.maskedKey,
      tier: k.tier,
    })),
    preferences: creds.preferences,
    runtime: {
      daemonVersion: 'v2.1.0',
      nodeVersion: process.version,
      hostname: hostname() || 'dev-workstation-local',
      platform: `${process.platform} (${process.arch})`,
      bindHost,
      uptimeSeconds: Math.floor(process.uptime()),
    },
  };
}

export function updateAccountPreferences(
  updates: Partial<TelemetryPreferences>
): TelemetryPreferences {
  const creds = loadStoredCredentials();
  creds.preferences = {
    ...creds.preferences,
    ...updates,
  };
  saveStoredCredentials(creds);
  return creds.preferences;
}

export function switchActiveVirtualKey(keyId: string): VirtualKeyProfile | null {
  const creds = loadStoredCredentials();
  const target = creds.virtualKeys.find((k) => k.id === keyId);
  if (!target) return null;

  creds.activeKeyId = target.id;
  saveStoredCredentials(creds);
  return target;
}

export function unlinkMachineCredentials(): boolean {
  const creds = loadStoredCredentials();
  creds.linked = false;
  creds.orgId = undefined;
  creds.orgName = undefined;
  creds.projectId = undefined;
  creds.projectName = undefined;
  creds.linkedAt = undefined;
  saveStoredCredentials(creds);
  return true;
}

export interface PairCredentialsInput {
  gatewayUrl?: string;
  virtualKey: string;
  keyName?: string;
  orgName?: string;
  projectName?: string;
}

function validateGatewayUrl(urlStr: string): string {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error('Invalid gateway URL format');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Invalid gateway protocol: Only HTTPS (or local loopback HTTP) is permitted');
  }

  // If HTTP, ensure it is exclusively loopback
  if (parsed.protocol === 'http:') {
    const host = parsed.hostname.toLowerCase();
    if (host !== '127.0.0.1' && host !== 'localhost' && host !== '::1') {
      throw new Error('Insecure HTTP is only permitted for local loopback development (127.0.0.1)');
    }
  }

  // Block AWS/GCP/Azure instance metadata endpoints and link-local addresses
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === '169.254.169.254' ||
    hostname === 'metadata.google.internal' ||
    hostname.startsWith('169.254.')
  ) {
    throw new Error('Gateway URL cannot point to internal cloud metadata endpoints');
  }

  return urlStr.trim().replace(/\/+$/, '');
}

export function pairMachineCredentials(input: PairCredentialsInput): AccountPayload {
  const key = input.virtualKey.trim();
  if (!key) {
    throw new Error('Virtual key is required');
  }

  const creds = loadStoredCredentials();
  const maskedKey = key.length > 8
    ? `${key.substring(0, 8)}••••••••••••••••${key.slice(-4)}`
    : '••••••••';

  const keyId = `key_${Date.now()}`;
  const newProfile: VirtualKeyProfile = {
    id: keyId,
    name: input.keyName || 'Production Ingress Key',
    key,
    maskedKey,
    tier: 'Linked Gateway Key',
    createdAt: new Date().toISOString(),
  };

  creds.linked = true;
  if (input.gatewayUrl && input.gatewayUrl.trim()) {
    creds.gatewayUrl = validateGatewayUrl(input.gatewayUrl.trim());
  } else {
    creds.gatewayUrl = creds.gatewayUrl || 'https://gateway.ostraops.com/v1';
  }
  creds.orgName = input.orgName?.trim() || 'Connected Organization';
  creds.projectName = input.projectName?.trim() || 'Active Project';
  creds.linkedAt = new Date().toISOString();
  creds.virtualKeys.unshift(newProfile);
  creds.activeKeyId = keyId;

  saveStoredCredentials(creds);
  return getAccountPayload();
}

