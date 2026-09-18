import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  Check,
  CheckCircle2,
  Shield,
  Info,
  RefreshCw,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { ProviderLogo } from './IntegrationsView';

interface OptimizationOpportunity {
  id: string;
  title: string;
  category: 'Model Downgrade' | 'Semantic Caching' | 'Batch Processing' | 'Prompt Trimming';
  currentModel: string;
  recommendedModel?: string;
  provider: string;
  monthlySavings: string;
  latencyImprovement: string;
  confidenceScore: string;
  impactScope: string;
  description: string;
  applied: boolean;
}

interface HeuristicRule {
  id: string;
  name: string;
  category: string;
  description: string;
  impactEst: string;
  enabled: boolean;
}

export const OptimizationView: React.FC = () => {
  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Opportunities state
  const [opportunities, setOpportunities] = useState<OptimizationOpportunity[]>([
    {
      id: 'opt-1',
      title: 'Downgrade Routine Extraction to Gemini 3.5 Flash',
      category: 'Model Downgrade',
      currentModel: 'GPT-5.6',
      recommendedModel: 'Gemini 3.5 Flash',
      provider: 'Google',
      monthlySavings: '$482.40 / mo',
      latencyImprovement: '-180ms TTFT',
      confidenceScore: '99.4%',
      impactScope: '42,000 calls / week',
      description: 'Telemetry logs show 42,000 weekly calls executing simple key-value regex JSON extraction. Gemini 3.5 Flash handles identical schemas with 0 accuracy degradation at 95% lower cost.',
      applied: false,
    },
    {
      id: 'opt-2',
      title: 'Enable Semantic Prompt Caching on Developer Prompts',
      category: 'Semantic Caching',
      currentModel: 'Claude Sonnet 4.6',
      provider: 'Anthropic',
      monthlySavings: '$394.10 / mo',
      latencyImprovement: '-320ms latency',
      confidenceScore: '98.1%',
      impactScope: '18,500 daily requests',
      description: 'Repeated multi-turn system prompts containing static TypeScript interfaces and design tokens can be cached in the proxy RAM layer, bypassing full provider token generation fees.',
      applied: false,
    },
    {
      id: 'opt-3',
      title: 'Offload Overnight Document Summaries to Batch API',
      category: 'Batch Processing',
      currentModel: 'GPT-5.5',
      provider: 'OpenAI',
      monthlySavings: '$218.00 / mo',
      latencyImprovement: 'Asynchronous (24h window)',
      confidenceScore: '100%',
      impactScope: '1,200 PDF documents / day',
      description: 'End-of-day analytics and log digest jobs do not require real-time streaming. Routing to OpenAI Batch endpoints instantly triggers a 50% discount on all input/output tokens.',
      applied: false,
    },
    {
      id: 'opt-4',
      title: 'Deduplicate Markdown Whitespace and Redundant Schemas',
      category: 'Prompt Trimming',
      currentModel: 'Claude Opus 4.8',
      provider: 'Anthropic',
      monthlySavings: '$154.00 / mo',
      latencyImprovement: '-45ms latency',
      confidenceScore: '99.8%',
      impactScope: '6,400 multi-turn sessions',
      description: 'Prompt tokenizer inspection reveals trailing whitespace, duplicate JSON Schema definitions, and comment headers adding an unnecessary 14% token payload per prompt.',
      applied: false,
    },
  ]);

  // Heuristic Rules state
  const [heuristicRules, setHeuristicRules] = useState<HeuristicRule[]>([
    {
      id: 'rule-1',
      name: 'Dynamic Model Downgrade for Short Queries',
      category: 'Model Routing',
      description: 'Queries with under 200 input tokens and no code syntax are automatically routed to flash/mini model tiers.',
      impactEst: '~18% Cost Reduction',
      enabled: true,
    },
    {
      id: 'rule-2',
      name: 'Proxy-Level Semantic Prefix Caching',
      category: 'Cache Layer',
      description: 'Identical system prompt headers and static context chunks are served directly from RAM cache within 4ms.',
      impactEst: '~28% Cost Reduction',
      enabled: true,
    },
    {
      id: 'rule-3',
      name: 'Automated Thinking Budget Throttle',
      category: 'Reasoning Guard',
      description: 'Enforces a strict 2,048 token upper ceiling on reasoning models (Gemini 3.7 Flash, DeepSeek R1) for non-scientific prompts.',
      impactEst: '~12% Cost Reduction',
      enabled: true,
    },
    {
      id: 'rule-4',
      name: 'Context History Sliding Window Truncation',
      category: 'Context Optimization',
      description: 'Prunes conversation history older than 10 turns while preserving active system state and tool schemas.',
      impactEst: '~15% Cost Reduction',
      enabled: true,
    },
    {
      id: 'rule-5',
      name: 'Batch Queue Auto-Delegation for Background Tasks',
      category: 'Batch Offloading',
      description: 'Headers matching `x-execution-mode: async` are dispatched directly to provider batch pools for 50% discount.',
      impactEst: '~22% Cost Reduction',
      enabled: false,
    },
    {
      id: 'rule-6',
      name: 'Zero-Drop Intelligent Failover Routing',
      category: 'Reliability & Cost',
      description: 'On upstream rate limits (HTTP 429), automatically redirect queries to verified cheaper fallback within 12ms.',
      impactEst: 'High Uptime SLA',
      enabled: true,
    },
  ]);

  // Interactive Simulator state
  const [simSourceModel, setSimSourceModel] = useState('gpt-5-6');
  const [simTargetModel, setSimTargetModel] = useState('gemini-3-8-flash');
  const [simMonthlyTokens, setSimMonthlyTokens] = useState<number>(10); // in Millions

  // Model costs per 1M tokens (input + output average)
  const modelRates: Record<string, { name: string; provider: string; avgPerMillion: number; latencyMs: number; qualityScore: number }> = {
    'gpt-5-6': { name: 'GPT-5.6', provider: 'OpenAI', avgPerMillion: 11.25, latencyMs: 380, qualityScore: 98 },
    'gpt-5-5': { name: 'GPT-5.5', provider: 'OpenAI', avgPerMillion: 7.50, latencyMs: 310, qualityScore: 94 },
    'gpt-5-6-mini': { name: 'GPT-5.6-mini', provider: 'OpenAI', avgPerMillion: 2.00, latencyMs: 190, qualityScore: 90 },
    'claude-opus-4-8': { name: 'Claude Opus 4.8', provider: 'Anthropic', avgPerMillion: 20.00, latencyMs: 440, qualityScore: 99 },
    'claude-sonnet-4-6': { name: 'Claude Sonnet 4.6', provider: 'Anthropic', avgPerMillion: 7.00, latencyMs: 270, qualityScore: 96 },
    'claude-haiku-4-5': { name: 'Claude Haiku 4.5', provider: 'Anthropic', avgPerMillion: 1.00, latencyMs: 140, qualityScore: 88 },
    'gemini-3-8-flash': { name: 'Gemini 3.8 Flash', provider: 'Google', avgPerMillion: 0.375, latencyMs: 180, qualityScore: 95 },
    'gemini-3-7-flash': { name: 'Gemini 3.7 Flash', provider: 'Google', avgPerMillion: 0.30, latencyMs: 190, qualityScore: 93 },
    'gemini-3-5-flash': { name: 'Gemini 3.5 Flash', provider: 'Google', avgPerMillion: 0.20, latencyMs: 160, qualityScore: 89 },
    'mistral-large-3': { name: 'Mistral Large 3', provider: 'Mistral', avgPerMillion: 4.00, latencyMs: 250, qualityScore: 91 },
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApplyOpportunity = (id: string, title: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => (opp.id === id ? { ...opp, applied: true } : opp))
    );
    showToast(`Rule applied: "${title}". Proxy heuristics updated.`);
  };

  const handleToggleRule = (id: string, name: string, currentState: boolean) => {
    setHeuristicRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !currentState } : r))
    );
    showToast(`Policy "${name}" ${!currentState ? 'enabled' : 'disabled'}.`);
  };

  const handleRunScan = () => {
    setIsScanning(true);
    showToast('Running comprehensive heuristic scan on proxy traffic...');
    setTimeout(() => {
      setIsScanning(false);
      showToast('Scan complete: 4 actionable optimization opportunities verified.');
    }, 1800);
  };

  // Simulator calculations
  const simSource = modelRates[simSourceModel] || modelRates['gpt-5-6'];
  const simTarget = modelRates[simTargetModel] || modelRates['gemini-3-8-flash'];
  const sourceMonthlyCost = simMonthlyTokens * simSource.avgPerMillion;
  const targetMonthlyCost = simMonthlyTokens * simTarget.avgPerMillion;
  const netSavingsDollars = Math.max(0, sourceMonthlyCost - targetMonthlyCost);
  const netSavingsPercent = sourceMonthlyCost > 0 ? Math.round((netSavingsDollars / sourceMonthlyCost) * 100) : 0;
  const latencyDelta = simTarget.latencyMs - simSource.latencyMs;

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesSearch =
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.currentModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opp.recommendedModel && opp.recommendedModel.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || opp.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [opportunities, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16 animate-in fade-in duration-150">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-mono flex items-center gap-2 border border-[#3F3F46] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C59E5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. TOP HEADER & TELEMETRY SUMMARY                            */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EAE5DC] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-[#F4EFE6] text-[#9C7938] text-[10px] font-bold font-mono tracking-wider uppercase border border-[#E5DBCA]">
              Cost & Latency Governance
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
              Proxy Engine Active
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-charcoal-900 tracking-tight font-sans">
            AI Spend & Model Optimization
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-3xl">
            Automated model substitution recommendations, prompt token caching telemetry, dynamic thinking budget caps, and proxy-level savings heuristics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-bold font-mono transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C59E5F] ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Traffic...' : 'Run Optimization Scan'}</span>
          </button>
        </div>
      </div>

      {/* Policy Governance Banner */}
      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#9C7938] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-charcoal-600 leading-relaxed font-sans">
          <strong className="text-charcoal-900 font-semibold">Strict Governance Mode:</strong> All optimization rules require explicit policy toggling or verification. OsterdOps never alters upstream prompt payloads or downgrades models silently without your configured rules.
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. NUMERICAL KPI TILES (Strictly Numerical, No Status Bars)  */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tile 1: Projected Monthly Savings */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-charcoal-500 font-bold tracking-wider">
              Projected Monthly Savings
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center text-[#C59E5F]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-black text-charcoal-900 font-mono tracking-tight">
              $1,248.50
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-emerald-700 bg-emerald-50 text-[10px] font-bold font-mono px-1.5 py-0.2 rounded border border-emerald-200">
                +34.2% Saved
              </span>
              <span className="text-[11px] text-charcoal-500 font-mono">across all models</span>
            </div>
          </div>
        </div>

        {/* Tile 2: Cache Acceleration */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-charcoal-500 font-bold tracking-wider">
              Prompt Cache Hit Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center text-charcoal-800">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-black text-charcoal-900 font-mono tracking-tight">
              68.4%
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-emerald-700 bg-emerald-50 text-[10px] font-bold font-mono px-1.5 py-0.2 rounded border border-emerald-200">
                3.8M Tokens
              </span>
              <span className="text-[11px] text-charcoal-500 font-mono">bypassed this month</span>
            </div>
          </div>
        </div>

        {/* Tile 3: Average Latency Reduction */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-charcoal-500 font-bold tracking-wider">
              Latency Improvement
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center text-emerald-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-black text-charcoal-900 font-mono tracking-tight">
              -148ms
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-emerald-700 bg-emerald-50 text-[10px] font-bold font-mono px-1.5 py-0.2 rounded border border-emerald-200">
                Faster TTFT
              </span>
              <span className="text-[11px] text-charcoal-500 font-mono">avg response time</span>
            </div>
          </div>
        </div>

        {/* Tile 4: Active Routing Rules */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-charcoal-500 font-bold tracking-wider">
              Active Optimization Rules
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center text-[#C59E5F]">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-black text-charcoal-900 font-mono tracking-tight">
              5 of 6
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-charcoal-700 bg-[#FAF8F5] text-[10px] font-bold font-mono px-1.5 py-0.2 rounded border border-[#EAE5DC]">
                Policies Enforced
              </span>
              <span className="text-[11px] text-charcoal-500 font-mono">zero silent overrides</span>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. ACTIVE OPTIMIZATION OPPORTUNITIES (ACTIONABLE CARDS)      */}
      {/* ============================================================ */}
      <div className="rounded-2xl bg-white border border-[#EAE5DC] p-6 lg:p-7 shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE5DC] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#9C7938] text-[10px] font-bold font-mono tracking-wider uppercase border border-[#E5DBCA]">
                Verified Recommendations
              </span>
              <span className="text-xs font-mono text-charcoal-500">{filteredOpportunities.length} Available</span>
            </div>
            <h3 className="text-base font-bold text-charcoal-900 font-sans">
              High-Impact Optimization Opportunities
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search opportunities..."
              className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#C59E5F] font-sans"
            />
            {['All', 'Model Downgrade', 'Semantic Caching', 'Batch Processing', 'Prompt Trimming'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#18181B] text-white font-bold'
                    : 'bg-[#FAF8F5] text-charcoal-700 hover:bg-sandstone-200 border border-[#EAE5DC]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of Actionable Opportunity Cards */}
        <div className="space-y-4">
          {filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 ${
                opp.applied
                  ? 'bg-[#FAF8F5]/60 border-emerald-200'
                  : 'bg-white border-[#EAE5DC] hover:border-[#C59E5F] shadow-2xs'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center p-2 shadow-2xs">
                    <ProviderLogo provider={opp.provider} className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#C59E5F]">
                        {opp.category}
                      </span>
                      <span className="text-[10px] font-mono text-charcoal-400">·</span>
                      <span className="text-[10px] font-mono text-charcoal-500">
                        {opp.impactScope}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-charcoal-900 font-sans mt-0.5">
                      {opp.title}
                    </h4>
                  </div>
                </div>

                {/* Savings & Action */}
                <div className="flex items-center gap-3 self-end md:self-auto">
                  <div className="text-right font-mono">
                    <span className="text-sm font-extrabold text-emerald-700 block">
                      {opp.monthlySavings}
                    </span>
                    <span className="text-[10px] text-charcoal-400">
                      {opp.latencyImprovement}
                    </span>
                  </div>

                  {opp.applied ? (
                    <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Applied</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApplyOpportunity(opp.id, opp.title)}
                      className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-mono font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Apply Rule</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#C59E5F]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Description Body */}
              <p className="text-xs text-charcoal-600 leading-relaxed font-sans bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EAE5DC]">
                {opp.description}
              </p>

              {/* Scope & Metric Chips */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono text-charcoal-500">
                <div className="flex items-center gap-3">
                  <span>Current: <strong className="text-charcoal-800">{opp.currentModel}</strong></span>
                  {opp.recommendedModel && (
                    <>
                      <span>→</span>
                      <span>Target: <strong className="text-[#C59E5F]">{opp.recommendedModel}</strong></span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-sandstone-200 text-charcoal-700 text-[10px] font-bold">
                    Confidence: {opp.confidenceScore}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MODEL SUBSTITUTION SIMULATOR (CALCULATOR)                 */}
      {/* ============================================================ */}
      <div className="rounded-2xl bg-white border border-[#EAE5DC] p-6 lg:p-7 shadow-subtle space-y-6">
        <div className="border-b border-[#EAE5DC] pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#9C7938] text-[10px] font-bold font-mono tracking-wider uppercase border border-[#E5DBCA]">
              Interactive Estimator
            </span>
            <span className="text-xs font-mono text-charcoal-500">Real-Time Pricing Model</span>
          </div>
          <h3 className="text-base font-bold text-charcoal-900 font-sans">
            Model Substitution & Savings Calculator
          </h3>
          <p className="text-xs text-charcoal-500 mt-0.5 font-sans">
            Simulate the financial and latency impact of switching models across your production telemetry volume.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Column 1: Source Model & Volume */}
          <div className="space-y-4 p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC]">
            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-charcoal-500 block mb-1.5">
                Baseline Model (Current)
              </label>
              <select
                value={simSourceModel}
                onChange={(e) => setSimSourceModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
              >
                <option value="gpt-5-6">OpenAI · GPT-5.6 ($11.25/M avg)</option>
                <option value="claude-opus-4-8">Anthropic · Claude Opus 4.8 ($20.00/M avg)</option>
                <option value="claude-sonnet-4-6">Anthropic · Claude Sonnet 4.6 ($7.00/M avg)</option>
                <option value="gpt-5-5">OpenAI · GPT-5.5 ($7.50/M avg)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-mono uppercase font-bold text-charcoal-500">
                  Monthly Prompt Volume
                </label>
                <span className="text-xs font-mono font-bold text-charcoal-900">
                  {simMonthlyTokens}M Tokens / mo
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={simMonthlyTokens}
                onChange={(e) => setSimMonthlyTokens(parseInt(e.target.value, 10))}
                className="w-full accent-[#C59E5F] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-charcoal-400 mt-1">
                <span>1M</span>
                <span>25M</span>
                <span>50M Tokens</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#EAE5DC] text-xs font-mono">
              <span className="text-charcoal-500">Current Cost: </span>
              <strong className="text-charcoal-900">${sourceMonthlyCost.toFixed(2)} / mo</strong>
            </div>
          </div>

          {/* Column 2: Target Model */}
          <div className="space-y-4 p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC]">
            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-charcoal-500 block mb-1.5">
                Target Model (Recommended Alternative)
              </label>
              <select
                value={simTargetModel}
                onChange={(e) => setSimTargetModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
              >
                <option value="gemini-3-8-flash">Google · Gemini 3.8 Flash ($0.38/M avg)</option>
                <option value="gemini-3-7-flash">Google · Gemini 3.7 Flash ($0.30/M avg)</option>
                <option value="gemini-3-5-flash">Google · Gemini 3.5 Flash ($0.20/M avg)</option>
                <option value="gpt-5-6-mini">OpenAI · GPT-5.6-mini ($2.00/M avg)</option>
                <option value="claude-haiku-4-5">Anthropic · Claude Haiku 4.5 ($1.00/M avg)</option>
                <option value="mistral-large-3">Mistral · Mistral Large 3 ($4.00/M avg)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#EAE5DC] space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Target Benchmark Score:</span>
                <span className="font-bold text-charcoal-900">{simTarget.qualityScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Expected Latency:</span>
                <span className="font-bold text-charcoal-900">{simTarget.latencyMs}ms TTFT</span>
              </div>
              <div className="flex justify-between border-t border-[#EAE5DC] pt-1.5">
                <span className="text-charcoal-500">Optimized Cost:</span>
                <span className="font-bold text-emerald-700">${targetMonthlyCost.toFixed(2)} / mo</span>
              </div>
            </div>
          </div>

          {/* Column 3: Net Simulated Impact */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#18181B] via-[#27272A] to-[#3F3F46] text-white shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C59E5F] font-bold">
                Projected Net Impact
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                +{netSavingsPercent}% Savings
              </span>
            </div>

            <div>
              <div className="text-3xl lg:text-4xl font-black font-mono tracking-tight text-white">
                ${netSavingsDollars.toFixed(2)}
              </div>
              <span className="text-xs text-white/70 font-mono block mt-0.5">
                Net dollars saved per month
              </span>
            </div>

            <div className="space-y-2 pt-3 border-t border-white/10 text-xs font-mono">
              <div className="flex items-center justify-between text-white/80">
                <span>Latency Shift:</span>
                <span className={latencyDelta <= 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {latencyDelta <= 0 ? `${latencyDelta}ms (Faster)` : `+${latencyDelta}ms`}
                </span>
              </div>

              <div className="flex items-center justify-between text-white/80">
                <span>Quality Retention:</span>
                <span className="text-white font-bold">
                  {Math.round((simTarget.qualityScore / simSource.qualityScore) * 100)}% preserved
                </span>
              </div>
            </div>

            <button
              onClick={() => showToast(`Created substitution policy: Route ${simSource.name} -> ${simTarget.name}`)}
              className="w-full py-2 rounded-xl bg-[#C59E5F] hover:bg-[#b08b4f] text-charcoal-950 text-xs font-mono font-bold transition-all cursor-pointer shadow-xs"
            >
              Deploy Substitution Rule
            </button>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. AUTONOMOUS HEURISTIC RULES MATRIX                         */}
      {/* ============================================================ */}
      <div className="rounded-2xl bg-white border border-[#EAE5DC] p-6 lg:p-7 shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE5DC] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#9C7938] text-[10px] font-bold font-mono tracking-wider uppercase border border-[#E5DBCA]">
                Proxy Policies
              </span>
              <span className="text-xs font-mono text-charcoal-500">Autonomous Gateways</span>
            </div>
            <h3 className="text-base font-bold text-charcoal-900 font-sans">
              Proxy Heuristic Enforcement Rules
            </h3>
          </div>

          <span className="text-xs font-mono text-charcoal-500">
            Rules apply globally across all API vault keys
          </span>
        </div>

        <div className="divide-y divide-[#EAE5DC]">
          {heuristicRules.map((rule) => (
            <div key={rule.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-sm font-bold text-charcoal-900 font-sans">
                    {rule.name}
                  </h4>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-[#FAF8F5] text-charcoal-600 border border-[#EAE5DC]">
                    {rule.category}
                  </span>
                </div>
                <p className="text-xs text-charcoal-500 font-sans leading-relaxed">
                  {rule.description}
                </p>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto flex-shrink-0">
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {rule.impactEst}
                </span>

                {/* Toggle switch without status bars */}
                <button
                  onClick={() => handleToggleRule(rule.id, rule.name, rule.enabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    rule.enabled ? 'bg-[#18181B]' : 'bg-[#EAE5DC]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                      rule.enabled ? 'translate-x-5.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. RECENT OPTIMIZATION AUDIT LOG                             */}
      {/* ============================================================ */}
      <div className="rounded-2xl bg-white border border-[#EAE5DC] p-6 lg:p-7 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#9C7938] text-[10px] font-bold font-mono tracking-wider uppercase border border-[#E5DBCA]">
                Audit Telemetry
              </span>
              <span className="text-xs font-mono text-charcoal-500">Live Stream</span>
            </div>
            <h3 className="text-base font-bold text-charcoal-900 font-sans">
              Automated Optimization Execution Ledger
            </h3>
          </div>

          <button
            onClick={() => showToast('Exporting optimization execution ledger to CSV...')}
            className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] hover:border-charcoal-400 text-charcoal-800 text-xs font-mono font-bold transition-all cursor-pointer"
          >
            Export Ledger
          </button>
        </div>

        <div className="divide-y divide-[#EAE5DC] font-mono text-xs">
          {[
            { time: 'Just now', action: 'Prompt Cache Hit', model: 'Claude Sonnet 4.6', tokens: '4,120 cached', savings: '$0.05', latency: '4ms' },
            { time: '12m ago', action: 'Auto-Downgrade Applied', model: 'GPT-5.6 -> GPT-5.6-nano', tokens: '1,890 tokens', savings: '$0.02', latency: '82ms' },
            { time: '45m ago', action: 'Whitespace Deduplication', model: 'Claude Opus 4.8', tokens: '1,420 trimmed', savings: '$0.04', latency: '210ms' },
            { time: '2h ago', action: 'Batch Endpoint Offload', model: 'GPT-5.5 (Batch API)', tokens: '420,000 tokens', savings: '$18.40', latency: 'Async' },
            { time: '4h ago', action: 'Thinking Budget Capped', model: 'Gemini 3.7 Flash', tokens: '2,048 max thinking', savings: '$0.12', latency: '290ms' },
          ].map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between hover:bg-sandstone-100 p-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <div>
                  <span className="font-bold text-charcoal-900 block font-sans">{item.action}</span>
                  <span className="text-charcoal-500 text-[11px]">{item.model} · {item.tokens}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-emerald-700 font-bold block">Saved {item.savings}</span>
                <span className="text-charcoal-400 text-[10px]">{item.time} · {item.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
