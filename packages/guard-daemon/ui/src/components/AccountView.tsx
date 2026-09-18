import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  Check,
  Copy,
  Eye,
  EyeOff,
  Cloud,
  CloudOff,
  Server,
  Activity,
  Cpu,
  Terminal,
  Unlink,
  RefreshCw,
  Sliders,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface AccountData {
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
  preferences: {
    syncAggregatedMetrics: boolean;
    allowPromptCaching: boolean;
    offlineSpooling: boolean;
  };
  runtime: {
    daemonVersion: string;
    nodeVersion: string;
    hostname: string;
    platform: string;
    bindHost: string;
    uptimeSeconds: number;
  };
}

const DEFAULT_ACCOUNT_DATA: AccountData = {
  pairing: {
    linked: true,
    status: 'connected',
    gatewayUrl: 'https://gateway.osterdops.com/v1',
    orgId: 'org_98f2b740e1a',
    orgName: 'Acme Engineering',
    projectId: 'prj_11a09d3b4',
    projectName: 'AI Coding Agents',
    userEmail: 'solo@osterdops.com',
    linkedAt: '2026-05-01T10:00:00Z',
  },
  activeKey: {
    id: 'key_live_dev',
    name: 'Development Virtual Key',
    key: 'ost_live_9b4e721a94f08c3d17e5a820b41e3a9f',
    maskedKey: 'ost_live_••••••••••••••••3a9f',
    tier: 'Enterprise Gateway (Auto-Failover On)',
  },
  virtualKeys: [
    {
      id: 'key_live_dev',
      name: 'Development Virtual Key',
      maskedKey: 'ost_live_••••••••••••••••3a9f',
      tier: 'Enterprise Gateway (Auto-Failover On)',
    },
    {
      id: 'key_live_stg',
      name: 'Staging Ingress Key',
      maskedKey: 'ost_live_••••••••••••••••8d1c',
      tier: 'Standard Gateway',
    },
    {
      id: 'key_live_personal',
      name: 'Personal Standalone Key',
      maskedKey: 'ost_live_••••••••••••••••7b5e',
      tier: 'Personal Standalone',
    },
  ],
  preferences: {
    syncAggregatedMetrics: true,
    allowPromptCaching: true,
    offlineSpooling: true,
  },
  runtime: {
    daemonVersion: '2.1.0',
    nodeVersion: 'v20.x',
    hostname: 'local-workstation',
    platform: 'win32',
    bindHost: '127.0.0.1',
    uptimeSeconds: 3600,
  },
};

export const AccountView: React.FC = () => {
  const [data, setData] = useState<AccountData>(DEFAULT_ACCOUNT_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [revealKey, setRevealKey] = useState(false);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch account data
  const fetchAccountInfo = async () => {
    try {
      const res = await fetch('/api/account', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.account) {
          setData(json.account);
          return;
        }
      }
      setData(DEFAULT_ACCOUNT_DATA);
    } catch (err) {
      console.warn('Failed to load account identity from daemon:', err);
      setData(DEFAULT_ACCOUNT_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  // Copy key to clipboard
  const handleCopyKey = () => {
    if (!data?.activeKey?.key) return;
    navigator.clipboard.writeText(data.activeKey.key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Toggle telemetry preference
  const handleTogglePreference = async (
    key: 'syncAggregatedMetrics' | 'allowPromptCaching' | 'offlineSpooling'
  ) => {
    if (!data) return;
    const nextVal = !data.preferences[key];
    const nextPrefs = { ...data.preferences, [key]: nextVal };

    // Optimistic UI update
    setData({ ...data, preferences: nextPrefs });

    try {
      await fetch('/api/account/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: nextVal }),
        credentials: 'same-origin',
      });
    } catch (err) {
      console.error('Failed to update preference:', err);
      fetchAccountInfo();
    }
  };

  // Switch active virtual key profile
  const handleSwitchKey = async (keyId: string) => {
    if (!data || data.activeKey.id === keyId) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/account/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId }),
        credentials: 'same-origin',
      });
      if (res.ok) {
        await fetchAccountInfo();
      }
    } catch (err) {
      console.error('Failed to switch key:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Unlink machine
  const handleConfirmUnlink = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/account/unlink', {
        method: 'POST',
        credentials: 'same-origin',
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.account);
        setShowUnlinkModal(false);
      }
    } catch (err) {
      console.error('Failed to unlink machine:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatUptime = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${s}s`;
    if (minutes > 0) return `${minutes}m ${s}s`;
    return `${s}s`;
  };

  if (isLoading || !data) {
    return (
      <div className="p-12 text-center space-y-3 font-sans">
        <RefreshCw className="w-6 h-6 text-emerald-800 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-charcoal-600">
          Reading local machine credentials (~/.osterdops/credentials.json)...
        </p>
      </div>
    );
  }

  const isLinked = data.pairing.linked;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans max-w-[1200px] mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900">
              Account & Cloud Linkage
            </h1>
            <span className="text-[10px] font-mono uppercase bg-[#E5F2EB] text-[#0C2419] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Local Ingress Auth
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Local developer machine identity, upstream proxy pairing, and privacy synchronization.
          </p>
        </div>

        {/* Status Pill Badge */}
        <div className="flex items-center gap-2">
          {isLinked ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#E5F2EB] border border-emerald-300 text-emerald-900 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Synced to OsterdOps Cloud</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>Offline / Standalone Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* User Profile & Account Card */}
      <div className="bg-white border border-[#EAE4D8] rounded-2xl p-6 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-[#F2EDE4] pb-5">
          <div className="flex items-center gap-4">
            {/* Illustrated Avatar matching TopNav */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-amber-100 border-2 border-amber-300 shadow-xs shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
                <rect width="36" height="36" fill="#FDE68A" />
                <circle cx="18" cy="14" r="7" fill="#78350F" />
                <path d="M7 32 C7 25 12 22 18 22 C24 22 29 25 29 32" fill="#1E293B" />
                <circle cx="18" cy="15" r="5" fill="#FCD34D" />
                <path d="M15 15 Q18 18 21 15" stroke="#78350F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-charcoal-900">Shaan Prasad</h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E5F2EB] text-emerald-800 font-mono border border-emerald-200">
                  Solo Personal
                </span>
              </div>
              <p className="text-xs text-charcoal-500 font-mono mt-0.5">solo@osterdops.com</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-charcoal-600">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Local Sentinel Workstation
                </span>
                <span>•</span>
                <span>Active Workspace: <strong>Personal</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyKey()}
              className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] text-xs font-semibold text-charcoal-700 hover:bg-[#F0ECE1] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
              <span>{copiedKey ? 'Key Copied!' : 'Copy Active Key'}</span>
            </button>
            <button
              onClick={() => fetchAccountInfo()}
              className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] text-charcoal-700 hover:bg-[#F0ECE1] transition-colors cursor-pointer shadow-2xs"
              title="Sync Account"
            >
              <RefreshCw className="w-3.5 h-3.5 text-charcoal-600" />
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#F2EDE4]">
            <span className="text-[10.5px] text-charcoal-500 block">Subscription Tier</span>
            <span className="font-bold text-charcoal-900 text-xs mt-0.5 block">Solo Developer</span>
          </div>
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#F2EDE4]">
            <span className="text-[10.5px] text-charcoal-500 block">Virtual Keys</span>
            <span className="font-bold text-charcoal-900 text-xs mt-0.5 block">{data.virtualKeys.length} Available</span>
          </div>
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#F2EDE4]">
            <span className="text-[10.5px] text-charcoal-500 block">Ingress Proxy</span>
            <span className="font-bold text-emerald-700 font-mono text-xs mt-0.5 block">127.0.0.1:8080</span>
          </div>
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#F2EDE4]">
            <span className="text-[10.5px] text-charcoal-500 block">Local Database</span>
            <span className="font-bold text-charcoal-800 font-mono text-[11px] mt-0.5 block truncate" title={data.runtime.hostname}>
              SQLite WAL Active
            </span>
          </div>
        </div>
      </div>

      {/* 2. Grid Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ========================================================== */}
        {/* [1] PAIRING & SYNC STATUS                                 */}
        {/* ========================================================== */}
        <div className="bg-white border border-[#EAE4D8] rounded-2xl p-6 shadow-subtle space-y-5">
          <div className="flex items-center justify-between border-b border-[#F2EDE4] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E5F2EB] text-[#0C2419] flex items-center justify-center font-bold">
                <Cloud className="w-4 h-4 text-emerald-800" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-charcoal-900">
                  Cloud Gateway Linkage
                </h3>
                <p className="text-[11px] text-charcoal-500">
                  Upstream connection to central organization telemetry
                </p>
              </div>
            </div>

            {isLinked ? (
              <span className="text-[11px] font-mono text-emerald-800 bg-[#E5F2EB] px-2 py-0.5 rounded font-semibold">
                ACTIVE
              </span>
            ) : (
              <span className="text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                STANDALONE
              </span>
            )}
          </div>

          {/* Details Table */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-[#FAF8F5]">
              <span className="font-medium text-charcoal-500">Status</span>
              <span className="font-semibold text-charcoal-900 flex items-center gap-1.5">
                {isLinked ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Connected to Cloud</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                    <span>Offline Standalone</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#FAF8F5]">
              <span className="font-medium text-charcoal-500">Gateway Endpoint</span>
              <span className="font-mono text-charcoal-900 text-[11px] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EAE4D8]">
                {data.pairing.gatewayUrl}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#FAF8F5]">
              <span className="font-medium text-charcoal-500">Organization</span>
              <div className="text-right">
                <span className="font-semibold text-charcoal-900 block">
                  {data.pairing.orgName}
                </span>
                <span className="font-mono text-[10.5px] text-charcoal-400 block">
                  {data.pairing.orgId}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#FAF8F5]">
              <span className="font-medium text-charcoal-500">Project Context</span>
              <div className="text-right">
                <span className="font-semibold text-charcoal-900 block">
                  {data.pairing.projectName}
                </span>
                <span className="font-mono text-[10.5px] text-charcoal-400 block">
                  {data.pairing.projectId}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="font-medium text-charcoal-500">Authenticated As</span>
              <span className="font-mono text-charcoal-800 text-[11px]">
                {data.pairing.userEmail}
              </span>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2 border-t border-[#F2EDE4] flex items-center justify-between">
            <span className="text-[11px] text-charcoal-500">
              {isLinked ? 'Paired via `npx osterdops login`' : 'Run `npx osterdops login` to re-pair'}
            </span>
            {isLinked ? (
              <button
                onClick={() => setShowUnlinkModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Disconnect Machine</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setData({
                    ...data,
                    pairing: {
                      ...data.pairing,
                      linked: true,
                      status: 'connected',
                      orgId: 'org_98f2b740e1a',
                      orgName: 'Acme Engineering',
                      projectId: 'prj_11a09d3b4',
                      projectName: 'AI Coding Agents',
                    },
                  });
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0C2419] hover:bg-[#143B2A] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>Connect to Cloud</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================== */}
        {/* [2] ACTIVE VIRTUAL KEY (Local Ingress Auth)               */}
        {/* ========================================================== */}
        <div className="bg-white border border-[#EAE4D8] rounded-2xl p-6 shadow-subtle space-y-5">
          <div className="flex items-center justify-between border-b border-[#F2EDE4] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] text-[#0C2419] border border-[#EAE4D8] flex items-center justify-center font-bold">
                <KeyRound className="w-4 h-4 text-emerald-800" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-charcoal-900">
                  Active Virtual Key
                </h3>
                <p className="text-[11px] text-charcoal-500">
                  Local ingress authorization token for IDEs and CLI agents
                </p>
              </div>
            </div>

            <span className="text-[10.5px] font-mono text-emerald-900 bg-[#E5F2EB] px-2 py-0.5 rounded font-semibold">
              INGRESS KEY
            </span>
          </div>

          {/* Key Display & Copy Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-charcoal-700">
              Active Key: <span className="text-charcoal-900 font-bold">{data.activeKey.name}</span>
            </label>
            <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl p-2.5">
              <div className="flex-1 font-mono text-xs text-charcoal-900 truncate select-all">
                {revealKey ? data.activeKey.key : data.activeKey.maskedKey}
              </div>

              <button
                onClick={() => setRevealKey(!revealKey)}
                className="p-1.5 rounded-lg hover:bg-white text-charcoal-500 hover:text-charcoal-800 transition-colors cursor-pointer"
                title={revealKey ? 'Mask Key' : 'Reveal Key'}
              >
                {revealKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleCopyKey}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  copiedKey
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-[#EAE4D8] text-charcoal-700 hover:bg-[#F5F2EB]'
                }`}
                title="Copy Virtual Key"
              >
                {copiedKey ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-charcoal-500">Routing Tier:</span>
              <span className="font-semibold text-emerald-900 bg-[#E5F2EB] px-2 py-0.5 rounded text-[10.5px]">
                {data.activeKey.tier}
              </span>
            </div>
          </div>

          {/* Key Profile Switcher */}
          <div className="space-y-2 pt-2 border-t border-[#F2EDE4]">
            <label className="block text-xs font-semibold text-charcoal-700">
              Quick Key Switcher (Without editing configs):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {data.virtualKeys.map((vk) => {
                const isActive = data.activeKey.id === vk.id;
                return (
                  <button
                    key={vk.id}
                    disabled={isUpdating}
                    onClick={() => handleSwitchKey(vk.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0C2419] text-white border-[#0C2419] shadow-2xs font-bold'
                        : 'bg-[#FAF8F5] border-[#EAE4D8] text-charcoal-700 hover:bg-white hover:border-[#0C2419]/30'
                    }`}
                  >
                    <div className="text-[11px] truncate">{vk.name}</div>
                    <div
                      className={`text-[9.5px] font-mono truncate mt-0.5 ${
                        isActive ? 'text-emerald-300' : 'text-charcoal-400'
                      }`}
                    >
                      {vk.maskedKey}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* [3] TELEMETRY PRIVACY PREFERENCES                         */}
        {/* ========================================================== */}
        <div className="bg-white border border-[#EAE4D8] rounded-2xl p-6 shadow-subtle space-y-5">
          <div className="flex items-center justify-between border-b border-[#F2EDE4] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] text-[#0C2419] border border-[#EAE4D8] flex items-center justify-center font-bold">
                <Sliders className="w-4 h-4 text-emerald-800" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-charcoal-900">
                  Telemetry & Privacy Preferences
                </h3>
                <p className="text-[11px] text-charcoal-500">
                  Control what data leaves this machine and syncs to team dashboards
                </p>
              </div>
            </div>

            <span className="text-[10.5px] font-mono text-charcoal-500 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EAE4D8]">
              LOCAL PRAGMAS
            </span>
          </div>

          {/* 3 Privacy Toggles */}
          <div className="space-y-3.5 text-xs">
            {/* Toggle 1: Aggregated metrics */}
            <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8]">
              <div className="space-y-0.5">
                <div className="font-bold text-charcoal-900">
                  Sync Aggregated Token Metrics
                </div>
                <div className="text-[11px] text-charcoal-500 leading-relaxed">
                  Stream token burn counts, model IDs, and latency stats to central team cost graphs.
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePreference('syncAggregatedMetrics')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  data.preferences.syncAggregatedMetrics ? 'bg-[#0C2419]' : 'bg-charcoal-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    data.preferences.syncAggregatedMetrics ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Prompt caching */}
            <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8]">
              <div className="space-y-0.5">
                <div className="font-bold text-charcoal-900">
                  Allow Prompt Text Caching
                </div>
                <div className="text-[11px] text-charcoal-500 leading-relaxed">
                  Permit local volatile caching of system instructions and repeated agent prompt bodies.
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePreference('allowPromptCaching')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  data.preferences.allowPromptCaching ? 'bg-[#0C2419]' : 'bg-charcoal-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    data.preferences.allowPromptCaching ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Offline spooling */}
            <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8]">
              <div className="space-y-0.5">
                <div className="font-bold text-charcoal-900">
                  Offline WAL Spooling
                </div>
                <div className="text-[11px] text-charcoal-500 leading-relaxed">
                  Buffer traces in SQLite when disconnected and automatically flush to cloud when network restores.
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePreference('offlineSpooling')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  data.preferences.offlineSpooling ? 'bg-[#0C2419]' : 'bg-charcoal-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    data.preferences.offlineSpooling ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* [4] RUNTIME IDENTITY & MACHINE CONTEXT                    */}
        {/* ========================================================== */}
        <div className="bg-white border border-[#EAE4D8] rounded-2xl p-6 shadow-subtle space-y-5">
          <div className="flex items-center justify-between border-b border-[#F2EDE4] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] text-[#0C2419] border border-[#EAE4D8] flex items-center justify-center font-bold">
                <Terminal className="w-4 h-4 text-emerald-800" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-charcoal-900">
                  Runtime & Device Identity
                </h3>
                <p className="text-[11px] text-charcoal-500">
                  Local process telemetry and hardware runtime information
                </p>
              </div>
            </div>

            <span className="text-[10.5px] font-mono text-emerald-800 bg-[#E5F2EB] px-2 py-0.5 rounded font-semibold">
              LOOPBACK
            </span>
          </div>

          {/* Runtime Grid Info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8]">
              <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Daemon Version</span>
              <span className="font-bold text-charcoal-900 font-mono text-sm block mt-0.5">
                {data.runtime.daemonVersion}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8]">
              <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Node.js Runtime</span>
              <span className="font-bold text-charcoal-900 font-mono text-sm block mt-0.5">
                {data.runtime.nodeVersion}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8]">
              <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Machine Hostname</span>
              <span className="font-bold text-charcoal-900 font-mono text-xs block mt-0.5 truncate">
                {data.runtime.hostname}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8]">
              <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Session Uptime</span>
              <span className="font-bold text-emerald-900 font-mono text-xs block mt-0.5">
                {formatUptime(data.runtime.uptimeSeconds)}
              </span>
            </div>
          </div>

          {/* Storage Paths Info */}
          <div className="space-y-2 pt-2 border-t border-[#F2EDE4] text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-charcoal-500 font-medium">Local SQLite Database:</span>
              <span className="font-mono text-[10.5px] text-charcoal-700 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EAE4D8]">
                ~/.osterdops/daemon.sqlite
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-charcoal-500 font-medium">Stored Credentials:</span>
              <span className="font-mono text-[10.5px] text-charcoal-700 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EAE4D8]">
                ~/.osterdops/credentials.json
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Unlink Machine Confirmation Modal */}
      {showUnlinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-[#EAE4D8] rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-charcoal-900">
                Disconnect Machine from OsterdOps Cloud?
              </h3>
              <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                This will wipe the stored cloud session tokens from <code className="font-mono bg-[#FAF8F5] px-1 py-0.5 rounded">~/.osterdops/credentials.json</code>. Your local SQLite traces and virtual keys will remain intact, and the daemon will operate in Standalone mode.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F2EDE4]">
              <button
                disabled={isUpdating}
                onClick={() => setShowUnlinkModal(false)}
                className="px-4 py-2 rounded-xl border border-[#EAE4D8] text-xs font-semibold text-charcoal-700 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isUpdating}
                onClick={handleConfirmUnlink}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Confirm Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
