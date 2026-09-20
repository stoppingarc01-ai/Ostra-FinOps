import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  Search, 
  HelpCircle 
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'architecture' | 'guardrails' | 'setup' | 'privacy';
  tags: string[];
}

export const FAQSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openItemIds, setOpenItemIds] = useState<string[]>(['faq-1', 'faq-3']);

  const faqItems: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'architecture',
      tags: ['latency', 'daemon', 'loopback', 'overhead', 'memory'],
      question: 'What is the actual latency overhead of running OstraOps locally?',
      answer: 'OstraOps runs as a local daemon bound to your loopback interface (`http://127.0.0.1:8080`). Every proxy introduces networking and parsing layers: benchmarks measure OstraOps proxy overhead at typically ~0.8ms to 1.8ms (p99 < 2.5ms). Because requests and responses stream chunk-by-chunk through Server-Sent Events (SSE) directly to the upstream model provider, your Time-To-First-Token (TTFT) overhead is limited to immediate packet transit without artificial full-body buffering.',
    },
    {
      id: 'faq-2',
      category: 'guardrails',
      tags: ['circuit breaker', 'runaway loops', 'billing', 'cost limit', 'hard cap'],
      question: 'How does the Financial Circuit Breaker stop runaway agent loops?',
      answer: 'Autonomous agents (such as Cursor Composer or Cline) can get trapped in repetitive retry loops, consuming thousands of dollars in tokens overnight. OstraOps computes a real-time spending derivative ($/minute) over a rolling 180-second window and tracks cumulative daily spend. If velocity spikes or your daily hard cap (e.g. $15.00/day) is crossed, OstraOps injects a clean HTTP 429 backoff locally before the request leaves your computer, preventing unauthorized charges.',
    },
    {
      id: 'faq-3',
      category: 'architecture',
      tags: ['intra-family', 'failover', 'tool calling', 'json schema', 'claude', 'gpt'],
      question: 'Why do other AI proxies break agent tool calls, and how does Intra-Family Failover solve this?',
      answer: 'Generic AI proxies attempt cross-vendor swapping (e.g., redirecting Claude to GPT-4o when rate-limited). This breaks agents because Claude expects XML-based `tool_use` blocks while OpenAI relies on JSON-based `tool_calls` schemas. OstraOps enforces deterministic Intra-Family Failover: if Claude 3.7 Sonnet encounters a 429/529 overload, OstraOps automatically cascades to Claude 3.5 Haiku, keeping the exact same provider API contract, parameter definitions, and file-editing tools intact with 0% session disruption.',
    },
    {
      id: 'faq-4',
      category: 'privacy',
      tags: ['sqlite', 'cloud retention', 'privacy', 'aes-256', 'gdpr', 'soc2'],
      question: 'Does OstraOps store or log my codebase and prompts on remote cloud servers?',
      answer: 'No. OstraOps is strictly local-first with a Zero-Data-Retention architecture. All agent dispatches, tokens, and telemetry are buffered locally in an on-device SQLite database at `~/.ostraops/traces.db` encrypted with local AES-256 keys. No prompts, completion tokens, codebase files, or secrets ever egress to OstraOps cloud servers.',
    },
    {
      id: 'faq-5',
      category: 'setup',
      tags: ['cursor', 'cline', 'windsurf', 'aider', 'setup', 'config'],
      question: 'How do I connect Cursor, Cline, or Windsurf to OstraOps?',
      answer: 'Setup takes under 30 seconds. In Cursor, open Settings > Models, enable OpenAI API Key, and set the OpenAI Base URL to `http://127.0.0.1:8080/v1`. For Cline or Claude Dev, set Custom Base URL to `http://127.0.0.1:8080/v1`. OstraOps automatically intercepts prompt streams without requiring changes to your source code or agent scripts.',
    },
    {
      id: 'faq-6',
      category: 'setup',
      tags: ['npx', 'cli', 'install', 'free', 'open-core'],
      question: 'Do I need to create an account or provide a credit card to run the daemon?',
      answer: 'No account or credit card is required. Individual developers can run `npx ostraops-guard` in any terminal immediately. The local loopback gateway, real-time telemetry console (localhost:4040), and local SQLite trace buffer are completely free and open-core for local developers.',
    },
    {
      id: 'faq-7',
      category: 'privacy',
      tags: ['pii', 'redaction', 'secrets', 'jwt', 'security'],
      question: 'How does the local PII and secret redaction engine work?',
      answer: 'Before any prompt payload is dispatched to an upstream provider, OstraOps executes an in-memory high-entropy scanner (0.18ms latency). It identifies API keys (sk-live-...), JWT tokens, and private internal IP addresses (RFC1918), replacing them with deterministic masks before transmission. Tokens are re-hydrated dynamically in the completion stream before being returned to your agent.',
    },
    {
      id: 'faq-8',
      category: 'architecture',
      tags: ['vllm', 'ollama', 'local models', 'deepseek', 'llama'],
      question: 'Can I use OstraOps with local LLMs like Ollama or vLLM?',
      answer: 'Yes. OstraOps fully supports local inference engines. You can configure OstraOps to route background indexing or fast code review tasks to your local Ollama or vLLM endpoints (e.g. Llama 3.3 70B or DeepSeek-R1) while routing complex reasoning to frontier models, enforcing budget limits across all combined channels.',
    },
    {
      id: 'faq-9',
      category: 'guardrails',
      tags: ['pricing', 'teams', 'hosted', 'enterprise'],
      question: 'When should a team upgrade from Solo Guard to Team Gateway?',
      answer: 'Solo Guard is optimized for individual developers working locally on their own machines. Teams upgrade to OstraOps Team Gateway when they need centralized team budget pooling, shared project API keys, role-based governance, multi-seat audit exports for SOC2 compliance, and unified organization analytics across dozens of engineers.',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'architecture', label: 'Architecture & Loopback' },
    { id: 'guardrails', label: 'Cost Guardrails' },
    { id: 'setup', label: 'Agent Setup' },
    { id: 'privacy', label: 'Privacy & Security' },
  ];

  const filteredItems = useMemo(() => {
    return faqItems.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query || 
        item.question.toLowerCase().includes(query) || 
        item.answer.toLowerCase().includes(query) ||
        item.tags.some(t => t.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setOpenItemIds(filteredItems.map(i => i.id));
  };

  const collapseAll = () => {
    setOpenItemIds([]);
  };

  return (
    <section id="faq" className="relative py-24 bg-[#FAF8F5] border-t border-[#EAE5DB] overflow-hidden">
      {/* Subtle 3D Ambient Light Aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-ostraGold-400/10 via-sandstone-300/15 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sandstone-200 border border-sandstone-300/80 text-[11px] font-bold tracking-[0.16em] text-charcoal-700 uppercase font-mono mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-ostraGold-600" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-charcoal-900 tracking-[-0.02em] font-display">
            Everything You Need To Know.{' '}
            <span className="gold-gradient-text block">Zero Hype. Full Engineering Details.</span>
          </h2>
          <p className="mt-4 text-base text-charcoal-600 leading-relaxed max-w-2xl mx-auto">
            Got questions about latency, tool schemas, privacy, or setup? Here are the technical facts.
          </p>
        </div>

        {/* Search Bar & Quick Category Filters */}
        <div className="max-w-3xl mx-auto mb-10 space-y-4">
          {/* Search Input Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics (e.g. latency, Cursor, tool calling, SQLite, circuit breaker)..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-[#EAE5DB] text-sm text-charcoal-900 placeholder:text-charcoal-400 shadow-subtle focus:outline-none focus:border-ostraGold-500 transition-colors font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-charcoal-400 hover:text-charcoal-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills & Expand Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeCategory === c.id
                      ? 'bg-charcoal-900 text-white shadow-xs'
                      : 'bg-white text-charcoal-600 hover:text-charcoal-900 hover:bg-sandstone-100 border border-[#EAE5DB]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-charcoal-500">
              <button onClick={expandAll} className="hover:text-charcoal-900 cursor-pointer">
                Expand all
              </button>
              <span>•</span>
              <button onClick={collapseAll} className="hover:text-charcoal-900 cursor-pointer">
                Collapse all
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-3xl mx-auto space-y-3.5">
          {filteredItems.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-[#EAE5DB] text-center space-y-2">
              <p className="text-sm font-bold text-charcoal-900">No matching questions found</p>
              <p className="text-xs text-charcoal-500 font-mono">
                Try searching for keywords like "latency", "Cursor", "cost", or "failover".
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="mt-3 px-4 py-2 rounded-xl bg-sandstone-200 text-xs font-bold text-charcoal-800 hover:bg-sandstone-300 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isOpen = openItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-white border-ostraGold-500/60 shadow-card-3d'
                      : 'bg-white/80 hover:bg-white border-[#EAE5DB] shadow-2xs hover:shadow-subtle'
                  }`}
                >
                  {/* Question Accordion Button */}
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-charcoal-900 font-display leading-snug">
                      {item.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'bg-charcoal-900 text-white rotate-180'
                          : 'bg-sandstone-200 text-charcoal-700'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Expanded Answer Content */}
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 border-t border-[#EFEBE3]/80 space-y-3">
                      <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                        {item.answer}
                      </p>

                      {/* Tag badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-sandstone-100 text-charcoal-500 text-[10px] font-mono border border-sandstone-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Helper Strip */}
        <div className="max-w-3xl mx-auto mt-12 p-6 rounded-2xl bg-white border border-[#EAE5DB] shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <h4 className="text-sm font-bold text-charcoal-900 font-display">
              Have a specific architecture question?
            </h4>
            <p className="text-xs text-charcoal-500">
              Check our technical documentation or test the loopback daemon directly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-sandstone-200 font-mono text-xs text-charcoal-800 border border-sandstone-300">
              npx ostraops-guard
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
