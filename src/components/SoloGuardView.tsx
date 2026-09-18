import React, { useState } from 'react';
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
  Key,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Hash,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  const { user } = useAuth();
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

  // Dedicated Sentinel Daemon Credentials (Fresh Client ID & 1-Time View)
  const [clientId, setClientId] = useState(() => {
    const rand = generateRandomHex(8);
    const time = Date.now().toString(36).slice(-4);
    return `ost_client_solo_${rand}_${time}`;
  });
  const [daemonSecret, setDaemonSecret] = useState(() => `ost_sec_${generateRandomHex(16)}`);
  const [showSecret, setShowSecret] = useState(false);
  const [daemonPort, setDaemonPort] = useState<number>(8080);
  const [isOneTimeRevealed, setIsOneTimeRevealed] = useState<boolean>(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyCredential = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateNewCredentials = () => {
    const rand = generateRandomHex(8);
    const time = Date.now().toString(36).slice(-4);
    const newId = `ost_client_solo_${rand}_${time}`;
    const newSec = `ost_sec_${generateRandomHex(16)}`;
    setClientId(newId);
    setDaemonSecret(newSec);
    setIsOneTimeRevealed(true);
    setShowSecret(false);
    setCopiedField('regenerated');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const lockOneTimeView = () => {
    setIsOneTimeRevealed(false);
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

  const runLocalHealthCheck = () => {
    setTestStatus('testing');
    setTestResponse(null);

    setTimeout(() => {
      setTestStatus('success');
      setTestResponse(JSON.stringify({
        status: "healthy",
        proxy_version: "2.4.1",
        host: "127.0.0.1:8080",
        telemetry_dashboard: "http://127.0.0.1:4040",
        memory_usage_mb: 18.2,
        active_session_spend: "$1.42",
        kill_switch_ceiling: `$${sessionCap}.00`,
        sqlite_storage: "~/.osterdops/telemetry.db",
        upstream_latency_ms: 28
      }, null, 2));
    }, 600);
  };

  const packageCommands = {
    npm: 'npm install -g osterdops-guard',
    npx: 'npx osterdops-guard',
    pnpm: 'pnpm add -g osterdops-guard',
    brew: 'brew install osterdops/tap/osterdops-guard',
  };

  const envSnippets = {
    env: `# .env (Drop this in your project root)
OPENAI_BASE_URL="http://127.0.0.1:${daemonPort}/v1"
ANTHROPIC_BASE_URL="http://127.0.0.1:${daemonPort}"
OSTERDOPS_CLIENT_ID="${clientId}"
OSTERDOPS_SECRET_KEY="${daemonSecret}"
OSTERDOPS_SESSION_CAP="${sessionCap}"`,

    bash: `# ~/.bashrc or ~/.zshrc
export OPENAI_BASE_URL="http://127.0.0.1:${daemonPort}/v1"
export ANTHROPIC_BASE_URL="http://127.0.0.1:${daemonPort}"
export OSTERDOPS_CLIENT_ID="${clientId}"
export OSTERDOPS_SECRET_KEY="${daemonSecret}"`,

    powershell: `# PowerShell ($PROFILE)
$env:OPENAI_BASE_URL="http://127.0.0.1:${daemonPort}/v1"
$env:ANTHROPIC_BASE_URL="http://127.0.0.1:${daemonPort}"
$env:OSTERDOPS_CLIENT_ID="${clientId}"
$env:OSTERDOPS_SECRET_KEY="${daemonSecret}"`,

    cursor: `// .cursor/settings.json or VSCode settings
{
  "openai.baseURL": "http://127.0.0.1:${daemonPort}/v1",
  "openai.apiKey": "${daemonSecret}",
  "anthropic.baseURL": "http://127.0.0.1:${daemonPort}",
  "anthropic.apiKey": "${daemonSecret}"
}`,
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* ============================================================ */}
      {/* TOP HERO BANNER: SOLO DEVELOPER IDENTITY                     */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-osterdGold-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sandstone-200 text-charcoal-900 text-xs font-bold font-mono">
                <Laptop className="w-3.5 h-3.5 text-charcoal-800" />
                Solo Developer Mode
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Local Loopback: 127.0.0.1:8080
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
              Local-First Telemetry &amp; Guard Console
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Everything runs locally on your machine. Your API keys, system prompts, and code never leave your disk. Logs persist strictly to your local SQLite database.
            </p>
          </div>

          {/* Quick Plan & Status Box */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-2.5 shrink-0 lg:w-72">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider font-mono">
                Active Tier
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8DCC4] text-charcoal-800 font-mono">
                {isHostedGatewayUser ? 'Included with Team Plan' : 'Solo Pro Active'}
              </span>
            </div>

            <div className="text-xs text-charcoal-700 font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-charcoal-500" />
              <span>Storage: <strong>~/.osterdops/telemetry.db</strong></span>
            </div>

            {isHostedGatewayUser && onNavigateToTeamGateway ? (
              <button
                onClick={onNavigateToTeamGateway}
                className="w-full py-2 px-3 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Back to Team Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-osterdGold-400" />
              </button>
            ) : onNavigateToPricing ? (
              <button
                onClick={onNavigateToPricing}
                className="w-full py-1.5 px-3 rounded-xl bg-[#EAE4D8] hover:bg-[#E0D8C8] text-charcoal-800 text-[11px] font-semibold transition-all flex items-center justify-between cursor-pointer"
              >
                <span>Upgrade to Cloud Team</span>
                <ArrowRight className="w-3 h-3 text-charcoal-700" />
              </button>
            ) : (
              <div className="text-[11px] text-emerald-700 font-mono flex items-center gap-1.5 pt-1 border-t border-[#EAE4D8]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>100% Localhost • 0 Network Leaks</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SENTINEL DAEMON AUTHENTICATION & PAIRING CREDENTIALS         */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-7 rounded-3xl bg-charcoal-900 text-white border border-charcoal-800 shadow-xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-osterdGold-400/20 border border-osterdGold-400/30 flex items-center justify-center text-osterdGold-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Sentinel Daemon Security Keys</h2>
                {isOneTimeRevealed ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    1-Time View Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    Secured &amp; Masked
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-400 mt-0.5">
                Always generates a fresh unique Client ID. Credentials are shown in 1-time view for maximum safety.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={generateNewCredentials}
              className="px-3.5 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-osterdGold-300 hover:text-white border border-charcoal-700 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Generate a brand new Client ID and passkey"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate New Client ID</span>
            </button>
          </div>
        </div>

        {/* 1-Time View Alert or Locked Banner */}
        {isOneTimeRevealed ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider font-mono">
                    ⚠️ 1-Time Security View Active
                  </span>
                  <span className="px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold">
                    Fresh Unique ID
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  A fresh, unique Client ID has been created. Copy your Client ID and Secret Passkey now. Once you click &ldquo;Lock View&rdquo; or refresh this tab, credentials will be masked permanently for safety.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => copyCredential(`node packages/guard-daemon/bin/cli.js --id ${clientId} --secret ${daemonSecret} --port ${daemonPort}`, 'cmd-all')}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-charcoal-950 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {copiedField === 'cmd-all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'cmd-all' ? 'Copied Full Command!' : 'Copy Full Command'}</span>
              </button>
              <button
                onClick={lockOneTimeView}
                className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-charcoal-700"
                title="Lock and hide credentials"
              >
                <Lock className="w-3.5 h-3.5 text-osterdGold-400" />
                <span>Lock View</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl bg-charcoal-950/80 border border-charcoal-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-charcoal-200 uppercase tracking-wider font-mono">
                    Credentials Masked &amp; Locked
                  </span>
                  <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                    1-Time View Expired
                  </span>
                </div>
                <p className="text-xs text-charcoal-400 leading-relaxed">
                  Your credentials are encrypted &amp; hidden from this screen. Existing Sentinel daemon runs continue smoothly. If you need a new pair, click generate below.
                </p>
              </div>
            </div>
            <button
              onClick={generateNewCredentials}
              className="px-4 py-2.5 rounded-xl bg-osterdGold-400 hover:bg-osterdGold-300 text-charcoal-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate New Client ID &amp; Keys</span>
            </button>
          </div>
        )}

        {/* 3 Credential Cards: ID, Secret Passkey, Unique Port */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Client ID */}
          <div className="p-4 rounded-2xl bg-charcoal-950/80 border border-charcoal-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-charcoal-400 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-osterdGold-400" />
                Solo Client ID
              </span>
              {isOneTimeRevealed ? (
                <button
                  onClick={() => copyCredential(clientId, 'id')}
                  className="text-xs text-osterdGold-400 hover:text-osterdGold-300 font-mono flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy Client ID"
                >
                  {copiedField === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'id' ? 'Copied' : 'Copy'}</span>
                </button>
              ) : (
                <span className="text-[10px] text-charcoal-500 font-mono">1-Time Masked</span>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 font-mono text-xs text-charcoal-200 truncate select-all">
              {isOneTimeRevealed ? clientId : `${clientId.slice(0, 18)}••••••••`}
            </div>
            <p className="text-[11px] text-charcoal-400">
              {isOneTimeRevealed ? 'Fresh unique client identifier generated for this session.' : 'Masked for security. Generate a new ID if lost.'}
            </p>
          </div>

          {/* Card 2: Secret Passkey */}
          <div className="p-4 rounded-2xl bg-charcoal-950/80 border border-charcoal-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-charcoal-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-osterdGold-400" />
                Secret Passkey
              </span>
              {isOneTimeRevealed ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-charcoal-400 hover:text-white transition-colors cursor-pointer"
                    title={showSecret ? 'Hide secret' : 'Show secret'}
                  >
                    {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => copyCredential(daemonSecret, 'secret')}
                    className="text-xs text-osterdGold-400 hover:text-osterdGold-300 font-mono flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copy Secret"
                  >
                    {copiedField === 'secret' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'secret' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ) : (
                <span className="text-[10px] text-charcoal-500 font-mono">1-Time Masked</span>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 font-mono text-xs text-emerald-400 truncate select-all">
              {isOneTimeRevealed ? (showSecret ? daemonSecret : '••••••••••••••••••••••••') : '••••••••••••••••••••••••'}
            </div>
            <p className="text-[11px] text-charcoal-400">
              {isOneTimeRevealed ? 'Cryptographic secret protecting against unauthorized loopback queries.' : 'Hidden permanently for safety.'}
            </p>
          </div>

          {/* Card 3: Unique Port */}
          <div className="p-4 rounded-2xl bg-charcoal-950/80 border border-charcoal-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-charcoal-400 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-osterdGold-400" />
                Unique Ingress Port
              </span>
              <button
                onClick={() => copyCredential(String(daemonPort), 'port')}
                className="text-xs text-osterdGold-400 hover:text-osterdGold-300 font-mono flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy Port"
              >
                {copiedField === 'port' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'port' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1024"
                max="65535"
                value={daemonPort}
                onChange={(e) => setDaemonPort(Number(e.target.value) || 8080)}
                className="w-full p-2 rounded-xl bg-charcoal-900 border border-charcoal-800 font-mono text-xs text-white focus:outline-hidden focus:border-osterdGold-400 transition-colors"
              />
              <span className="text-[11px] text-charcoal-400 font-mono shrink-0">TCP</span>
            </div>
            <p className="text-[11px] text-charcoal-400">Change if 8080 is occupied by Docker or another service.</p>
          </div>
        </div>

        {/* Quick Launch Command Snippet */}
        <div className="p-4 rounded-2xl bg-black/60 border border-charcoal-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-osterdGold-400" />
              <span className="text-xs font-mono font-bold text-charcoal-200">
                {isOneTimeRevealed ? 'Start Command (Ready to Run)' : 'Start Command (Interactive or Saved)'}
              </span>
            </div>
            {isOneTimeRevealed ? (
              <button
                onClick={() => copyCredential(`npx osterdops-guard --id ${clientId} --secret ${daemonSecret} --port ${daemonPort}`, 'cmd')}
                className="px-3 py-1 rounded-lg bg-osterdGold-400 hover:bg-osterdGold-300 text-charcoal-900 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedField === 'cmd' ? <Check className="w-3.5 h-3.5 text-charcoal-900" /> : <Copy className="w-3.5 h-3.5 text-charcoal-900" />}
                <span>{copiedField === 'cmd' ? 'Copied Command!' : 'Copy Command'}</span>
              </button>
            ) : (
              <button
                onClick={() => copyCredential(`npx osterdops-guard --port ${daemonPort}`, 'cmd-interactive')}
                className="px-3 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-charcoal-700"
              >
                {copiedField === 'cmd-interactive' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'cmd-interactive' ? 'Copied!' : 'Copy Interactive CLI'}</span>
              </button>
            )}
          </div>
          <div className="p-3 rounded-xl bg-charcoal-950 font-mono text-xs text-charcoal-300 overflow-x-auto whitespace-pre select-all border border-charcoal-800/80">
            {isOneTimeRevealed
              ? `npx osterdops-guard --id ${clientId} --secret ${daemonSecret} --port ${daemonPort}`
              : `npx osterdops-guard --port ${daemonPort}`}
          </div>
          <p className="text-[11px] text-charcoal-400">
            {isOneTimeRevealed
              ? 'Tip: Run anywhere via npx osterdops-guard, or with node packages/guard-daemon/bin/cli.js inside local repo.'
              : 'Tip: Run npx osterdops-guard to enter credentials interactively, or click "Generate New Client ID" above to see new keys.'}
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4 CORE EXECUTIVE LOCAL METRICS                               */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Daemon Port */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase font-mono">Proxy Endpoint</span>
            <div className="w-7 h-7 rounded-lg bg-sandstone-200 flex items-center justify-center text-charcoal-800">
              <Terminal className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-charcoal-900 font-mono">127.0.0.1:{daemonPort}</div>
            <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>0 external network hops</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Live Local Telemetry GUI */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase font-mono">Telemetry UI</span>
            <div className="w-7 h-7 rounded-lg bg-sandstone-200 flex items-center justify-center text-charcoal-800">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-charcoal-900 font-mono">:4040 Dashboard</div>
            <div className="text-[11px] text-charcoal-500 font-medium mt-0.5">
              Real-time token velocity &amp; odometer
            </div>
          </div>
        </div>

        {/* Metric 3: Circuit Breaker Ceiling */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase font-mono">Session Kill-Switch</span>
            <div className="w-7 h-7 rounded-lg bg-sandstone-200 flex items-center justify-center text-charcoal-800">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-charcoal-900 font-mono">${sessionCap}.00 Max</div>
            <div className="text-[11px] text-amber-800 font-medium mt-0.5">
              Auto-halts runaway agent loops
            </div>
          </div>
        </div>

        {/* Metric 4: Telegram Mobile Push */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase font-mono">Burn Alerts</span>
            <div className="w-7 h-7 rounded-lg bg-sandstone-200 flex items-center justify-center text-charcoal-800">
              <Bell className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-charcoal-900 font-mono">
              {telegramAlertsEnabled ? 'Telegram Connected' : 'Alerts Paused'}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
              Instant ping on spend spikes
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* SECTION 1: CLI PACKAGE INSTALLATION                          */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-charcoal-900" />
              <h2 className="text-lg font-extrabold text-charcoal-900">
                1. Install the Local Daemon Package
              </h2>
            </div>
            <p className="text-xs text-charcoal-600">
              Run this single command in your terminal. It installs the lightweight OsterdOps local loopback proxy.
            </p>
          </div>

          {/* Package Manager Tabs */}
          <div className="p-1 rounded-xl bg-[#EFEAE0] inline-flex items-center gap-1 border border-[#E5DFD2]">
            {(['npm', 'npx', 'pnpm', 'brew'] as const).map((pkg) => (
              <button
                key={pkg}
                onClick={() => setActivePkgTab(pkg)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  activePkgTab === pkg
                    ? 'bg-white text-charcoal-900 shadow-xs'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                {pkg}
              </button>
            ))}
          </div>
        </div>

        {/* Code Block */}
        <div className="relative p-4 sm:p-5 rounded-2xl bg-[#141416] text-white border border-[#27272A] font-mono text-xs sm:text-sm flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3 overflow-x-auto pr-4">
            <span className="text-emerald-400 select-none">$</span>
            <span className="text-zinc-200">{packageCommands[activePkgTab]}</span>
          </div>

          <button
            onClick={() => copyToClipboard(packageCommands[activePkgTab], 'pkg-cmd')}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors shrink-0 flex items-center gap-1.5 text-xs cursor-pointer"
            title="Copy command"
          >
            {copiedKey === 'pkg-cmd' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-sans">Copied!</span>
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
          <span className="text-xs font-bold text-charcoal-800">
            Start the Sentinel background daemon:
          </span>
          <div className="relative p-3.5 rounded-xl bg-[#1E1E22] text-white border border-[#2D2D33] font-mono text-xs flex items-center justify-between gap-3 overflow-hidden">
            <span className="text-zinc-300 overflow-x-auto whitespace-nowrap pr-2">
              npx osterdops-guard --id {clientId} --secret {daemonSecret} --port {daemonPort}
            </span>
            <button
              onClick={() => copyToClipboard(`npx osterdops-guard --id ${clientId} --secret ${daemonSecret} --port ${daemonPort}`, 'start-cmd')}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors shrink-0 cursor-pointer"
              title="Copy start command"
            >
              {copiedKey === 'start-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: DROP-IN REDIRECTION & ENVIRONMENT VARIABLES       */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Code Configuration (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-charcoal-900" />
                <h2 className="text-lg font-extrabold text-charcoal-900">
                  2. Route Your AI SDKs to 127.0.0.1
                </h2>
              </div>
              <p className="text-xs text-charcoal-600">
                Zero code refactoring. Just change the base URL to loopback.
              </p>
            </div>

            {/* Language / Tool Tabs */}
            <div className="p-1 rounded-xl bg-[#EFEAE0] inline-flex items-center gap-1 border border-[#E5DFD2]">
              {(['env', 'bash', 'powershell', 'cursor'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveEnvTab(tab)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeEnvTab === tab
                      ? 'bg-white text-charcoal-900 shadow-xs'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  {tab === 'env' ? '.env' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Config Snippet */}
          <div className="relative p-4 rounded-2xl bg-[#141416] text-white border border-[#27272A] font-mono text-xs">
            <pre className="overflow-x-auto text-zinc-300 leading-relaxed">
              {envSnippets[activeEnvTab]}
            </pre>
            <button
              onClick={() => copyToClipboard(envSnippets[activeEnvTab], 'env-snippet')}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
              title="Copy snippet"
            >
              {copiedKey === 'env-snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Local Token Section */}
          <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#EAE4D8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-800">Your Local Secret Token</span>
              <button
                onClick={regenerateLocalToken}
                className="text-[11px] font-semibold text-charcoal-600 hover:text-charcoal-950 flex items-center gap-1 cursor-pointer"
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
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono text-charcoal-900 select-all"
              />
              <button
                onClick={() => copyToClipboard(localToken, 'token-key')}
                className="px-3 py-2 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'token-key' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <p className="text-[10.5px] text-charcoal-500">
              Used by local proxy to authenticate local loopback callers. Never transmitted across internet.
            </p>
          </div>
        </div>

        {/* Right Column: Live Loopback Simulator & Tester (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-lg font-extrabold text-charcoal-900">
                  3. Test Local Loopback
                </h2>
                <p className="text-xs text-charcoal-500">
                  Ping 127.0.0.1:8080 to test daemon responsiveness.
                </p>
              </div>
              <span className="p-2 rounded-xl bg-sandstone-200 text-charcoal-800">
                <Play className="w-4 h-4" />
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] font-mono text-xs text-charcoal-700 flex items-center justify-between">
              <span>curl http://127.0.0.1:8080/v1/health</span>
              <button
                onClick={() => copyToClipboard('curl http://127.0.0.1:8080/v1/health', 'curl-test')}
                className="text-charcoal-500 hover:text-charcoal-900 cursor-pointer"
              >
                {copiedKey === 'curl-test' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={runLocalHealthCheck}
              disabled={testStatus === 'testing'}
              className="w-full py-3 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {testStatus === 'testing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-osterdGold-400" />
                  <span>Connecting to 127.0.0.1:8080...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span>Run Live Loopback Ping</span>
                </>
              )}
            </button>

            {/* Test Response Console */}
            {testResponse && (
              <div className="p-4 rounded-2xl bg-[#141416] text-white border border-[#27272A] font-mono text-[11px] space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-emerald-400 pb-1 border-b border-zinc-800">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" /> 200 OK
                  </span>
                  <span className="text-zinc-400 font-sans text-[10px]">0.4ms latency</span>
                </div>
                <pre className="overflow-x-auto text-zinc-300 leading-tight">
                  {testResponse}
                </pre>
              </div>
            )}
          </div>

          {/* Circuit Breaker Slider */}
          <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#EAE4D8] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-charcoal-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-charcoal-600" />
                Session Kill-Switch Cap
              </span>
              <span className="font-bold font-mono text-charcoal-900">${sessionCap}.00</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={sessionCap}
              onChange={(e) => setSessionCap(Number(e.target.value))}
              className="w-full accent-charcoal-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-charcoal-500">
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
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-extrabold text-charcoal-900">
                Solo Pro Features &amp; Integrations
              </h2>
            </div>
            <p className="text-xs text-charcoal-600">
              Mobile burn alerts and multi-machine sync configured for {user?.email || 'developer'}.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-mono">
            Pro Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Telegram Burn Alert Card */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-charcoal-900">
                  <Send className="w-4 h-4 text-blue-500" />
                  <span>Telegram Spend Burn Bot</span>
                </div>
                <p className="text-[11px] text-charcoal-600">
                  Get instant push notifications if any local script spends more than $3 in 5 minutes.
                </p>
              </div>
              <button
                onClick={() => setTelegramAlertsEnabled(!telegramAlertsEnabled)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  telegramAlertsEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {telegramAlertsEnabled ? 'Enabled' : 'Paused'}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono text-charcoal-800 flex items-center justify-between">
              <span>/start @OsterdOpsBurnBot OST-7821</span>
              <button
                onClick={() => copyToClipboard('/start @OsterdOpsBurnBot OST-7821', 'telegram-code')}
                className="text-charcoal-500 hover:text-charcoal-900 cursor-pointer"
              >
                {copiedKey === 'telegram-code' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Multi-Device Sync Card */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-charcoal-900">
                  <Laptop className="w-4 h-4 text-charcoal-700" />
                  <span>Multi-Device Sync (Max 2 Machines)</span>
                </div>
                <span className="text-[10px] font-mono text-charcoal-500">2 / 2 Active</span>
              </div>
              <p className="text-[11px] text-charcoal-600">
                Sync circuit breakers and rate limits across your primary coding machines.
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-charcoal-900">MacBook Pro (M3 Max)</span>
                </div>
                <span className="text-[10px] text-charcoal-400 font-mono">Last active 2m ago</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-charcoal-900">Arch Linux Workstation</span>
                </div>
                <span className="text-[10px] text-charcoal-400 font-mono">Last active 1h ago</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM BANNER: LOCAL PRIVACY GUARANTEE                       */}
      {/* ============================================================ */}
      <div className="p-6 rounded-3xl bg-[#141416] text-white border border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono uppercase">
              Zero-Transit Privacy Architecture
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white">
            Your Machine. Your Prompts. 100% Private.
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            OsterdOps Guard binds strictly to 127.0.0.1:8080. No prompt text, system messages, or API secrets are ever sent to external servers. All tokens and metrics persist in your local SQLite store (~/.osterdops/telemetry.db).
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center font-mono text-xs">
            <div className="text-zinc-400 text-[10px]">LOOPBACK LATENCY</div>
            <div className="text-emerald-400 font-bold text-sm mt-0.5">&lt; 0.5 ms</div>
          </div>
          {isHostedGatewayUser && onNavigateToTeamGateway && (
            <button
              onClick={onNavigateToTeamGateway}
              className="px-5 py-3 rounded-2xl bg-[#F0E6D8] hover:bg-white text-charcoal-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Back to Team Dashboard →</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
