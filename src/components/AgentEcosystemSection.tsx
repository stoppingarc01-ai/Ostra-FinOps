import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

export const AgentEcosystemSection: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string>('cursor');
  const [copied, setCopied] = useState(false);

  const agents = [
    {
      id: 'cursor',
      name: 'Cursor IDE',
      category: 'AI Code Editor',
      description: 'Intercept agent background indexers, tab completions, and multi-file composer sessions.',
      configType: 'Settings > Models > OpenAI API Key & Base URL',
      envVar: 'OPENAI_BASE_URL=http://127.0.0.1:8080/v1',
      codeSnippet: `// In Cursor: Settings > Models > Custom Endpoint
{
  "openai_base_url": "http://127.0.0.1:8080/v1",
  "anthropic_base_url": "http://127.0.0.1:8080/v1"
}`,
      supportedModels: 'Claude 3.7 Sonnet, GPT-4o, o3-mini',
      stat: '0 Tool Call Corruptions',
    },
    {
      id: 'cline',
      name: 'Cline (Claude Dev)',
      category: 'Autonomous VSCode Agent',
      description: 'Prevent runaway bash execution loops and monitor token burn per terminal command execution.',
      configType: 'Extension Settings > Provider > Custom Base URL',
      envVar: 'ANTHROPIC_BASE_URL=http://127.0.0.1:8080/v1',
      codeSnippet: `// In Cline Settings > API Provider:
// Base URL: http://127.0.0.1:8080/v1
// Model: claude-3-7-sonnet
// Hard limit enforced automatically by OsterdOps Daemon.`,
      supportedModels: 'Claude 3.7 Sonnet, DeepSeek-R1',
      stat: '$15/day Circuit Breaker',
    },
    {
      id: 'windsurf',
      name: 'Windsurf (Codeium)',
      category: 'Cascade AI Flow',
      description: 'Audit full-context Cascade prompts and intercept internal API keys before dispatch.',
      configType: 'Cascade Engine Configuration',
      envVar: 'OPENAI_BASE_URL=http://127.0.0.1:8080/v1',
      codeSnippet: `export OPENAI_BASE_URL="http://127.0.0.1:8080/v1"
export WINDSURF_PROXY_ENABLED="true"`,
      supportedModels: 'Claude 3.5 Sonnet, GPT-4o',
      stat: '0.18ms Secret Redaction',
    },
    {
      id: 'antigravity',
      name: 'Antigravity IDE',
      category: 'Next-Gen Autonomous IDE',
      description: 'Native deep integration with loopback telemetry and subagent trace aggregation.',
      configType: 'Workspace Config / Daemon auto-bind',
      envVar: 'OSTERDOPS_DAEMON_PORT=8080',
      codeSnippet: `// .agents/config.json
{
  "telemetry": "local",
  "loopback_port": 8080,
  "velocity_brake": 3.00
}`,
      supportedModels: 'Gemini 2.5 Pro, Claude Sonnet, GPT-4o',
      stat: '100% Local SQLite Traces',
    },
    {
      id: 'aider',
      name: 'Aider CLI',
      category: 'Terminal Pair Programmer',
      description: 'Add financial safeguards to multi-file git commit generation and diff loops in your shell.',
      configType: 'CLI Flag / Environment Variable',
      envVar: 'aider --openai-api-base http://127.0.0.1:8080/v1',
      codeSnippet: `# Run Aider paired through the OsterdOps financial firewall
aider --openai-api-base http://127.0.0.1:8080/v1 \\
      --model openai/gpt-4o`,
      supportedModels: 'GPT-4o, Claude 3.5 Sonnet, DeepSeek-V3',
      stat: 'Git Safe Dispatches',
    },
    {
      id: 'frameworks',
      name: 'LangChain & CrewAI',
      category: 'Agent Orchestration SDKs',
      description: 'Universal drop-in for multi-agent Python and TypeScript autonomous workflows.',
      configType: 'SDK Client Constructor',
      envVar: 'base_url="http://127.0.0.1:8080/v1"',
      codeSnippet: `from openai import OpenAI

# OsterdOps intercepts all outbound calls transparently
client = OpenAI(
    base_url="http://127.0.0.1:8080/v1",
    api_key="your-api-key"
)`,
      supportedModels: 'All Provider Families',
      stat: 'Drop-In Python / TS',
    },
  ];

  const current = agents.find((a) => a.id === selectedAgent) || agents[0];

  const copyCode = () => {
    navigator.clipboard.writeText(current.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="agents" className="relative py-24 bg-[#FAF8F5] border-t border-[#EAE5DB] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sandstone-200 border border-sandstone-300/80 text-[11px] font-bold tracking-[0.16em] text-charcoal-700 uppercase font-mono mb-3">
            <span className="w-2 h-2 rounded-full bg-osterdGold-500" />
            <span>UNIVERSAL AGENT COMPATIBILITY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-charcoal-900 tracking-[-0.02em] font-display">
            Plug Into Any Agent in 30 Seconds.{' '}
            <span className="gold-gradient-text block">Zero Code Rewrites.</span>
          </h2>
          <p className="mt-4 text-base text-charcoal-600 leading-relaxed max-w-2xl mx-auto">
            OsterdOps speaks fluent OpenAI and Anthropic HTTP protocol. Just point your agent's Base URL to <code className="bg-sandstone-200 px-1.5 py-0.5 rounded text-charcoal-900 font-mono text-xs">127.0.0.1:8080</code>.
          </p>
        </div>

        {/* Interactive Agent Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {agents.map((a) => {
            const isSelected = a.id === selectedAgent;
            return (
              <button
                key={a.id}
                onClick={() => setSelectedAgent(a.id)}
                className={`p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white border-osterdGold-500 shadow-card-3d -translate-y-1'
                    : 'bg-[#FAF8F5] border-[#EAE5DB] hover:bg-white hover:border-sandstone-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-charcoal-900 font-display">
                    {a.name}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-osterdGold-500 shadow-[0_0_8px_#D4AF7C]" />
                  )}
                </div>
                <span className="text-[10px] text-charcoal-500 font-mono block truncate">
                  {a.category}
                </span>
                <div className="mt-3 pt-2 border-t border-[#EFEBE3] text-[9px] font-mono text-emerald-700 font-semibold">
                  {a.stat}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Agent Configuration Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE5DB] shadow-dashboard-3d">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Details (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-charcoal-900 font-display">
                    {current.name} Integration
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-sandstone-200 text-charcoal-700 font-mono text-[10px] font-bold">
                    {current.category}
                  </span>
                </div>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  {current.description}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DB] space-y-1">
                  <span className="text-[10px] font-bold font-mono uppercase text-charcoal-400">
                    Configuration Location
                  </span>
                  <p className="font-mono text-charcoal-900 font-medium">
                    {current.configType}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DB] space-y-1">
                  <span className="text-[10px] font-bold font-mono uppercase text-charcoal-400">
                    Tested Frontier Models
                  </span>
                  <p className="font-mono text-charcoal-900 font-medium">
                    {current.supportedModels}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Code Block (6 cols) */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-charcoal-950 text-white border border-charcoal-800 shadow-2xl overflow-hidden font-mono text-xs">
                <div className="flex items-center justify-between px-4 py-3 bg-charcoal-900 border-b border-charcoal-800">
                  <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                    <Terminal className="w-3.5 h-3.5 text-osterdGold-400" />
                    <span>One-Line Connection Spec</span>
                  </div>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-charcoal-800 text-zinc-300 hover:text-white hover:bg-charcoal-700 text-[11px] transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-zinc-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-5 text-[11px] leading-relaxed overflow-x-auto text-zinc-300 selection:bg-osterdGold-500/30">
                  <code>{current.codeSnippet}</code>
                </pre>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
