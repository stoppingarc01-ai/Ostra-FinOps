import React, { useState, useEffect, useMemo } from 'react';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Code,
  Globe,
  TrendingUp,
  X,
  Search,
  Loader2,
  FileCode,
  Terminal,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToUserApiKeys,
  createGatewayApiKey,
  revokeGatewayApiKey,
  deleteGatewayApiKey,
  type GatewayApiKey
} from '../lib/keysService';

export const ApiKeysView: React.FC = () => {
  const { user, profile } = useAuth();

  const [keys, setKeys] = useState<GatewayApiKey[]>([]);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [envFilter, setEnvFilter] = useState<'All' | 'Production' | 'Staging' | 'Development'>('All');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [revealedKeyIds, setRevealedKeyIds] = useState<Record<string, boolean>>({});

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<GatewayApiKey | null>(null);
  const [selectedSnippetKey, setSelectedSnippetKey] = useState<GatewayApiKey | null>(null);
  const [snippetLanguage, setSnippetLanguage] = useState<'curl' | 'python' | 'typescript'>('curl');

  // Create Form State
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'Production' | 'Staging' | 'Development'>('Production');
  const [newKeyScope, setNewKeyScope] = useState<'full_access' | 'model_scoped' | 'read_only'>('full_access');
  const [newKeyMonthlyLimit, setNewKeyMonthlyLimit] = useState('500');
  const [newKeyExpiry, setNewKeyExpiry] = useState('Never');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    showToast(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // Real-time Firestore Key Subscription
  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToUserApiKeys(user.id, (liveKeys) => {
      setKeys(liveKeys);
      setIsLiveConnected(true);
    });
    return unsub;
  }, [user?.id]);

  const handleCreateKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      showToast('Please enter an API key name.');
      return;
    }
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      const created = await createGatewayApiKey(user.id, {
        name: newKeyName.trim(),
        environment: newKeyEnv,
        scope: newKeyScope,
        monthly_limit_usd: parseInt(newKeyMonthlyLimit, 10) || 500,
        expires_in_label: newKeyExpiry,
        rate_limit_rpm: 600,
      });

      setCreateModalOpen(false);
      setNewlyCreatedKey(created);
      setNewKeyName('');
      setNewKeyMonthlyLimit('500');
      setNewKeyExpiry('Never');
      showToast(`Gateway Key "${created.name}" generated successfully!`);
    } catch (err: any) {
      showToast(`Error creating key: ${err.message || 'Check network'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeKey = async (key: GatewayApiKey) => {
    if (!user?.id) return;
    if (!window.confirm(`Revoke key "${key.name}"? Requests authenticating with this key will immediately fail.`)) {
      return;
    }
    try {
      await revokeGatewayApiKey(user.id, key.id);
      showToast(`Revoked key "${key.name}".`);
    } catch (err: any) {
      showToast(`Failed to revoke: ${err.message}`);
    }
  };

  const handleDeleteKey = async (key: GatewayApiKey) => {
    if (!user?.id) return;
    if (!window.confirm(`Permanently delete key "${key.name}" from your vault?`)) {
      return;
    }
    try {
      await deleteGatewayApiKey(user.id, key.id);
      showToast(`Permanently deleted key "${key.name}".`);
    } catch (err: any) {
      showToast(`Failed to delete: ${err.message}`);
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedKeyIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredKeys = useMemo(() => {
    return keys.filter((k) => {
      const matchesSearch =
        k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.key_prefix.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEnv = envFilter === 'All' || k.environment === envFilter;
      return matchesSearch && matchesEnv;
    });
  }, [keys, searchQuery, envFilter]);

  const activeKeysCount = useMemo(() => keys.filter((k) => k.status === 'active').length, [keys]);

  const snippetCurl = (token: string) => `curl https://gateway.ostraops.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Hello from OstraOps Gateway!"}
    ]
  }'`;

  const snippetPython = (token: string) => `from openai import OpenAI

# Drop-in OpenAI replacement powered by OstraOps Unified Gateway
client = OpenAI(
    base_url="https://gateway.ostraops.com/v1",
    api_key="${token}"
)

response = client.chat.completions.create(
    model="gpt-4o",  # Automatically routed with zero-downtime fallback
    messages=[{"role": "user", "content": "Explain quantum computing in one sentence"}]
)

print(response.choices[0].message.content)`;

  const snippetTypeScript = (token: string) => `import OpenAI from 'openai';

// Point any standard OpenAI SDK to OstraOps Gateway
const client = new OpenAI({
  baseURL: 'https://gateway.ostraops.com/v1',
  apiKey: '${token}',
});

async function main() {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Say hello to the future of AI FinOps!' }],
  });
  console.log(completion.choices[0].message.content);
}

main();`;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-mono flex items-center gap-2 border border-[#3F3F46] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C59E5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* TOP HEADER: GATEWAY API KEYS                                 */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-[#C59E5F]/15 text-[#E5C38D] text-[10px] font-bold font-mono tracking-wider uppercase border border-[#C59E5F]/30">
              Gateway Access & Authentication
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono font-semibold">
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isLiveConnected ? 'animate-pulse' : ''}`} />
              <span>{isLiveConnected ? 'Gateway Cloud Synced' : 'Connecting to Vault...'}</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              {profile?.company_name || 'Production Workspace'}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-sans">
            Gateway API Keys
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Generate, scope, rate-limit, and manage secret credentials for your apps and CLI. Seamlessly authenticate to <code className="text-[#E5C38D] bg-[#07090C] px-1 py-0.5 rounded border border-white/[0.08]">https://gateway.ostraops.com/v1</code>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setSelectedSnippetKey(keys[0] || null);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F] text-zinc-200 text-xs font-bold transition-all shadow-xs cursor-pointer hover:bg-white/[0.04]"
          >
            <Code className="w-3.5 h-3.5 text-[#C59E5F]" />
            <span>Code Snippets</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C59E5F] hover:bg-[#B38D4F] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Key</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4 TOP KPI METRICS CARDS                                      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Keys */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase font-mono tracking-wide">
              Active Keys
            </span>
            <div className="w-7 h-7 rounded-xl bg-white/[0.06] text-zinc-300 flex items-center justify-center">
              <Key className="w-4 h-4 text-[#C59E5F]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {activeKeysCount}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#E5C38D] font-mono font-medium mt-1">
            <TrendingUp className="w-3 h-3 text-[#C59E5F]" />
            <span>{keys.length} total generated in vault</span>
          </div>
        </div>

        {/* Card 2: Gateway Endpoint */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase font-mono tracking-wide">
              Gateway URL
            </span>
            <div className="w-7 h-7 rounded-xl bg-white/[0.06] text-emerald-400 flex items-center justify-center">
              <Globe className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-xs font-mono font-bold text-white truncate max-w-full">
            https://gateway.ostraops.com/v1
          </div>
          <div className="mt-2">
            <button
              onClick={() => copyToClipboard('https://gateway.ostraops.com/v1', 'url', 'Gateway Base URL')}
              className="text-[11px] font-mono text-[#E5C38D] hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedKeyId === 'url' ? 'Copied URL' : 'Copy Endpoint'}</span>
            </button>
          </div>
        </div>

        {/* Card 3: Default Throughput */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase font-mono tracking-wide">
              Capacity Quota
            </span>
            <div className="w-7 h-7 rounded-xl bg-white/[0.06] text-zinc-300 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-[#C59E5F]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            600 RPM
          </div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            Burst up to 400,000 TPM
          </div>
        </div>

        {/* Card 4: Security Posture */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase font-mono tracking-wide">
              Protection Level
            </span>
            <div className="w-7 h-7 rounded-xl bg-white/[0.06] text-zinc-300 flex items-center justify-center">
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-sm font-extrabold text-emerald-400 font-mono tracking-tight flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Enforced &amp; Salted</span>
          </div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            PBKDF2 SHA-256 vault encryption
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FILTER & SEARCH TOOLBAR                                      */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B0E14] border border-white/[0.08] p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keys by name or prefix (e.g. ost_live_...)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#07090C] border border-white/[0.08] text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#C59E5F]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-[#07090C] border border-white/[0.08] text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#C59E5F]"
          >
            <option value="All">All Environments</option>
            <option value="Production">Production</option>
            <option value="Staging">Staging</option>
            <option value="Development">Development</option>
          </select>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#C59E5F] hover:bg-[#B38D4F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Key</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* API KEYS TABLE / LIST                                        */}
      {/* ============================================================ */}
      <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-sans">
              Personal Gateway Tokens ({filteredKeys.length})
            </h3>
            <p className="text-xs text-zinc-400">
              Each key carries an authenticated identity, optional spend cap, and routing permissions.
            </p>
          </div>
        </div>

        {filteredKeys.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/[0.1] rounded-2xl text-zinc-400 space-y-3">
            <Key className="w-10 h-10 text-zinc-600 mx-auto" />
            <div className="text-sm font-bold text-white">No Gateway Keys Found</div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {searchQuery ? 'No API keys matched your search filter.' : 'Generate your first secret key to connect OpenAI, Anthropic, or Gemini through the OstraOps proxy.'}
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#C59E5F] hover:bg-[#B38D4F] text-white text-xs font-bold font-mono inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate First Key</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.08]">
            {filteredKeys.map((k) => {
              const isRevealed = Boolean(revealedKeyIds[k.id]);
              const displaySecret = isRevealed
                ? k.token
                : `${k.token.slice(0, 16)}••••••••••••••••${k.token.slice(-4)}`;

              return (
                <div key={k.id} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Key Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-white text-sm">{k.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          k.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {k.status.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[#E5C38D] bg-[#C59E5F]/15 border border-[#C59E5F]/30">
                        {k.environment}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 bg-white/[0.06] border border-white/[0.08]">
                        {k.scope === 'full_access' ? 'Full Access' : k.scope === 'model_scoped' ? 'Model Scoped' : 'Read Only'}
                      </span>
                    </div>

                    {/* Secret Token Field */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-mono text-zinc-300 bg-[#07090C] px-2.5 py-1 rounded-lg border border-white/[0.08] select-all">
                        {displaySecret}
                      </code>
                      <button
                        type="button"
                        onClick={() => toggleReveal(k.id)}
                        className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer"
                        title={isRevealed ? 'Mask Token' : 'Reveal Token'}
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(k.token, k.id, k.name)}
                        className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white bg-[#07090C] px-2.5 py-1 rounded-lg border border-white/[0.08] cursor-pointer"
                      >
                        {copiedKeyId === k.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKeyId === k.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-500 pt-0.5">
                      <span>Created: {new Date(k.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>Expires: {k.expires_in_label}</span>
                      <span>•</span>
                      <span>Ceiling: ${k.monthly_limit_usd || 500}/mo</span>
                      <span>•</span>
                      <span>Last Used: {k.last_used_at}</span>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                    <button
                      onClick={() => setSelectedSnippetKey(k)}
                      className="px-3 py-1.5 rounded-xl bg-[#07090C] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-mono font-bold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <FileCode className="w-3.5 h-3.5 text-[#C59E5F]" />
                      <span>Integration</span>
                    </button>

                    {k.status === 'active' ? (
                      <button
                        onClick={() => handleRevokeKey(k)}
                        className="px-3 py-1.5 rounded-xl bg-[#07090C] hover:bg-rose-950/20 border border-rose-500/30 text-xs font-mono font-bold text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                      >
                        Revoke
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteKey(k)}
                        className="px-3 py-1.5 rounded-xl bg-[#07090C] hover:bg-rose-950/20 border border-white/[0.08] text-xs font-mono font-bold text-zinc-500 hover:text-rose-400 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* QUICKSTART CODE INTEGRATION CARD                             */}
      {/* ============================================================ */}
      <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#C59E5F]" />
              <span>Quickstart Gateway Connection</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Drop this snippet directly into your terminal or application backend.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#07090C] p-1 rounded-xl border border-white/[0.08] font-mono text-xs">
            <button
              onClick={() => setSnippetLanguage('curl')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                snippetLanguage === 'curl' ? 'bg-[#C59E5F] text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setSnippetLanguage('python')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                snippetLanguage === 'python' ? 'bg-[#C59E5F] text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Python
            </button>
            <button
              onClick={() => setSnippetLanguage('typescript')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                snippetLanguage === 'typescript' ? 'bg-[#C59E5F] text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              TypeScript
            </button>
          </div>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-[#07090C] border border-white/[0.08] text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
            {snippetLanguage === 'curl'
              ? snippetCurl(keys[0]?.token || 'ost_live_YOUR_KEY_HERE')
              : snippetLanguage === 'python'
              ? snippetPython(keys[0]?.token || 'ost_live_YOUR_KEY_HERE')
              : snippetTypeScript(keys[0]?.token || 'ost_live_YOUR_KEY_HERE')}
          </pre>
          <button
            onClick={() => {
              const code =
                snippetLanguage === 'curl'
                  ? snippetCurl(keys[0]?.token || 'ost_live_YOUR_KEY_HERE')
                  : snippetLanguage === 'python'
                  ? snippetPython(keys[0]?.token || 'ost_live_YOUR_KEY_HERE')
                  : snippetTypeScript(keys[0]?.token || 'ost_live_YOUR_KEY_HERE');
              copyToClipboard(code, 'quickstart-code', 'Snippet Code');
            }}
            className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F] text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
          >
            {copiedKeyId === 'quickstart-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedKeyId === 'quickstart-code' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: GENERATE NEW GATEWAY KEY                            */}
      {/* ============================================================ */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#07090C] border border-white/[0.08] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0B0E14]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF3E0] border border-[#EEDDB8] flex items-center justify-center text-[#C59E5F]">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-sans">
                    Generate Gateway API Key
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Create a secret token for your production backend, AI agent, or development environment.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateKeySubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Key Name */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1 font-mono uppercase">
                  Key Name / Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production Next.js Server or Agent Worker"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-sans text-white focus:outline-none focus:border-[#C59E5F]"
                />
              </div>

              {/* Environment Selection */}
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                {(['Production', 'Staging', 'Development'] as const).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setNewKeyEnv(env)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                      newKeyEnv === env
                        ? 'bg-[#C59E5F]/20 text-[#E5C38D] border-[#C59E5F]'
                        : 'bg-[#0B0E14] text-zinc-400 border-white/[0.08] hover:text-white'
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>

              {/* Permissions & Scopes */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1 font-mono uppercase">
                  Routing Scope &amp; Access
                </label>
                <select
                  value={newKeyScope}
                  onChange={(e) => setNewKeyScope(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-[#C59E5F]"
                >
                  <option value="full_access">Full Access (All Models, Routing & Fallbacks)</option>
                  <option value="model_scoped">Model Scoped (Only Designated Models)</option>
                  <option value="read_only">Read-Only (Telemetry & Usage Inspection Only)</option>
                </select>
              </div>

              {/* Monthly Spend Limit & Expiration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1 font-mono uppercase">
                    Monthly Limit ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-500">$</span>
                    <input
                      type="number"
                      value={newKeyMonthlyLimit}
                      onChange={(e) => setNewKeyMonthlyLimit(e.target.value)}
                      placeholder="500"
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-[#C59E5F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1 font-mono uppercase">
                    Key Expiration
                  </label>
                  <select
                    value={newKeyExpiry}
                    onChange={(e) => setNewKeyExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-[#C59E5F]"
                  >
                    <option value="Never">Never (Recommended)</option>
                    <option value="30 Days">30 Days</option>
                    <option value="60 Days">60 Days</option>
                    <option value="90 Days">90 Days</option>
                    <option value="1 Year">1 Year</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#C59E5F] hover:bg-[#B38D4F] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Key className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmitting ? 'Generating...' : 'Generate Secret Key'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: ONE-TIME REVEAL BOX FOR NEWLY CREATED KEY           */}
      {/* ============================================================ */}
      {newlyCreatedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#07090C] border border-[#C59E5F]/40 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0B0E14]">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>API Key Generated Successfully</span>
              </div>
              <button
                onClick={() => setNewlyCreatedKey(null)}
                className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                <strong>Important:</strong> Please copy this secret key now. For your security, you will not be able to view it in plaintext again.
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono block mb-1 font-bold">
                  Secret Gateway Token ({newlyCreatedKey.name})
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newlyCreatedKey.token}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-mono text-white select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(newlyCreatedKey.token, 'new-key', newlyCreatedKey.name)}
                    className="px-4 py-2 rounded-xl bg-[#C59E5F] hover:bg-[#B38D4F] text-white text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {copiedKeyId === 'new-key' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKeyId === 'new-key' ? 'Copied!' : 'Copy Key'}</span>
                  </button>
                </div>
              </div>

              <div className="text-xs font-mono text-zinc-400 space-y-1 pt-2 border-t border-white/[0.08]">
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <span className="text-white font-bold">{newlyCreatedKey.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Spend Ceiling:</span>
                  <span className="text-white font-bold">${newlyCreatedKey.monthly_limit_usd}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span>Expiration:</span>
                  <span className="text-white font-bold">{newlyCreatedKey.expires_in_label}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setNewlyCreatedKey(null)}
                  className="px-5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-bold cursor-pointer"
                >
                  I have saved my key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: CODE SNIPPET VIEWER                                 */}
      {/* ============================================================ */}
      {selectedSnippetKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#07090C] border border-white/[0.08] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0B0E14]">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#C59E5F]" />
                <h3 className="text-sm font-bold text-white">
                  Integration Snippets for {selectedSnippetKey.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSnippetKey(null)}
                className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 bg-[#0B0E14] p-1 rounded-xl border border-white/[0.08] font-mono text-xs">
                <button
                  onClick={() => setSnippetLanguage('curl')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    snippetLanguage === 'curl' ? 'bg-[#C59E5F] text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setSnippetLanguage('python')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    snippetLanguage === 'python' ? 'bg-[#C59E5F] text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Python (OpenAI)
                </button>
                <button
                  onClick={() => setSnippetLanguage('typescript')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    snippetLanguage === 'typescript' ? 'bg-[#C59E5F] text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  TypeScript
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-80">
                  {snippetLanguage === 'curl'
                    ? snippetCurl(selectedSnippetKey.token)
                    : snippetLanguage === 'python'
                    ? snippetPython(selectedSnippetKey.token)
                    : snippetTypeScript(selectedSnippetKey.token)}
                </pre>
                <button
                  onClick={() => {
                    const code =
                      snippetLanguage === 'curl'
                        ? snippetCurl(selectedSnippetKey.token)
                        : snippetLanguage === 'python'
                        ? snippetPython(selectedSnippetKey.token)
                        : snippetTypeScript(selectedSnippetKey.token);
                    copyToClipboard(code, 'modal-snippet', 'Code');
                  }}
                  className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-[#07090C] border border-white/[0.08] hover:border-[#C59E5F] text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  {copiedKeyId === 'modal-snippet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKeyId === 'modal-snippet' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs font-mono text-zinc-400">
                <span>Direct Proxy Endpoint: <code className="text-[#E5C38D]">https://gateway.ostraops.com/v1</code></span>
                <button
                  onClick={() => setSelectedSnippetKey(null)}
                  className="px-4 py-1.5 rounded-xl bg-white/[0.08] text-white text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
