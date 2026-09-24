import React, { useState } from 'react';
import { Copy, Check, CheckCircle2 } from 'lucide-react';

export const DeveloperQuickstartSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'npx' | 'ts' | 'python'>('npx');
  const [copied, setCopied] = useState(false);

  const snippets = {
    npx: `# 1. Run OstraOps in any terminal with zero configuration
npx ostraops

# What happens:
# - Connects to your local AI environment
# - Reads active model pricing rate cards
# - Arms your custom budget limits
# - Ready to track OpenAI, Anthropic, Gemini, and DeepSeek calls`,
    ts: `// Track calls in TypeScript / Node
import { track } from 'ostraops';
import OpenAI from 'openai';

const client = new OpenAI();

// Wrap your call to track tokens and enforce spend limits
const response = await track('gpt-4o', () => 
  client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Generate quarterly report' }],
  })
);`,
    python: `# Track calls in Python
from ostraops import track
from openai import OpenAI

client = OpenAI()

# Enforce budget guardrails around your LLM call
with track("claude-3-7-sonnet"):
    response = client.chat.completions.create(
        model="claude-3-7-sonnet",
        messages=[{"role": "user", "content": "Analyze codebase"}]
    )`,
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developers" className="relative py-24 bg-[#F5F2EB] border-t border-[#EAE5DB] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header: Product Induction */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-semibold text-ostraGold-700 uppercase tracking-wider mb-2 font-mono">
            How OstraOps Works
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-charcoal-900 tracking-[-0.02em] font-display">
            What OstraOps Does &amp; How It Works.{' '}
            <span className="gold-gradient-text block">Simple, Honest Budget Control.</span>
          </h2>
          <p className="mt-4 text-base text-charcoal-600 leading-relaxed max-w-2xl mx-auto">
            Building with AI shouldn't come with the fear of surprise invoices. OstraOps gives you real-time spend visibility, hard budget limits, and complete data privacy.
          </p>
        </div>

        {/* 3 Step Induction: How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-7 rounded-2xl bg-white border border-[#EAE5DB] shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-charcoal-900 text-white flex items-center justify-center font-mono text-sm font-bold">
              1
            </div>
            <h4 className="text-base font-bold text-charcoal-900 font-sans">
              Connect In Seconds
            </h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Run <code className="bg-sandstone-200 px-1.5 py-0.5 rounded font-mono text-charcoal-900">npx ostraops</code> in your terminal or add our lightweight package to your project. No complex configs required.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-[#EAE5DB] shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-ostraGold-600 text-white flex items-center justify-center font-mono text-sm font-bold">
              2
            </div>
            <h4 className="text-base font-bold text-charcoal-900 font-sans">
              Set Your Budget Limit
            </h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Define your comfort limit (e.g. $10/day or $200/month). As prompts run, OstraOps tallies every input and output token down to the cent.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-[#EAE5DB] shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-mono text-sm font-bold">
              3
            </div>
            <h4 className="text-base font-bold text-charcoal-900 font-sans">
              Build Without Anxiety
            </h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              If an agent gets stuck in a loop or an API call goes out of control, requests pause safely before you get billed for runaway tokens.
            </p>
          </div>
        </div>

        {/* Clean Code Integration Card (No fake simulator) */}
        <div className="rounded-3xl bg-charcoal-950 text-white border border-charcoal-800 shadow-dashboard-3d overflow-hidden max-w-4xl mx-auto">
          
          {/* Terminal Tabs Bar */}
          <div className="flex flex-wrap items-center justify-between px-6 py-3.5 bg-charcoal-900 border-b border-charcoal-800 gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-3">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>

              {[
                { id: 'npx', label: 'One-Line Command (npx)' },
                { id: 'ts', label: 'TypeScript / Node' },
                { id: 'python', label: 'Python' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-charcoal-800 text-ostraGold-300 font-bold'
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
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Terminal Body */}
          <div className="p-6 sm:p-8 font-mono text-xs leading-relaxed overflow-x-auto text-zinc-300 selection:bg-ostraGold-500/30">
            <pre>
              <code>{snippets[activeTab]}</code>
            </pre>
          </div>

          {/* Simple honest guarantees banner */}
          <div className="px-6 py-3.5 bg-charcoal-900/60 border-t border-charcoal-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-zinc-400 gap-2">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Zero prompt retention: Your data never leaves your environment
            </span>
            <span className="text-zinc-400">Works with your existing API keys</span>
          </div>

        </div>

      </div>
    </section>
  );
};
