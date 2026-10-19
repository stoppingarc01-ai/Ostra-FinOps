import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronDown, 
  Search, 
  ArrowLeft, 
  HelpCircle
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'account' | 'guardrails' | 'setup' | 'privacy' | 'architecture';
  tags: string[];
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-personalized-sdk',
    category: 'account',
    tags: ['account', 'sdk', 'api key', 'dashboard', 'personalized', 'signup', 'snippets'],
    question: 'After creating an account, will I get my own personalized SDK and API keys?',
    answer: 'Yes, absolutely! As soon as you sign up, your OstraOps dashboard generates your personalized virtual API key (e.g. ost_live_...) with your custom budget limits attached. Inside the Integrations and Projects tabs, all code snippets for LangChain, CrewAI, Python, and TypeScript are pre-filled with your actual key and project endpoint — ready to copy and run with zero manual configuration.',
  },
  {
    id: 'faq-cli-vs-web',
    category: 'guardrails',
    tags: ['npx', 'cli', 'website', 'tokens', 'api tracking', 'difference', 'guard'],
    question: 'What is the difference between "npx ostraops-guard" and this website?',
    answer: 'Here is the simple breakdown: "npx ostraops-guard" is a free local tool that runs on your computer. It does NOT send your API calls, code, or prompts to any server — it only counts your tokens and enforces your daily spend limit so runaway AI agents don\'t drain your wallet. On the other hand, the OstraOps Website and Gateway is our hosted platform for teams who want full API tracking, live dashboards, response times, model breakdowns, and team budgets.',
  },
  {
    id: 'faq-circuit-breaker',
    category: 'guardrails',
    tags: ['spending limit', 'runaway agents', 'hard cap', 'billing', 'cursor', 'cline'],
    question: 'How do spending limits stop runaway AI agents from burning my money?',
    answer: 'Autonomous coding agents (like Cursor, Cline, or custom scripts) can sometimes get stuck in an endless retry loop and burn through hundreds of dollars while you sleep. With OstraOps, you set a hard budget limit (for example, $10/day). The second your limit is reached, OstraOps stops the requests locally with a standard 429 pause code. Your credit card is never hit with surprise charges.',
  },
  {
    id: 'faq-privacy-code',
    category: 'privacy',
    tags: ['privacy', 'code security', 'prompts', 'secrets', 'data'],
    question: 'Does OstraOps read, save, or upload my code and prompts?',
    answer: 'No. When you use the local guard (npx ostraops-guard), your code and prompts stay 100% on your own computer. We never read or store your source code or prompts on our servers. The guard only counts token numbers so it knows when to stop before you exceed your budget.',
  },
  {
    id: 'faq-where-available',
    category: 'setup',
    tags: ['cursor', 'cline', 'windsurf', 'python', 'langchain', 'crewai', 'tools', 'compatibility'],
    question: 'Where is OstraOps available? Is it only for Cursor and Cline?',
    answer: 'Not at all! OstraOps works anywhere you use AI. Because it implements the standard OpenAI and Anthropic API formats, you can use it with: (1) AI Code Editors like Cursor, Windsurf, VS Code (Cline, Continue.dev), Aider CLI, and Claude Code; (2) AI Frameworks like LangChain, CrewAI, AutoGen, and LlamaIndex; (3) Custom apps in Python, Node.js, Next.js, FastAPI, or Go; and (4) Any terminal on macOS, Linux, and Windows using npx ostraops-guard. Setup takes just 30 seconds by pointing your base URL to http://127.0.0.1:8080/v1.',
  },
  {
    id: 'faq-latency',
    category: 'architecture',
    tags: ['speed', 'latency', 'delay', 'fast'],
    question: 'Will OstraOps slow down my AI responses?',
    answer: 'Not at all. OstraOps adds less than 1 to 2 milliseconds of delay, which is invisible to humans. The response streams straight through to your editor, so coding in Cursor or Cline feels just as fast as normal.',
  },
  {
    id: 'faq-free-account',
    category: 'setup',
    tags: ['free', 'pricing', 'signup', 'credit card'],
    question: 'Do I need to sign up or enter a credit card to use it?',
    answer: 'No! You can run "npx ostraops-guard" in your terminal right now without creating an account or entering a credit card. The local tool is completely free for individual developers.',
  },
  {
    id: 'faq-models-supported',
    category: 'architecture',
    tags: ['openai', 'anthropic', 'claude', 'gemini', 'deepseek', 'models'],
    question: 'Which AI providers and models work with OstraOps?',
    answer: 'All major models work out of the box: OpenAI (GPT-4o, o3-mini), Anthropic (Claude 3.7 Sonnet, Haiku), Google Gemini, DeepSeek, Mistral, and even local models via Ollama. If it uses standard OpenAI or Anthropic format, OstraOps supports it.',
  },
  {
    id: 'faq-model-fallback',
    category: 'architecture',
    tags: ['fallback', 'error', 'model down', 'reliability'],
    question: 'What happens if an AI model is down or gives an error?',
    answer: 'If your primary model (like Claude 3.7 Sonnet) is temporarily down or gives a server error, OstraOps can automatically redirect the request to a fallback model from the same provider (like Claude 3.5 Haiku) so your agent doesn\'t crash in the middle of a task.',
  },
  {
    id: 'faq-upgrade-teams',
    category: 'account',
    tags: ['teams', 'enterprise', 'upgrade', 'dashboard'],
    question: 'When should someone upgrade to the Team Gateway?',
    answer: 'If you are coding alone, the free local guard is all you need. But if you lead a team and want shared budgets across multiple developers, centralized company API keys, and a web dashboard to see all API logs in one place, that is when you use our Team Gateway.',
  },
];

interface FAQPageProps {
  onNavigateHome?: () => void;
  onNavigatePricing?: () => void;
  onNavigateSupport?: () => void;
}

export const FAQPage: React.FC<FAQPageProps> = ({
  onNavigateHome,
  onNavigatePricing,
  onNavigateSupport,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openItemIds, setOpenItemIds] = useState<string[]>(['faq-personalized-sdk', 'faq-cli-vs-web']);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'account', label: 'Account & SDK' },
    { id: 'guardrails', label: 'Spending & Limits' },
    { id: 'setup', label: 'Setup & Tools' },
    { id: 'privacy', label: 'Privacy & Security' },
    { id: 'architecture', label: 'Speed & Models' },
  ];

  const filteredItems = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
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
    <div className="min-h-screen bg-[#07090C] text-white pt-28 pb-24 relative overflow-hidden select-none">
      {/* 3D Ambient Radial Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-[#C59E5F]/15 via-[#E5C38D]/5 to-transparent blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-[10%] w-[500px] h-[500px] bg-radial from-[#C59E5F]/10 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Breadcrumb & Navigation Back */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#C59E5F]/40 text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#E5C38D]" />
            <span>Back to Home</span>
          </button>

          <span className="text-xs font-mono text-zinc-500">
            Last Updated: October 2026
          </span>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C59E5F]/10 border border-[#C59E5F]/30 text-xs font-mono font-bold text-[#E5C38D] uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>KNOWLEDGE BASE &amp; FAQ</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-[-0.03em] font-display leading-[1.12]">
            Frequently Asked{' '}
            <span className="gold-gradient-text">Questions.</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about personalized SDKs, spending limits, local privacy, and integrating with your AI workflow.
          </p>
        </div>

        {/* Search Bar & Categories */}
        <div className="max-w-3xl mx-auto mb-10 space-y-4">
          {/* Search Input Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g. personalized SDK, API keys, Cursor, limits, privacy)..."
              aria-label="Search frequently asked questions"
              className="w-full pl-11 pr-14 py-3.5 rounded-2xl bg-[#0B0E14] border border-white/[0.1] text-sm text-zinc-100 placeholder:text-zinc-500 shadow-xl focus:outline-none focus:border-[#C59E5F] focus:ring-1 focus:ring-[#C59E5F] transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400 hover:text-white cursor-pointer px-2 py-1 rounded bg-white/[0.06]"
                aria-label="Clear FAQ search filter"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  aria-label={`Filter by category: ${c.label}`}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeCategory === c.id
                      ? 'bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] text-[#07090C] font-bold shadow-md scale-100'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.08]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
              <button onClick={expandAll} className="hover:text-[#E5C38D] transition-colors cursor-pointer">
                Expand all
              </button>
              <span className="text-zinc-600">•</span>
              <button onClick={collapseAll} className="hover:text-[#E5C38D] transition-colors cursor-pointer">
                Collapse all
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-3xl mx-auto space-y-3.5">
          {filteredItems.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#0B0E14] border border-white/[0.08] text-center space-y-2">
              <p className="text-sm font-bold text-zinc-100">No matching questions found</p>
              <p className="text-xs text-zinc-500 font-mono">
                Try searching for keywords like "sdk", "api key", "limits", or "cursor".
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="mt-3 px-4 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/[0.12] transition-colors cursor-pointer"
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
                      ? 'bg-[#0B0E14] border-[#C59E5F]/50 shadow-[0_0_25px_rgba(197,158,95,0.08)]'
                      : 'bg-[#0B0E14]/80 hover:bg-[#0B0E14] border-white/[0.08] hover:border-white/[0.16]'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    className="w-full px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer transition-colors"
                  >
                    <span className={`text-sm sm:text-base font-bold font-display leading-snug transition-colors ${
                      isOpen ? 'text-white' : 'text-zinc-200 hover:text-white'
                    }`}>
                      {item.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'bg-[#C59E5F]/20 text-[#E5C38D] border border-[#C59E5F]/30 rotate-180'
                          : 'bg-white/[0.06] border border-white/[0.1] text-zinc-400'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 border-t border-white/[0.06] space-y-3">
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                        {item.answer}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 text-[10px] font-mono border border-white/[0.06]"
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
        <div className="max-w-3xl mx-auto mt-12 p-6 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <h4 className="text-sm font-bold text-zinc-100 font-display">
              Still have a question or need integration support?
            </h4>
            <p className="text-xs text-zinc-400">
              Reach out to our engineering team or explore pricing plans.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateSupport}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer"
            >
              Contact Support
            </button>
            <button
              onClick={onNavigatePricing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] text-[#07090C] text-xs font-bold shadow-md hover:scale-[1.02] transition-all cursor-pointer"
            >
              View Pricing
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
