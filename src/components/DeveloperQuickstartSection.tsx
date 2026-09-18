import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const DeveloperQuickstartSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'npx' | 'python' | 'ts' | 'curl'>('npx');
  const [copied, setCopied] = useState(false);

  const snippets = {
    npx: `# 1. Start the local-first loopback financial firewall
npx osterdops-guard

# Output:
# ✔ OsterdOps Loopback Daemon running on http://127.0.0.1:8080
# ✔ Telemetry & Circuit Breaker Console at http://127.0.0.1:4040
# ✔ Local SQLite persistent buffer at ~/.osterdops/traces.db
# ✔ Intra-family failover armed (Claude 3.7 -> 3.5 Haiku)`,
    python: `# Install OsterdOps Python wrapper
pip install osterdops-guard

# Use transparently with OpenAI, Anthropic, or LangChain
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8080/v1",  # Point to OsterdOps Daemon
    api_key="sk-ant-..."                  # Your upstream API key
)

response = client.chat.completions.create(
    model="claude-3-7-sonnet",
    messages=[{"role": "user", "content": "Autonomous code fix..."}]
)`,
    ts: `// Install SDK or use native fetch
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'http://127.0.0.1:8080/v1',
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const completion = await openai.chat.completions.create({
  model: 'claude-3-7-sonnet',
  messages: [{ role: 'user', content: 'Generate schema tests' }],
});`,
    curl: `# Direct cURL test against OsterdOps Local Gateway
curl http://127.0.0.1:8080/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Ping OsterdOps Daemon"}],
    "stream": true
  }'`,
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developers" className="relative py-24 bg-[#F5F2EB] border-t border-[#EAE5DB] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sandstone-300/80 border border-sandstone-400/60 text-[11px] font-bold tracking-[0.16em] text-charcoal-700 uppercase font-mono mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>DEVELOPER QUICKSTART</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-charcoal-900 tracking-[-0.02em] font-display">
            Up and Running in 10 Seconds.{' '}
            <span className="gold-gradient-text block">From Terminal to Production.</span>
          </h2>
          <p className="mt-4 text-base text-charcoal-600 leading-relaxed max-w-2xl mx-auto">
            No cloud accounts, no credit cards, no DNS records. Run the daemon locally and shield your agents immediately.
          </p>
        </div>

        {/* Quickstart 3-Step Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-white border border-[#EAE5DB] shadow-subtle space-y-3">
            <div className="w-8 h-8 rounded-xl bg-charcoal-900 text-white flex items-center justify-center font-mono text-xs font-bold">
              1
            </div>
            <h4 className="text-base font-bold text-charcoal-900 font-display">
              Launch Local Daemon
            </h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Run <code className="bg-sandstone-200 px-1.5 py-0.5 rounded font-mono text-charcoal-900">npx osterdops-guard</code> in any terminal. Binds to localhost port 8080 with 0 configuration.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EAE5DB] shadow-subtle space-y-3">
            <div className="w-8 h-8 rounded-xl bg-osterdGold-600 text-white flex items-center justify-center font-mono text-xs font-bold">
              2
            </div>
            <h4 className="text-base font-bold text-charcoal-900 font-display">
              Point Your Agent
            </h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Update your IDE or SDK Base URL to <code className="bg-sandstone-200 px-1.5 py-0.5 rounded font-mono text-charcoal-900">http://127.0.0.1:8080/v1</code>. Keep your own vendor API keys.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EAE5DB] shadow-subtle space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-mono text-xs font-bold">
              3
            </div>
            <h4 className="text-base font-bold text-charcoal-900 font-display">
              Inspect Telemetry & Guard
            </h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Open the on-device dashboard at <code className="bg-sandstone-200 px-1.5 py-0.5 rounded font-mono text-charcoal-900">localhost:4040</code> to view spend velocity, traces & hard caps.
            </p>
          </div>
        </div>

        {/* Interactive Terminal Window */}
        <div className="rounded-3xl bg-charcoal-950 text-white border border-charcoal-800 shadow-dashboard-3d overflow-hidden">
          
          {/* Terminal Tabs Bar */}
          <div className="flex flex-wrap items-center justify-between px-6 py-3.5 bg-charcoal-900 border-b border-charcoal-800 gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-3">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>

              {[
                { id: 'npx', label: 'NPX Daemon CLI' },
                { id: 'python', label: 'Python SDK' },
                { id: 'ts', label: 'TypeScript / Node' },
                { id: 'curl', label: 'Raw cURL' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-charcoal-800 text-osterdGold-300 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={copySnippet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 text-zinc-300 hover:text-white hover:bg-charcoal-700 text-xs font-mono transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>

          {/* Terminal Body */}
          <div className="p-6 sm:p-8 font-mono text-xs leading-relaxed overflow-x-auto text-zinc-300 selection:bg-osterdGold-500/30">
            <pre>
              <code>{snippets[activeTab]}</code>
            </pre>
          </div>

          {/* Terminal Status Footer */}
          <div className="px-6 py-3 bg-charcoal-900/60 border-t border-charcoal-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-400 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Loopback proxy: active
              </span>
              <span>Buffer: SQLite WAL Mode</span>
            </div>
            <span>Cross-Vendor Translation: Disabled</span>
          </div>

        </div>

      </div>
    </section>
  );
};
