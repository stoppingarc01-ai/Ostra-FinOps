import React from 'react';
import { Layers, Eye, ShieldCheck, Zap, ArrowUpRight, Lock, Workflow } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Layers,
      title: 'Cost Guardrails & Circuit Breaker',
      subtitle: 'LLM Cost Governance',
      description: 'Set hard spending limits and token velocity brakes ($/min). Cut runaway agent retry storms before four-figure invoices occur.',
      highlight: 'Sub-ms 429 Cutoff',
      badge: 'Financial Protection',
    },
    {
      icon: Eye,
      title: 'Agentic Tracing & Odometer',
      subtitle: 'Real-Time Observability',
      description: 'Track prompt trajectories, tool calls, and model latency per agent across Cursor, Cline, Windsurf, and Antigravity.',
      highlight: '~0.8ms Telemetry',
      badge: 'Live Odometer',
    },
    {
      icon: Workflow,
      title: 'Intra-Family Failover Matrix',
      subtitle: 'Native Tool Schema Integrity',
      description: 'Cascade automatically from Sonnet to Haiku or GPT-4o to 4o-mini without breaking XML or JSON tool calling definitions.',
      highlight: 'Native API Fidelity',
      badge: 'Deterministic',
    },
    {
      icon: ShieldCheck,
      title: 'Universal Drop-In Gateway',
      subtitle: 'Single Local Endpoint',
      description: 'Zero code modifications. Simply point your agent or SDK Base URL to 127.0.0.1:8080 for local loopback proxying with sub-millisecond overhead.',
      highlight: 'Drop-In Loopback',
      badge: 'OpenAI & Anthropic Spec',
    },
    {
      icon: Lock,
      title: 'Local Secret & PII Scrubbing',
      subtitle: 'Zero-Egress Security',
      description: 'Scans and masks internal IPs, credentials, JWTs, and API tokens in ~0.5ms before any byte hits upstream LLM providers.',
      highlight: 'Air-Gapped Ready',
      badge: 'Zero Cloud Storage',
    },
    {
      icon: Zap,
      title: 'Local-First SQLite Persistence',
      subtitle: 'Strict Zero-Data Retention',
      description: 'Your codebase, prompts, and traces never touch an external third-party server. Everything stays encrypted on your own machine.',
      highlight: 'AES-256 at Rest',
      badge: '100% Offline Capable',
    },
  ];

  return (
    <section id="features" className="py-24 border-t border-white/[0.08] bg-[#07090C] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#C59E5F]/10 via-[#C59E5F]/5 to-transparent blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-semibold text-[#E5C38D] uppercase tracking-wider mb-2 font-mono">
            Core Platform Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-[-0.02em] font-display">
            Built For Developers Who{' '}
            <span className="gold-gradient-text block">Demand Real Budget Control.</span>
          </h2>
          <p className="mt-4 text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Traditional AI cost tools only alert you after the money is already gone. OstraOps protects your account in real time as requests are processed.
          </p>
        </div>

        {/* 6 Feature Cards Grid with 3D Depth */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1200">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative p-7 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-xl hover:shadow-[0_0_30px_rgba(197,158,95,0.12)] hover:border-[#C59E5F]/40 transition-all duration-300 flex flex-col justify-between transform preserve-3d hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    {/* Icon Container */}
                    <div className="w-12 h-12 rounded-2xl bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center text-[#E5C38D] group-hover:bg-[#C59E5F] group-hover:text-[#07090C] transition-all duration-200 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
                      {item.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold tracking-wider text-[#E5C38D] uppercase font-mono">
                      {item.subtitle}
                    </span>
                    <h3 className="text-lg font-bold text-zinc-100 font-display group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Tag */}
                <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="font-semibold text-zinc-200">{item.highlight}</span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-[#E5C38D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
