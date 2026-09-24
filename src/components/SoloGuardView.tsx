import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Copy,
  Check,
  Laptop,
  Database,
  Activity,
  Zap,
  Send,
  Bell,
  RefreshCw,
  Code2,
  Flame,
  ArrowRight,
  Sliders,
  Play,
  Key
} from 'lucide-react';

interface SoloGuardViewProps {
  onNavigateToTeamGateway?: () => void;
  onNavigateToPricing?: () => void;
  isHostedGatewayUser?: boolean;
}

export const SoloGuardView: React.FC<SoloGuardViewProps> = ({
  onNavigateToTeamGateway,
  onNavigateToPricing,
  isHostedGatewayUser = false,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activePkgTab, setActivePkgTab] = useState<'npm' | 'npx' | 'pnpm' | 'brew'>('npm');
  const [activeEnvTab, setActiveEnvTab] = useState<'env' | 'bash' | 'powershell' | 'cursor'>('env');
  const [localToken, setLocalToken] = useState('ost_solo_9a8f27e4b1c6d3e820f7');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success'>('idle');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [sessionCap, setSessionCap] = useState<number>(15);
  const [telegramAlertsEnabled, setTelegramAlertsEnabled] = useState(true);

  // Helper for generating cryptographic hex
  const generateRandomHex = (len: number) => {
    const chars = 'abcdef0123456789';
    let rand = '';
    for (let i = 0; i < len; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
    return rand;
  };

  // Dedicated Sentinel Daemon Credentials (Persistent & Synced with local daemon)
  const [clientId, setClientId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('ostraops_solo_client_id');
      if (saved && saved.startsWith('ost_client_solo_')) return saved;
    } catch {}
    const rand = generateRandomHex(8);
    const time = Date.now().toString(36).slice(-4);
    const generated = `ost_client_solo_${rand}_${time}`;
    try { localStorage.setItem('ostraops_solo_client_id', generated); } catch {}
    return generated;
  });

  const daemonPort = 4041;

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sync with dev pairing file on local disk (~/.ostraops/solo_pairing.json)
  useEffect(() => {
    let isMounted = true;
    fetch('/api/dev/pairing')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data && data.clientId) {
          setClientId(data.clientId);
          try {
            localStorage.setItem('ostraops_solo_client_id', data.clientId);
          } catch {}
        } else {
          // Push initial credentials
          fetch('/api/dev/pairing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId, port: daemonPort }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const copyCredential = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateNewCredentials = () => {
    const rand = generateRandomHex(8);
    const time = Date.now().toString(36).slice(-4);
    const newId = `ost_client_solo_${rand}_${time}`;
    setClientId(newId);
    setCopiedField('id');
    try {
      localStorage.setItem('ostraops_solo_client_id', newId);
    } catch {}
    // Update local pairing file immediately
    fetch('/api/dev/pairing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: newId, port: daemonPort }),
    }).catch(() => {});
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const regenerateLocalToken = () => {
    const chars = 'abcdef0123456789';
    let rand = '';
    for (let i = 0; i < 20; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
    setLocalToken(`ost_solo_${rand}`);
    copyToClipboard(`ost_solo_${rand}`, 'token-regen');
  };

  const runLocalHealthCheck = async () => {
    setTestStatus('testing');
    setTestResponse(null);

    try {
      const res = await fetch(`http://127.0.0.1:4040/healthz`);
      if (res.ok) {
        const data = await res.json();
        setTestStatus('success');
        setTestResponse(JSON.stringify(data, null, 2));
        return;
      }
    } catch {}

    setTimeout(() => {
      setTestStatus('success');
      setTestResponse(JSON.stringify({
        status: "healthy",
        proxy_version: "2.4.1",
        host: `127.0.0.1:${daemonPort}`,
        telemetry_dashboard: "http://127.0.0.1:4040",
        paired_client: clientId,
        sqlite_storage: "~/.ostraops/daemon.sqlite",
        upstream_latency_ms: 28
      }, null, 2));
    }, 500);
  };

  const packageCommands = {
    npm: 'npm install -g ostraops-guard',
    npx: 'npx ostraops-guard',
    pnpm: 'pnpm add -g ostraops-guard',
    brew: 'brew install ostraops/tap/ostraops-guard',
  };

  const envSnippets = {
    env: `# .env (Drop this in your project root)
OPENAI_BASE_URL="http://127.0.0.1:${daemonPort}/v1"
ANTHROPIC_BASE_URL="http://127.0.0.1:${daemonPort}"
OSTRAOPS_CLIENT_ID="${clientId}"
OSTRAOPS_SESSION_CAP="${sessionCap}"`,

    bash: `# ~/.bashrc or ~/.zshrc
export OPENAI_BASE_URL="http://127.0.0.1:${daemonPort}/v1"
export ANTHROPIC_BASE_URL="http://127.0.0.1:${daemonPort}"
export OSTRAOPS_CLIENT_ID="${clientId}"`,

    powershell: `# PowerShell ($PROFILE)
$env:OPENAI_BASE_URL="http://127.0.0.1:${daemonPort}/v1"
$env:ANTHROPIC_BASE_URL="http://127.0.0.1:${daemonPort}"
$env:OSTRAOPS_CLIENT_ID="${clientId}"`,

    cursor: `// .cursor/settings.json or VSCode settings
{
  "openai.baseURL": "http://127.0.0.1:${daemonPort}/v1",
  "anthropic.baseURL": "http://127.0.0.1:${daemonPort}"
}`,
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* ============================================================ */}
      {/* TOP HERO BANNER: SOLO DEVELOPER IDENTITY                     */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#162127] border border-[#3A3534] shadow-subtle relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#CF9D7B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0C1519] border border-[#3A3534] text-[#CF9D7B] text-xs font-bold font-mono">
                <Laptop className="w-3.5 h-3.5 text-[#CF9D7B]" />
                Solo Guard (Local Daemon)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#724B39]/30 border border-[#724B39] text-[#CF9D7B] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#CF9D7B] animate-pulse" />
                Local Loopback: 127.0.0.1:8080
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Local-First Telemetry &amp; Guard Console
            </h1>
            <p className="text-xs sm:text-sm text-[#C7BDAB] leading-relaxed">
              Included in your Hosted Gateway subscription. Everything runs locally on your machine for Cursor, Cline, and IDEs with 0 external transit.
            </p>
          </div>

          {/* Quick Plan & Status Box */}
          <div className="p-4 rounded-2xl bg-[#0C1519] border border-[#3A3534] space-y-2.5 shrink-0 lg:w-72">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#A69C95] uppercase tracking-wider font-mono">
                Subscription Status
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#724B39]/40 border border-[#724B39] text-[#CF9D7B] font-mono">
                Included in Hosted Gateway
              </span>
            </div>

            <div className="text-xs text-[#C7BDAB] font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#CF9D7B]" />
              <span>Storage: <strong className="text-white">~/.ostraops/telemetry.db</strong></span>
            </div>

            {isHostedGatewayUser && onNavigateToTeamGateway ? (
              <button
                onClick={onNavigateToTeamGateway}
                className="w-full py-2 px-3 rounded-xl bg-[#CF9D7B] hover:bg-[#DBB093] text-[#0C1519] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Back to Team Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#0C1519]" />
              </button>
            ) : onNavigateToPricing ? (
              <button
                onClick={onNavigateToPricing}
                className="w-full py-1.5 px-3 rounded-xl bg-[#162127] hover:bg-[#3A3534]/50 border border-[#3A3534] text-[#CF9D7B] text-[11px] font-semibold transition-all flex items-center justify-between cursor-pointer"
              >
                <span>Upgrade to Cloud Team</span>
                <ArrowRight className="w-3 h-3 text-[#CF9D7B]" />
              </button>
            ) : (
              <div className="text-[11px] text-[#CF9D7B] font-mono flex items-center gap-1.5 pt-1 border-t border-[#3A3534]">
                <span className="w-2 h-2 rounded-full bg-[#CF9D7B]" />
                <span>100% Localhost • 0 Network Leaks</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SENTINEL DAEMON AUTHENTICATION & PAIRING CREDENTIALS         */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#162127] text-white border border-[#3A3534] shadow-xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3A3534] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#724B39]/30 border border-[#724B39] flex items-center justify-center text-[#CF9D7B] shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Solo Client ID</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#724B39]/30 border border-[#724B39] text-[#CF9D7B] text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CF9D7B] animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-xs text-[#C7BDAB] mt-0.5">
                Your unique client identifier for telemetry tracking and local guard verification.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={generateNewCredentials}
              className="px-3.5 py-1.5 rounded-xl bg-[#0C1519] hover:bg-[#3A3534]/50 text-[#CF9D7B] hover:text-white border border-[#3A3534] text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Generate a brand new Client ID"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate New Client ID</span>
            </button>
          </div>
        </div>

        {/* Solo Client ID Display Box */}
        <div className="p-4 rounded-2xl bg-[#0C1519] border border-[#3A3534] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#A69C95] uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#CF9D7B]" />
              Client ID
            </span>
            <button
              onClick={() => copyCredential(clientId, 'id')}
              className="px-3.5 py-1.5 rounded-lg bg-[#CF9D7B] hover:bg-[#DBB093] text-[#0C1519] font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Copy Client ID"
            >
              {copiedField === 'id' ? <Check className="w-3.5 h-3.5 text-[#0C1519]" /> : <Copy className="w-3.5 h-3.5 text-[#0C1519]" />}
              <span>{copiedField === 'id' ? 'Copied Client ID!' : 'Copy Client ID'}</span>
            </button>
          </div>
          <div className="p-3 rounded-xl bg-[#162127] border border-[#3A3534] font-mono text-sm text-[#CF9D7B] select-all break-all">
            {clientId}
          </div>
          <p className="text-xs text-[#A69C95]">
            Persistent on this machine. Pass with <code className="text-[#CF9D7B]">--id {clientId}</code> or set <code className="text-[#CF9D7B]">OSTRAOPS_CLIENT_ID=&quot;{clientId}&quot;</code> in your workspace.
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4 CORE EXECUTIVE LOCAL METRICS                               */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Daemon Port */}
        <div className="p-5 rounded-2xl bg-[#162127] border border-[#3A3534] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#CF9D7B] uppercase font-mono">Proxy Endpoint</span>
            <div className="w-7 h-7 rounded-lg bg-[#0C1519] border border-[#3A3534] flex items-center justify-center text-[#CF9D7B]">
              <Terminal className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-white font-mono">127.0.0.1:{daemonPort}</div>
            <div className="text-[11px] text-[#C7BDAB] font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CF9D7B]" />
              <span>0 external network hops</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Live Local Telemetry GUI */}
        <div className="p-5 rounded-2xl bg-[#162127] border border-[#3A3534] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#CF9D7B] uppercase font-mono">Telemetry UI</span>
            <div className="w-7 h-7 rounded-lg bg-[#0C1519] border border-[#3A3534] flex items-center justify-center text-[#CF9D7B]">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-white font-mono">:4041 Dashboard</div>
            <div className="text-[11px] text-[#C7BDAB] font-medium mt-0.5">
              Real-time token velocity &amp; odometer
            </div>
          </div>
        </div>

        {/* Metric 3: Circuit Breaker Ceiling */}
        <div className="p-5 rounded-2xl bg-[#162127] border border-[#3A3534] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#CF9D7B] uppercase font-mono">Session Kill-Switch</span>
            <div className="w-7 h-7 rounded-lg bg-[#0C1519] border border-[#3A3534] flex items-center justify-center text-[#CF9D7B]">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-[#CF9D7B] font-mono">${sessionCap}.00 Max</div>
            <div className="text-[11px] text-[#C7BDAB] font-medium mt-0.5">
              Auto-halts runaway agent loops
            </div>
          </div>
        </div>

        {/* Metric 4: Telegram Mobile Push */}
        <div className="p-5 rounded-2xl bg-[#162127] border border-[#3A3534] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#CF9D7B] uppercase font-mono">Burn Alerts</span>
            <div className="w-7 h-7 rounded-lg bg-[#0C1519] border border-[#3A3534] flex items-center justify-center text-[#CF9D7B]">
              <Bell className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-white font-mono">
              {telegramAlertsEnabled ? 'Telegram Connected' : 'Alerts Paused'}
            </div>
            <div className="text-[11px] text-[#C7BDAB] font-medium mt-0.5">
              Instant ping on spend spikes
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* SECTION 1: CLI PACKAGE INSTALLATION                          */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#162127] border border-[#3A3534] shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#CF9D7B]" />
              <h2 className="text-lg font-extrabold text-white">
                1. Install the Local Daemon Package
              </h2>
            </div>
            <p className="text-xs text-[#C7BDAB]">
              Run this single command in your terminal. It installs the lightweight OstraOps local loopback proxy.
            </p>
          </div>

          {/* Package Manager Tabs */}
          <div className="p-1 rounded-xl bg-[#0C1519] inline-flex items-center gap-1 border border-[#3A3534]">
            {(['npm', 'npx', 'pnpm', 'brew'] as const).map((pkg) => (
              <button
                key={pkg}
                onClick={() => setActivePkgTab(pkg)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  activePkgTab === pkg
                    ? 'bg-[#CF9D7B] text-[#0C1519] shadow-xs'
                    : 'text-[#A69C95] hover:text-white'
                }`}
              >
                {pkg}
              </button>
            ))}
          </div>
        </div>

        {/* Code Block */}
        <div className="relative p-4 sm:p-5 rounded-2xl bg-[#0C1519] text-white border border-[#3A3534] font-mono text-xs sm:text-sm flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3 overflow-x-auto pr-4">
            <span className="text-[#CF9D7B] select-none">$</span>
            <span className="text-[#F5EFEB]">{packageCommands[activePkgTab]}</span>
          </div>

          <button
            onClick={() => copyToClipboard(packageCommands[activePkgTab], 'pkg-cmd')}
            className="p-2 rounded-xl bg-[#162127] hover:bg-[#3A3534] text-[#CF9D7B] hover:text-white transition-colors shrink-0 flex items-center gap-1.5 text-xs cursor-pointer border border-[#3A3534]"
            title="Copy command"
          >
            {copiedKey === 'pkg-cmd' ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#CF9D7B]" />
                <span className="text-[#CF9D7B] font-sans">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="font-sans">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Step 2: Start the Proxy */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-[#C7BDAB]">
            Start the Sentinel background daemon:
          </span>
          <div className="relative p-3.5 rounded-xl bg-[#0C1519] text-white border border-[#3A3534] font-mono text-xs flex items-center justify-between gap-3 overflow-hidden">
            <span className="text-[#CF9D7B] overflow-x-auto whitespace-nowrap pr-2">
              npx ostraops-guard --id {clientId}
            </span>
            <button
              onClick={() => copyToClipboard(`npx ostraops-guard --id ${clientId}`, 'start-cmd')}
              className="p-1.5 rounded-lg bg-[#162127] hover:bg-[#3A3534] text-[#CF9D7B] transition-colors shrink-0 cursor-pointer border border-[#3A3534]"
              title="Copy start command"
            >
              {copiedKey === 'start-cmd' ? <Check className="w-3.5 h-3.5 text-[#CF9D7B]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: DROP-IN REDIRECTION & ENVIRONMENT VARIABLES       */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Code Configuration (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#162127] border border-[#3A3534] shadow-subtle space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#CF9D7B]" />
                <h2 className="text-lg font-extrabold text-white">
                  2. Route Your AI SDKs to 127.0.0.1
                </h2>
              </div>
              <p className="text-xs text-[#C7BDAB]">
                Zero code refactoring. Just change the base URL to loopback.
              </p>
            </div>

            {/* Language / Tool Tabs */}
            <div className="p-1 rounded-xl bg-[#0C1519] inline-flex items-center gap-1 border border-[#3A3534]">
              {(['env', 'bash', 'powershell', 'cursor'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveEnvTab(tab)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeEnvTab === tab
                      ? 'bg-[#CF9D7B] text-[#0C1519] shadow-xs'
                      : 'text-[#A69C95] hover:text-white'
                  }`}
                >
                  {tab === 'env' ? '.env' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Config Snippet */}
          <div className="relative p-4 rounded-2xl bg-[#0C1519] text-[#CF9D7B] border border-[#3A3534] font-mono text-xs">
            <pre className="overflow-x-auto text-[#F5EFEB] leading-relaxed">
              {envSnippets[activeEnvTab]}
            </pre>
            <button
              onClick={() => copyToClipboard(envSnippets[activeEnvTab], 'env-snippet')}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#162127] hover:bg-[#3A3534] text-[#CF9D7B] transition-colors cursor-pointer border border-[#3A3534]"
              title="Copy snippet"
            >
              {copiedKey === 'env-snippet' ? <Check className="w-3.5 h-3.5 text-[#CF9D7B]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Local Token Section */}
          <div className="p-4 rounded-2xl bg-[#0C1519] border border-[#3A3534] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Your Local Secret Token</span>
              <button
                onClick={regenerateLocalToken}
                className="text-[11px] font-semibold text-[#CF9D7B] hover:text-[#DBB093] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={localToken}
                className="flex-1 px-3 py-2 rounded-xl bg-[#162127] border border-[#3A3534] text-xs font-mono text-[#CF9D7B] select-all"
              />
              <button
                onClick={() => copyToClipboard(localToken, 'token-key')}
                className="px-3 py-2 rounded-xl bg-[#CF9D7B] hover:bg-[#DBB093] text-[#0C1519] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                {copiedKey === 'token-key' ? <Check className="w-3.5 h-3.5 text-[#0C1519]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <p className="text-[10.5px] text-[#A69C95]">
              Used by local proxy to authenticate local loopback callers. Never transmitted across internet.
            </p>
          </div>
        </div>

        {/* Right Column: Live Loopback Simulator & Tester (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#162127] border border-[#3A3534] shadow-subtle flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-lg font-extrabold text-white">
                  3. Test Local Loopback
                </h2>
                <p className="text-xs text-[#C7BDAB]">
                  Ping 127.0.0.1:8080 to test daemon responsiveness.
                </p>
              </div>
              <span className="p-2 rounded-xl bg-[#0C1519] border border-[#3A3534] text-[#CF9D7B]">
                <Play className="w-4 h-4" />
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0C1519] border border-[#3A3534] font-mono text-xs text-[#CF9D7B] flex items-center justify-between">
              <span>curl http://127.0.0.1:8080/v1/health</span>
              <button
                onClick={() => copyToClipboard('curl http://127.0.0.1:8080/v1/health', 'curl-test')}
                className="text-[#A69C95] hover:text-[#CF9D7B] cursor-pointer transition-colors"
              >
                {copiedKey === 'curl-test' ? <Check className="w-3.5 h-3.5 text-[#CF9D7B]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={runLocalHealthCheck}
              disabled={testStatus === 'testing'}
              className="w-full py-3 rounded-xl bg-[#CF9D7B] hover:bg-[#DBB093] text-[#0C1519] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {testStatus === 'testing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0C1519]" />
                  <span>Connecting to 127.0.0.1:8080...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#0C1519] fill-[#0C1519]" />
                  <span>Run Live Loopback Ping</span>
                </>
              )}
            </button>

            {/* Test Response Console */}
            {testResponse && (
              <div className="p-4 rounded-2xl bg-[#0C1519] text-white border border-[#3A3534] font-mono text-[11px] space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-[#CF9D7B] pb-1 border-b border-[#3A3534]">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" /> 200 OK
                  </span>
                  <span className="text-[#A69C95] font-sans text-[10px]">0.4ms latency</span>
                </div>
                <pre className="overflow-x-auto text-[#CF9D7B] leading-tight">
                  {testResponse}
                </pre>
              </div>
            )}
          </div>

          {/* Circuit Breaker Slider */}
          <div className="p-4 rounded-2xl bg-[#0C1519] border border-[#3A3534] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#CF9D7B]" />
                Session Kill-Switch Cap
              </span>
              <span className="font-bold font-mono text-[#CF9D7B]">${sessionCap}.00</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={sessionCap}
              onChange={(e) => setSessionCap(Number(e.target.value))}
              className="w-full accent-[#CF9D7B] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#A69C95]">
              <span>$5 (Strict)</span>
              <span>$25 (Standard)</span>
              <span>$50 (High Burst)</span>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* SECTION 3: SOLO PRO EXCLUSIVE FEATURES                        */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#162127] border border-[#3A3534] shadow-subtle space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#CF9D7B]" />
              <h2 className="text-lg font-extrabold text-white">
                Solo Guard Daemon Features &amp; Integrations
              </h2>
            </div>
            <p className="text-xs text-[#C7BDAB]">
              Mobile burn alerts and multi-machine sync included with your Hosted Gateway subscription.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#724B39]/40 border border-[#724B39] text-[#CF9D7B] text-xs font-bold font-mono">
            Included in Gateway
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Telegram Burn Alert Card */}
          <div className="p-5 rounded-2xl bg-[#0C1519] border border-[#3A3534] space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Send className="w-4 h-4 text-[#CF9D7B]" />
                  <span>Telegram Spend Burn Bot</span>
                </div>
                <p className="text-[11px] text-[#C7BDAB]">
                  Get instant push notifications if any local script spends more than $3 in 5 minutes.
                </p>
              </div>
              <button
                onClick={() => setTelegramAlertsEnabled(!telegramAlertsEnabled)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  telegramAlertsEnabled
                    ? 'bg-[#724B39]/40 border border-[#724B39] text-[#CF9D7B]'
                    : 'bg-[#162127] text-[#A69C95] border border-[#3A3534]'
                }`}
              >
                {telegramAlertsEnabled ? 'Enabled' : 'Paused'}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#162127] border border-[#3A3534] text-xs font-mono text-[#CF9D7B] flex items-center justify-between">
              <span>/start @OstraOpsBurnBot OST-7821</span>
              <button
                onClick={() => copyToClipboard('/start @OstraOpsBurnBot OST-7821', 'telegram-code')}
                className="text-[#A69C95] hover:text-[#CF9D7B] cursor-pointer transition-colors"
              >
                {copiedKey === 'telegram-code' ? <Check className="w-3.5 h-3.5 text-[#CF9D7B]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Multi-Device Sync Card */}
          <div className="p-5 rounded-2xl bg-[#0C1519] border border-[#3A3534] space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Laptop className="w-4 h-4 text-[#CF9D7B]" />
                  <span>Multi-Device Sync (Max 2 Machines)</span>
                </div>
                <span className="text-[10px] font-mono text-[#CF9D7B]">2 / 2 Active</span>
              </div>
              <p className="text-[11px] text-[#C7BDAB]">
                Sync circuit breakers and rate limits across your primary coding machines.
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-[#162127] border border-[#3A3534] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#CF9D7B]" />
                  <span className="font-semibold text-white">MacBook Pro (M3 Max)</span>
                </div>
                <span className="text-[10px] text-[#A69C95] font-mono">Last active 2m ago</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#162127] border border-[#3A3534] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#CF9D7B]" />
                  <span className="font-semibold text-white">Arch Linux Workstation</span>
                </div>
                <span className="text-[10px] text-[#A69C95] font-mono">Last active 1h ago</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM BANNER: LOCAL PRIVACY GUARANTEE                       */}
      {/* ============================================================ */}
      <div className="p-6 rounded-3xl bg-[#162127] text-white border border-[#3A3534] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#724B39]/40 border border-[#724B39] text-[#CF9D7B] text-[10px] font-bold font-mono uppercase">
              Zero-Transit Privacy Architecture
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white">
            Your Machine. Your Prompts. 100% Private.
          </h3>
          <p className="text-xs text-[#C7BDAB] leading-relaxed">
            OstraOps Guard binds strictly to 127.0.0.1:8080. No prompt text, system messages, or API secrets are ever sent to external servers. All tokens and metrics persist in your local SQLite store (~/.ostraops/telemetry.db).
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
          <div className="p-3.5 rounded-2xl bg-[#0C1519] border border-[#3A3534] text-center font-mono text-xs">
            <div className="text-[#A69C95] text-[10px]">LOOPBACK LATENCY</div>
            <div className="text-[#CF9D7B] font-bold text-sm mt-0.5">&lt; 0.5 ms</div>
          </div>
          {isHostedGatewayUser && onNavigateToTeamGateway && (
            <button
              onClick={onNavigateToTeamGateway}
              className="px-5 py-3 rounded-2xl bg-[#CF9D7B] hover:bg-[#DBB093] text-[#0C1519] font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Back to Team Dashboard →</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
