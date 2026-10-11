import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Info,
  Minus,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { CATALOG_MODELS, ProviderLogo, type ModelIntegration } from './IntegrationsView';

export const ModelsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'context' | 'cost-asc' | 'cost-desc' | 'name'>('recommended');
  const [activeDetailModel, setActiveDetailModel] = useState<ModelIntegration | null>(null);
  const [isClosingDetail, setIsClosingDetail] = useState(false);
  const [isDetailMaximized, setIsDetailMaximized] = useState(false);

  const handleCloseDetail = () => {
    setIsClosingDetail(true);
    setTimeout(() => {
      setActiveDetailModel(null);
      setIsClosingDetail(false);
      setIsDetailMaximized(false);
    }, 200);
  };

  const handleOpenDetail = (model: ModelIntegration) => {
    setIsClosingDetail(false);
    setActiveDetailModel(model);
  };

  // Scroll lock and ESC key listener for clean modal display
  useEffect(() => {
    if (activeDetailModel) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCloseDetail();
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [activeDetailModel]);

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
    <div className="space-y-8 select-none text-zinc-100">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <p className="text-xs font-semibold text-[#E5C38D] uppercase tracking-wider mb-1 font-mono">
            Model Directory &amp; Pricing
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            Compare AI Models &amp; Real Token Costs
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Real prices, context limits, and honest speed ratings across {CATALOG_MODELS.length} popular foundation models. No marketing hype or hidden fees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-right">
            <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold block">
              Catalog
            </span>
            <span className="text-sm font-extrabold text-[#E5C38D] font-mono">
              {filteredModels.length} Models Available
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Stats Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/[0.08] shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
              Active Models
            </span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{CATALOG_MODELS.length}</div>
            <span className="text-[10px] font-mono text-zinc-500">Claude, GPT, Kimi &amp; more</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#07090C] border border-white/[0.08] flex items-center justify-center text-[#E5C38D]">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/[0.08] shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
              AI Providers
            </span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{providers.length > 1 ? providers.length - 1 : 10}</div>
            <span className="text-[10px] font-mono text-zinc-500">Zero vendor lock-in</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#07090C] border border-white/[0.08] flex items-center justify-center text-zinc-300">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/[0.08] shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
              Max Context Window
            </span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">4.2M</div>
            <span className="text-[10px] font-mono text-zinc-500">Tokens per single prompt</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#07090C] border border-white/[0.08] flex items-center justify-center text-[#E5C38D]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/[0.08] shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
              Starting Input Price
            </span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">$0.03</div>
            <span className="text-[10px] font-mono text-zinc-500">per 1M input tokens</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#07090C] border border-white/[0.08] flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by model name, provider, or capability..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#07090C] border border-white/[0.1] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#C59E5F] font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
            <span className="text-xs font-mono text-zinc-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#07090C] border border-white/[0.1] text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#C59E5F]"
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
        <div className="space-y-1.5 pt-1 border-t border-white/[0.08]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
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
                      ? 'bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] text-[#07090C] shadow-xs font-bold'
                      : 'bg-[#07090C] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08]'
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
                    ? 'bg-[#C59E5F]/20 text-[#E5C38D] border border-[#C59E5F]/40 font-bold'
                    : 'bg-[#07090C] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08]'
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
        <div className="p-12 text-center rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-3">
          <Info className="w-8 h-8 text-zinc-500 mx-auto" />
          <h3 className="text-base font-bold text-white font-sans">No matching models found</h3>
          <p className="text-xs text-zinc-400">Try changing your search terms or resetting the provider filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedProvider('All');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] text-[#07090C] font-bold text-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          key={`${selectedProvider}-${selectedCategory}-${sortBy}`}
          className="tab-transition-enter grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredModels.map((model) => (
            <div
              key={model.id}
              className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/50 shadow-2xl transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Provider Logo + Model Name */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#07090C] border border-white/[0.08] flex items-center justify-center p-2 shrink-0">
                      <ProviderLogo provider={model.provider} className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase block">
                        {model.provider}
                      </span>
                      <h3 className="text-sm font-bold text-white font-sans group-hover:text-[#E5C38D] transition-colors">
                        {model.name}
                      </h3>
                    </div>
                  </div>

                  {model.badgeLabel && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30 uppercase shrink-0">
                      {model.badgeLabel.split('•')[0].trim()}
                    </span>
                  )}
                </div>

                {/* Plain Human Description */}
                <p className="text-xs text-zinc-400 leading-relaxed font-sans line-clamp-3 mb-4">
                  {model.description}
                </p>

                {/* Key Specifications Strip */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#07090C] p-2.5 rounded-xl border border-white/[0.08] mb-3">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Context Size</span>
                    <span className="font-bold text-white">{model.contextWindow}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Price per 1M</span>
                    <span className="font-bold text-[#E5C38D]">{model.tokenCost}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {model.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06] text-[10px] font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button: View Specs Modal */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenDetail(model);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-gradient-to-r hover:from-[#C59E5F] hover:to-[#E5C38D] hover:text-[#07090C] text-zinc-200 border border-white/[0.1] hover:border-transparent text-xs font-semibold font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs group/btn"
              >
                <span>View Full Model Details</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E5C38D] group-hover/btn:text-[#07090C] transition-colors" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 5. Clean Model Details Modal (MacBook Style Window & React Portal) */}
      {activeDetailModel && typeof document !== 'undefined' && createPortal(
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md ${
            isClosingDetail ? 'mac-backdrop-leave' : 'mac-backdrop-enter'
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseDetail();
          }}
        >
          <div className="relative w-full flex items-center justify-center">
            <div className="mac-window-ambient-glow" />
            <div
              className={`bg-[#0B0E14] border border-white/[0.14] w-full ${
                isDetailMaximized ? 'max-w-4xl max-h-[94vh]' : 'max-w-2xl max-h-[90vh]'
              } rounded-[24px] mac-window-frame overflow-hidden flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] text-zinc-100 ${
                isClosingDetail ? 'mac-window-leave' : 'mac-window-enter'
              }`}
            >
              {/* Modal Titlebar (MacBook Style) */}
            <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-[#07090C] select-none">
              <div className="flex items-center gap-3">
                {/* Traffic Lights */}
                <div className="flex items-center gap-2 group/modallights">
                  <button
                    type="button"
                    onClick={handleCloseDetail}
                    title="Close Window (Esc)"
                    className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/70 flex items-center justify-center cursor-pointer mac-traffic-light"
                  >
                    <X className="w-2 h-2 text-black/80 opacity-0 group-hover/modallights:opacity-100 transition-opacity" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseDetail}
                    title="Minimize"
                    className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/70 flex items-center justify-center cursor-pointer mac-traffic-light"
                  >
                    <Minus className="w-2 h-2 text-black/80 opacity-0 group-hover/modallights:opacity-100 transition-opacity" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDetailMaximized(!isDetailMaximized)}
                    title={isDetailMaximized ? "Restore Size" : "Expand Window"}
                    className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/70 flex items-center justify-center cursor-pointer mac-traffic-light"
                  >
                    {isDetailMaximized ? (
                      <Minimize2 className="w-2 h-2 text-black/80 opacity-0 group-hover/modallights:opacity-100 transition-opacity" />
                    ) : (
                      <Maximize2 className="w-2 h-2 text-black/80 opacity-0 group-hover/modallights:opacity-100 transition-opacity" />
                    )}
                  </button>
                </div>

                <div className="h-4 w-px bg-white/[0.1] hidden sm:block mx-0.5" />

                <div className="w-6 h-6 rounded-lg bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center text-[#E5C38D] shrink-0">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white font-sans tracking-tight">
                    {activeDetailModel.name} — Technical Specifications
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-[10px] font-mono text-zinc-400">
                  esc
                </kbd>
                <button
                  type="button"
                  onClick={handleCloseDetail}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title="Close Window"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 lg:p-7 space-y-5 overflow-y-auto flex-1">
              {/* Model Header */}
              <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#07090C] border border-white/[0.08] flex items-center justify-center p-2.5 shadow-2xs">
                    <ProviderLogo provider={activeDetailModel.provider} className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase text-[#E5C38D]">
                        {activeDetailModel.provider}
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                        Available for Tracking
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white font-sans mt-0.5">
                      {activeDetailModel.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Description in Plain Human Language */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-zinc-300 uppercase font-mono">Overview:</span>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans bg-[#07090C] p-3.5 rounded-xl border border-white/[0.08]">
                  {activeDetailModel.description}
                </p>
              </div>

              {/* Detailed Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#07090C] border border-white/[0.08] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                    Context Window
                  </span>
                  <span className="text-sm font-extrabold text-white font-mono block">
                    {activeDetailModel.contextWindow}
                  </span>
                  <span className="text-[10px] text-zinc-400 block leading-tight">
                    Total prompt &amp; completion memory
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#07090C] border border-white/[0.08] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                    Official Pricing
                  </span>
                  <span className="text-sm font-extrabold text-[#E5C38D] font-mono block">
                    {activeDetailModel.tokenCost}
                  </span>
                  <span className="text-[10px] text-zinc-400 block leading-tight">
                    Per 1M input / output tokens
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#07090C] border border-white/[0.08] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                    Recommended Fallback
                  </span>
                  <span className="text-sm font-extrabold text-zinc-200 font-mono block">
                    {activeDetailModel.fallback}
                  </span>
                  <span className="text-[10px] text-zinc-400 block leading-tight">
                    If rate-limited or unavailable
                  </span>
                </div>
              </div>

              {/* What OstraOps Tracks for this Model */}
              <div className="space-y-2 border-t border-white/[0.08] pt-4">
                <span className="text-xs font-bold text-white font-sans block">
                  How OstraOps Manages Calls to {activeDetailModel.name}:
                </span>
                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Live Cost Calculation:</strong> Tally input and output tokens accurately with official provider prices.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Budget Threshold Warning:</strong> Get alerted before you reach your monthly spending target.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Complete Privacy:</strong> Your prompt contents and completions are never stored on external servers.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-white/[0.08] p-4 bg-[#07090C] flex justify-end">
              <button
                type="button"
                onClick={handleCloseDetail}
                className="px-5 py-2 rounded-xl bg-white/[0.08] text-white text-xs font-semibold hover:bg-white/[0.14] border border-white/[0.1] transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}
    </div>
  );
};
