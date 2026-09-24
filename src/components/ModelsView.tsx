import React, { useState, useMemo } from 'react';
import {
  Search,
  Cpu,
  Zap,
  Shield,
  SlidersHorizontal,
  X,
  Layers,
  Sparkles,
  Clock,
  CheckCircle2,
  Activity,
  Copy,
  Check,
  Code2,
  Plus,
  AlertCircle,
  Filter,
  CheckSquare,
  BookmarkCheck
} from 'lucide-react';
import { CATALOG_MODELS, ProviderLogo, type ModelIntegration } from './IntegrationsView';

export const ModelsView: React.FC = () => {
  const MAX_MODELS = 5;
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ostraops_selected_models');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 5);
      }
    } catch {}
    return ['gemini-3-8-flash', 'gpt-4o', 'claude-3-7-sonnet'];
  });
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const [showOnlySelected, setShowOnlySelected] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'context' | 'cost-asc' | 'cost-desc' | 'name'>('recommended');
  const [activeDetailModel, setActiveDetailModel] = useState<ModelIntegration | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'snippet' | 'specs'>('snippet');
  const [snippetLang, setSnippetLang] = useState<'typescript' | 'javascript' | 'python'>('typescript');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleModelSelection = (modelId: string) => {
    if (selectedModelIds.includes(modelId)) {
      const updated = selectedModelIds.filter((id) => id !== modelId);
      setSelectedModelIds(updated);
      try { localStorage.setItem('ostraops_selected_models', JSON.stringify(updated)); } catch {}
      setLimitWarning(null);
    } else {
      if (selectedModelIds.length >= MAX_MODELS) {
        setLimitWarning(`Limit reached! You can select a maximum of ${MAX_MODELS} models in your active stack. Please deselect a model first.`);
        setTimeout(() => setLimitWarning(null), 5000);
        return;
      }
      const updated = [...selectedModelIds, modelId];
      setSelectedModelIds(updated);
      try { localStorage.setItem('ostraops_selected_models', JSON.stringify(updated)); } catch {}
      setLimitWarning(null);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const generateSnippet = (model: ModelIntegration, lang: 'typescript' | 'javascript' | 'python'): string => {
    const modelId = model.modelId;
    const p = model.provider.toLowerCase();

    if (lang === 'python') {
      if (p === 'anthropic') {
        return `# File: src/ai/claude.py
# Run: pip install ostraops anthropic
from anthropic import Anthropic
from ostraops import track

client = Anthropic()

def ask_claude(prompt: str):
    """Executes call wrapped in OstraOps spend & latency guard."""
    with track("${modelId}"):
        return client.messages.create(
            model="${modelId}",
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}],
        )
`;
      }
      if (p === 'google') {
        return `# File: src/ai/gemini.py
# Run: pip install ostraops google-genai
from google import genai
from ostraops import track

client = genai.Client()

def ask_gemini(prompt: str):
    """Executes call wrapped in OstraOps spend & latency guard."""
    with track("${modelId}"):
        return client.models.generate_content(
            model="${modelId}",
            contents=prompt,
        )
`;
      }
      const baseUrlLine = p === 'deepseek'
        ? '    base_url="https://api.deepseek.com",\n'
        : p === 'mistral'
        ? '    base_url="https://api.mistral.ai/v1",\n'
        : p === 'xai'
        ? '    base_url="https://api.x.ai/v1",\n'
        : p === 'meta'
        ? '    base_url="https://api.groq.com/openai/v1",\n'
        : p === 'qwen'
        ? '    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",\n'
        : p === 'cohere'
        ? '    base_url="https://api.cohere.com/v2",\n'
        : '';

      return `# File: src/ai/${model.id}.py
# Run: pip install ostraops openai
from openai import OpenAI
from ostraops import track

client = OpenAI(
${baseUrlLine})

def run_query(prompt: str):
    """Executes call wrapped in OstraOps spend & latency guard."""
    with track("${modelId}"):
        return client.chat.completions.create(
            model="${modelId}",
            messages=[{"role": "user", "content": prompt}],
        )
`;
    }

    const isTs = lang === 'typescript';

    if (p === 'anthropic') {
      return `// File: src/ai/${model.id}.${isTs ? 'ts' : 'js'}
// Run: npm install ostraops-guard @anthropic-ai/sdk
import Anthropic from '@anthropic-ai/sdk';
import { track } from 'ostraops-guard';

const anthropic = new Anthropic();

export async function askClaude(prompt${isTs ? ': string' : ''}) {
  // Wrapped in OstraOps - automatically tracks token cost, velocity & limits spend
  return track('${modelId}', async () => {
    return anthropic.messages.create({
      model: '${modelId}',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });
  });
}
`;
    }

    if (p === 'google') {
      return `// File: src/ai/${model.id}.${isTs ? 'ts' : 'js'}
// Run: npm install ostraops-guard @google/genai
import { GoogleGenAI } from '@google/genai';
import { track } from 'ostraops-guard';

const ai = new GoogleGenAI();

export async function askGemini(prompt${isTs ? ': string' : ''}) {
  // Wrapped in OstraOps - automatically tracks token cost, velocity & limits spend
  return track('${modelId}', async () => {
    return ai.models.generateContent({
      model: '${modelId}',
      contents: prompt,
    });
  });
}
`;
    }

    const baseUrlOption = p === 'deepseek'
      ? "  baseURL: 'https://api.deepseek.com',\n  apiKey: process.env.DEEPSEEK_API_KEY,\n"
      : p === 'mistral'
      ? "  baseURL: 'https://api.mistral.ai/v1',\n  apiKey: process.env.MISTRAL_API_KEY,\n"
      : p === 'xai'
      ? "  baseURL: 'https://api.x.ai/v1',\n  apiKey: process.env.XAI_API_KEY,\n"
      : p === 'meta'
      ? "  baseURL: 'https://api.groq.com/openai/v1',\n  apiKey: process.env.GROQ_API_KEY,\n"
      : p === 'qwen'
      ? "  baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',\n  apiKey: process.env.DASHSCOPE_API_KEY,\n"
      : p === 'cohere'
      ? "  baseURL: 'https://api.cohere.com/v2',\n  apiKey: process.env.COHERE_API_KEY,\n"
      : '';

    return `// File: src/ai/${model.id}.${isTs ? 'ts' : 'js'}
// Run: npm install ostraops-guard openai
import OpenAI from 'openai';
import { track } from 'ostraops-guard';

const openai = new OpenAI({
${baseUrlOption}});

export async function askModel(prompt${isTs ? ': string' : ''}) {
  // Wrapped in OstraOps - automatically tracks token cost, velocity & limits spend
  return track('${modelId}', async () => {
    return openai.chat.completions.create({
      model: '${modelId}',
      messages: [{ role: 'user', content: prompt }],
    });
  });
}
`;
  };

  const generateCombinedStack = (ids: string[], lang: 'typescript' | 'python' = 'typescript'): string => {
    const activeModels = CATALOG_MODELS.filter((m) => ids.includes(m.id));
    if (activeModels.length === 0) return '// No models selected. Pick up to 5 models from the catalog.';

    if (lang === 'python') {
      return `# File: src/ai/guard_stack.py
# OstraOps Guard Stack — ${activeModels.length}/${MAX_MODELS} Active Models Configured
# Run: pip install ostraops
from ostraops import track

${activeModels.map((m) => {
  const safeFn = m.id.replace(/-/g, '_');
  return `def run_${safeFn}(prompt: str, client_call=None):
    """${m.name} (${m.provider}) | Cost: ${m.tokenCost}"""
    with track("${m.modelId}"):
        if client_call:
            return client_call(prompt)
        return {"model": "${m.modelId}", "prompt": prompt, "status": "guarded"}`;
}).join('\n\n')}
`;
    }

    return `// File: src/ai/guard-stack.ts
// OstraOps Guard Stack — ${activeModels.length}/${MAX_MODELS} Active Models Configured
// Run: npm i ostraops-guard
import { track } from 'ostraops-guard';

${activeModels.map((m) => {
  const safeFn = m.id.replace(/-/g, '_');
  return `/**
 * ${m.name} (${m.provider})
 * Cost: ${m.tokenCost} | Context: ${m.contextWindow}
 */
export async function run_${safeFn}(prompt: string, clientCall?: (p: string) => Promise<any>) {
  return track('${m.modelId}', async () => {
    if (clientCall) return clientCall(prompt);
    return { model: '${m.modelId}', prompt, status: 'guarded' };
  });
};`;
}).join('\n\n')}
`;
  };

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

      const matchesSelected = !showOnlySelected || selectedModelIds.includes(m.id);

      return matchesSearch && matchesProvider && matchesTag && matchesSelected;
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
  }, [searchQuery, selectedProvider, selectedTag, sortBy, selectedModelIds, showOnlySelected]);

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

      {/* Notice Banner: Drop-In Snippets */}
      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
          <Code2 className="w-4 h-4" />
        </div>
        <div className="text-xs text-charcoal-700 leading-relaxed font-sans">
          <strong className="text-charcoal-900 font-semibold">Zero-Plugin Developer Workflow:</strong> No IDE extensions or VSIX setup required. Simply install <code className="px-1.5 py-0.5 rounded bg-sandstone-200 text-charcoal-900 font-mono text-[11px]">ostraops-guard</code> (or <code className="px-1.5 py-0.5 rounded bg-sandstone-200 text-charcoal-900 font-mono text-[11px]">pip install ostraops</code>), copy any model wrapper snippet below into your project folder (e.g. <code className="px-1.5 py-0.5 rounded bg-sandstone-200 text-charcoal-900 font-mono text-[11px]">src/ai/model.ts</code>), and start monitoring token velocity & spend immediately.
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1.5 ACTIVE MODEL STACK TRAY (MAX 5 MODELS SELECTION)         */}
      {/* ============================================================ */}
      <div className="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-charcoal-900 text-[#C59E5F] flex items-center justify-center">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-charcoal-900">
                  Your Active Model Stack
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                  selectedModelIds.length >= MAX_MODELS
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {selectedModelIds.length} / {MAX_MODELS} Selected
                </span>
                {selectedModelIds.length >= MAX_MODELS && (
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                    Max Limit Reached
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-500">
                Pick up to 5 models for your workspace stack. Every selected model has an automated drop-in tracking snippet.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOnlySelected(!showOnlySelected)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showOnlySelected
                  ? 'bg-charcoal-900 text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-charcoal-700 hover:bg-[#F0ECE4] border border-[#EAE5DC]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{showOnlySelected ? 'Show All Models' : `Show Selected (${selectedModelIds.length})`}</span>
            </button>

            <button
              onClick={() => copyToClipboard(generateCombinedStack(selectedModelIds, 'typescript'), 'combined-stack')}
              className="px-3.5 py-1.5 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Copy all active model wrappers into one guard-stack.ts file"
            >
              {copiedKey === 'combined-stack' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Stack!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C59E5F]" />
                  <span>Copy Stack File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Limit Warning Alert */}
        {limitWarning && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{limitWarning}</span>
            </div>
            <button
              onClick={() => setLimitWarning(null)}
              className="text-amber-700 hover:text-amber-900 cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* 5 Slots Display */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {Array.from({ length: MAX_MODELS }).map((_, slotIdx) => {
            const modelId = selectedModelIds[slotIdx];
            const model = modelId ? CATALOG_MODELS.find((m) => m.id === modelId) : null;

            if (model) {
              return (
                <div
                  key={model.id}
                  className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DBCA] flex items-center justify-between gap-2 transition-all hover:border-[#C59E5F]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white border border-[#EAE5DC] flex items-center justify-center p-1 shrink-0">
                      <ProviderLogo provider={model.provider} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-charcoal-900 truncate">
                        {model.name}
                      </div>
                      <div className="text-[10px] font-mono text-charcoal-500 truncate">
                        {model.modelId}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setActiveDetailModel(model);
                        setActiveModalTab('snippet');
                      }}
                      className="p-1 rounded-lg hover:bg-white text-charcoal-600 hover:text-[#C59E5F] transition-colors cursor-pointer"
                      title="View Snippet"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleModelSelection(model.id)}
                      className="p-1 rounded-lg hover:bg-red-50 text-charcoal-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove from stack"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`empty-slot-${slotIdx}`}
                className="p-3 rounded-xl border border-dashed border-[#DDD7CD] bg-[#FAF8F5]/60 flex items-center justify-center gap-2 text-xs font-mono text-charcoal-400 select-none"
              >
                <Plus className="w-3.5 h-3.5 text-charcoal-300" />
                <span>Slot {slotIdx + 1} (Available)</span>
              </div>
            );
          })}
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
            const isSelected = selectedModelIds.includes(model.id);
            const isAtMax = selectedModelIds.length >= MAX_MODELS && !isSelected;

            return (
              <div
                key={model.id}
                className={`rounded-2xl bg-white border p-5 shadow-subtle hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-gradient-to-b from-emerald-50/20 to-white'
                    : model.isShowcase
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

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
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

                      {/* Select / Active Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleModelSelection(model.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : isAtMax
                            ? 'bg-[#FAF8F5] text-charcoal-400 border border-[#EAE5DC] hover:border-amber-300'
                            : 'bg-[#FAF8F5] text-charcoal-700 hover:bg-[#F0ECE4] border border-[#EAE5DC]'
                        }`}
                        title={
                          isSelected
                            ? 'Active in stack (Click to remove)'
                            : isAtMax
                            ? 'Stack full (Max 5 models reached)'
                            : 'Add to active stack (Max 5)'
                        }
                      >
                        {isSelected ? (
                          <>
                            <CheckSquare className="w-3 h-3 text-white" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 text-[#C59E5F]" />
                            <span>{isAtMax ? 'Limit 5' : 'Select'}</span>
                          </>
                        )}
                      </button>
                    </div>
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

                  {/* Action Buttons: Quick Copy Snippet + View Code & Specs */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        copyToClipboard(generateSnippet(model, 'typescript'), `card-${model.id}`);
                      }}
                      className="py-2 px-2.5 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      title="Quick Copy TypeScript Drop-in Snippet"
                    >
                      {copiedKey === `card-${model.id}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#C59E5F]" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setActiveDetailModel(model);
                        setActiveModalTab('snippet');
                      }}
                      className="py-2 px-2.5 rounded-xl bg-[#F5F2EB] hover:bg-[#EAE5DC] text-charcoal-900 text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#E5DBCA]"
                    >
                      <Code2 className="w-3.5 h-3.5 text-[#C59E5F]" />
                      <span>Snippets</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. INTERACTIVE DROP-IN SNIPPET & SPECIFICATIONS MODAL        */}
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

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleModelSelection(activeDetailModel.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedModelIds.includes(activeDetailModel.id)
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : selectedModelIds.length >= MAX_MODELS
                      ? 'bg-[#FAF8F5] text-charcoal-400 border border-[#EAE5DC]'
                      : 'bg-charcoal-900 text-white hover:bg-black shadow-xs'
                  }`}
                  title={
                    selectedModelIds.includes(activeDetailModel.id)
                      ? 'In Active Stack (Click to remove)'
                      : selectedModelIds.length >= MAX_MODELS
                      ? 'Stack is full (Max 5 models reached)'
                      : 'Add to Active Stack'
                  }
                >
                  {selectedModelIds.includes(activeDetailModel.id) ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-white" />
                      <span>In Active Stack</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-[#C59E5F]" />
                      <span>{selectedModelIds.length >= MAX_MODELS ? 'Stack Full (5/5)' : 'Add to Stack'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setActiveDetailModel(null)}
                  className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center text-charcoal-600 hover:text-charcoal-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Tabs: Drop-in Snippet vs Specifications */}
            <div className="flex items-center gap-2 border-b border-[#EAE5DC] pb-3">
              <button
                onClick={() => setActiveModalTab('snippet')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeModalTab === 'snippet'
                    ? 'bg-charcoal-900 text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-charcoal-600 hover:text-charcoal-900 border border-[#EAE5DC]'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-[#C59E5F]" />
                <span>Drop-in Code Snippet</span>
              </button>
              <button
                onClick={() => setActiveModalTab('specs')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeModalTab === 'specs'
                    ? 'bg-charcoal-900 text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-charcoal-600 hover:text-charcoal-900 border border-[#EAE5DC]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Specifications & Limits</span>
              </button>
            </div>

            {activeModalTab === 'snippet' ? (
              <div className="space-y-4">
                {/* 3-Step Quickstart Guide */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-3">
                  <span className="text-[11px] font-mono uppercase font-bold text-charcoal-500 block">
                    Zero-Friction 3-Step Integration
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                    {/* Step 1 */}
                    <div className="p-2.5 rounded-xl bg-white border border-[#EAE5DC] space-y-1.5">
                      <span className="text-[10px] text-[#C59E5F] font-bold block">STEP 1: INSTALL</span>
                      <div className="flex items-center justify-between text-[11px] text-charcoal-800 bg-[#FAF8F5] p-1.5 rounded-lg border border-[#EAE5DC]">
                        <span className="truncate">{snippetLang === 'python' ? 'pip install ostraops' : 'npm i ostraops-guard'}</span>
                        <button
                          onClick={() => copyToClipboard(snippetLang === 'python' ? 'pip install ostraops' : 'npm i ostraops-guard', 'modal-pkg')}
                          className="text-charcoal-500 hover:text-charcoal-900 ml-1 cursor-pointer"
                          title="Copy install command"
                        >
                          {copiedKey === 'modal-pkg' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="p-2.5 rounded-xl bg-white border border-[#EAE5DC] space-y-1.5">
                      <span className="text-[10px] text-[#C59E5F] font-bold block">STEP 2: CREATE FILE</span>
                      <div className="flex items-center justify-between text-[11px] text-charcoal-800 bg-[#FAF8F5] p-1.5 rounded-lg border border-[#EAE5DC]">
                        <span className="truncate">src/ai/{activeDetailModel.id}.{snippetLang === 'python' ? 'py' : snippetLang === 'javascript' ? 'js' : 'ts'}</span>
                        <button
                          onClick={() => copyToClipboard(`src/ai/${activeDetailModel.id}.${snippetLang === 'python' ? 'py' : snippetLang === 'javascript' ? 'js' : 'ts'}`, 'modal-path')}
                          className="text-charcoal-500 hover:text-charcoal-900 ml-1 cursor-pointer"
                          title="Copy file path"
                        >
                          {copiedKey === 'modal-path' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="p-2.5 rounded-xl bg-white border border-[#EAE5DC] space-y-1.5">
                      <span className="text-[10px] text-[#C59E5F] font-bold block">STEP 3: PASTE & RUN</span>
                      <div className="text-[11px] text-charcoal-600 bg-[#FAF8F5] p-1.5 rounded-lg border border-[#EAE5DC] truncate">
                        track('{activeDetailModel.modelId}')
                      </div>
                    </div>
                  </div>
                </div>

                {/* Language Switcher and Copy Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE5DC]">
                    {(['typescript', 'javascript', 'python'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSnippetLang(lang)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          snippetLang === lang
                            ? 'bg-charcoal-900 text-white shadow-xs'
                            : 'text-charcoal-600 hover:text-charcoal-900'
                        }`}
                      >
                        {lang === 'typescript' ? 'TypeScript' : lang === 'javascript' ? 'JavaScript' : 'Python'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => copyToClipboard(generateSnippet(activeDetailModel, snippetLang), 'modal-snippet')}
                    className="px-3 py-1.5 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedKey === 'modal-snippet' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied Snippet!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#C59E5F]" />
                        <span>Copy Snippet</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Code Container */}
                <div className="relative p-4 rounded-2xl bg-[#0C1519] border border-[#3A3534] font-mono text-xs shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-[#243138] text-[11px] text-[#A69C95]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      <span className="ml-2 font-mono text-white/70">src/ai/{activeDetailModel.id}.{snippetLang === 'python' ? 'py' : snippetLang === 'javascript' ? 'js' : 'ts'}</span>
                    </div>
                    <span className="text-[10px] text-[#CF9D7B] uppercase font-mono">Ready to Paste</span>
                  </div>
                  <pre className="pt-3 text-[#F5EFEB] overflow-x-auto whitespace-pre leading-relaxed select-all">
                    {generateSnippet(activeDetailModel, snippetLang)}
                  </pre>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero IDE Extension dependency. Works directly in Cursor, VS Code, WebStorm, Neovim & CI/CD.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
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
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#EAE5DC] flex items-center justify-between text-xs text-charcoal-500 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                <span>Catalog sync updated May 2026</span>
              </span>
              <button
                onClick={() => setActiveDetailModel(null)}
                className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-bold font-mono transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
