import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  EyeOff, 
  Scale, 
  Lock, 
  Code2, 
  AlertTriangle,
  Globe2,
  HardDrive
} from 'lucide-react';

interface AboutUsPageProps {
  onNavigateHome?: () => void;
  onNavigatePricing?: () => void;
  onNavigateModels?: () => void;
  onNavigateSoloGuard?: () => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({
  onNavigateHome,
  onNavigatePricing,
  onNavigateModels,
  onNavigateSoloGuard,
}) => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeDogma, setActiveDogma] = useState<number>(0);
  const [simState, setSimState] = useState<'idle' | 'running' | 'blocked' | 'verified'>('idle');
  const [simLog, setSimLog] = useState<string[]>([
    'Daemon initialized on loopback 127.0.0.1:8080',
    'SQLite ledger mounted: ~/.ostraops/traces.db',
    'Hardware key vault: macOS Keychain / Windows DPAPI synced',
    'Status: Ready for agentic connections (Cursor, Cline, Windsurf, Aider)'
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('npx ostraops-guard');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const runSimulation = (type: 'burst' | 'budget' | 'privacy') => {
    if (type === 'burst') {
      setSimState('running');
      setSimLog(prev => [
        `[${new Date().toLocaleTimeString()}] [BURST] Cursor spawning 12 concurrent sub-agent reasoning loops...`,
        `[${new Date().toLocaleTimeString()}] [TOKEN_GUARD] Rate limiter throttled 4 requests, maintaining 30k TPM quota`,
        `[${new Date().toLocaleTimeString()}] [ROUTING] Latency: 1.2ms loopback overhead. Zero packet drops.`,
        ...prev.slice(0, 5)
      ]);
    } else if (type === 'budget') {
      setSimState('blocked');
      setSimLog(prev => [
        `[${new Date().toLocaleTimeString()}] [ALERT] Agent loop attempted $15.20 expenditure against $10.00 daily budget!`,
        `[${new Date().toLocaleTimeString()}] [CIRCUIT_BREAKER] Hard socket drop activated immediately. HTTP 429 triggered.`,
        `[${new Date().toLocaleTimeString()}] [PROTECTED] Account credit saved. $0 overspend prevented.`,
        ...prev.slice(0, 5)
      ]);
    } else {
      setSimState('verified');
      setSimLog(prev => [
        `[${new Date().toLocaleTimeString()}] [AUDIT] Inspecting outbound TCP telemetry packets...`,
        `[${new Date().toLocaleTimeString()}] [AIR_GAP] Code prompts routed strictly to direct LLM provider SSL socket.`,
        `[${new Date().toLocaleTimeString()}] [ZERO_RETENTION] 0 bytes sent to 3rd party or OstraOps servers.`,
        `[${new Date().toLocaleTimeString()}] [AUDIT] 100% verified private and sovereign.`,
        ...prev.slice(0, 5)
      ]);
    }
  };

  const dogmas = [
    {
      title: 'Local-First Above All',
      tagline: 'Your code and secrets never touch our cloud.',
      desc: 'Most "gateways" require you to route your most sensitive source code and API keys through their remote servers. We fundamentally reject that. OstraOps runs as an ultra-lightweight daemon directly on your development machine (127.0.0.1:8080). Your private intellectual property stays completely inside your trusted network boundary.',
      icon: HardDrive,
      bullet1: 'Native OS keychain integration (DPAPI / Keychain / Secret Service)',
      bullet2: 'No cloud storage of prompts or AST semantic trees',
      bullet3: 'Offline-ready with support for local models (Ollama, vLLM, LMStudio)'
    },
    {
      title: 'Deterministic Financial Circuit Breakers',
      tagline: 'Millisecond hard-stops, not "next-morning" billing alerts.',
      desc: 'When an autonomous agent enters a hallucinated infinite recursion loop, standard SaaS alerts arrive hours after your credit card has already been drained. OstraOps intercepts raw HTTP streams and cuts socket connections the microsecond a budget ceiling or token burst threshold is breached.',
      icon: Zap,
      bullet1: 'Pre-flight token estimation before external dispatch',
      bullet2: 'Synchronous HTTP 429 injection that halts the agent gracefully',
      bullet3: 'Per-agent, per-project, and per-hour granular quota ceilings'
    },
    {
      title: 'Zero-Telemetry Sovereignty',
      tagline: 'Traces stored in your local SQLite. Owned by you.',
      desc: 'Observability should empower engineers, not surveillance vendors. All conversation spans, model timings, token distributions, and financial metrics are indexed into an embedded SQLite database (~/.ostraops/traces.db) on your local drive. You can query it with standard SQL, dump it to parquet, or wipe it with a single rm command.',
      icon: EyeOff,
      bullet1: 'Embedded local SQLite engine with zero network phone-home',
      bullet2: 'Open SQL schema ready for custom analytics scripts',
      bullet3: 'Instant one-click cryptographic sanitization'
    },
    {
      title: 'Intra-Family Failover',
      tagline: 'Zero cross-vendor prompt and schema degradation.',
      desc: 'Generic proxies indiscriminately fallback Claude 3.7 Sonnet onto GPT-4o when rate limits hit. This silently corrupts tool-calling schemas, XML markers, and agent instructions. OstraOps enforces intra-lineage failover—degrading only to compatible sibling models (e.g. Claude 3.7 -> Claude 3.5 Sonnet) to guarantee zero syntax hallucination.',
      icon: Scale,
      bullet1: 'Preserves custom XML prompts and tool JSON schemas',
      bullet2: 'Lineage-aware model matching across Anthropic, OpenAI & Gemini',
      bullet3: 'Prevents agent crashes caused by unexpected API schema differences'
    },
    {
      title: 'Sub-2ms Invisible Latency',
      tagline: 'High-speed loopback written for interactive flow.',
      desc: 'Autonomous coding agents feel sluggish when proxy overhead accumulates across hundreds of recursive tool invocations. The OstraOps loopback engine is tuned for instant stream passthrough, adding less than 1.4ms of overhead to raw LLM provider roundtrips.',
      icon: Activity,
      bullet1: 'Zero-copy stream piping directly between agent and LLM provider',
      bullet2: 'Non-blocking async telemetry worker thread pool',
      bullet3: 'Consumes less than 35MB of RAM during peak multi-agent bursts'
    }
  ];

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-10 max-w-[1540px] mx-auto relative overflow-hidden select-none">
      {/* 3D Warm Ambient Radial Glow Background */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-ostraGold-400/15 via-sandstone-300/20 to-transparent blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-96 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-amber-200/10 via-ostraGold-300/5 to-transparent blur-[130px] pointer-events-none -z-10" />

      {/* Top Breadcrumbs / Quick Navigation Bar */}
      <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-sandstone-100 text-charcoal-700 hover:text-charcoal-900 border border-[#EAE5DB] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {onNavigateModels && (
            <button
              onClick={onNavigateModels}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-sandstone-100 text-charcoal-700 border border-[#EAE5DB] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-ostraGold-600" />
              <span>Models Catalog</span>
            </button>
          )}
          {onNavigateSoloGuard && (
            <button
              onClick={onNavigateSoloGuard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-sandstone-100 text-charcoal-700 border border-[#EAE5DB] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-charcoal-700" />
              <span>Solo Guard</span>
            </button>
          )}
          {onNavigatePricing && (
            <button
              onClick={onNavigatePricing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold font-mono transition-colors shadow-xs cursor-pointer"
            >
              <span>View Pricing</span>
              <ArrowRight className="w-3.5 h-3.5 text-ostraGold-400" />
            </button>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6 mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sandstone-200/90 border border-sandstone-300/90 text-[11px] font-bold tracking-[0.15em] text-charcoal-700 uppercase font-mono shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-ostraGold-500 animate-ping" />
          <span>WHO WE ARE • OUR STORY & MISSION</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-charcoal-900 font-display leading-[1.12]">
          Securing the Agentic Era with{' '}
          <span className="gold-gradient-text">Deterministic Guardrails.</span>
        </h1>

        <p className="text-base sm:text-lg text-charcoal-600 leading-relaxed max-w-3xl mx-auto">
          We are a distributed collective of systems engineers, security researchers, and developer tooling veterans. We built <strong className="text-charcoal-900 font-semibold">OstraOps</strong> because we fell in love with autonomous coding agents—and immediately grew terrified of their unconstrained access to production credit cards and private codebases.
        </p>

        {/* Quick Command Box */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[#EAE5DB] shadow-2xs font-mono text-xs text-charcoal-800">
            <span className="text-charcoal-400">$</span>
            <span className="font-semibold text-charcoal-900">npx ostraops-guard</span>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-sandstone-100 rounded-md transition-colors text-charcoal-500 hover:text-charcoal-900"
              title="Copy to clipboard"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <span className="text-xs text-charcoal-400 font-mono">Zero config required • 100% Local</span>
        </div>
      </div>

      {/* Key Metric Highlights Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
        <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#EAE5DB] shadow-2xs hover:border-ostraGold-300 transition-colors">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-charcoal-900 mb-1">0 Bytes</div>
          <div className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-mono">Cloud Retention</div>
          <p className="text-[11px] text-charcoal-500 mt-2 leading-relaxed">
            Your proprietary source code stays on localhost. Zero traces sent to remote surveillance servers.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#EAE5DB] shadow-2xs hover:border-ostraGold-300 transition-colors">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-charcoal-900 mb-1">&lt; 1.4ms</div>
          <div className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-mono">Loopback Latency</div>
          <p className="text-[11px] text-charcoal-500 mt-2 leading-relaxed">
            Engineered with zero-copy stream passthrough. Completely imperceptible during multi-agent refactors.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#EAE5DB] shadow-2xs hover:border-ostraGold-300 transition-colors">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-charcoal-900 mb-1">$0.00</div>
          <div className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-mono">Runaway Loops</div>
          <p className="text-[11px] text-charcoal-500 mt-2 leading-relaxed">
            Hardware-enforced socket circuit breakers kill infinite loops at the exact penny threshold.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#EAE5DB] shadow-2xs hover:border-ostraGold-300 transition-colors">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-charcoal-900 mb-1">5+ Engines</div>
          <div className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-mono">Agent Ecosystem</div>
          <p className="text-[11px] text-charcoal-500 mt-2 leading-relaxed">
            Plug-and-play drop-in support for Cursor, Cline, Windsurf, Antigravity, and Aider CLI.
          </p>
        </div>
      </div>

      {/* The Genesis / Origin Story Section */}
      <div className="mb-24">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sandstone-200 border border-sandstone-300 text-[10px] font-bold tracking-wider text-charcoal-700 uppercase font-mono mb-3">
            <span>THE GENESIS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900 font-display">
            The 4:00 AM Incident That Sparked OstraOps
          </h2>
          <p className="text-charcoal-600 text-sm sm:text-base mt-3 leading-relaxed">
            Like tens of thousands of developers in early 2024, our team embraced autonomous AI coding. We paired with agents in Cursor and Cline, watching them scaffold microservices, squash complex bugs, and refactor monolithic codebases in minutes. But then came the breaking point.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Story Card 1 */}
          <div className="p-8 rounded-3xl bg-white border border-[#EAE5DB] shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:shadow-card-3d transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-3xl" />
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-center font-mono font-bold text-sm">
                01
              </div>
              <h3 className="text-lg font-bold text-charcoal-900 font-display">The Infinite Recursion Trap</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                During an overnight automated migration, an agent misparsed a compiler error and went into an unthrottled retry cascade. In less than 4 hours, it dispatched over 1,800 requests to frontier models, racking up over $840 in unbudgeted API fees while the developer was asleep.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-borderLight flex items-center gap-2 text-[11px] font-mono text-red-700 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SaaS alert email arrived 6 hours too late</span>
            </div>
          </div>

          {/* Story Card 2 */}
          <div className="p-8 rounded-3xl bg-white border border-[#EAE5DB] shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:shadow-card-3d transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-3xl" />
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-mono font-bold text-sm">
                02
              </div>
              <h3 className="text-lg font-bold text-charcoal-900 font-display">The Cloud Proxy Illusion</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                We tested commercial LLM gateways. Every single one required piping our entire enterprise codebase context and production API keys through a remote 3rd-party SaaS server. They were trading code confidentiality for basic observability—a deal no responsible engineering team should make.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-borderLight flex items-center gap-2 text-[11px] font-mono text-amber-800 font-semibold">
              <EyeOff className="w-3.5 h-3.5" />
              <span>Unacceptable risk for proprietary IP</span>
            </div>
          </div>

          {/* Story Card 3 */}
          <div className="p-8 rounded-3xl bg-white border border-[#EAE5DB] shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:shadow-card-3d transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-ostraGold-500/10 rounded-bl-3xl" />
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-ostraGold-100 border border-ostraGold-300 text-ostraGold-900 flex items-center justify-center font-mono font-bold text-sm">
                03
              </div>
              <h3 className="text-lg font-bold text-charcoal-900 font-display">The Local Loopback Answer</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                We realized the gateway needed to live on the developer's machine. By running a local loopback proxy (`127.0.0.1:8080`), we could intercept tokens with zero cloud roundtrips, enforce microsecond circuit breakers, and log traces locally to an embedded SQLite database.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-borderLight flex items-center gap-2 text-[11px] font-mono text-ostraGold-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Born: OstraOps Financial Gateway</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Philosophy Section: The 5 Dogmas */}
      <div className="mb-24 bg-white rounded-3xl border border-[#EAE5DB] p-8 sm:p-12 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-[#EAE5DB]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-ostraGold-600 uppercase tracking-wider mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>THE OSTRAOPS MANIFESTO</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900 font-display">
              The 5 Dogmas of Autonomous FinOps
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 max-w-md">
            These architectural decisions are non-negotiable. They define how every single line of OstraOps code is drafted, tested, and shipped.
          </p>
        </div>

        {/* Tabbed Dogmas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          {/* Dogma Navigation Buttons */}
          <div className="lg:col-span-5 space-y-2">
            {dogmas.map((d, idx) => {
              const Icon = d.icon;
              const isActive = activeDogma === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveDogma(idx)}
                  className={`w-full text-left p-4 rounded-2xl transition-all cursor-pointer flex items-center gap-3.5 border ${
                    isActive
                      ? 'bg-charcoal-900 text-white border-charcoal-800 shadow-sm'
                      : 'bg-sandstone-50 hover:bg-sandstone-100 text-charcoal-700 border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-charcoal-800 text-ostraGold-400' : 'bg-white text-charcoal-500 border border-sandstone-200'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{d.title}</div>
                    <div className={`text-[11px] truncate ${isActive ? 'text-charcoal-400' : 'text-charcoal-500'}`}>{d.tagline}</div>
                  </div>
                  <span className={`text-xs font-mono font-bold ${isActive ? 'text-ostraGold-400' : 'text-charcoal-400'}`}>
                    0{idx + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Dogma Details Card */}
          <div className="lg:col-span-7 bg-[#FAF8F5] rounded-2xl p-6 sm:p-8 border border-[#EAE5DB] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-ostraGold-600 uppercase tracking-wider">
                  DOGMA 0{activeDogma + 1} OF 05
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white border border-[#EAE5DB] text-[10px] font-mono text-charcoal-600 font-semibold">
                  CORE SPECIFICATION
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-charcoal-900 font-display">
                {dogmas[activeDogma].title}
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                {dogmas[activeDogma].desc}
              </p>

              <div className="pt-4 space-y-2.5 border-t border-[#EAE5DB]">
                <div className="flex items-start gap-2.5 text-xs text-charcoal-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{dogmas[activeDogma].bullet1}</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-charcoal-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{dogmas[activeDogma].bullet2}</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-charcoal-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{dogmas[activeDogma].bullet3}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EAE5DB] flex items-center justify-between text-[11px] text-charcoal-500 font-mono">
              <span>Local daemon target: loopback:8080</span>
              <span className="text-charcoal-800 font-semibold">Zero-Trust Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Simulator: Experience the Local Loopback */}
      <div className="mb-24">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-ostraGold-600 uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5" />
            <span>INTERACTIVE DEMO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900 font-display">
            Test the Loopback Engine in Real-Time
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500">
            Click the triggers below to see how OstraOps intercepts high-frequency agent requests, prevents runaway loops, and verifies zero-retention privacy.
          </p>
        </div>

        <div className="bg-charcoal-950 rounded-3xl border border-charcoal-800 p-6 sm:p-8 shadow-dashboard-3d text-white font-mono max-w-4xl mx-auto">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs text-charcoal-400 ml-2">ostraops-loopback-daemon :: v1.2.4</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-charcoal-500">STATE:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                simState === 'running' ? 'bg-amber-500/20 text-amber-300' :
                simState === 'blocked' ? 'bg-red-500/20 text-red-300' :
                simState === 'verified' ? 'bg-emerald-500/20 text-emerald-300' :
                'bg-charcoal-800 text-charcoal-400'
              }`}>
                {simState}
              </span>
              <span className="text-charcoal-500 ml-2">PORT:</span>
              <span className="text-ostraGold-400 font-bold">127.0.0.1:8080</span>
            </div>
          </div>

          {/* Interactive Trigger Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
            <button
              onClick={() => runSimulation('burst')}
              className="px-3.5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 border border-charcoal-700 text-xs font-semibold text-charcoal-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Agent Burst</span>
            </button>
            <button
              onClick={() => runSimulation('budget')}
              className="px-3.5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 border border-charcoal-700 text-xs font-semibold text-charcoal-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Simulate Hard Cap Trip</span>
            </button>
            <button
              onClick={() => runSimulation('privacy')}
              className="px-3.5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 border border-charcoal-700 text-xs font-semibold text-charcoal-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit Zero-Retention</span>
            </button>
          </div>

          {/* Terminal Screen */}
          <div className="bg-charcoal-900/90 rounded-2xl p-4 sm:p-5 border border-charcoal-800/80 min-h-[160px] text-xs space-y-2 overflow-x-auto">
            {simLog.map((line, i) => (
              <div
                key={i}
                className={`transition-opacity duration-300 ${
                  line.includes('[ALERT]') || line.includes('[CIRCUIT_BREAKER]')
                    ? 'text-red-400 font-semibold'
                    : line.includes('[BURST]') || line.includes('[TOKEN_GUARD]')
                    ? 'text-amber-300'
                    : line.includes('[AUDIT]') || line.includes('[ZERO_RETENTION]') || line.includes('[AIR_GAP]')
                    ? 'text-emerald-400'
                    : 'text-charcoal-400'
                }`}
              >
                {line}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-charcoal-500 gap-2">
            <span>Runs as background daemon. Launch with: <code className="text-ostraGold-400 font-bold">npx ostraops-guard</code></span>
            <span className="text-charcoal-400">Zero Node.js global dependencies required</span>
          </div>
        </div>
      </div>

      {/* Comparison Matrix: Cloud Proxies vs. OstraOps */}
      <div className="mb-24">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-ostraGold-600 uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>ARCHITECTURAL COMPARISON</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900 font-display">
            Why Legacy Cloud Proxies Fail Autonomous Agents
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-2">
            Traditional AI proxies were designed for slow web apps—not lightning-speed multi-agent loops writing thousands of lines of code per minute.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse bg-white rounded-2xl border border-[#EAE5DB] shadow-2xs text-xs overflow-hidden">
            <thead>
              <tr className="bg-sandstone-100/70 border-b border-[#EAE5DB] text-charcoal-800 font-mono text-[11px] uppercase tracking-wider">
                <th className="p-4 sm:p-5">Capability / Vector</th>
                <th className="p-4 sm:p-5 text-charcoal-500">Legacy Cloud Gateways</th>
                <th className="p-4 sm:p-5 bg-ostraGold-500/10 text-charcoal-900 font-bold">OstraOps Local Gateway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE5DB]">
              <tr className="hover:bg-sandstone-50/50 transition-colors">
                <td className="p-4 sm:p-5 font-semibold text-charcoal-900">Source Code Privacy</td>
                <td className="p-4 sm:p-5 text-charcoal-500">Sent to 3rd-party cloud servers; prompt logs retained in remote databases</td>
                <td className="p-4 sm:p-5 bg-ostraGold-500/5 font-bold text-emerald-800">
                  100% on localhost. Prompts never leave your computer untracked.
                </td>
              </tr>
              <tr className="hover:bg-sandstone-50/50 transition-colors">
                <td className="p-4 sm:p-5 font-semibold text-charcoal-900">API Key Storage</td>
                <td className="p-4 sm:p-5 text-charcoal-500">Uploaded to SaaS database; vulnerable to vendor cloud breaches</td>
                <td className="p-4 sm:p-5 bg-ostraGold-500/5 font-bold text-emerald-800">
                  Encrypted in native OS Keychain / DPAPI. Zero remote transmission.
                </td>
              </tr>
              <tr className="hover:bg-sandstone-50/50 transition-colors">
                <td className="p-4 sm:p-5 font-semibold text-charcoal-900">Overhead Latency</td>
                <td className="p-4 sm:p-5 text-charcoal-500">+80ms to +250ms extra cloud roundtrip penalty per token chunk</td>
                <td className="p-4 sm:p-5 bg-ostraGold-500/5 font-bold text-emerald-800">
                  &lt; 1.4ms local loopback pipe. Completely imperceptible.
                </td>
              </tr>
              <tr className="hover:bg-sandstone-50/50 transition-colors">
                <td className="p-4 sm:p-5 font-semibold text-charcoal-900">Cost Guardrails</td>
                <td className="p-4 sm:p-5 text-charcoal-500">Asynchronous webhooks / emails; alerts trigger minutes after money is spent</td>
                <td className="p-4 sm:p-5 bg-ostraGold-500/5 font-bold text-emerald-800">
                  Synchronous TCP socket termination. Exact penny circuit breaker.
                </td>
              </tr>
              <tr className="hover:bg-sandstone-50/50 transition-colors">
                <td className="p-4 sm:p-5 font-semibold text-charcoal-900">Air-Gapped &amp; Local LLMs</td>
                <td className="p-4 sm:p-5 text-charcoal-500">Fails completely without active public internet connection</td>
                <td className="p-4 sm:p-5 bg-ostraGold-500/5 font-bold text-emerald-800">
                  Full offline support for Ollama, vLLM, LMStudio, and local GPUs.
                </td>
              </tr>
              <tr className="hover:bg-sandstone-50/50 transition-colors">
                <td className="p-4 sm:p-5 font-semibold text-charcoal-900">Telemetry Sovereignty</td>
                <td className="p-4 sm:p-5 text-charcoal-500">Proprietary cloud dashboards; high export fees</td>
                <td className="p-4 sm:p-5 bg-ostraGold-500/5 font-bold text-emerald-800">
                  Embedded SQLite database (~/.ostraops/traces.db). 100% user-owned.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Engineering Culture / Who We Are Collective */}
      <div className="mb-24 bg-white rounded-3xl border border-[#EAE5DB] p-8 sm:p-12 shadow-sm">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-ostraGold-600 uppercase tracking-wider mb-2">
            <Globe2 className="w-3.5 h-3.5" />
            <span>OUR TEAM CULTURE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900 font-display">
            A Collective of Systems Craftsmen
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-2 leading-relaxed">
            We don't believe in vanity metrics or enterprise bloatware. We are compiler enthusiasts, security researchers, and high-frequency backend engineers who build tools we use every single day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DB]">
            <Code2 className="w-6 h-6 text-ostraGold-600 mb-3" />
            <h3 className="text-sm font-bold text-charcoal-900 mb-2">100% Dogfooded</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Every single PR and release of OstraOps is developed using Cursor, Cline, and Antigravity guarded by OstraOps itself. If something feels slow, confusing, or brittle, we feel the pain immediately.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DB]">
            <Lock className="w-6 h-6 text-ostraGold-600 mb-3" />
            <h3 className="text-sm font-bold text-charcoal-900 mb-2">Zero Data Monetization</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Our business model is simple: transparent developer tooling licenses and enterprise team governance. We will never sell, train on, or monetize your prompt data or coding habits.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DB]">
            <Zap className="w-6 h-6 text-ostraGold-600 mb-3" />
            <h3 className="text-sm font-bold text-charcoal-900 mb-2">Extreme Performance Obsession</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              We benchmark every release down to memory allocation counts and microsecond packet traversal. The proxy must remain light, quiet, and reliable under any workload.
            </p>
          </div>
        </div>
      </div>

      {/* Final Call to Action Banner */}
      <div className="relative rounded-3xl bg-charcoal-950 text-white p-8 sm:p-14 border border-charcoal-800 shadow-dashboard-3d overflow-hidden text-center sm:text-left">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-ostraGold-500/20 via-amber-600/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-ostraGold-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>START GUARDING YOUR AGENTS TODAY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Take Control of Your Autonomous Costs &amp; Code Privacy.
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed">
            Run OstraOps locally in less than 30 seconds. No cloud signups required to start protecting your local machine.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <button
              onClick={handleCopy}
              className="px-5 py-3 rounded-xl bg-ostraGold-500 hover:bg-ostraGold-400 text-charcoal-950 text-xs font-extrabold font-mono transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>{copiedCmd ? 'COPIED TO CLIPBOARD!' : 'npx ostraops-guard'}</span>
            </button>
            {onNavigatePricing && (
              <button
                onClick={onNavigatePricing}
                className="px-5 py-3 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white text-xs font-semibold transition-all border border-charcoal-700 cursor-pointer"
              >
                <span>Explore Team Plans</span>
              </button>
            )}
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-4 py-3 rounded-xl text-charcoal-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Return to Overview</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
