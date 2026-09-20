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
    <section id="architecture" className="relative py-24 bg-[#F5F2EB] border-t border-[#EAE5DB] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-gradient-to-br from-ostraGold-400/10 via-amber-200/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sandstone-300/80 border border-sandstone-400/60 text-[11px] font-bold tracking-[0.16em] text-charcoal-700 uppercase font-mono mb-3">
            <span className="w-2 h-2 rounded-full bg-ostraGold-600" />
            <span>DETERMINISTIC ARCHITECTURE SPECIFICATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-charcoal-900 tracking-[-0.02em] font-display">
            Under The Hood:{' '}
            <span className="gold-gradient-text block">Local Loopback & Intra-Family Failover.</span>
          </h2>
          <p className="mt-4 text-base text-charcoal-600 leading-relaxed max-w-2xl mx-auto">
            Traditional AI proxies fail autonomous agents because they swap vendors mid-turn and corrupt JSON tool schemas. OstraOps isolates provider families and validates payloads locally before charges accrue.
          </p>
        </div>

        {/* 6-Stage Execution Pipeline Grid */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-charcoal-700">
              Local Loopback Interception Pipeline
            </h3>
            <span className="text-[11px] font-mono text-charcoal-700 font-bold bg-sandstone-200/80 px-2.5 py-0.5 rounded-full border border-sandstone-300">
              Measured Proxy Overhead: ~0.8ms – 1.8ms
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              {
                step: '01',
                title: 'Agent Dispatch',
                desc: 'Cursor, Cline, or Aider sends prompt to 127.0.0.1:8080.',
                badge: 'OpenAI Spec',
                icon: FileCode,
              },
              {
                step: '02',
                title: 'Pre-Flight Gate',
                desc: 'Evaluates cumulative daily spend and sliding window velocity.',
                badge: 'Circuit Breaker',
                icon: ShieldCheck,
              },
              {
                step: '03',
                title: 'Secret Redaction',
                desc: 'Scans for API keys, bearer tokens & internal IPs before egress.',
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
                  className="p-5 rounded-2xl bg-white border border-[#EAE5DB] shadow-subtle hover:shadow-card-3d transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-ostraGold-600 bg-sandstone-200 px-2 py-0.5 rounded">
                        {card.step}
                      </span>
                      <Icon className="w-4 h-4 text-charcoal-400 group-hover:text-charcoal-900 transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-charcoal-900 leading-snug">
                        {card.title}
                      </h4>
                      <p className="text-xs text-charcoal-600 leading-relaxed mt-1">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#EFEBE3]">
                    <span className="text-[10px] font-mono font-semibold text-charcoal-500 uppercase tracking-wide">
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
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white border border-rose-200/80 shadow-subtle flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-charcoal-900 font-display">
                    Why Generic AI Proxies Break Agents
                  </h4>
                  <p className="text-xs text-rose-700 font-mono">
                    Problem: Cross-Vendor Tool Calling Deserialization
                  </p>
                </div>
              </div>

              <p className="text-xs text-charcoal-600 leading-relaxed">
                When Anthropic Claude is rate-limited (HTTP 429), naive routing proxies redirect the prompt to OpenAI GPT-4o. This immediately crashes coding agents:
              </p>

              <div className="p-4 rounded-xl bg-charcoal-950 text-rose-300 font-mono text-[11px] leading-relaxed border border-charcoal-800 space-y-1">
                <p className="text-zinc-500">// Naive Proxy Behavior:</p>
                <p className="text-rose-400">✖ Received: 429 Too Many Requests (Anthropic)</p>
                <p className="text-rose-400">✖ Swapping to: gpt-4o (OpenAI)</p>
                <p className="text-zinc-400">✖ Error: Missing expected parameter `tool_choice` schema.</p>
                <p className="text-rose-500 font-bold">✖ Fatal: Cursor Agent crashed. File edits aborted.</p>
              </div>

              <div className="space-y-2 text-xs text-charcoal-600">
                <div className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span>Claude expects <code className="bg-sandstone-200 px-1 rounded font-mono text-[10px]">tool_use</code> content blocks, while OpenAI expects <code className="bg-sandstone-200 px-1 rounded font-mono text-[10px]">tool_calls</code> array.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span>Tool definition parameter typing schemas differ between JSONSchema draft-07 and draft-2020-12.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-rose-100 flex items-center justify-between text-xs text-rose-800 font-bold">
              <span>Result: Corrupted Agent Session</span>
              <span className="font-mono">100% Failure Rate</span>
            </div>
          </div>

          {/* Right: OstraOps Deterministic Intra-Family Cascading (6 cols) */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white border border-emerald-300/80 shadow-card-3d flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-charcoal-900 font-display">
                    OstraOps Deterministic Intra-Family Engine
                  </h4>
                  <p className="text-xs text-emerald-700 font-mono">
                    Solution: Strict Provider-Family Isolation
                  </p>
                </div>
              </div>

              <p className="text-xs text-charcoal-600 leading-relaxed">
                OstraOps strictly restricts failovers to sibling models within the exact same provider family, maintaining identical API contracts, tool blocks, and streaming formats:
              </p>

              <div className="p-4 rounded-xl bg-charcoal-950 text-emerald-300 font-mono text-[11px] leading-relaxed border border-charcoal-800 space-y-1">
                <p className="text-zinc-500">// OstraOps Intra-Family Cascade:</p>
                <p className="text-amber-400">⚡ 429 Detected: claude-3-7-sonnet rate-limited</p>
                <p className="text-emerald-400">✔ Cascading to sibling: claude-3-5-haiku</p>
                <p className="text-emerald-400">✔ Tool schema: 100% native tool_use retained</p>
                <p className="text-emerald-300 font-bold">✔ Execution: 0 session drops, 0 syntax corruptions.</p>
              </div>

              <div className="space-y-2 text-xs text-charcoal-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Intra-Family Passthrough:</strong> Payload is forwarded byte-for-byte to sibling models.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Automatic Rate-Limit Backoff:</strong> Intelligently handles retry-after headers without blocking agent threads.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-800 font-bold">
              <span>Result: Continuous Autonomous Coding</span>
              <span className="font-mono">High Tool Fidelity</span>
            </div>
          </div>

        </div>

        {/* Technical Architecture Comparison Table */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE5DB] shadow-subtle overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-charcoal-900 font-display">
                Engineering Specification Matrix
              </h3>
              <p className="text-xs text-charcoal-500 font-mono">
                OstraOps Local Daemon vs. Remote Cloud Proxies vs. Direct API Calls
              </p>
            </div>
            <span className="text-[11px] font-mono text-charcoal-500 hidden sm:inline-block">
              Benchmark hardware: Apple M3 / AMD Ryzen 9
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#EAE5DB] text-[11px] text-charcoal-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Architecture Metric</th>
                  <th className="py-3 px-4 text-ostraGold-600 font-bold bg-sandstone-100/80 rounded-t-xl">
                    OstraOps (Local Loopback)
                  </th>
                  <th className="py-3 px-4">Hosted Cloud Gateways</th>
                  <th className="py-3 px-4">Direct LLM Calls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE3]">
                <tr>
                  <td className="py-3.5 px-4 font-sans font-bold text-charcoal-900">Added Proxy Latency</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold bg-sandstone-100/50">
                    ~0.8ms - 1.8ms (Local Loopback Overhead)
                  </td>
                  <td className="py-3.5 px-4 text-rose-600">+45 ms – 180 ms (Cloud Roundtrip)</td>
                  <td className="py-3.5 px-4 text-charcoal-500">0 ms</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-sans font-bold text-charcoal-900">Data Privacy & Prompts</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold bg-sandstone-100/50">
                    100% On-Device (0 Cloud Storage)
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-600">Logged on 3rd-party servers</td>
                  <td className="py-3.5 px-4 text-charcoal-600">Provider Retention</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-sans font-bold text-charcoal-900">Runaway Spend Circuit Breaker</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold bg-sandstone-100/50">
                    Sub-Millisecond Budget Guard (&lt;1.2ms)
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-600">Post-facto Webhook Alerts</td>
                  <td className="py-3.5 px-4 text-rose-600">None (Full Bill Accrues)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-sans font-bold text-charcoal-900">Agent Tool Call Preservation</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold bg-sandstone-100/50">
                    Deterministic Intra-Family
                  </td>
                  <td className="py-3.5 px-4 text-rose-600">Cross-Vendor Deserialization Error</td>
                  <td className="py-3.5 px-4 text-charcoal-500">Single Model Only</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-sans font-bold text-charcoal-900">Memory Footprint</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold bg-sandstone-100/50">
                    ~36 MB Resident RAM
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-600">N/A (Hosted)</td>
                  <td className="py-3.5 px-4 text-charcoal-500">0 MB</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-sans font-bold text-charcoal-900">Deployment Overhead</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold bg-sandstone-100/50 rounded-b-xl">
                    1 command (<code className="bg-sandstone-200 px-1 rounded">npx ostraops-guard</code>)
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-600">DNS CNAMEs, API Keys, Signups</td>
                  <td className="py-3.5 px-4 text-charcoal-500">API Key per vendor</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
