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
  linked: true,
  gatewayUrl: 'https://gateway.ostraops.com/v1',
  orgId: 'org_98f2b740e1a',
  orgName: 'Acme Engineering',
  projectId: 'prj_11a09d3b4',
  projectName: 'AI Coding Agents',
  userEmail: 'solo@ostraops.com',
  activeKeyId: 'key_live_dev',
  virtualKeys: [
    {
      id: 'key_live_dev',
      name: 'Development Virtual Key',
      key: 'ost_live_9b4e721a94f08c3d17e5a820b41e3a9f',
      maskedKey: 'ost_live_••••••••••••••••3a9f',
      tier: 'Enterprise Gateway (Auto-Failover On)',
      createdAt: '2026-05-01T10:00:00Z',
    },
    {
      id: 'key_live_stg',
      name: 'Staging Ingress Key',
      key: 'ost_live_6c8d231e78a04b1f92d6e410a72b8d1c',
      maskedKey: 'ost_live_••••••••••••••••8d1c',
      tier: 'Standard Gateway',
      createdAt: '2026-06-15T14:30:00Z',
    },
    {
      id: 'key_live_personal',
      name: 'Personal Standalone Key',
      key: 'ost_live_1f4a908d32b56e7c81a0d240e93a7b5e',
      maskedKey: 'ost_live_••••••••••••••••7b5e',
      tier: 'Solo Developer (Direct Routing)',
      createdAt: '2026-07-20T08:00:00Z',
    },
  ],
  preferences: {
    syncAggregatedMetrics: true,
    allowPromptCaching: false,
    offlineSpooling: true,
  },
  linkedAt: '2026-05-10T12:00:00Z',
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
  creds.gatewayUrl = input.gatewayUrl?.trim() || creds.gatewayUrl || 'https://gateway.ostraops.com/v1';
  creds.orgName = input.orgName?.trim() || 'Connected Organization';
  creds.projectName = input.projectName?.trim() || 'Active Project';
  creds.linkedAt = new Date().toISOString();
  creds.virtualKeys.unshift(newProfile);
  creds.activeKeyId = keyId;

  saveStoredCredentials(creds);
  return getAccountPayload();
}

