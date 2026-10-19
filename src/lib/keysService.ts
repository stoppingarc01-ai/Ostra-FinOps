import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

export interface GatewayApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  token: string; // Full token (or masked)
  scope: 'full_access' | 'model_scoped' | 'read_only';
  allowed_models: string[];
  environment: 'Production' | 'Staging' | 'Development';
  monthly_limit_usd: number;
  current_spend_usd: number;
  rate_limit_rpm: number;
  status: 'active' | 'revoked' | 'expired';
  expires_at: string | null;
  expires_in_label: string;
  last_used_at: string;
  created_at: string;
  updated_at: string;
}

const COL = 'api_keys';
const docId = (userId: string, id: string) =>
  id.startsWith(userId) ? id : `${userId}_${id}`;

/** Generate random cryptographically secure token */
export function generateGatewayToken(userId?: string): string {
  const prefix = userId ? userId.slice(0, 8) : 'usr';
  const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(18)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `ost_live_${prefix}_${randomBytes}`;
}

/** Default seed key for initial user setup */
async function seedDefaultKey(userId: string): Promise<GatewayApiKey[]> {
  const now = new Date().toISOString();
  const token = generateGatewayToken(userId);
  const prefix = token.slice(0, 16);
  const id = `key_primary_${Date.now()}`;

  const defaultKey: GatewayApiKey = {
    id,
    user_id: userId,
    name: 'Antigravity IDE & CLI Gateway Key',
    key_prefix: prefix,
    token,
    scope: 'full_access',
    allowed_models: ['all'],
    environment: 'Production',
    monthly_limit_usd: 500,
    current_spend_usd: 0,
    rate_limit_rpm: 600,
    status: 'active',
    expires_at: null,
    expires_in_label: 'Never',
    last_used_at: 'Active Now',
    created_at: now,
    updated_at: now,
  };

  try {
    await setDoc(doc(db, COL, docId(userId, id)), defaultKey, { merge: true });
  } catch (e) {
    console.warn('Failed to seed default API key to Firestore:', e);
  }

  try {
    localStorage.setItem(`ostraops_user_api_keys_${userId}`, JSON.stringify([defaultKey]));
  } catch {}

  return [defaultKey];
}

/** Subscribe in real-time to user's Gateway API Keys */
export function subscribeToUserApiKeys(
  userId: string,
  onUpdate: (keys: GatewayApiKey[]) => void
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(collection(db, COL), where('user_id', '==', userId));

  return onSnapshot(
    q,
    async (snap) => {
      if (snap.empty) {
        // Check local cache first
        const cached = localStorage.getItem(`ostraops_user_api_keys_${userId}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Convert legacy PersonalApiKey if needed
              const normalized = parsed.map((k: any) => ({
                id: k.id || `key_${Date.now()}`,
                user_id: userId,
                name: k.name || 'Gateway Key',
                key_prefix: k.key_prefix || (k.token ? k.token.slice(0, 16) : 'ost_live_'),
                token: k.token || generateGatewayToken(userId),
                scope: k.scope || 'full_access',
                allowed_models: k.allowed_models || ['all'],
                environment: k.environment || 'Production',
                monthly_limit_usd: k.monthly_limit_usd || 500,
                current_spend_usd: k.current_spend_usd || 0,
                rate_limit_rpm: k.rate_limit_rpm || 600,
                status: k.status || 'active',
                expires_at: k.expires_at || null,
                expires_in_label: k.expiresIn || k.expires_in_label || 'Never',
                last_used_at: k.lastUsed || k.last_used_at || 'Just now',
                created_at: k.createdAt || k.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }));
              onUpdate(normalized);
              return;
            }
          } catch {}
        }
        const seeded = await seedDefaultKey(userId);
        onUpdate(seeded);
        return;
      }

      const list: GatewayApiKey[] = [];
      snap.forEach((d) => {
        list.push(d.data() as GatewayApiKey);
      });

      // Sort newest first
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      try {
        localStorage.setItem(`ostraops_user_api_keys_${userId}`, JSON.stringify(list));
      } catch {}

      onUpdate(list);
    },
    (err) => {
      console.warn('Realtime API keys subscription error, fallback to local cache:', err);
      const cached = localStorage.getItem(`ostraops_user_api_keys_${userId}`);
      if (cached) {
        try {
          onUpdate(JSON.parse(cached));
        } catch {}
      }
    }
  );
}

/** Create new Gateway API Key in Firestore */
export async function createGatewayApiKey(
  userId: string,
  params: {
    name: string;
    scope?: 'full_access' | 'model_scoped' | 'read_only';
    allowed_models?: string[];
    environment?: 'Production' | 'Staging' | 'Development';
    monthly_limit_usd?: number;
    rate_limit_rpm?: number;
    expires_in_label?: string;
  }
): Promise<GatewayApiKey> {
  const now = new Date().toISOString();
  const id = `key_${Date.now()}`;
  const token = generateGatewayToken(userId);
  const prefix = token.slice(0, 16);

  // Compute expiration date
  let expires_at: string | null = null;
  const expiryLabel = params.expires_in_label || 'Never';
  if (expiryLabel === '30 Days') {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    expires_at = d.toISOString();
  } else if (expiryLabel === '60 Days') {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    expires_at = d.toISOString();
  } else if (expiryLabel === '90 Days') {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    expires_at = d.toISOString();
  } else if (expiryLabel === '1 Year') {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    expires_at = d.toISOString();
  }

  const newKey: GatewayApiKey = {
    id,
    user_id: userId,
    name: params.name.trim(),
    key_prefix: prefix,
    token,
    scope: params.scope || 'full_access',
    allowed_models: params.allowed_models || ['all'],
    environment: params.environment || 'Production',
    monthly_limit_usd: params.monthly_limit_usd ?? 500,
    current_spend_usd: 0,
    rate_limit_rpm: params.rate_limit_rpm || 600,
    status: 'active',
    expires_at,
    expires_in_label: expiryLabel,
    last_used_at: 'Just created',
    created_at: now,
    updated_at: now,
  };

  try {
    await setDoc(doc(db, COL, docId(userId, id)), newKey, { merge: true });
  } catch (e) {
    console.warn('Firestore createGatewayApiKey error, saving locally:', e);
  }

  try {
    const raw = localStorage.getItem(`ostraops_user_api_keys_${userId}`);
    const current: GatewayApiKey[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(`ostraops_user_api_keys_${userId}`, JSON.stringify([newKey, ...current]));
  } catch {}

  return newKey;
}

/** Revoke Gateway API Key */
export async function revokeGatewayApiKey(userId: string, keyId: string): Promise<void> {
  const fullDocId = docId(userId, keyId);
  const now = new Date().toISOString();

  try {
    await updateDoc(doc(db, COL, fullDocId), {
      status: 'revoked',
      updated_at: now,
    });
  } catch (e) {
    console.warn('Firestore revokeGatewayApiKey error:', e);
  }

  try {
    const raw = localStorage.getItem(`ostraops_user_api_keys_${userId}`);
    if (raw) {
      const current: GatewayApiKey[] = JSON.parse(raw);
      const updated = current.map((k) =>
        k.id === keyId ? { ...k, status: 'revoked' as const, updated_at: now } : k
      );
      localStorage.setItem(`ostraops_user_api_keys_${userId}`, JSON.stringify(updated));
    }
  } catch {}
}

/** Permanently Delete API Key */
export async function deleteGatewayApiKey(userId: string, keyId: string): Promise<void> {
  const fullDocId = docId(userId, keyId);

  try {
    await deleteDoc(doc(db, COL, fullDocId));
  } catch (e) {
    console.warn('Firestore deleteGatewayApiKey error:', e);
  }

  try {
    const raw = localStorage.getItem(`ostraops_user_api_keys_${userId}`);
    if (raw) {
      const current: GatewayApiKey[] = JSON.parse(raw);
      localStorage.setItem(
        `ostraops_user_api_keys_${userId}`,
        JSON.stringify(current.filter((k) => k.id !== keyId))
      );
    }
  } catch {}
}
