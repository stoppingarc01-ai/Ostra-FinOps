import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Sliders,
  KeyRound,
  HardDrive,
  Server,
  Save,
  Check,
  RefreshCw,
  AlertCircle,
  Clock,
  DollarSign,
  Activity,
  Cpu,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

interface DaemonConfigData {
  proxyPort: number;
  uiPort: number;
  bindHost: string;
  sessionBudgetUsd: number;
  rollingWindowSeconds: number;
  ringBufferSize: number;
  dbPath: string;
  upstreamGatewayUrl: string;
  hasAnthropicKey: boolean;
  maskedAnthropicKey: string;
  hasOpenaiKey: boolean;
  maskedOpenaiKey: string;
  hardCutoff: boolean;
  warningThresholdPct: number;
  rateLimitRpm: number;
}

const DEFAULT_CONFIG_DATA: DaemonConfigData = {
  proxyPort: 4040,
  uiPort: 4040,
  bindHost: '127.0.0.1',
  sessionBudgetUsd: 5.0,
  rollingWindowSeconds: 300,
  ringBufferSize: 1000,
  dbPath: '~/.osterdops/daemon.sqlite',
  upstreamGatewayUrl: 'https://gateway.osterdops.com/v1',
  hasAnthropicKey: true,
  maskedAnthropicKey: 'sk-ant-••••••••5812',
  hasOpenaiKey: true,
  maskedOpenaiKey: 'sk-proj-••••••••9104',
  hardCutoff: true,
  warningThresholdPct: 80,
  rateLimitRpm: 60,
};

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guardrails' | 'proxy' | 'keys' | 'telemetry'>('guardrails');
  const [config, setConfig] = useState<DaemonConfigData>(DEFAULT_CONFIG_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [budgetUsd, setBudgetUsd] = useState('5.00');
  const [rollingWindow, setRollingWindow] = useState('300');
  const [ringBuffer, setRingBuffer] = useState('1000');
  const [gatewayUrl, setGatewayUrl] = useState('https://gateway.osterdops.com/v1');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);

  // Guardrail Policy toggles
  const [hardCutoff, setHardCutoff] = useState(true);
  const [warningThreshold, setWarningThreshold] = useState('80');
  const [rateLimitRpm, setRateLimitRpm] = useState('60');

  const applyConfig = (c: DaemonConfigData) => {
    setConfig(c);
    setBudgetUsd(c.sessionBudgetUsd.toFixed(2));
    setRollingWindow(String(c.rollingWindowSeconds));
    setRingBuffer(String(c.ringBufferSize));
    setGatewayUrl(c.upstreamGatewayUrl || 'https://gateway.osterdops.com/v1');
    setHardCutoff(c.hardCutoff !== undefined ? c.hardCutoff : true);
    setWarningThreshold(String(c.warningThresholdPct ?? 80));
    setRateLimitRpm(String(c.rateLimitRpm ?? 60));
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.config) {
          applyConfig(json.config as DaemonConfigData);
          return;
        }
      }
      applyConfig(DEFAULT_CONFIG_DATA);
    } catch (err) {
      console.warn('Failed to load daemon configuration:', err);
      applyConfig(DEFAULT_CONFIG_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const payload: Record<string, unknown> = {
      sessionBudgetUsd: parseFloat(budgetUsd) || 5.0,
      rollingWindowSeconds: parseInt(rollingWindow, 10) || 300,
      ringBufferSize: parseInt(ringBuffer, 10) || 1000,
      upstreamGatewayUrl: gatewayUrl.trim(),
      hardCutoff,
      warningThresholdPct: parseInt(warningThreshold, 10) || 80,
      rateLimitRpm: parseInt(rateLimitRpm, 10) || 60,
    };

    if (anthropicKey.trim()) {
      payload.anthropicApiKey = anthropicKey.trim();
    }
    if (openaiKey.trim()) {
      payload.openaiApiKey = openaiKey.trim();
    }

    try {
      const res = await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      });
      if (res.ok) {
        setSaveSuccess(true);
        setAnthropicKey('');
        setOpenaiKey('');
        await fetchConfig();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !config) {
    return (
      <div className="p-12 text-center space-y-3 font-sans">
        <RefreshCw className="w-6 h-6 text-emerald-800 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-charcoal-600">
          Loading daemon runtime parameters...
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'guardrails', label: 'Guardrails & Budgets', icon: Shield },
    { id: 'proxy', label: 'Proxy & Network', icon: Server },
    { id: 'keys', label: 'BYOK Provider Keys', icon: KeyRound },
    { id: 'telemetry', label: 'Storage & Telemetry', icon: HardDrive },
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans max-w-[1200px] mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900">
              Daemon Settings
            </h1>
            <span className="text-[10px] font-mono uppercase bg-[#E5F2EB] text-[#0C2419] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              ~/.osterdops/config.json
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Configure local proxy ports, hard spend cutoffs, upstream model keys, and buffer capacity.
          </p>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center gap-3 shrink-0">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1 bg-[#E5F2EB] px-3 py-1.5 rounded-xl animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Saved to disk</span>
            </span>
          )}
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0C2419] hover:bg-[#143B2A] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* 2. Settings Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#EAE4D8]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white text-charcoal-900 border border-[#EAE4D8] shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-white/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-emerald-800' : 'text-charcoal-400'
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      {/* ========================================================== */}
      {/* TAB 1: GUARDRAILS & BUDGETS                                */}
      {/* ========================================================== */}
      {activeTab === 'guardrails' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#EAE4D8] rounded-2xl p-6 shadow-subtle space-y-6">
            <div className="border-b border-[#F2EDE4] pb-4">
              <h3 className="text-sm font-bold text-charcoal-900">
                Session Spend Limit & Circuit Breakers
              </h3>
              <p className="text-[11px] text-charcoal-500 mt-0.5">
                Automatically halt runaway agent loops when token burn crosses developer budget caps.
              </p>
            </div>

            {/* Session Budget Input */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-charcoal-800">
                Session Spending Ceiling ($ USD)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-48">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-charcoal-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={budgetUsd}
                    onChange={(e) => setBudgetUsd(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl pl-8 pr-3.5 py-2 text-xs font-mono font-bold text-charcoal-900 focus:outline-none focus:border-[#0C2419] focus:bg-white shadow-2xs"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5">
                  {['2.00', '5.00', '10.00', '25.00', '50.00'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setBudgetUsd(val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                        budgetUsd === val
                          ? 'bg-[#0C2419] text-white border-[#0C2419] shadow-2xs'
                          : 'bg-[#FAF8F5] border-[#EAE4D8] text-charcoal-700 hover:bg-white'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-charcoal-500">
                Current active ceiling: <strong className="text-emerald-900 font-mono">${budgetUsd} USD</strong>. Requests will evaluate against this before proxying to OpenAI/Anthropic.
              </p>
            </div>

            {/* Circuit Breaker Cutoff Policy */}
            <div className="space-y-3 pt-4 border-t border-[#F2EDE4]">
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8]">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-charcoal-900">
                    Hard Circuit Breaker (Strict HTTP 429 Rejection)
                  </div>
                  <div className="text-[11px] text-charcoal-500 leading-relaxed max-w-xl">
                    When enabled, the proxy immediately rejects subsequent AI requests with <code>429 OVER_BUDGET_GUARDRAIL</code> as soon as recorded spend hits 100% of the ceiling.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHardCutoff(!hardCutoff)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    hardCutoff ? 'bg-[#0C2419]' : 'bg-charcoal-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      hardCutoff ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Warning Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-2">
                  <label className="block text-xs font-semibold text-charcoal-800">
                    Warning Alert Threshold (% of budget)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="10"
                      max="95"
                      value={warningThreshold}
                      onChange={(e) => setWarningThreshold(e.target.value)}
                      className="w-24 bg-white border border-[#EAE4D8] rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-charcoal-900 focus:outline-none"
                    />
                    <span className="text-xs text-charcoal-500 font-mono">%</span>
                  </div>
                  <p className="text-[10.5px] text-charcoal-400">
                    Triggers a high-priority SSE alert in terminal UI when budget crosses {warningThreshold}%.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-2">
                  <label className="block text-xs font-semibold text-charcoal-800">
                    Max Requests Per Minute (RPM Cap)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="10"
                      max="600"
                      value={rateLimitRpm}
                      onChange={(e) => setRateLimitRpm(e.target.value)}
                      className="w-24 bg-white border border-[#EAE4D8] rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-charcoal-900 focus:outline-none"
                    />
                    <span className="text-xs text-charcoal-500 font-mono">RPM</span>
                  </div>
                  <p className="text-[10.5px] text-charcoal-400">
                    Prevents rogue infinite prompt loops from exhausting provider account credits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: PROXY & NETWORK                                     */}
      {/* ========================================================== */}
      {activeTab === 'proxy' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#EAE4D8] rounded-2xl p-6 shadow-subtle space-y-6">
            <div className="border-b border-[#F2EDE4] pb-4">
              <h3 className="text-sm font-bold text-charcoal-900">
                Network Ingress & Proxy Ports
              </h3>
              <p className="text-[11px] text-charcoal-500 mt-0.5">
                Local loopback ports for client AI SDKs (Cursor, Claude Code, Cline, Python SDK).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-1.5">
                <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Proxy Port</span>
                <span className="text-lg font-bold font-mono text-charcoal-900 block">
                  :{config.proxyPort}
                </span>
                <span className="text-[10.5px] text-charcoal-500 block">
                  Point AI SDK base_url to <code>http://127.0.0.1:{config.proxyPort}/v1</code>
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-1.5">
                <span className="text-[10px] font-mono text-charcoal-500 uppercase block">UI Dashboard Port</span>
                <span className="text-lg font-bold font-mono text-charcoal-900 block">
                  :{config.uiPort}
                </span>
                <span className="text-[10.5px] text-charcoal-500 block">
                  Local browser dashboard active at <code>http://127.0.0.1:{config.uiPort}</code>
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-1.5">
                <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Bind Host</span>
                <span className="text-lg font-bold font-mono text-emerald-800 block">
                  {config.bindHost} (Loopback)
                </span>
                <span className="text-[10.5px] text-charcoal-500 block">
                  Restricted to local device only. Zero LAN exposure.
                </span>
              </div>
            </div>

            {/* Upstream Cloud Gateway URL */}
            <div className="space-y-2 pt-4 border-t border-[#F2EDE4]">
              <label className="block text-xs font-semibold text-charcoal-800">
                Upstream Cloud Gateway URL
              </label>
              <input
                type="text"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                placeholder="https://gateway.osterdops.com/v1"
                className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-3.5 py-2 text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#0C2419] focus:bg-white shadow-2xs font-sans"
              />
              <p className="text-[10.5px] text-charcoal-400">
                The centralized OsterdOps Edge Gateway endpoint used for token optimization and team sync.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 3: BYOK PROVIDER KEYS                                  */}
      {/* ========================================================== */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#EAE4D8] rounded-2xl p-6 shadow-subtle space-y-6">
            <div className="border-b border-[#F2EDE4] pb-4">
              <h3 className="text-sm font-bold text-charcoal-900">
                Bring Your Own Key (BYOK) Providers
              </h3>
              <p className="text-[11px] text-charcoal-500 mt-0.5">
                Direct model upstream keys stored locally in <code>~/.osterdops/config.json</code>.
              </p>
            </div>

            {/* Anthropic Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-charcoal-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span>Anthropic API Key (Claude 3.7 Sonnet, Claude 3.5 Haiku)</span>
                </label>
                {config.hasAnthropicKey && (
                  <span className="text-[10.5px] font-mono text-emerald-800 bg-[#E5F2EB] px-2 py-0.5 rounded font-semibold">
                    Configured ({config.maskedAnthropicKey})
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showAnthropicKey ? 'text' : 'password'}
                  placeholder={config.hasAnthropicKey ? 'Enter new key to update...' : 'sk-ant-api03-...'}
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl pl-3.5 pr-10 py-2 text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#0C2419] focus:bg-white shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
                >
                  {showAnthropicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* OpenAI Key */}
            <div className="space-y-2 pt-4 border-t border-[#F2EDE4]">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-charcoal-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>OpenAI API Key (GPT-4o, o1-preview)</span>
                </label>
                {config.hasOpenaiKey && (
                  <span className="text-[10.5px] font-mono text-emerald-800 bg-[#E5F2EB] px-2 py-0.5 rounded font-semibold">
                    Configured ({config.maskedOpenaiKey})
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showOpenaiKey ? 'text' : 'password'}
                  placeholder={config.hasOpenaiKey ? 'Enter new key to update...' : 'sk-proj-...'}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl pl-3.5 pr-10 py-2 text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#0C2419] focus:bg-white shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
                >
                  {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 4: STORAGE & TELEMETRY                                 */}
      {/* ========================================================== */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#EAE4D8] rounded-2xl p-6 shadow-subtle space-y-6">
            <div className="border-b border-[#F2EDE4] pb-4">
              <h3 className="text-sm font-bold text-charcoal-900">
                SQLite WAL & In-Memory Ring Buffer
              </h3>
              <p className="text-[11px] text-charcoal-500 mt-0.5">
                Local high-performance cache and durable telemetry storage settings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-2">
                <label className="block text-xs font-semibold text-charcoal-800">
                  Ring Buffer Size (In-Memory Capacity)
                </label>
                <input
                  type="number"
                  min="200"
                  max="10000"
                  step="100"
                  value={ringBuffer}
                  onChange={(e) => setRingBuffer(e.target.value)}
                  className="w-full bg-white border border-[#EAE4D8] rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-charcoal-900 focus:outline-none"
                />
                <p className="text-[10.5px] text-charcoal-400">
                  Total traces kept in ultra-fast zero-allocation memory for instant SSE stream replay.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-2">
                <label className="block text-xs font-semibold text-charcoal-800">
                  Rolling Velocity Window (Seconds)
                </label>
                <input
                  type="number"
                  min="60"
                  max="3600"
                  step="30"
                  value={rollingWindow}
                  onChange={(e) => setRollingWindow(e.target.value)}
                  className="w-full bg-white border border-[#EAE4D8] rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-charcoal-900 focus:outline-none"
                />
                <p className="text-[10.5px] text-charcoal-400">
                  Window for calculating real-time Tokens/Min (TPM) and Requests/Min (RPM).
                </p>
              </div>
            </div>

            {/* Storage Path */}
            <div className="space-y-2 pt-4 border-t border-[#F2EDE4] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-500 font-medium">SQLite WAL Database Path:</span>
                <span className="font-mono text-charcoal-800 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EAE4D8]">
                  {config.dbPath}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
