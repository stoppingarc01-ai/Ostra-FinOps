import React, { useState, useMemo } from 'react';
import {
  Search,
  Cpu,
  Zap,
  SlidersHorizontal,
  X,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Info
} from 'lucide-react';
import { CATALOG_MODELS, ProviderLogo, type ModelIntegration } from './IntegrationsView';

export const ModelsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'context' | 'cost-asc' | 'cost-desc' | 'name'>('recommended');
  const [activeDetailModel, setActiveDetailModel] = useState<ModelIntegration | null>(null);

  const providers = useMemo(() => {
    const set = new Set<string>();
    CATALOG_MODELS.forEach((m) => set.add(m.provider));
    return ['All', ...Array.from(set)];
  }, []);

  const categories = [
    'All',
    'Fast & Low-Cost',
    'General Purpose',
    'Complex Reasoning & Coding',
    'Large Context'
  ];

  const parseCost = (tokenCost: string): number => {
    try {
      const parts = tokenCost.replace(/\$/g, '').split('/');
      return parseFloat(parts[0].trim()) || 0;
    } catch {
      return 0;
    }
  };

  const parseContext = (contextWindow: string): number => {
    try {
      const lower = contextWindow.toLowerCase();
      if (lower.includes('m')) {
        return parseFloat(lower.replace('m', '').replace('tokens', '').trim()) * 1000;
      }
      return parseFloat(lower.replace('k', '').replace('tokens', '').trim()) || 0;
    } catch {
      return 0;
    }
  };

  const filteredModels = useMemo(() => {
    let list = [...CATALOG_MODELS];

    if (selectedProvider !== 'All') {
      list = list.filter((m) => m.provider.toLowerCase() === selectedProvider.toLowerCase());
    }

    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Fast & Low-Cost') {
        list = list.filter((m) => parseCost(m.tokenCost) < 1.0 || m.isFastest);
      } else if (selectedCategory === 'Complex Reasoning & Coding') {
        list = list.filter((m) => m.tags.some(t => t.toLowerCase().includes('reasoning') || t.toLowerCase().includes('coding') || t.toLowerCase().includes('swe')));
      } else if (selectedCategory === 'Large Context') {
        list = list.filter((m) => parseContext(m.contextWindow) >= 500);
      } else if (selectedCategory === 'General Purpose') {
        list = list.filter((m) => parseCost(m.tokenCost) >= 1.0 && parseCost(m.tokenCost) <= 5.0);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          m.modelId.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'cost-asc') return parseCost(a.tokenCost) - parseCost(b.tokenCost);
      if (sortBy === 'cost-desc') return parseCost(b.tokenCost) - parseCost(a.tokenCost);
      if (sortBy === 'context') return parseContext(b.contextWindow) - parseContext(a.contextWindow);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // Recommended default
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return 0;
    });

    return list;
  }, [selectedProvider, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-8 select-none">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE5DC] pb-6">
        <div>
          <p className="text-xs font-semibold text-ostraGold-700 uppercase tracking-wider mb-1 font-mono">
            Model Directory &amp; Pricing
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight font-sans">
            Compare AI Models &amp; Real Token Costs
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-2xl leading-relaxed">
            Real prices, context limits, and honest speed ratings across 40 popular foundation models. No marketing hype or hidden fees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#F5F2EB] border border-[#EAE5DC] text-right">
            <span className="text-[10px] uppercase font-mono text-charcoal-400 font-bold block">
              Catalog
            </span>
            <span className="text-sm font-extrabold text-charcoal-900 font-mono">
              {filteredModels.length} Models Available
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Stats Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#EAE5DC] shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-charcoal-500 font-bold block">
              Active Models
            </span>
            <div className="text-2xl font-black text-charcoal-900 font-mono mt-0.5">40</div>
            <span className="text-[10px] font-mono text-charcoal-400">Claude, GPT, Gemini &amp; more</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center text-ostraGold-600">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#EAE5DC] shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-charcoal-500 font-bold block">
              AI Providers
            </span>
            <div className="text-2xl font-black text-charcoal-900 font-mono mt-0.5">9</div>
            <span className="text-[10px] font-mono text-charcoal-400">Zero vendor lock-in</span>
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
            <span className="text-[10px] font-mono text-charcoal-400">Tokens per single prompt</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center text-ostraGold-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#EAE5DC] shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-charcoal-500 font-bold block">
              Starting Input Price
            </span>
            <div className="text-2xl font-black text-charcoal-900 font-mono mt-0.5">$0.03</div>
            <span className="text-[10px] font-mono text-charcoal-400">per 1M input tokens</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center text-emerald-700">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="rounded-2xl bg-white border border-[#EAE5DC] p-5 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by model name, provider, or capability..."
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
              <option value="recommended">Recommended / Flagships First</option>
              <option value="cost-asc">Lowest Cost First</option>
              <option value="cost-desc">Highest Cost First</option>
              <option value="context">Largest Context Window</option>
              <option value="name">Alphabetical (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Provider Filter Tabs */}
        <div className="space-y-1.5 pt-1 border-t border-[#EAE5DC]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-400 block">
            Filter by Provider:
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
                    <ProviderLogo provider={prov} className="w-3.5 h-3.5" />
                  )}
                  <span>{prov}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-ostraGold-500 text-charcoal-950 font-bold'
                    : 'bg-sandstone-100 text-charcoal-600 hover:bg-sandstone-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Model Cards Grid */}
      {filteredModels.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#EAE5DC] space-y-3">
          <Info className="w-8 h-8 text-charcoal-400 mx-auto" />
          <h3 className="text-base font-bold text-charcoal-900 font-sans">No matching models found</h3>
          <p className="text-xs text-charcoal-500">Try changing your search terms or resetting the provider filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedProvider('All');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl bg-charcoal-900 text-white text-xs font-medium"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              className="p-5 rounded-2xl bg-white border border-[#EAE5DC] hover:border-ostraGold-500/60 shadow-subtle hover:shadow-card-3d transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Provider Logo + Model Name */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center p-2 shrink-0">
                      <ProviderLogo provider={model.provider} className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-charcoal-400 font-bold uppercase block">
                        {model.provider}
                      </span>
                      <h3 className="text-sm font-bold text-charcoal-900 font-sans group-hover:text-ostraGold-700 transition-colors">
                        {model.name}
                      </h3>
                    </div>
                  </div>

                  {model.badgeLabel && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase shrink-0">
                      {model.badgeLabel.split('•')[0].trim()}
                    </span>
                  )}
                </div>

                {/* Plain Human Description */}
                <p className="text-xs text-charcoal-600 leading-relaxed font-sans line-clamp-3 mb-4">
                  {model.description}
                </p>

                {/* Key Specifications Strip */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAE5DC] mb-3">
                  <div>
                    <span className="text-[10px] text-charcoal-400 block uppercase font-bold">Context Size</span>
                    <span className="font-bold text-charcoal-900">{model.contextWindow}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-400 block uppercase font-bold">Price per 1M</span>
                    <span className="font-bold text-charcoal-900">{model.tokenCost}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {model.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-sandstone-100 text-charcoal-600 text-[10px] font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button: View Specs Modal */}
              <button
                onClick={() => setActiveDetailModel(model)}
                className="w-full py-2.5 px-3 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-semibold font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>View Full Model Details</span>
                <ArrowRight className="w-3.5 h-3.5 text-ostraGold-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 5. Clean Model Details Modal (Zero Snippet Generator) */}
      {activeDetailModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#EAE5DC] w-full max-w-2xl rounded-2xl shadow-2xl p-6 lg:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#EAE5DC] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center p-2.5 shadow-2xs">
                  <ProviderLogo provider={activeDetailModel.provider} className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase text-ostraGold-700">
                      {activeDetailModel.provider}
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      Available for Tracking
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-900 font-sans mt-0.5">
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

            {/* Description in Plain Human Language */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-charcoal-900 uppercase font-mono">Overview:</span>
              <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed font-sans bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EAE5DC]">
                {activeDetailModel.description}
              </p>
            </div>

            {/* Detailed Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white border border-[#EAE5DC] space-y-1">
                <span className="text-[10px] font-mono uppercase text-charcoal-400 font-bold block">
                  Context Window
                </span>
                <span className="text-sm font-extrabold text-charcoal-900 font-mono block">
                  {activeDetailModel.contextWindow}
                </span>
                <span className="text-[10px] text-charcoal-500 block leading-tight">
                  Total prompt &amp; completion memory
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#EAE5DC] space-y-1">
                <span className="text-[10px] font-mono uppercase text-charcoal-400 font-bold block">
                  Official Pricing
                </span>
                <span className="text-sm font-extrabold text-charcoal-900 font-mono block">
                  {activeDetailModel.tokenCost}
                </span>
                <span className="text-[10px] text-charcoal-500 block leading-tight">
                  Per 1M input / output tokens
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#EAE5DC] space-y-1">
                <span className="text-[10px] font-mono uppercase text-charcoal-400 font-bold block">
                  Recommended Fallback
                </span>
                <span className="text-sm font-extrabold text-charcoal-900 font-mono block">
                  {activeDetailModel.fallback}
                </span>
                <span className="text-[10px] text-charcoal-500 block leading-tight">
                  If rate-limited or unavailable
                </span>
              </div>
            </div>

            {/* What OstraOps Tracks for this Model */}
            <div className="space-y-2 border-t border-[#EAE5DC] pt-4">
              <span className="text-xs font-bold text-charcoal-900 font-sans block">
                How OstraOps Manages Calls to {activeDetailModel.name}:
              </span>
              <div className="space-y-2 text-xs text-charcoal-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Live Cost Calculation:</strong> Tally input and output tokens accurately with official provider prices.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Budget Threshold Warning:</strong> Get alerted before you reach your monthly spending target.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Complete Privacy:</strong> Your prompt contents and completions are never stored on external servers.</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#EAE5DC] pt-4 flex justify-end">
              <button
                onClick={() => setActiveDetailModel(null)}
                className="px-5 py-2 rounded-xl bg-charcoal-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
