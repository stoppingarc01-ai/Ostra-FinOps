import React, { useState, useMemo } from 'react';
import {
  Search,
  Cpu,
  Zap,
  Shield,
  Info,
  SlidersHorizontal,
  X,
  Layers,
  Sparkles,
  Clock,
  CheckCircle2,
  FileText,
  Activity
} from 'lucide-react';
import { CATALOG_MODELS, ProviderLogo, type ModelIntegration } from './IntegrationsView';

export const ModelsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'context' | 'cost-asc' | 'cost-desc' | 'name'>('recommended');
  const [activeDetailModel, setActiveDetailModel] = useState<ModelIntegration | null>(null);

  // Providers list
  const providers = ['All', 'Google', 'OpenAI', 'Anthropic', 'Mistral', 'xAI', 'DeepSeek', 'Meta', 'Qwen', 'Cohere'];

  // Popular capability tags for fast filtering
  const capabilityTags = [
    'All',
    'Long-Horizon SWE',
    'Autonomous Agents',
    'Agentic Reasoning',
    'Thinking Budget',
    'Computer Use',
    'Vision',
    'Sub-150ms',
    'Edge / On-Device',
    'EU Sovereign',
    'STEM Reasoning'
  ];

  // Helper to parse numeric context size for sorting
  const parseContextTokens = (ctx: string): number => {
    const clean = ctx.replace(/[^0-9]/g, '');
    const num = parseInt(clean, 10) || 0;
    if (ctx.toLowerCase().includes('m')) return num * 1000000;
    if (ctx.toLowerCase().includes('k')) return num * 1000;
    return num;
  };

  // Helper to parse input cost for sorting
  const parseInputCost = (costStr: string): number => {
    const match = costStr.match(/\$([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Filter & Sort models
  const filteredModels = useMemo(() => {
    return CATALOG_MODELS.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.modelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesProvider =
        selectedProvider === 'All' || m.provider.toLowerCase() === selectedProvider.toLowerCase();

      const matchesTag =
        selectedTag === 'All' || m.tags.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase()));

      return matchesSearch && matchesProvider && matchesTag;
    }).sort((a, b) => {
      if (sortBy === 'context') {
        return parseContextTokens(b.contextWindow) - parseContextTokens(a.contextWindow);
      }
      if (sortBy === 'cost-asc') {
        return parseInputCost(a.tokenCost) - parseInputCost(b.tokenCost);
      }
      if (sortBy === 'cost-desc') {
        return parseInputCost(b.tokenCost) - parseInputCost(a.tokenCost);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // Recommended: Showcases & flagships first
      if (a.isShowcase && !b.isShowcase) return -1;
      if (!a.isShowcase && b.isShowcase) return 1;
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return 0;
    });
  }, [searchQuery, selectedProvider, selectedTag, sortBy]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16 animate-in fade-in duration-150">
      
      {/* ============================================================ */}
      {/* 1. HEADER & OVERVIEW BANNER                                  */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EAE5DC] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-[#F4EFE6] text-[#9C7938] text-[10px] font-bold font-mono tracking-wider uppercase border border-[#E5DBCA]">
              Foundation Model Intelligence
            </span>
            <span className="text-[11px] font-mono text-charcoal-500 bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#EAE5DC]">
              Catalog Reference Directory · Read Only
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-charcoal-900 tracking-tight font-sans">
            AI Models & Specifications
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-3xl">
            Explore technical limits, official logos, context capacities, input/output token pricing, and failover pathways across all 40 supported enterprise foundation models.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#F5F2EB] border border-[#EAE5DC] text-right">
            <span className="text-[10px] uppercase font-mono text-charcoal-400 font-bold block">
              Active Models
            </span>
            <span className="text-sm font-extrabold text-charcoal-900 font-mono">
              {filteredModels.length} of {CATALOG_MODELS.length} Cataloged
            </span>
          </div>
        </div>
      </div>

      {/* Notice Banner: Pure Model Reference */}
      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#9C7938] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-charcoal-600 leading-relaxed font-sans">
          <strong className="text-charcoal-900 font-semibold">Model Specifications Only:</strong> This view serves as a technical benchmark directory and comparison catalog. Integration forms and credential management are decoupled to maintain clean governance.
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TOP METRICS STRIP                                         */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#EAE5DC] shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-charcoal-500 font-bold block">
              Total Models
            </span>
            <div className="text-2xl font-black text-charcoal-900 font-mono mt-0.5">40</div>
            <span className="text-[10px] font-mono text-charcoal-400">Strictly active, zero retired</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center text-[#C59E5F]">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#EAE5DC] shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-charcoal-500 font-bold block">
              Provider Families
            </span>
            <div className="text-2xl font-black text-charcoal-900 font-mono mt-0.5">9</div>
            <span className="text-[10px] font-mono text-charcoal-400">Google, OpenAI, Anthropic + 6 more</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center text-charcoal-800">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#EAE5DC] shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-charcoal-500 font-bold block">
              Max Context Window
            </span>
            <div className="text-2xl font-black text-charcoal-900 font-mono mt-0.5">4.2M</div>
            <span className="text-[10px] font-mono text-charcoal-400">Gemini 3.1 Pro monorepo ingestion</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center text-[#C59E5F]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#EAE5DC] shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-charcoal-500 font-bold block">
              Lowest Entry Floor
            </span>
            <div className="text-2xl font-black text-charcoal-900 font-mono mt-0.5">$0.03</div>
            <span className="text-[10px] font-mono text-charcoal-400">per 1M input tokens</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center text-emerald-700">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. SEARCH, PROVIDER FILTERS & SORT CONTROLS                  */}
      {/* ============================================================ */}
      <div className="rounded-2xl bg-white border border-[#EAE5DC] p-5 shadow-subtle space-y-4">
        
        {/* Search & Sort Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by model name, ID, provider, or tags..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#C59E5F] font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-charcoal-400 hidden sm:block" />
            <span className="text-xs font-mono text-charcoal-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-mono text-charcoal-800 focus:outline-none focus:border-[#C59E5F]"
            >
              <option value="recommended">Featured / Flagships First</option>
              <option value="context">Context Window (Largest First)</option>
              <option value="cost-asc">Input Cost (Lowest First)</option>
              <option value="cost-desc">Input Cost (Highest First)</option>
              <option value="name">Model Name (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Provider Tabs with Vector Logos */}
        <div className="space-y-1.5 pt-1 border-t border-[#EAE5DC]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-400 block">
            Filter by Provider
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {providers.map((prov) => {
              const isSelected = selectedProvider === prov;
              return (
                <button
                  key={prov}
                  onClick={() => setSelectedProvider(prov)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#18181B] text-white shadow-xs font-bold'
                      : 'bg-[#FAF8F5] text-charcoal-700 hover:bg-sandstone-200 border border-[#EAE5DC]'
                  }`}
                >
                  {prov !== 'All' && (
                    <div className="w-3.5 h-3.5 flex items-center justify-center">
                      <ProviderLogo provider={prov} className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <span>{prov}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Capability Tags Row */}
        <div className="space-y-1.5 pt-1 border-t border-[#EAE5DC]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-400 block">
            Filter by Capability
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {capabilityTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#F4EFE6] text-[#9C7938] font-bold border border-[#E5DBCA]'
                      : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sandstone-100'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. MODELS GRID (SHOWCASE & ALL CATALOG MODELS)               */}
      {/* ============================================================ */}
      {filteredModels.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#EAE5DC] space-y-3">
          <Cpu className="w-8 h-8 text-charcoal-400 mx-auto" />
          <h3 className="text-base font-bold text-charcoal-900 font-sans">No matching models found</h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            Try adjusting your search keywords or switching provider filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedProvider('All');
              setSelectedTag('All');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#18181B] text-white text-xs font-mono font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModels.map((model) => {
            return (
              <div
                key={model.id}
                className={`rounded-2xl bg-white border p-5 shadow-subtle hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  model.isShowcase
                    ? 'border-[#C59E5F] ring-1 ring-[#C59E5F]/30 bg-gradient-to-b from-[#FAF8F5] to-white'
                    : 'border-[#EAE5DC]'
                }`}
              >
                {/* Card Top: Provider Logo & Badges */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center p-1.5 shadow-2xs">
                        <ProviderLogo provider={model.provider} className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-500 block">
                          {model.provider}
                        </span>
                        <h3 className="text-base font-bold text-charcoal-900 font-sans leading-tight">
                          {model.name}
                        </h3>
                      </div>
                    </div>

                    {/* Special Feature Pill */}
                    {model.badgeLabel ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider bg-[#18181B] text-white">
                        {model.badgeLabel}
                      </span>
                    ) : model.isPopular ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider bg-[#F4EFE6] text-[#9C7938] border border-[#E5DBCA]">
                        Popular
                      </span>
                    ) : model.isFastest ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Ultra-Fast
                      </span>
                    ) : null}
                  </div>

                  {/* Model ID in Monospace */}
                  <div className="inline-block px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#EAE5DC] text-[10px] font-mono text-charcoal-600 font-semibold">
                    {model.modelId}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-charcoal-600 leading-relaxed font-sans line-clamp-3">
                    {model.description}
                  </p>
                </div>

                {/* Key Technical Specifications Table */}
                <div className="space-y-3 pt-3 border-t border-[#EAE5DC]">
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAE5DC]">
                    <div>
                      <span className="text-[10px] text-charcoal-400 block uppercase">Context Window</span>
                      <span className="font-bold text-charcoal-900">{model.contextWindow}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-charcoal-400 block uppercase">Token Cost (In/Out)</span>
                      <span className="font-bold text-charcoal-900">{model.tokenCost}</span>
                    </div>
                  </div>

                  {/* Failover and Tag Indicators */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-charcoal-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-[#C59E5F]" />
                      <span>Failover: <strong className="text-charcoal-800">{model.fallback}</strong></span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Active
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {model.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-sandstone-100 text-charcoal-700 text-[10px] font-mono border border-sandstone-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {model.tags.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded bg-sandstone-100 text-charcoal-500 text-[10px] font-mono">
                        +{model.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Read-Only Details Action (NO INTEGRATE BUTTON) */}
                  <button
                    onClick={() => setActiveDetailModel(model)}
                    className="w-full py-2 rounded-xl bg-[#F5F2EB] hover:bg-[#EAE5DC] text-charcoal-900 text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#E5DBCA]"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#C59E5F]" />
                    <span>View Specifications</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. READ-ONLY MODEL SPECIFICATIONS MODAL                      */}
      {/* ============================================================ */}
      {activeDetailModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#EAE5DC] w-full max-w-2xl rounded-2xl shadow-2xl p-6 lg:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EAE5DC] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center p-2.5 shadow-2xs">
                  <ProviderLogo provider={activeDetailModel.provider} className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase text-[#C59E5F]">
                      {activeDetailModel.provider}
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.2 rounded border border-emerald-200 font-bold">
                      Verified Foundation Model
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-charcoal-900 font-sans mt-0.5">
                    {activeDetailModel.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveDetailModel(null)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center text-charcoal-600 hover:text-charcoal-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Model Architecture Info */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-charcoal-400 font-bold block">
                Description & Recommended Workflows
              </span>
              <p className="text-xs text-charcoal-700 leading-relaxed font-sans bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EAE5DC]">
                {activeDetailModel.description}
              </p>
            </div>

            {/* Technical Parameters Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <span className="text-[10px] text-charcoal-400 block uppercase">Context Limit</span>
                <span className="font-bold text-charcoal-900">{activeDetailModel.contextWindow}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <span className="text-[10px] text-charcoal-400 block uppercase">Token Cost (1M)</span>
                <span className="font-bold text-charcoal-900">{activeDetailModel.tokenCost}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <span className="text-[10px] text-charcoal-400 block uppercase">Intra-Family Failover</span>
                <span className="font-bold text-charcoal-900">{activeDetailModel.fallback}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <span className="text-[10px] text-charcoal-400 block uppercase">Model Identifier</span>
                <span className="font-bold text-charcoal-900 text-[11px] truncate block">
                  {activeDetailModel.modelId}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <span className="text-[10px] text-charcoal-400 block uppercase">Streaming Protocol</span>
                <span className="font-bold text-charcoal-900">SSE Chunked</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <span className="text-[10px] text-charcoal-400 block uppercase">Structured Output</span>
                <span className="font-bold text-emerald-700">Strict JSON Mode</span>
              </div>
            </div>

            {/* Modalities & Capabilities */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-charcoal-400 font-bold block">
                Validated Capabilities & Modalities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeDetailModel.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC] text-charcoal-800 text-xs font-mono font-medium flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#C59E5F]" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Architecture Failover Topology Notice */}
            <div className="p-3.5 rounded-xl bg-[#F4EFE6] border border-[#E5DBCA] text-xs font-mono space-y-1 text-charcoal-800">
              <div className="flex items-center gap-2 font-bold text-[#9C7938]">
                <Activity className="w-4 h-4" />
                <span>Zero-Drop Intelligent Failover Architecture</span>
              </div>
              <p className="text-[11px] text-charcoal-600 font-sans leading-relaxed">
                If {activeDetailModel.name} experiences provider rate limits (HTTP 429) or momentary upstream timeouts, OstraOps automatically reroutes pending inference requests to <strong>{activeDetailModel.fallback}</strong> within 12ms.
              </p>
            </div>

            {/* Modal Footer (Strictly Read-Only, Close Button Only) */}
            <div className="pt-3 border-t border-[#EAE5DC] flex items-center justify-between text-xs text-charcoal-500 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                <span>Catalog sync updated May 2026</span>
              </span>
              <button
                onClick={() => setActiveDetailModel(null)}
                className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-bold font-mono transition-all cursor-pointer"
              >
                Close Specifications
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
