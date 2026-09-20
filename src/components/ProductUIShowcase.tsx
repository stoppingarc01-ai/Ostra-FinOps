import React, { useState } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Lock, 
  Workflow, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  Clock, 
  FileCode, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';

export const ProductUIShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'firewall' | 'security' | 'router'>('telemetry');

  // Interactive controls state within the UI preview (visual, realistic UI)
  const [hardLimit, setHardLimit] = useState<number>(25);
  const [circuitBreakerActive, setCircuitBreakerActive] = useState<boolean>(true);
  const [piiScrubbing, setPiiScrubbing] = useState<boolean>(true);

  return (
    <section id="ui-showcase" className="relative py-24 bg-[#FAF8F5] border-t border-[#EAE5DB] overflow-hidden">
      {/* 3D Background Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-ostraGold-500/10 via-sandstone-300/20 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sandstone-200 border border-sandstone-300/80 text-[11px] font-bold tracking-[0.16em] text-charcoal-700 uppercase font-mono mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>OPERATIONAL CONSOLE UI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-charcoal-900 tracking-[-0.02em] font-display">
            Built For Developers Who Need Real Visibility.{' '}
            <span className="gold-gradient-text block">Inspect Every Agent Loop in Real-Time.</span>
          </h2>
          <p className="mt-4 text-base text-charcoal-600 leading-relaxed max-w-2xl mx-auto">
            Explore the exact interface powering enterprise AI engineering teams and high-velocity solo developers alike.
          </p>
        </div>

        {/* Tab Navigation Bar with 3D Depth */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          {[
            { id: 'telemetry', label: 'Token Velocity & Latency Telemetry', icon: Activity },
            { id: 'firewall', label: 'Financial Gateway & Circuit Breakers', icon: ShieldAlert },
            { id: 'security', label: 'PII Redactor & Prompt Guard', icon: Lock },
            { id: 'router', label: 'Intra-Family Model Router Matrix', icon: Workflow },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-charcoal-900 text-white shadow-md -translate-y-0.5'
                    : 'bg-white text-charcoal-600 hover:text-charcoal-900 hover:bg-sandstone-100 border border-[#EAE5DB] shadow-2xs'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-ostraGold-400' : 'text-charcoal-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* The 3D UI Window Container */}
        <div className="relative rounded-3xl bg-white border border-[#EAE5DB] shadow-dashboard-3d overflow-hidden">
          
          {/* Top Window Chrome Header */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#EFEBE3] bg-[#FAF8F5]/80">
            <div className="flex items-center gap-3">
              {/* macOS style dots */}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400/80 border border-rose-500/40" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80 border border-amber-500/40" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80 border border-emerald-500/40" />
              </div>
              <div className="h-4 w-px bg-sandstone-300 mx-1 hidden sm:block" />
              <span className="text-xs font-mono font-bold text-charcoal-700 hidden sm:inline-block">
                ostraops-daemon v2.4.1 // loopback-ui:4040
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-charcoal-500 hidden md:inline-block">
                SQLite: ~/.ostraops/traces.db
              </span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* TAB 1: REAL-TIME TOKEN TELEMETRY & STREAM ODOMETER           */}
          {/* ============================================================ */}
          {activeTab === 'telemetry' && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Metrics Summary Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DB]">
                  <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500">
                    <span>Live Token Velocity</span>
                    <Activity className="w-4 h-4 text-ostraGold-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-charcoal-900 font-mono mt-1">
                    4,120 <span className="text-xs font-sans font-normal text-charcoal-500">tok/sec</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 font-mono mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Active stream: Cursor IDE (Agent #4)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DB]">
                  <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500">
                    <span>Today's Total Spend</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-charcoal-900 font-mono mt-1">
                    $8.42 <span className="text-xs font-sans font-normal text-charcoal-500">/ $25.00 limit</span>
                  </div>
                  <div className="w-full bg-sandstone-300 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-ostraGold-500 h-full rounded-full w-[33%]" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DB]">
                  <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500">
                    <span>Avg Proxy Overhead</span>
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">
                    0.38 ms
                  </div>
                  <div className="text-[11px] text-charcoal-500 font-mono mt-1">
                    Zero TTFT buffering delay
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DB]">
                  <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500">
                    <span>Runaway Loops Blocked</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-charcoal-900 font-mono mt-1">
                    3 Invocations
                  </div>
                  <div className="text-[11px] text-emerald-600 font-mono mt-1">
                    Saved ~$38.20 in runaway API charges
                  </div>
                </div>
              </div>

              {/* Live Traces Table */}
              <div className="border border-[#EAE5DB] rounded-2xl overflow-hidden bg-white">
                <div className="px-5 py-3.5 bg-[#FAF8F5] border-b border-[#EAE5DB] flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal-900 font-mono uppercase tracking-wider">
                    Recent Agentic Dispatches (Intercepted via Port 8080)
                  </span>
                  <span className="text-[11px] text-charcoal-500 font-mono">
                    Auto-refresh: 1s • Local SQLite
                  </span>
                </div>

                <div className="divide-y divide-[#EFEBE3] text-xs font-mono">
                  {[
                    {
                      time: '18:42:09',
                      agent: 'Cursor IDE',
                      model: 'claude-3-7-sonnet',
                      provider: 'Anthropic',
                      inputTok: '48,210',
                      outputTok: '1,420',
                      cost: '$0.165',
                      latency: '312ms',
                      status: 'Stream 200 OK',
                      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                    },
                    {
                      time: '18:41:45',
                      agent: 'Cline Extension',
                      model: 'gpt-4o',
                      provider: 'OpenAI',
                      inputTok: '18,500',
                      outputTok: '890',
                      cost: '$0.055',
                      latency: '240ms',
                      status: 'Stream 200 OK',
                      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                    },
                    {
                      time: '18:40:12',
                      agent: 'Antigravity IDE',
                      model: 'gemini-2.5-pro',
                      provider: 'Google',
                      inputTok: '124,000',
                      outputTok: '3,200',
                      cost: '$0.171',
                      latency: '190ms',
                      status: 'Stream 200 OK',
                      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                    },
                    {
                      time: '18:38:50',
                      agent: 'Aider CLI',
                      model: 'claude-3-5-haiku',
                      provider: 'Anthropic (Failover)',
                      inputTok: '32,100',
                      outputTok: '450',
                      cost: '$0.034',
                      latency: '145ms',
                      status: 'Failover Handled',
                      statusColor: 'text-amber-800 bg-amber-50 border-amber-200',
                    },
                  ].map((row, i) => (
                    <div key={i} className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-[#FAF8F5]/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-charcoal-400">{row.time}</span>
                        <span className="font-bold text-charcoal-900">{row.agent}</span>
                        <span className="text-charcoal-600 bg-sandstone-200 px-2 py-0.5 rounded text-[11px]">
                          {row.model}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px]">
                        <span className="text-charcoal-500">In: {row.inputTok}</span>
                        <span className="text-charcoal-500">Out: {row.outputTok}</span>
                        <span className="text-charcoal-900 font-bold">{row.cost}</span>
                        <span className="text-charcoal-500">{row.latency}</span>
                        <span className={`px-2 py-0.5 rounded border ${row.statusColor} font-bold text-[10px]`}>
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: FINANCIAL GATEWAY & CIRCUIT BREAKERS                 */}
          {/* ============================================================ */}
          {activeTab === 'firewall' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left: Interactive Limits Control (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DB] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-charcoal-900">Daily Financial Hard Cap</h4>
                        <p className="text-xs text-charcoal-500">
                          Automated 429 injection when cumulative daily API bills cross this threshold.
                        </p>
                      </div>
                      <span className="text-lg font-mono font-extrabold text-charcoal-900 bg-white px-3 py-1 rounded-xl border border-sandstone-300">
                        ${hardLimit}.00/day
                      </span>
                    </div>

                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={hardLimit}
                      onChange={(e) => setHardLimit(Number(e.target.value))}
                      className="w-full accent-ostraGold-500 cursor-pointer"
                    />

                    <div className="flex justify-between text-[11px] font-mono text-charcoal-400">
                      <span>$5.00 (Minimalist Solo)</span>
                      <span>$25.00 (Standard Dev)</span>
                      <span>$100.00 (Heavy Agent Farm)</span>
                    </div>
                  </div>

                  {/* Velocity Circuit Breaker Toggle */}
                  <div className="p-5 rounded-2xl bg-white border border-[#EAE5DB] flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-ostraGold-600" />
                        <h4 className="text-sm font-bold text-charcoal-900">Runaway Loop Velocity Brake</h4>
                      </div>
                      <p className="text-xs text-charcoal-500">
                        Auto-pauses agents if spend rate accelerates beyond $3.00/minute over a 3-minute rolling window.
                      </p>
                    </div>

                    <button
                      onClick={() => setCircuitBreakerActive(!circuitBreakerActive)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        circuitBreakerActive ? 'bg-emerald-600' : 'bg-charcoal-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          circuitBreakerActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Intra-Family Auto-Failover rule */}
                  <div className="p-5 rounded-2xl bg-white border border-[#EAE5DB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-charcoal-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Intra-Family Fallback: Claude 3.7 Sonnet → Claude 3.5 Haiku</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sandstone-200 text-charcoal-700">
                        Zero Tool Schema Errors
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-500">
                      When Anthropic responds with HTTP 429 / 529 overload, OstraOps automatically downgrades to Claude 3.5 Haiku instead of breaking Cursor's file-editing tool schemas.
                    </p>
                  </div>
                </div>

                {/* Right: Real-time Financial Meter (5 cols) */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-charcoal-950 text-white border border-charcoal-800 shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
                    <span className="text-xs font-bold font-mono text-zinc-300">CIRCUIT STATUS: ARMED</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                      SECURE
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-zinc-400 font-mono">PROJECTED MONTHLY SAVINGS</span>
                    <div className="text-3xl font-extrabold text-ostraGold-300 font-mono">
                      $412.80
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Based on 4 intercepted runaway tool loops and prompt cache hits this billing cycle.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-zinc-400">
                      <span>Sliding Window:</span>
                      <span className="text-zinc-200">180 seconds</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Burn Rate:</span>
                      <span className="text-emerald-400">$0.04 / minute</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Velocity Cap:</span>
                      <span className="text-zinc-200">$3.00 / minute</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Emergency Kill Switch:</span>
                      <span className="text-emerald-400">Standby (0 trips)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: PROMPT SECURITY & PII REDACTOR                        */}
          {/* ============================================================ */}
          {activeTab === 'security' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left: Real-time Payload Inspection Diff (8 cols) */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-900 font-mono flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-ostraGold-600" />
                      <span>INCOMING PROMPT PAYLOAD (CURSOR AGENT → LOOPBACK 8080)</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPiiScrubbing(!piiScrubbing)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          piiScrubbing
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                            : 'text-charcoal-500 bg-sandstone-200 border-sandstone-300'
                        }`}
                      >
                        {piiScrubbing ? 'Scrubbing: ACTIVE (0.18ms)' : 'Scrubbing: BYPASS'}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-charcoal-950 text-zinc-200 font-mono text-xs border border-charcoal-800 space-y-2 leading-relaxed overflow-x-auto">
                    <p className="text-zinc-500">// Inbound prompt snippet from agent workspace:</p>
                    <p>
                      <span className="text-zinc-400">User Prompt:</span> "Debug the payment webhook connecting to{' '}
                      <span className="bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/40">
                        10.14.88.22:5432
                      </span>{' '}
                      with credentials{' '}
                      <span className="bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/40">
                        sk-live-94a8e2b8109f...
                      </span>"
                    </p>
                    
                    <div className="my-2 border-t border-charcoal-800 pt-2 text-emerald-400 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>OstraOps Sanitized Stream sent to Upstream LLM:</span>
                    </div>

                    <p>
                      <span className="text-zinc-400">Dispatched:</span> "Debug the payment webhook connecting to{' '}
                      <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                        [INTERNAL_IP_MASK_01]
                      </span>{' '}
                      with credentials{' '}
                      <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                        [SECRET_KEY_REDACTED_01]
                      </span>"
                    </p>
                  </div>

                  <p className="text-xs text-charcoal-500">
                    OstraOps replaces high-entropy secrets and sensitive environment variables before any byte reaches the model provider, re-hydrating tokens in the return completion automatically.
                  </p>
                </div>

                {/* Right: Active Scanners (4 cols) */}
                <div className="lg:col-span-4 p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DB] space-y-4">
                  <h4 className="text-xs font-bold text-charcoal-900 font-mono uppercase tracking-wider">
                    Zero-Egress Scanners Active
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    {[
                      { name: 'API Keys & JWT Tokens', status: 'Active (Regex & Entropy)', hitCount: '14 scrubbed' },
                      { name: 'Private IP & DNS Subnets', status: 'Active (RFC1918)', hitCount: '32 masked' },
                      { name: 'Email & PII Identifiers', status: 'Active (Named Entity)', hitCount: '8 scrubbed' },
                      { name: 'Prompt Injection Jailbreaks', status: 'Active (Heuristic)', hitCount: '0 detected' },
                    ].map((item, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-[#EAE5DB] flex flex-col gap-1">
                        <div className="flex items-center justify-between font-bold text-charcoal-900">
                          <span>{item.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="flex justify-between text-[11px] text-charcoal-500 font-mono">
                          <span>{item.status}</span>
                          <span className="text-ostraGold-600 font-bold">{item.hitCount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: INTRA-FAMILY MODEL ROUTER MATRIX                      */}
          {/* ============================================================ */}
          {activeTab === 'router' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="border border-[#EAE5DB] rounded-2xl overflow-hidden bg-white">
                <div className="px-5 py-3.5 bg-[#FAF8F5] border-b border-[#EAE5DB] flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal-900 font-mono uppercase tracking-wider">
                    Deterministic Provider Cascades (Zero Cross-Vendor Corruption)
                  </span>
                  <span className="text-[11px] text-charcoal-500 font-mono">
                    Enforces Rule 2: Keep Same Architecture Family
                  </span>
                </div>

                <div className="divide-y divide-[#EFEBE3] text-xs font-mono">
                  {[
                    {
                      family: 'Anthropic Claude Family',
                      primary: 'Claude 3.7 Sonnet',
                      fallback1: 'Claude 3.5 Sonnet',
                      fallback2: 'Claude 3.5 Haiku',
                      toolFidelity: '100% Native tool_use blocks preserved',
                      crossVendorRisk: '0.00% (Strictly within Anthropic API spec)',
                    },
                    {
                      family: 'OpenAI GPT Family',
                      primary: 'GPT-4o (Frontier)',
                      fallback1: 'o3-mini (Reasoning)',
                      fallback2: 'GPT-4o-mini (Fallback)',
                      toolFidelity: '100% function_call JSON schema matching',
                      crossVendorRisk: '0.00% (Strictly within OpenAI API spec)',
                    },
                    {
                      family: 'Google Gemini Family',
                      primary: 'Gemini 2.5 Pro',
                      fallback1: 'Gemini 2.5 Flash',
                      fallback2: 'Gemini 1.5 Pro',
                      toolFidelity: 'Function declarations & 2M context sustained',
                      crossVendorRisk: '0.00% (Strictly within Google DeepMind spec)',
                    },
                    {
                      family: 'DeepSeek Family',
                      primary: 'DeepSeek-R1',
                      fallback1: 'DeepSeek-V3',
                      fallback2: 'Local VLLM DeepSeek 67B',
                      toolFidelity: 'Thought trace & reasoning stream preserved',
                      crossVendorRisk: '0.00% (Zero cross-vendor payload jitter)',
                    },
                  ].map((row, idx) => (
                    <div key={idx} className="p-5 space-y-3 hover:bg-[#FAF8F5]/40 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-sm text-charcoal-900 font-sans">
                          {row.family}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          {row.crossVendorRisk}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-sandstone-50 border border-sandstone-300">
                          <span className="text-[10px] text-charcoal-500 uppercase block font-bold">Primary Target</span>
                          <span className="text-xs font-bold text-charcoal-900 mt-0.5 block">{row.primary}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-sandstone-50 border border-sandstone-300">
                          <span className="text-[10px] text-charcoal-500 uppercase block font-bold">Tier 1 Failover</span>
                          <span className="text-xs font-bold text-charcoal-900 mt-0.5 block">{row.fallback1}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-sandstone-50 border border-sandstone-300">
                          <span className="text-[10px] text-charcoal-500 uppercase block font-bold">Emergency Circuit</span>
                          <span className="text-xs font-bold text-charcoal-900 mt-0.5 block">{row.fallback2}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-charcoal-600 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{row.toolFidelity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
