import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Zap, 
  CheckCircle2, 
  AlertOctagon, 
  Server,
  FileCode,
  HardDrive
} from 'lucide-react';

export const InteractiveArchitecture: React.FC = () => {
  return (
    <section id="architecture" className="relative py-24 bg-[#07090C] border-t border-white/[0.08] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-gradient-to-br from-[#C59E5F]/10 via-[#C59E5F]/5 to-transparent blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-semibold text-[#E5C38D] uppercase tracking-wider mb-2 font-mono">
            Architecture &amp; Reliability
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-[-0.02em] font-display">
            Designed for High Reliability.{' '}
            <span className="gold-gradient-text block">Zero Compromise on Code Quality.</span>
          </h2>
          <p className="mt-4 text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            OstraOps intercepts API calls smoothly, verifies budget limits before dispatch, and prevents accidental overspending without changing your prompt formats or tool schemas.
          </p>
        </div>

        {/* 6-Stage Execution Pipeline Grid */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-300">
              Request Processing Lifecycle
            </h3>
            <span className="text-[11px] font-mono text-[#E5C38D] font-bold bg-[#C59E5F]/15 px-2.5 py-0.5 rounded-md border border-[#C59E5F]/30">
              Negligible Overhead: ~1ms
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              {
                step: '01',
                title: 'Request Dispatch',
                desc: 'Your application, agent, or editor triggers an LLM completion.',
                badge: 'Input',
                icon: FileCode,
              },
              {
                step: '02',
                title: 'Budget Limit Check',
                desc: 'Verifies cumulative spend against your active daily and monthly caps.',
                badge: 'Budget Guard',
                icon: ShieldCheck,
              },
              {
                step: '03',
                title: 'Secret Protection',
                desc: 'Safeguards local credentials so private keys are never exposed.',
                badge: '~0.4ms Scan',
                icon: Lock,
              },
              {
                step: '04',
                title: 'Provider Ingress',
                desc: 'Dispatches request to Anthropic, OpenAI, or Gemini upstream.',
                badge: 'Streaming SSE',
                icon: Server,
              },
              {
                step: '05',
                title: 'Intra-Family Fallback',
                desc: 'If 429/529 occurs, cascades within family without broken tools.',
                badge: '< 1ms Overhead',
                icon: Zap,
              },
              {
                step: '06',
                title: 'Local Persistence',
                desc: 'Buffers token counts, latency & cost to local SQLite database.',
                badge: '100% Offline',
                icon: HardDrive,
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.step}
                  className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-subtle hover:shadow-[0_0_25px_rgba(197,158,95,0.1)] hover:border-[#C59E5F]/40 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#E5C38D] bg-[#C59E5F]/15 border border-[#C59E5F]/30 px-2 py-0.5 rounded">
                        {card.step}
                      </span>
                      <Icon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100 leading-snug">
                        {card.title}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.06]">
                    <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wide">
                      {card.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deep Dive Breakdown: Why Intra-Family Failover vs Cross-Vendor Switching */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-14">
          
          {/* Left: The Failure of Cross-Vendor Switching (6 cols) */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#0B0E14] border border-rose-500/30 shadow-subtle flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 flex items-center justify-center">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-100 font-display">
                    Why Generic AI Proxies Break Agents
                  </h4>
                  <p className="text-xs text-rose-400 font-mono">
                    Problem: Cross-Vendor Tool Calling Deserialization
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                When Anthropic Claude is rate-limited (HTTP 429), naive routing proxies redirect the prompt to OpenAI GPT-4o. This immediately crashes coding agents:
              </p>

              <div className="p-4 rounded-xl bg-[#07090C] text-rose-300 font-mono text-[11px] leading-relaxed border border-rose-500/20 space-y-1">
                <p className="text-zinc-500">// Naive Proxy Behavior:</p>
                <p className="text-rose-400">✖ Received: 429 Too Many Requests (Anthropic)</p>
                <p className="text-rose-400">✖ Swapping to: gpt-4o (OpenAI)</p>
                <p className="text-zinc-400">✖ Error: Missing expected parameter `tool_choice` schema.</p>
                <p className="text-rose-500 font-bold">✖ Fatal: Cursor Agent crashed. File edits aborted.</p>
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Claude expects <code className="bg-white/[0.06] border border-white/[0.08] px-1 rounded font-mono text-[10px] text-zinc-200">tool_use</code> content blocks, while OpenAI expects <code className="bg-white/[0.06] border border-white/[0.08] px-1 rounded font-mono text-[10px] text-zinc-200">tool_calls</code> array.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Tool definition parameter typing schemas differ between JSONSchema draft-07 and draft-2020-12.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-rose-500/20 flex items-center justify-between text-xs text-rose-400 font-bold">
              <span>Result: Corrupted Agent Session</span>
              <span className="font-mono">100% Failure Rate</span>
            </div>
          </div>

          {/* Right: OstraOps Deterministic Intra-Family Cascading (6 cols) */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#0B0E14] border border-emerald-500/30 shadow-card-3d flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-100 font-display">
                    OstraOps Deterministic Intra-Family Engine
                  </h4>
                  <p className="text-xs text-emerald-400 font-mono">
                    Solution: Strict Provider-Family Isolation
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                OstraOps strictly restricts failovers to sibling models within the exact same provider family, maintaining identical API contracts, tool blocks, and streaming formats:
              </p>

              <div className="p-4 rounded-xl bg-[#07090C] text-emerald-300 font-mono text-[11px] leading-relaxed border border-emerald-500/20 space-y-1">
                <p className="text-zinc-500">// OstraOps Intra-Family Cascade:</p>
                <p className="text-[#E5C38D]">⚡ 429 Detected: claude-3-7-sonnet rate-limited</p>
                <p className="text-emerald-400">✔ Cascading to sibling: claude-3-5-haiku</p>
                <p className="text-emerald-400">✔ Tool schema: 100% native tool_use retained</p>
                <p className="text-emerald-300 font-bold">✔ Execution: 0 session drops, 0 syntax corruptions.</p>
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-zinc-100">Intra-Family Passthrough:</strong> Payload is forwarded byte-for-byte to sibling models.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-zinc-100">Automatic Rate-Limit Backoff:</strong> Intelligently handles retry-after headers without blocking agent threads.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span>Result: Continuous Autonomous Coding</span>
              <span className="font-mono">High Tool Fidelity</span>
            </div>
          </div>

        </div>

        {/* Technical Architecture Comparison Table */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-100 font-display">
                Engineering Specification Matrix
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                OstraOps Local Daemon vs. Remote Cloud Proxies vs. Direct API Calls
              </p>
            </div>
            <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline-block">
              Benchmark hardware: Apple M3 / AMD Ryzen 9
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Architecture Metric</th>
                  <th className="py-3 px-4 text-[#E5C38D] font-bold bg-[#C59E5F]/[0.08] rounded-t-xl">
                    OstraOps (Local Loopback)
                  </th>
                  <th className="py-3 px-4">Hosted Cloud Gateways</th>
                  <th className="py-3 px-4">Direct LLM Calls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr>
                  <td className="py-3.5 px-4 font-sans font-bold text-zinc-200">Added Proxy Latency</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#C59E5F]/[0.04]">
                    ~0.8ms - 1.8ms (Local Loopback Overhead)
                  </td>
                  <td className="py-3.5 px-4 text-rose-400">+45 ms – 180 ms (Cloud Roundtrip)</td>
                  <td className="py-3.5 px-4 text-zinc-500">0 ms</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-sans font-bold text-zinc-200">Data Privacy & Prompts</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#C59E5F]/[0.04]">
                    100% On-Device (0 Cloud Storage)
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">Logged on 3rd-party servers</td>
                  <td className="py-3.5 px-4 text-zinc-400">Provider Retention</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-sans font-bold text-zinc-200">Runaway Spend Circuit Breaker</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#C59E5F]/[0.04]">
                    Sub-Millisecond Budget Guard (&lt;1.2ms)
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">Post-facto Webhook Alerts</td>
                  <td className="py-3.5 px-4 text-rose-400">None (Full Bill Accrues)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-sans font-bold text-zinc-200">Agent Tool Call Preservation</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#C59E5F]/[0.04]">
                    Deterministic Intra-Family
                  </td>
                  <td className="py-3.5 px-4 text-rose-400">Cross-Vendor Deserialization Error</td>
                  <td className="py-3.5 px-4 text-zinc-500">Single Model Only</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-sans font-bold text-zinc-200">Memory Footprint</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#C59E5F]/[0.04]">
                    ~36 MB Resident RAM
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">N/A (Hosted)</td>
                  <td className="py-3.5 px-4 text-zinc-500">0 MB</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-sans font-bold text-zinc-200">Deployment Overhead</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#C59E5F]/[0.04] rounded-b-xl">
                    1 command (<code className="bg-white/[0.06] px-1 py-0.5 rounded text-[#E5C38D]">npx ostraops-guard</code>)
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">DNS CNAMEs, API Keys, Signups</td>
                  <td className="py-3.5 px-4 text-zinc-500">API Key per vendor</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
