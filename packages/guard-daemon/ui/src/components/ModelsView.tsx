import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  LayoutGrid,
  MoreHorizontal,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Compass,
  Zap,
  FileText,
  Eye,
  Wrench,
  Sparkles,
  Mic,
  Layers,
  Terminal,
  Code2,
  Info,
  Network,
  Cpu,
  Target,
  Award,
  DollarSign,
  Play,
  Copy,
  Edit3,
  Power,
  Plus,
} from 'lucide-react';
import {
  OpenAILogo,
  AnthropicLogo,
  GoogleLogo,
  DeepSeekLogo,
  GrokLogo,
  KimiLogo,
  QwenLogo,
  GLMLogo,
  ProviderIcon,
} from './ProviderLogos';

interface ModelRow {
  id: string;
  name: string;
  provider: string;
  description: string;
  inputPrice: string;
  outputPrice: string;
  contextWindow: string;
  capabilities: string[];
  status: 'Active' | 'Disabled';
  recommended?: boolean;
}

const INITIAL_MODELS: ModelRow[] = [
  // OpenAI
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Best balance of speed, intelligence and cost.',
    inputPrice: '$0.0025 / 1K',
    outputPrice: '$0.01 / 1K',
    contextWindow: '128K',
    capabilities: ['Text', 'Vision', 'Tools'],
    status: 'Active',
    recommended: true,
  },
  {
    id: 'gpt-4-1',
    name: 'GPT-4.1',
    provider: 'OpenAI',
    description: 'Latest flagship model with improved reasoning.',
    inputPrice: '$0.004 / 1K',
    outputPrice: '$0.016 / 1K',
    contextWindow: '1M',
    capabilities: ['Text', 'Vision', 'Tools'],
    status: 'Active',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o-mini',
    provider: 'OpenAI',
    description: 'Fast, affordable, great for everyday tasks.',
    inputPrice: '$0.00015 / 1K',
    outputPrice: '$0.0006 / 1K',
    contextWindow: '128K',
    capabilities: ['Text', 'Vision'],
    status: 'Active',
  },
  {
    id: 'o1-preview',
    name: 'o1-preview',
    provider: 'OpenAI',
    description: 'Advanced reasoning for complex problems.',
    inputPrice: '$0.015 / 1K',
    outputPrice: '$0.06 / 1K',
    contextWindow: '128K',
    capabilities: ['Text', 'Reasoning'],
    status: 'Active',
  },

  // Anthropic
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    description: 'Best for complex reasoning and coding.',
    inputPrice: '$0.003 / 1K',
    outputPrice: '$0.015 / 1K',
    contextWindow: '200K',
    capabilities: ['Text', 'Vision', 'Tools'],
    status: 'Active',
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    description: 'Fast, efficient, great for simple tasks.',
    inputPrice: '$0.0008 / 1K',
    outputPrice: '$0.004 / 1K',
    contextWindow: '200K',
    capabilities: ['Text', 'Tools'],
    status: 'Active',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced performance and intelligence.',
    inputPrice: '$0.003 / 1K',
    outputPrice: '$0.015 / 1K',
    contextWindow: '200K',
    capabilities: ['Text', 'Vision', 'Tools'],
    status: 'Active',
  },

  // Google Gemini
  {
    id: 'gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google Gemini',
    description: 'Best for multimodal and long context.',
    inputPrice: '$0.0035 / 1K',
    outputPrice: '$0.014 / 1K',
    contextWindow: '1M',
    capabilities: ['Text', 'Vision', 'Tools'],
    status: 'Active',
  },
  {
    id: 'gemini-2-5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google Gemini',
    description: 'Fast and cost-effective for high volume.',
    inputPrice: '$0.00015 / 1K',
    outputPrice: '$0.0006 / 1K',
    contextWindow: '1M',
    capabilities: ['Text', 'Vision'],
    status: 'Active',
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google Gemini',
    description: 'Large context, strong performance.',
    inputPrice: '$0.0025 / 1K',
    outputPrice: '$0.01 / 1K',
    contextWindow: '2M',
    capabilities: ['Text', 'Vision', 'Tools'],
    status: 'Active',
  },
];

const PROVIDER_PILLS = [
  { id: 'all', label: 'All Models' },
  { id: 'OpenAI', label: 'OpenAI', Icon: OpenAILogo },
  { id: 'Anthropic', label: 'Anthropic', Icon: AnthropicLogo },
  { id: 'Google Gemini', label: 'Google Gemini', Icon: GoogleLogo },
  { id: 'DeepSeek', label: 'DeepSeek', Icon: DeepSeekLogo },
  { id: 'Grok', label: 'Grok', Icon: GrokLogo },
  { id: 'Kimi', label: 'Kimi', Icon: KimiLogo },
  { id: 'Qwen', label: 'Qwen', Icon: QwenLogo },
  { id: 'GLM', label: 'GLM', Icon: GLMLogo },
];

export const ModelsView: React.FC = () => {
  const [models, setModels] = useState<ModelRow[]>(INITIAL_MODELS);
  const [activeProviderPill, setActiveProviderPill] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>('All Providers');
  const [selectedCapabilityFilter, setSelectedCapabilityFilter] = useState<string>('All Capabilities');
  const [selectedSort, setSelectedSort] = useState<string>('Popular');

  // Dropdown Open States
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  const [isCapabilityDropdownOpen, setIsCapabilityDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Action Menu State
  const [activeMenuModelId, setActiveMenuModelId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Toggle model active status
  const handleToggleStatus = (id: string) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === 'Active' ? 'Disabled' : 'Active' } : m
      )
    );
    setActiveMenuModelId(null);
    showToast(`Model status updated.`);
  };

  // Duplicate model
  const handleDuplicateModel = (model: ModelRow) => {
    const duplicated: ModelRow = {
      ...model,
      id: `${model.id}-copy-${Date.now().toString().slice(-4)}`,
      name: `${model.name} (Copy)`,
    };
    setModels((prev) => [...prev, duplicated]);
    setActiveMenuModelId(null);
    showToast(`Duplicated ${model.name}`);
  };

  // Filtered & Grouped Models
  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      // Provider pill filter
      if (activeProviderPill !== 'all') {
        const normPill = activeProviderPill.toLowerCase();
        const normProvider = m.provider.toLowerCase();
        if (!normProvider.includes(normPill) && !normPill.includes(normProvider)) {
          return false;
        }
      }

      // Secondary Provider dropdown
      if (selectedProviderFilter !== 'All Providers') {
        if (!m.provider.toLowerCase().includes(selectedProviderFilter.toLowerCase())) {
          return false;
        }
      }

      // Secondary Capability dropdown
      if (selectedCapabilityFilter !== 'All Capabilities') {
        const hasCap = m.capabilities.some((c) =>
          c.toLowerCase().includes(selectedCapabilityFilter.toLowerCase())
        );
        if (!hasCap) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.name.toLowerCase().includes(q);
        const matchDesc = m.description.toLowerCase().includes(q);
        const matchProvider = m.provider.toLowerCase().includes(q);
        const matchCap = m.capabilities.some((c) => c.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchProvider && !matchCap) {
          return false;
        }
      }

      return true;
    });
  }, [
    models,
    activeProviderPill,
    selectedProviderFilter,
    selectedCapabilityFilter,
    searchQuery,
  ]);

  // Group by Provider
  const groupedModels = useMemo(() => {
    const groups: { [key: string]: { name: string; count: number; items: ModelRow[] } } = {};

    // Standard order or discovered
    const providerOrder = ['OpenAI', 'Anthropic', 'Google Gemini'];
    providerOrder.forEach((p) => {
      groups[p] = { name: p, count: p === 'OpenAI' ? 8 : p === 'Anthropic' ? 6 : 5, items: [] };
    });

    filteredModels.forEach((m) => {
      const p = m.provider;
      if (!groups[p]) {
        groups[p] = { name: p, count: 1, items: [] };
      }
      groups[p].items.push(m);
    });

    // If activeProviderPill is set to a specific provider without models yet (like DeepSeek, Grok)
    if (
      activeProviderPill !== 'all' &&
      !groups[activeProviderPill] &&
      !filteredModels.some((m) => m.provider === activeProviderPill)
    ) {
      groups[activeProviderPill] = { name: activeProviderPill, count: 0, items: [] };
    }

    return Object.values(groups).filter((g) => g.items.length > 0 || activeProviderPill === g.name);
  }, [filteredModels, activeProviderPill]);

  // Dynamic quick insights counts
  const totalModelsCount = 40 + (models.length - INITIAL_MODELS.length);
  const activeModelsCount = models.filter((m) => m.status === 'Active').length + (38 - INITIAL_MODELS.length);
  const disabledCount = Math.max(0, totalModelsCount - activeModelsCount);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0C2419] text-white px-4 py-2.5 rounded-xl shadow-xl border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header: Cube Badge, Title, Subtitle, and Add Model Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {/* Green 3D Isometric Cube Icon Badge */}
          <div className="w-10 h-10 rounded-xl bg-[#E5F2EB] flex items-center justify-center shrink-0 border border-[#CDE3D5] shadow-2xs mt-0.5">
            <svg
              className="w-5 h-5 text-[#0C2419]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900">
              Models
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-2xl leading-relaxed">
              Explore, compare and manage AI models across all providers. Find the best model for your use case, track pricing, and optimize for performance and cost.
            </p>
          </div>
        </div>

        {/* Official Supported Models Badge */}
        <div className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E5F2EB] border border-[#CDE3D5] text-[#0C2419] text-xs font-semibold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>{totalModelsCount} Supported Models Verified</span>
        </div>
      </div>

      {/* Provider Filter Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PROVIDER_PILLS.map((pill) => {
          const isActive = activeProviderPill === pill.id;
          const Icon = pill.Icon;
          return (
            <button
              key={pill.id}
              onClick={() => setActiveProviderPill(pill.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                isActive
                  ? 'bg-[#0C2419] text-white border-[#0C2419] shadow-xs'
                  : 'bg-white text-charcoal-700 border-[#EAE4D8] hover:bg-[#FAF8F5]'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Controls Bar: Search Input, Dropdowns, and Layout View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search models input */}
          <div className="relative min-w-[320px] flex-1 max-w-xl xl:max-w-2xl">
            <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#EAE4D8] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#0C2419] shadow-2xs font-sans transition-all"
            />
          </div>

          {/* All Providers Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProviderDropdownOpen(!isProviderDropdownOpen);
                setIsCapabilityDropdownOpen(false);
                setIsSortDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#EAE4D8] text-xs font-medium text-charcoal-700 hover:bg-[#FAF8F5] transition-colors shadow-2xs cursor-pointer"
            >
              <span>{selectedProviderFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
            </button>
            {isProviderDropdownOpen && (
              <div className="absolute left-0 mt-1 w-44 bg-white border border-[#EAE4D8] rounded-xl shadow-lg z-30 py-1 text-xs">
                {['All Providers', 'OpenAI', 'Anthropic', 'Google Gemini', 'DeepSeek', 'Grok'].map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setSelectedProviderFilter(p);
                        setIsProviderDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#FAF8F5] text-charcoal-700 cursor-pointer font-medium"
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* All Capabilities Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsCapabilityDropdownOpen(!isCapabilityDropdownOpen);
                setIsProviderDropdownOpen(false);
                setIsSortDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#EAE4D8] text-xs font-medium text-charcoal-700 hover:bg-[#FAF8F5] transition-colors shadow-2xs cursor-pointer"
            >
              <span>{selectedCapabilityFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
            </button>
            {isCapabilityDropdownOpen && (
              <div className="absolute left-0 mt-1 w-48 bg-white border border-[#EAE4D8] rounded-xl shadow-lg z-30 py-1 text-xs">
                {[
                  'All Capabilities',
                  'Text',
                  'Vision',
                  'Tools',
                  'Reasoning',
                  'Audio',
                  'Multimodal',
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedCapabilityFilter(c);
                      setIsCapabilityDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#FAF8F5] text-charcoal-700 cursor-pointer font-medium"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort by: Popular Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsSortDropdownOpen(!isSortDropdownOpen);
                setIsProviderDropdownOpen(false);
                setIsCapabilityDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#EAE4D8] text-xs font-medium text-charcoal-700 hover:bg-[#FAF8F5] transition-colors shadow-2xs cursor-pointer"
            >
              <span>Sort by: {selectedSort}</span>
              <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
            </button>
            {isSortDropdownOpen && (
              <div className="absolute left-0 mt-1 w-48 bg-white border border-[#EAE4D8] rounded-xl shadow-lg z-30 py-1 text-xs">
                {['Popular', 'Price: Low to High', 'Price: High to Low', 'Context: Largest'].map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSelectedSort(s);
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#FAF8F5] text-charcoal-700 cursor-pointer font-medium"
                    >
                      Sort by: {s}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* View mode toggle (Grid/Table view icon) */}
        <div className="flex items-center">
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#E5F2EB] text-[#0C2419] border border-[#CDE3D5] shadow-2xs cursor-pointer"
            title="Grid / Table layout"
          >
            <LayoutGrid className="w-4 h-4 text-emerald-800" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column 8 cols (Grouped Table) + Right Column 4 cols (Insights & Legend) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Grouped Table */}
        <div className="xl:col-span-8">
          <div className="bg-white border border-[#EAE4D8] rounded-2xl shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                {/* Table Column Headers */}
                <thead>
                  <tr className="border-b border-[#EAE4D8] bg-[#FAF8F5] text-[11px] font-semibold text-charcoal-500 select-none">
                    <th className="py-3 px-4 font-semibold w-[220px]">Model</th>
                    <th className="py-3 px-3 font-semibold w-[120px]">Provider</th>
                    <th className="py-3 px-3 font-semibold w-[95px]">Input Price</th>
                    <th className="py-3 px-3 font-semibold w-[95px]">Output Price</th>
                    <th className="py-3 px-3 font-semibold w-[100px]">Context Window</th>
                    <th className="py-3 px-3 font-semibold w-[180px]">Capabilities</th>
                    <th className="py-3 px-3 font-semibold w-[80px]">Status</th>
                    <th className="py-3 px-3 font-semibold w-[50px] text-center">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-[#F2EDE4]">
                  {groupedModels.map((group) => {
                    return (
                      <React.Fragment key={group.name}>
                        {/* Group Header Row */}
                        <tr className="bg-[#FAF8F5]/80 border-t border-[#EAE4D8]">
                          <td colSpan={8} className="py-2.5 px-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ProviderIcon provider={group.name} className="w-4 h-4" />
                                <span className="text-xs font-bold text-charcoal-900">
                                  {group.name}
                                </span>
                                <span className="text-[11px] text-charcoal-400 font-normal">
                                  {group.count} models
                                </span>
                              </div>
                              <button
                                onClick={() => setActiveProviderPill(group.name)}
                                className="text-emerald-700 hover:text-emerald-800 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors hover:underline"
                              >
                                <span>View all</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Group Model Rows */}
                        {group.items.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-4 px-4 text-center text-xs text-charcoal-400">
                              No models matching current filters in this provider.
                            </td>
                          </tr>
                        ) : (
                          group.items.map((model) => {
                            const isMenuOpen = activeMenuModelId === model.id;
                            return (
                              <tr
                                key={model.id}
                                className="hover:bg-[#FAF8F5] transition-colors text-xs text-charcoal-800"
                              >
                                {/* Model Name & Subtitle */}
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-charcoal-900 text-xs">
                                      {model.name}
                                    </span>
                                    {model.recommended && (
                                      <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-[#E5F2EB] text-emerald-800 leading-none">
                                        Recommended
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-charcoal-400 leading-tight mt-0.5">
                                    {model.description}
                                  </div>
                                </td>

                                {/* Provider Column */}
                                <td className="py-3.5 px-3">
                                  <div className="flex items-center gap-1.5 text-xs text-charcoal-700 font-medium">
                                    <ProviderIcon provider={model.provider} className="w-3.5 h-3.5" />
                                    <span>
                                      {model.provider.includes('Google') ? 'Google' : model.provider}
                                    </span>
                                  </div>
                                </td>

                                {/* Input Price */}
                                <td className="py-3.5 px-3 font-mono text-[11.5px] text-charcoal-600">
                                  {model.inputPrice}
                                </td>

                                {/* Output Price */}
                                <td className="py-3.5 px-3 font-mono text-[11.5px] text-charcoal-600">
                                  {model.outputPrice}
                                </td>

                                {/* Context Window */}
                                <td className="py-3.5 px-3 font-mono text-[11.5px] text-charcoal-600">
                                  {model.contextWindow}
                                </td>

                                {/* Capabilities Pills */}
                                <td className="py-3.5 px-3">
                                  <div className="flex flex-wrap items-center gap-1">
                                    {model.capabilities.map((cap) => {
                                      let CapIcon = FileText;
                                      if (cap.toLowerCase().includes('vision')) CapIcon = Eye;
                                      if (cap.toLowerCase().includes('tool')) CapIcon = Wrench;
                                      if (cap.toLowerCase().includes('reason')) CapIcon = Sparkles;
                                      if (cap.toLowerCase().includes('audio')) CapIcon = Mic;

                                      return (
                                        <span
                                          key={cap}
                                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#EAE4D8] text-[10px] text-charcoal-600 font-medium"
                                        >
                                          <CapIcon className="w-2.5 h-2.5 text-charcoal-500" />
                                          <span>{cap}</span>
                                        </span>
                                      );
                                    })}
                                  </div>
                                </td>

                                {/* Status Badge */}
                                <td className="py-3.5 px-3">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${
                                      model.status === 'Active'
                                        ? 'bg-[#E5F2EB] text-emerald-800'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {model.status}
                                  </span>
                                </td>

                                {/* Actions Menu Column */}
                                <td className="py-3.5 px-3 text-center relative">
                                  <button
                                    onClick={() =>
                                      setActiveMenuModelId(isMenuOpen ? null : model.id)
                                    }
                                    className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-charcoal-400 hover:text-charcoal-800 hover:bg-[#F5F2EB] transition-colors cursor-pointer"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>

                                  {/* Row Action Dropdown Popover */}
                                  {isMenuOpen && (
                                    <div className="absolute right-2 mt-1 w-44 bg-white border border-[#EAE4D8] rounded-xl shadow-xl z-40 py-1 text-left animate-in fade-in zoom-in-95 duration-150">
                                      <button
                                        onClick={() => {
                                          showToast(`Opening playground for ${model.name}`);
                                          setActiveMenuModelId(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-charcoal-700 hover:bg-[#FAF8F5] cursor-pointer"
                                      >
                                        <Play className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Test in Playground</span>
                                      </button>
                                      <button
                                        onClick={() => handleDuplicateModel(model)}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-charcoal-700 hover:bg-[#FAF8F5] cursor-pointer"
                                      >
                                        <Copy className="w-3.5 h-3.5 text-charcoal-500" />
                                        <span>Duplicate Model</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          showToast(`Editing ${model.name}`);
                                          setActiveMenuModelId(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-charcoal-700 hover:bg-[#FAF8F5] cursor-pointer"
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-charcoal-500" />
                                        <span>Edit Configuration</span>
                                      </button>
                                      <div className="border-t border-[#F2EDE4] my-1" />
                                      <button
                                        onClick={() => handleToggleStatus(model.id)}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                                      >
                                        <Power className="w-3.5 h-3.5" />
                                        <span>
                                          {model.status === 'Active' ? 'Disable Model' : 'Enable Model'}
                                        </span>
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary Row */}
            <div className="border-t border-[#EAE4D8] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-charcoal-500 bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <Network className="w-3.5 h-3.5 text-charcoal-400" />
                <span className="font-medium">
                  {totalModelsCount} models available across 8 providers
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-charcoal-400 text-[11px]">
                <Info className="w-3 h-3 text-charcoal-400 shrink-0" />
                <span>Prices are estimates and may vary by region and usage tier.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Insights, Top Model Usage, Capabilities Legend, and Optimize Card */}
        <div className="xl:col-span-4 space-y-6">
          {/* Card 1: Quick Insights */}
          <div className="bg-white border border-[#EAE4D8] rounded-2xl p-5 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 text-charcoal-900 font-bold text-xs">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>Quick Insights</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Metric 1 */}
              <div className="bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 text-[11px] font-medium">
                  <div className="w-5 h-5 rounded-md bg-[#E5F2EB] flex items-center justify-center text-[#0C2419]">
                    <Cpu className="w-3 h-3 text-emerald-800" />
                  </div>
                  <span>Total Models</span>
                </div>
                <div className="text-xl font-bold text-charcoal-900">{totalModelsCount}</div>
                <div className="text-[10px] text-charcoal-400">8 providers</div>
              </div>

              {/* Metric 2 */}
              <div className="bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 text-[11px] font-medium">
                  <div className="w-5 h-5 rounded-md bg-[#E5F2EB] flex items-center justify-center text-[#0C2419]">
                    <Target className="w-3 h-3 text-emerald-800" />
                  </div>
                  <span>Active Models</span>
                </div>
                <div className="text-xl font-bold text-charcoal-900">{activeModelsCount}</div>
                <div className="text-[10px] text-charcoal-400">{disabledCount} disabled</div>
              </div>

              {/* Metric 3 */}
              <div className="bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 text-[11px] font-medium">
                  <div className="w-5 h-5 rounded-md bg-[#E5F2EB] flex items-center justify-center text-[#0C2419]">
                    <Award className="w-3 h-3 text-emerald-800" />
                  </div>
                  <span>Most Used</span>
                </div>
                <div className="text-sm font-bold text-charcoal-900 truncate">GPT-4o</div>
                <div className="text-[10px] text-charcoal-400">32% of requests</div>
              </div>

              {/* Metric 4 */}
              <div className="bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 text-[11px] font-medium">
                  <div className="w-5 h-5 rounded-md bg-[#E5F2EB] flex items-center justify-center text-[#0C2419]">
                    <DollarSign className="w-3 h-3 text-emerald-800" />
                  </div>
                  <span>Avg. Cost / 1K</span>
                </div>
                <div className="text-sm font-bold text-charcoal-900">$0.0043</div>
                <div className="text-[10px] text-charcoal-400">across all models</div>
              </div>
            </div>
          </div>

          {/* Card 2: Top Model Usage */}
          <div className="bg-white border border-[#EAE4D8] rounded-2xl p-5 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 text-charcoal-900 font-bold text-xs">
              <BarChart2 className="w-4 h-4 text-emerald-700" />
              <span>Top Model Usage</span>
            </div>

            <div className="space-y-3 pt-1">
              {/* Item 1: GPT-4o 32% */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-charcoal-800">
                    <OpenAILogo className="w-3.5 h-3.5" />
                    <span>GPT-4o</span>
                  </div>
                  <span className="font-semibold text-charcoal-500 text-[11px]">32%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#FAF8F5] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#10B981] transition-all duration-500"
                    style={{ width: '32%' }}
                  />
                </div>
              </div>

              {/* Item 2: Claude 3.7 Sonnet 18% */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-charcoal-800">
                    <AnthropicLogo className="w-3.5 h-3.5" />
                    <span>Claude 3.7 Sonnet</span>
                  </div>
                  <span className="font-semibold text-charcoal-500 text-[11px]">18%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#FAF8F5] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#D97757] transition-all duration-500"
                    style={{ width: '18%' }}
                  />
                </div>
              </div>

              {/* Item 3: Gemini 2.5 Pro 12% */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-charcoal-800">
                    <GoogleLogo className="w-3.5 h-3.5" />
                    <span>Gemini 2.5 Pro</span>
                  </div>
                  <span className="font-semibold text-charcoal-500 text-[11px]">12%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#FAF8F5] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#4285F4] transition-all duration-500"
                    style={{ width: '12%' }}
                  />
                </div>
              </div>

              {/* Item 4: GPT-4o-mini 9% */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-charcoal-800">
                    <OpenAILogo className="w-3.5 h-3.5" />
                    <span>GPT-4o-mini</span>
                  </div>
                  <span className="font-semibold text-charcoal-500 text-[11px]">9%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#FAF8F5] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#10B981] transition-all duration-500"
                    style={{ width: '9%' }}
                  />
                </div>
              </div>

              {/* Item 5: DeepSeek R1 6% */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-charcoal-800">
                    <DeepSeekLogo className="w-3.5 h-3.5" />
                    <span>DeepSeek R1</span>
                  </div>
                  <span className="font-semibold text-charcoal-500 text-[11px]">6%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#FAF8F5] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0066FF] transition-all duration-500"
                    style={{ width: '6%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Capabilities Legend */}
          <div className="bg-white border border-[#EAE4D8] rounded-2xl p-5 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 text-charcoal-900 font-bold text-xs">
              <Compass className="w-4 h-4 text-emerald-700" />
              <span>Capabilities Legend</span>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] text-charcoal-700 pt-1">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                <span>Text generation</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                <span>Reasoning</span>
              </div>

              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                <span>Vision</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                <span>Tools / Function calling</span>
              </div>

              <div className="flex items-center gap-2">
                <Mic className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                <span>Audio</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                <span>Multimodal</span>
              </div>

              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                <span>Code execution</span>
              </div>
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                <span>JSON mode</span>
              </div>
            </div>
          </div>

          {/* Card 4: Optimize Your Model Usage */}
          <div className="relative overflow-hidden bg-white border border-[#EAE4D8] rounded-2xl p-5 shadow-subtle space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#0C2419] flex items-center justify-center text-[#10B981] shadow-xs">
              <Zap className="w-4 h-4 fill-emerald-400" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-charcoal-900 leading-tight">
                Optimize Your Model Usage
              </h4>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Get AI-powered recommendations to reduce costs and improve performance.
              </p>
            </div>

            <button
              onClick={() => showToast('Opening optimization recommendations...')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0C2419] hover:bg-[#143B2A] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span>View Recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Subtle background wave contour lines */}
            <div className="absolute -bottom-6 -right-6 pointer-events-none opacity-25">
              <svg width="180" height="120" viewBox="0 0 180 120" fill="none">
                <path
                  d="M0 80 C 40 40, 100 120, 180 60"
                  stroke="#10B981"
                  strokeWidth="1.5"
                />
                <path
                  d="M10 95 C 50 55, 110 135, 180 75"
                  stroke="#10B981"
                  strokeWidth="1.2"
                />
                <path
                  d="M20 110 C 60 70, 120 150, 180 90"
                  stroke="#10B981"
                  strokeWidth="1"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
