import React, { useState, useMemo } from 'react';
import {
  Search,
  Check,
  Copy,
  Layers,
  Key,
  ShieldCheck,
  Activity,
  Plus,
  ArrowUpRight,
  X,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  Lock
} from 'lucide-react';

// ============================================================
// OFFICIAL AI PROVIDER VECTOR LOGOS (All 9 Provider Families)
// ============================================================

export const OpenAILogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.5-2.9A6.07 6.07 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zm-9.02 12.61a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.8.8 0 0 0 .4-.68v-6.74l2.01 1.17a.07.07 0 0 1 .04.05v5.59a4.5 4.5 0 0 1-4.49 4.49zm-9.66-4.13a4.47 4.47 0 0 1-.54-3.01l.15.08 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.65zM2.34 7.9a4.49 4.49 0 0 1 2.37-1.98v5.68a.77.77 0 0 0 .38.68l5.82 3.35-2.02 1.17a.08.08 0 0 1-.07 0L4.82 14A4.5 4.5 0 0 1 2.34 7.9zm16.6 3.85L13.1 8.36 15.12 7.2a.08.08 0 0 1 .07 0l4.83 2.79a4.5 4.5 0 0 1-.67 8.1v-5.67a.8.8 0 0 0-.41-.67zm2.01-3.02l-.14-.08-4.78-2.79a.78.78 0 0 0-.78 0L9.41 9.23V6.9a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66zM8.31 12.86l-2.02-1.16a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.79 2.76a.8.8 0 0 0-.39.68zm1.1-2.36l2.6-1.5 2.6 1.5v3l-2.6 1.5-2.6-1.5z"
      fill="#18181B"
    />
  </svg>
);

export const GoogleLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export const AnthropicLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <path
      d="M51 76H41L37 63H19.5L15.5 76H5.5L25.5 24H35.5L51 76ZM33.5 53L28.2 36.8L23 53H33.5Z"
      fill="#18181B"
    />
    <path
      d="M59.5 24H70.5L94.5 76H83.5L59.5 24Z"
      fill="#CC785C"
    />
  </svg>
);

export const MetaLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M16.7 4C14.7 4 13 5.3 12 6.7C11 5.3 9.3 4 7.3 4C3.5 4 0.5 7.2 0.5 11.4C0.5 15.6 3.6 20 7.3 20C9.6 20 11.2 18.6 12 17.2C12.8 18.6 14.4 20 16.7 20C20.4 20 23.5 15.6 23.5 11.4C23.5 7.2 20.5 4 16.7 4ZM7.3 17C4.8 17 2.8 13.9 2.8 11.4C2.8 8.7 4.7 6.4 7.3 6.4C9.2 6.4 10.6 8 11.4 9.8C10.5 12.3 9.2 17 7.3 17ZM16.7 17C14.8 17 13.5 12.3 12.6 9.8C13.4 8 14.8 6.4 16.7 6.4C19.3 6.4 21.2 8.7 21.2 11.4C21.2 13.9 19.2 17 16.7 17Z"
      fill="#0081FB"
    />
  </svg>
);

export const DeepSeekLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <path
      d="M84 25C79 21 72 21 68 25C65 28 64 32 64 37C58 32 50 30 42 32C28 35 18 47 18 61C18 72 26 80 37 80C50 80 62 72 68 62C72 56 74 48 74 42C78 45 84 45 88 41C92 37 92 30 84 25Z"
      fill="#3366FF"
    />
    <path
      d="M74 27C78 20 86 18 92 21C94 22 93 25 90 27C84 31 78 30 74 27Z"
      fill="#3366FF"
    />
    <path
      d="M86 36C91 38 94 43 92 47C90 49 87 48 85 45C83 41 84 38 86 36Z"
      fill="#3366FF"
    />
    <path
      d="M23 61C23 71 31 78 41 78C51 78 61 71 66 61C62 67 53 72 44 72C33 72 26 65 24 55C23 57 23 59 23 61Z"
      fill="#6B93FF"
    />
    <circle cx="36" cy="48" r="3.2" fill="white" />
  </svg>
);

export const MistralLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <rect x="12" y="18" width="7" height="64" fill="#18181B" />
    <rect x="81" y="18" width="7" height="64" fill="#18181B" />
    <rect x="19" y="18" width="18" height="13" fill="#FF8200" />
    <rect x="63" y="18" width="18" height="13" fill="#FF8200" />
    <rect x="19" y="31" width="62" height="13" fill="#FF5E00" />
    <rect x="19" y="44" width="22" height="13" fill="#E63B00" />
    <rect x="41" y="44" width="18" height="18" fill="#18181B" />
    <rect x="59" y="44" width="22" height="13" fill="#E63B00" />
    <rect x="19" y="57" width="22" height="12" fill="#D12000" />
    <rect x="59" y="57" width="22" height="12" fill="#D12000" />
    <rect x="19" y="69" width="18" height="13" fill="#B30C00" />
    <rect x="63" y="69" width="18" height="13" fill="#B30C00" />
  </svg>
);

export const XAILogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      fill="#18181B"
    />
  </svg>
);

export const QwenLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 2L4.5 6.3V17.7L12 22L19.5 17.7V6.3L12 2Z"
      stroke="#624AFF"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M12 6.5L7.5 9.1V14.9L12 17.5L16.5 14.9V9.1L12 6.5Z"
      fill="#624AFF"
      fillOpacity="0.15"
      stroke="#624AFF"
      strokeWidth="1.2"
    />
    <circle cx="12" cy="12" r="2.2" fill="#624AFF" />
  </svg>
);

export const CohereLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <ellipse cx="9" cy="9" rx="5.5" ry="5.5" fill="#D9534F" />
    <ellipse cx="15" cy="14" rx="5" ry="5" fill="#39594C" />
    <ellipse cx="14.5" cy="8.5" rx="3.5" ry="3.5" fill="#E8C547" />
  </svg>
);

export const ProviderLogo: React.FC<{ provider: string; className?: string }> = ({
  provider,
  className = "w-5 h-5"
}) => {
  const p = provider.toLowerCase();
  if (p.includes('anthropic')) return <AnthropicLogo className={className} />;
  if (p.includes('openai')) return <OpenAILogo className={className} />;
  if (p.includes('google') || p.includes('gemini')) return <GoogleLogo className={className} />;
  if (p.includes('meta') || p.includes('llama')) return <MetaLogo className={className} />;
  if (p.includes('deepseek')) return <DeepSeekLogo className={className} />;
  if (p.includes('mistral')) return <MistralLogo className={className} />;
  if (p.includes('xai') || p.includes('grok') || p === 'x') return <XAILogo className={className} />;
  if (p.includes('qwen')) return <QwenLogo className={className} />;
  if (p.includes('cohere')) return <CohereLogo className={className} />;
  return (
    <div className="w-5 h-5 rounded-md bg-sandstone-300 font-mono text-[10px] font-bold flex items-center justify-center text-charcoal-700">
      {provider.slice(0, 2).toUpperCase()}
    </div>
  );
};

// ============================================================
// THE 40 PRODUCTION MODELS (Strictly Active Catalog)
// ============================================================

export interface ModelIntegration {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'Mistral' | 'xAI' | 'DeepSeek' | 'Qwen' | 'Meta' | 'Cohere';
  modelId: string;
  status: 'Ready' | 'Active';
  isShowcase?: boolean;
  isPopular?: boolean;
  isFastest?: boolean;
  isNew?: boolean;
  badgeLabel?: string;
  description: string;
  contextWindow: string;
  tokenCost: string;
  tags: string[];
  fallback: string;
}

export const CATALOG_MODELS: ModelIntegration[] = [
  // ------------------------------------------------------------
  // Google Gemini (8 Models) - Gemini 3.8 Flash is Showcase
  // ------------------------------------------------------------
  {
    id: 'gemini-3-8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'Google',
    modelId: 'gemini-3.8-flash',
    status: 'Ready',
    isShowcase: true,
    badgeLabel: 'SHOWCASE • LONG-HORIZON AGENT',
    description: "Google's flagship showcase model engineered specifically for long-horizon software engineering, autonomous multi-step agents, and deep code refactoring.",
    contextWindow: '2,097k tokens',
    tokenCost: '$0.15 / $0.60',
    tags: ['Long-Horizon SWE', 'Autonomous Agents', '2M Context', 'Multimodal'],
    fallback: 'gemini-3.7-flash',
  },
  {
    id: 'gemini-3-7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'Google',
    modelId: 'gemini-3.7-flash',
    status: 'Ready',
    isNew: true,
    description: 'Hybrid reasoning model with dynamic thinking budget controls for real-time interactive development and complex debugging.',
    contextWindow: '1,048k tokens',
    tokenCost: '$0.12 / $0.48',
    tags: ['Thinking Budget', '1M Context', 'Live Debugging'],
    fallback: 'gemini-3.6-flash',
  },
  {
    id: 'gemini-3-6-flash',
    name: 'Gemini 3.6 Flash',
    provider: 'Google',
    modelId: 'gemini-3.6-flash',
    status: 'Ready',
    isFastest: true,
    description: 'High-velocity multimodal streamer with instant audio-visual comprehension and zero queue buffering.',
    contextWindow: '1,048k tokens',
    tokenCost: '$0.10 / $0.40',
    tags: ['Streaming Audio/Video', 'Sub-180ms', 'Zero Queue'],
    fallback: 'gemini-3.5-flash',
  },
  {
    id: 'gemini-3-5-flash',
    name: 'Gemini 3.5 Flash',
    provider: 'Google',
    modelId: 'gemini-3.5-flash',
    status: 'Ready',
    isPopular: true,
    description: 'Core enterprise workhorse delivering high-throughput processing for repository audits and massive document sets.',
    contextWindow: '1,048k tokens',
    tokenCost: '$0.08 / $0.32',
    tags: ['Ultra Economical', 'Repo Ingestion', '1M Context'],
    fallback: 'gemini-3.5-flash-lite',
  },
  {
    id: 'gemini-3-5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    provider: 'Google',
    modelId: 'gemini-3.5-flash-lite',
    status: 'Ready',
    description: 'Lightweight throughput optimizer built for high-concurrency classification, filtering, and microservices.',
    contextWindow: '524k tokens',
    tokenCost: '$0.04 / $0.16',
    tags: ['Micro-Cost', 'Data Pipeline', 'Fast Classification'],
    fallback: 'gemini-3.1-flash-lite',
  },
  {
    id: 'gemini-3-1-pro',
    name: 'Gemini 3.1 Pro',
    provider: 'Google',
    modelId: 'gemini-3.1-pro',
    status: 'Ready',
    badgeLabel: '4M CONTEXT',
    description: 'Extreme context capacity for entire multi-repo monorepos, multi-year financial archives, and deep multimodal reasoning.',
    contextWindow: '4,194k tokens',
    tokenCost: '$1.50 / $6.00',
    tags: ['4M Context Window', 'Whole Repo Ingestion', 'Legal QA'],
    fallback: 'gemini-3.8-flash',
  },
  {
    id: 'gemini-3-1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    provider: 'Google',
    modelId: 'gemini-3.1-flash-lite',
    status: 'Ready',
    description: 'Ultra-compact inference model for edge IoT gateways, lightweight prompt safety expansion, and cache pre-checks.',
    contextWindow: '256k tokens',
    tokenCost: '$0.03 / $0.12',
    tags: ['Edge / IoT', 'Prompt Guard', 'Instant Cache'],
    fallback: 'gemini-3.5-flash-lite',
  },
  {
    id: 'gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    modelId: 'gemini-2.5-pro',
    status: 'Ready',
    description: 'Battle-tested production Pro tier with proven deterministic tool schemas and enterprise SLA stability.',
    contextWindow: '2,097k tokens',
    tokenCost: '$1.25 / $5.00',
    tags: ['Battle-Tested', 'Enterprise SLA', '2M Tokens'],
    fallback: 'gemini-3.8-flash',
  },

  // ------------------------------------------------------------
  // OpenAI (7 Models)
  // ------------------------------------------------------------
  {
    id: 'gpt-5-6',
    name: 'GPT-5.6',
    provider: 'OpenAI',
    modelId: 'gpt-5.6',
    status: 'Ready',
    isPopular: true,
    isNew: true,
    badgeLabel: 'FLAGSHIP',
    description: 'Frontier omnimodal foundation model with agentic reasoning, autonomic tool creation, and human-expert problem solving.',
    contextWindow: '512k tokens',
    tokenCost: '$4.50 / $18.00',
    tags: ['Agentic Reasoning', 'Omnimodal', 'Tool Synthesis', 'Math / Logic'],
    fallback: 'gpt-5.5',
  },
  {
    id: 'gpt-5-6-mini',
    name: 'GPT-5.6-mini',
    provider: 'OpenAI',
    modelId: 'gpt-5.6-mini',
    status: 'Ready',
    isPopular: true,
    description: 'High-velocity distilled reasoning engine optimized for real-time customer workflows, sub-agent tasking, and code generation.',
    contextWindow: '256k tokens',
    tokenCost: '$0.80 / $3.20',
    tags: ['Low Latency', 'Vision', 'Sub-Agent Routing'],
    fallback: 'gpt-5.5-mini',
  },
  {
    id: 'gpt-5-6-nano',
    name: 'GPT-5.6-nano',
    provider: 'OpenAI',
    modelId: 'gpt-5.6-nano',
    status: 'Ready',
    isFastest: true,
    description: 'Edge-speed micro model built for high-concurrency classification, JSON parsing, and real-time prompt sanitation.',
    contextWindow: '128k tokens',
    tokenCost: '$0.15 / $0.60',
    tags: ['Edge Speed', 'JSON Mode', 'Telemetry Filter'],
    fallback: 'gpt-5.4-mini',
  },
  {
    id: 'gpt-5-5',
    name: 'GPT-5.5',
    provider: 'OpenAI',
    modelId: 'gpt-5.5',
    status: 'Ready',
    description: 'Enterprise-hardened workhorse with proven deterministic structured outputs, code refactoring, and data analysis.',
    contextWindow: '256k tokens',
    tokenCost: '$3.00 / $12.00',
    tags: ['Enterprise Code', 'Vision', 'Structured Data'],
    fallback: 'gpt-5.4',
  },
  {
    id: 'gpt-5-5-mini',
    name: 'GPT-5.5-mini',
    provider: 'OpenAI',
    modelId: 'gpt-5.5-mini',
    status: 'Ready',
    description: 'Cost-balanced workhorse with robust function execution, streaming compliance, and reliable multi-turn conversations.',
    contextWindow: '128k tokens',
    tokenCost: '$0.60 / $2.40',
    tags: ['Function Calling', 'Streaming', 'Economical'],
    fallback: 'gpt-5.4-mini',
  },
  {
    id: 'gpt-5-4',
    name: 'GPT-5.4',
    provider: 'OpenAI',
    modelId: 'gpt-5.4',
    status: 'Ready',
    description: 'High-throughput generation model with deep context retention, strict security boundaries, and enterprise safety.',
    contextWindow: '128k tokens',
    tokenCost: '$2.00 / $8.00',
    tags: ['High Throughput', 'Tool Calling', 'Safe Enclave'],
    fallback: 'gpt-5.4-mini',
  },
  {
    id: 'gpt-5-4-mini',
    name: 'GPT-5.4-mini',
    provider: 'OpenAI',
    modelId: 'gpt-5.4-mini',
    status: 'Ready',
    description: 'High-efficiency compact runner for background batch processing, document summarization, and data extraction.',
    contextWindow: '128k tokens',
    tokenCost: '$0.40 / $1.60',
    tags: ['Batch API', 'Extraction', 'Sub-Second'],
    fallback: 'gpt-5.6-nano',
  },

  // ------------------------------------------------------------
  // Anthropic (5 Models) - Retired 3.7 & 3.5 Models Excluded
  // ------------------------------------------------------------
  {
    id: 'claude-opus-4-8',
    name: 'Claude Opus 4.8',
    provider: 'Anthropic',
    modelId: 'claude-4-8-opus',
    status: 'Ready',
    isPopular: true,
    isNew: true,
    badgeLabel: 'FRONTIER ELITE',
    description: 'Maximum intellectual depth for autonomous scientific discovery, system architecture design, and complex formal reasoning.',
    contextWindow: '1,000k tokens',
    tokenCost: '$8.00 / $32.00',
    tags: ['Scientific Discovery', 'Deep Thought', '1M Context'],
    fallback: 'claude-opus-4-7',
  },
  {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    modelId: 'claude-4-6-sonnet',
    status: 'Ready',
    isPopular: true,
    badgeLabel: 'PRIMARY SWE',
    description: 'Primary software engineering driver with state-of-the-art autonomous coding, computer use, and nuanced test generation.',
    contextWindow: '500k tokens',
    tokenCost: '$2.80 / $11.20',
    tags: ['Autonomous Coding', 'Vision', 'Computer Use', 'Refactoring'],
    fallback: 'claude-sonnet-4-5',
  },
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    modelId: 'claude-4-5-haiku',
    status: 'Ready',
    isFastest: true,
    description: 'Near-instantaneous response times with human-level comprehension for fast conversational agents and rapid triage.',
    contextWindow: '200k tokens',
    tokenCost: '$0.40 / $1.60',
    tags: ['Sub-150ms', 'Conversational', 'Triage Routing'],
    fallback: 'claude-sonnet-4-6',
  },
  {
    id: 'claude-opus-4-7',
    name: 'Claude Opus 4.7',
    provider: 'Anthropic',
    modelId: 'claude-4-7-opus',
    status: 'Ready',
    description: 'Heavyweight analytical engine with rigorous citation verification, audit synthesis, and formal logic validation.',
    contextWindow: '500k tokens',
    tokenCost: '$6.00 / $24.00',
    tags: ['Deep Analysis', 'Multi-Source QA', 'Code Verification'],
    fallback: 'claude-sonnet-4-6',
  },
  {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    modelId: 'claude-4-5-sonnet',
    status: 'Ready',
    description: 'Reliable production powerhouse for full-stack programming, API contract generation, and deterministic JSON schemas.',
    contextWindow: '350k tokens',
    tokenCost: '$2.20 / $8.80',
    tags: ['Full-Stack Dev', 'Test Generation', 'Structured Output'],
    fallback: 'claude-haiku-4-5',
  },

  // ------------------------------------------------------------
  // Mistral (5 Models)
  // ------------------------------------------------------------
  {
    id: 'mistral-medium-3-5',
    name: 'Mistral Medium 3.5',
    provider: 'Mistral',
    modelId: 'mistral-medium-3.5',
    status: 'Ready',
    isPopular: true,
    isNew: true,
    badgeLabel: 'EU SOVEREIGN',
    description: 'European sovereign flagship delivering balanced latency, multi-language fluency, and strong coding capability.',
    contextWindow: '128k tokens',
    tokenCost: '$1.20 / $3.60',
    tags: ['EU Sovereign', 'Multilingual', 'Code Synthesis'],
    fallback: 'mistral-small-4',
  },
  {
    id: 'mistral-small-4',
    name: 'Mistral Small 4',
    provider: 'Mistral',
    modelId: 'mistral-small-4',
    status: 'Ready',
    isFastest: true,
    description: 'High-speed lightweight model tuned for fast JSON parsing, conversational interfaces, and edge tasks.',
    contextWindow: '128k tokens',
    tokenCost: '$0.20 / $0.60',
    tags: ['Low Latency', 'JSON Parsing', 'Chat'],
    fallback: 'ministral-3-14b',
  },
  {
    id: 'mistral-large-3',
    name: 'Mistral Large 3',
    provider: 'Mistral',
    modelId: 'mistral-large-3',
    status: 'Ready',
    description: 'Maximum reasoning power and multilingual precision designed for strict European regulatory compliance.',
    contextWindow: '128k tokens',
    tokenCost: '$2.00 / $6.00',
    tags: ['EU Sovereign', 'Complex Reasoning', 'Tool Calling'],
    fallback: 'mistral-medium-3.5',
  },
  {
    id: 'ministral-3-14b',
    name: 'Ministral 3 14B',
    provider: 'Mistral',
    modelId: 'ministral-3-14b',
    status: 'Ready',
    description: 'High-performance 14B edge model with native on-device tool calling and minimal memory footprint.',
    contextWindow: '128k tokens',
    tokenCost: '$0.10 / $0.30',
    tags: ['14B Parameters', 'On-Device / Edge', 'Function Calling'],
    fallback: 'ministral-3-8b',
  },
  {
    id: 'ministral-3-8b',
    name: 'Ministral 3 8B',
    provider: 'Mistral',
    modelId: 'ministral-3-8b',
    status: 'Ready',
    description: 'Ultra-lean 8B parameter model for sub-second classification, extraction, and local microservices.',
    contextWindow: '128k tokens',
    tokenCost: '$0.06 / $0.18',
    tags: ['8B Parameters', 'Sub-Second', 'Data Extraction'],
    fallback: 'mistral-small-4',
  },

  // ------------------------------------------------------------
  // xAI (4 Models)
  // ------------------------------------------------------------
  {
    id: 'grok-4-1',
    name: 'Grok 4.1',
    provider: 'xAI',
    modelId: 'grok-4.1',
    status: 'Ready',
    isPopular: true,
    isNew: true,
    badgeLabel: 'REAL-TIME',
    description: 'Real-time global knowledge grounding with deep mathematical and scientific reasoning benchmarks.',
    contextWindow: '256k tokens',
    tokenCost: '$2.50 / $10.00',
    tags: ['Real-Time Knowledge', 'STEM Reasoning', 'Zero Bias'],
    fallback: 'grok-4',
  },
  {
    id: 'grok-4',
    name: 'Grok 4',
    provider: 'xAI',
    modelId: 'grok-4',
    status: 'Ready',
    description: 'Flagship reasoning engine with multimodal visual comprehension and deep code generation capabilities.',
    contextWindow: '131k tokens',
    tokenCost: '$2.00 / $8.00',
    tags: ['Vision', 'Deep Coding', 'Live Data'],
    fallback: 'grok-4-fast',
  },
  {
    id: 'grok-4-fast',
    name: 'Grok 4 Fast',
    provider: 'xAI',
    modelId: 'grok-4-fast',
    status: 'Ready',
    isFastest: true,
    description: 'Accelerated low-latency variant designed for instant interactive conversational agent workflows.',
    contextWindow: '131k tokens',
    tokenCost: '$0.50 / $2.00',
    tags: ['Sub-200ms', 'Conversational', 'High Throughput'],
    fallback: 'grok-3-mini',
  },
  {
    id: 'grok-3-mini',
    name: 'Grok 3 Mini',
    provider: 'xAI',
    modelId: 'grok-3-mini',
    status: 'Ready',
    description: 'Compact reasoning powerhouse for automated monitoring, alert triage, and background tasks.',
    contextWindow: '131k tokens',
    tokenCost: '$0.25 / $1.00',
    tags: ['Alert Triage', 'Lightweight', 'Monitoring'],
    fallback: 'grok-4-fast',
  },

  // ------------------------------------------------------------
  // DeepSeek (3 Models)
  // ------------------------------------------------------------
  {
    id: 'deepseek-v4',
    name: 'DeepSeek V4',
    provider: 'DeepSeek',
    modelId: 'deepseek-v4',
    status: 'Ready',
    isPopular: true,
    isNew: true,
    badgeLabel: 'NEXT-GEN MoE',
    description: 'Next-generation open mixture-of-experts model with exceptional multi-agent coding and architectural synthesis.',
    contextWindow: '128k tokens',
    tokenCost: '$0.20 / $0.80',
    tags: ['Open Weights', 'MoE', 'Agentic Coding'],
    fallback: 'deepseek-v3',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    modelId: 'deepseek-v3',
    status: 'Ready',
    badgeLabel: 'COST LEADER',
    description: 'Industry-disrupting MoE model delivering frontier-level programming at unmatched economic efficiency.',
    contextWindow: '64k tokens',
    tokenCost: '$0.14 / $0.28',
    tags: ['MoE', 'Ultra Cheap', 'Programming'],
    fallback: 'deepseek-r1',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    modelId: 'deepseek-reasoner',
    status: 'Ready',
    description: 'Open-weight milestone in chain-of-thought mathematical reasoning, competitive programming, and formal verification.',
    contextWindow: '64k tokens',
    tokenCost: '$0.55 / $2.19',
    tags: ['CoT Reasoning', 'Math / Logic', 'Open Weights'],
    fallback: 'deepseek-v3',
  },

  // ------------------------------------------------------------
  // Qwen (3 Models)
  // ------------------------------------------------------------
  {
    id: 'qwen3-max',
    name: 'Qwen3-Max',
    provider: 'Qwen',
    modelId: 'qwen3-max',
    status: 'Ready',
    isPopular: true,
    isNew: true,
    badgeLabel: 'ALIBABA CLOUD',
    description: "Alibaba's premier frontier model with rich multilingual depth, enterprise reasoning, and dense agent workflows.",
    contextWindow: '128k tokens',
    tokenCost: '$1.60 / $6.40',
    tags: ['Enterprise Reasoning', 'Multilingual', 'High Recall'],
    fallback: 'qwen3-coder',
  },
  {
    id: 'qwen3-coder',
    name: 'Qwen3-Coder',
    provider: 'Qwen',
    modelId: 'qwen3-coder',
    status: 'Ready',
    badgeLabel: 'CODE SPECIALIST',
    description: 'Specialized code synthesis model with unmatched proficiency in Python, Rust, Go, TypeScript, and SQL queries.',
    contextWindow: '128k tokens',
    tokenCost: '$0.30 / $1.20',
    tags: ['Coding Specialist', 'Rust / Go / TS', 'SQL Synthesis'],
    fallback: 'qwen3-235b',
  },
  {
    id: 'qwen3-235b',
    name: 'Qwen3-235B',
    provider: 'Qwen',
    modelId: 'qwen3-235b',
    status: 'Ready',
    description: '235-billion parameter open foundation model for full enterprise fine-tuning and secure local loopback inference.',
    contextWindow: '128k tokens',
    tokenCost: '$0.45 / $1.80',
    tags: ['235B Weights', 'Fine-Tuning', 'Zero Retention'],
    fallback: 'qwen3-coder',
  },

  // ------------------------------------------------------------
  // Meta / Llama (3 Models)
  // ------------------------------------------------------------
  {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'Meta',
    modelId: 'llama-4-maverick',
    status: 'Ready',
    isPopular: true,
    isNew: true,
    badgeLabel: 'LLAMA 4',
    description: "Meta's flagship Llama 4 tier built with mixture-of-experts for multi-step reasoning and autonomous planning.",
    contextWindow: '256k tokens',
    tokenCost: '$0.65 / $1.30',
    tags: ['Llama 4', 'Open Weights', 'Planning Agents'],
    fallback: 'llama-4-scout',
  },
  {
    id: 'llama-4-scout',
    name: 'Llama 4 Scout',
    provider: 'Meta',
    modelId: 'llama-4-scout',
    status: 'Ready',
    isFastest: true,
    description: 'Ultra-dense high-throughput open weight model tuned for sub-second search synthesis and data indexing.',
    contextWindow: '128k tokens',
    tokenCost: '$0.20 / $0.40',
    tags: ['Llama 4', 'Sub-Second', 'High Throughput'],
    fallback: 'llama-3-3-70b',
  },
  {
    id: 'llama-3-3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    modelId: 'llama-3.3-70b-instruct',
    status: 'Ready',
    description: 'The standard enterprise open-source baseline running on dedicated OstraOps LPU inference nodes.',
    contextWindow: '128k tokens',
    tokenCost: '$0.59 / $0.79',
    tags: ['Open Source', 'LPU Dedicated', 'JSON Mode'],
    fallback: 'llama-4-scout',
  },

  // ------------------------------------------------------------
  // Cohere (2 Models)
  // ------------------------------------------------------------
  {
    id: 'cohere-command-a',
    name: 'Command A',
    provider: 'Cohere',
    modelId: 'command-a',
    status: 'Ready',
    isPopular: true,
    isNew: true,
    badgeLabel: 'ENTERPRISE RAG',
    description: 'Specialized enterprise model engineered for grounded retrieval-augmented generation with verifiable citations.',
    contextWindow: '256k tokens',
    tokenCost: '$0.90 / $2.70',
    tags: ['Enterprise RAG', 'Grounded Citations', 'Search Retrieval'],
    fallback: 'cohere-command-r-plus',
  },
  {
    id: 'cohere-command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    modelId: 'command-r-plus',
    status: 'Ready',
    badgeLabel: 'TOOL ORCHESTRATION',
    description: 'Advanced enterprise tool-use orchestrator that parses complex multi-step actions across external databases and APIs.',
    contextWindow: '128k tokens',
    tokenCost: '$2.50 / $10.00',
    tags: ['Tool Orchestration', 'API Routing', 'Multi-Lingual'],
    fallback: 'cohere-command-a',
  },
];

// Provider-specific secret formats, placeholders, and validation rules
interface ProviderRule {
  placeholder: string;
  expectedPrefix: string;
  minLen: number;
  guideUrl?: string;
  formatDescription: string;
}

const PROVIDER_RULES: Record<string, ProviderRule> = {
  Anthropic: {
    placeholder: 'sk-ant-api03-xxxx...',
    expectedPrefix: 'sk-ant-',
    minLen: 24,
    formatDescription: 'Must start with "sk-ant-" and be at least 24 characters',
  },
  OpenAI: {
    placeholder: 'sk-proj-xxxx... or sk-xxxx...',
    expectedPrefix: 'sk-',
    minLen: 20,
    formatDescription: 'Must start with "sk-" and be at least 20 characters',
  },
  Google: {
    placeholder: 'AIzaSyxxxx...',
    expectedPrefix: 'AIza',
    minLen: 20,
    formatDescription: 'Google Gemini API key must start with "AIza"',
  },
  Mistral: {
    placeholder: 'mis_xxxx...',
    expectedPrefix: 'mis_',
    minLen: 16,
    formatDescription: 'Must start with "mis_" and have at least 16 characters',
  },
  xAI: {
    placeholder: 'xai-xxxx...',
    expectedPrefix: 'xai-',
    minLen: 16,
    formatDescription: 'Must start with "xai-" and have at least 16 characters',
  },
  DeepSeek: {
    placeholder: 'sk-xxxx...',
    expectedPrefix: 'sk-',
    minLen: 16,
    formatDescription: 'Must start with "sk-" and have at least 16 characters',
  },
  Qwen: {
    placeholder: 'sk-qwen-xxxx... or sk-xxxx...',
    expectedPrefix: 'sk-',
    minLen: 16,
    formatDescription: 'Must start with "sk-" and have at least 16 characters',
  },
  Meta: {
    placeholder: 'meta-xxxx...',
    expectedPrefix: 'meta-',
    minLen: 16,
    formatDescription: 'Must be at least 16 characters',
  },
  Cohere: {
    placeholder: 'coh-xxxx... or key-xxxx...',
    expectedPrefix: 'coh-',
    minLen: 16,
    formatDescription: 'Must have at least 16 characters',
  },
};

export const IntegrationsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ============================================================
  // 3-STEP INTEGRATION WIZARD STATE
  // ============================================================
  const [wizardOpen, setWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(2);
  const [activeModel, setActiveModel] = useState<ModelIntegration>(CATALOG_MODELS[0]);
  const [activeProvider, setActiveProvider] = useState<ModelIntegration['provider']>('Google');

  // Step 2 Form States
  const [connectionName, setConnectionName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [targetModelId, setTargetModelId] = useState('');
  const [customModelId, setCustomModelId] = useState('');
  const [monthlySpendLimit, setMonthlySpendLimit] = useState('');
  const [fallbackModelId, setFallbackModelId] = useState('');

  // Validation and Handshake States
  const [keyTouched, setKeyTouched] = useState(false);
  const [handshakeState, setHandshakeState] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [handshakeLatency, setHandshakeLatency] = useState<number>(16);
  const [codeSnippetLang, setCodeSnippetLang] = useState<'typescript' | 'python' | 'curl'>('typescript');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filterProviders = [
    { label: 'All Models', count: 40, value: 'All' },
    { label: 'Google Gemini', count: 8, value: 'Google' },
    { label: 'OpenAI', count: 7, value: 'OpenAI' },
    { label: 'Anthropic', count: 5, value: 'Anthropic' },
    { label: 'Mistral', count: 5, value: 'Mistral' },
    { label: 'xAI (Grok)', count: 4, value: 'xAI' },
    { label: 'DeepSeek', count: 3, value: 'DeepSeek' },
    { label: 'Qwen', count: 3, value: 'Qwen' },
    { label: 'Meta Llama', count: 3, value: 'Meta' },
    { label: 'Cohere', count: 2, value: 'Cohere' },
  ];

  const filteredModels = useMemo(() => {
    return CATALOG_MODELS.filter((model) => {
      const matchesProvider = selectedProvider === 'All' || model.provider === selectedProvider;
      const matchesSearch =
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.modelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesProvider && matchesSearch;
    });
  }, [selectedProvider, searchQuery]);

  // Models available within the currently selected provider in the modal
  const providerModels = useMemo(() => {
    return CATALOG_MODELS.filter((m) => m.provider === activeProvider);
  }, [activeProvider]);

  // Open the Integration Modal preloaded with the chosen model
  const handleOpenModelIntegrate = (model: ModelIntegration) => {
    setActiveModel(model);
    setActiveProvider(model.provider);
    setConnectionName(`${model.provider} Gateway Connection`);
    setApiKey('');
    setKeyTouched(false);
    setShowApiKey(false);
    setTargetModelId(model.modelId);
    setCustomModelId('');
    setMonthlySpendLimit('');
    setFallbackModelId(model.fallback);
    setHandshakeState('idle');
    setCurrentStep(2); // Step 2: Credentials as requested
    setWizardOpen(true);
  };

  // STRICT VALIDATION ENGINE
  const validateKey = (keyString: string, providerName: string) => {
    const trimmed = keyString.trim();
    if (!trimmed) {
      return { valid: false, message: 'Upstream API Key is required.' };
    }

    const rule = PROVIDER_RULES[providerName] || {
      expectedPrefix: '',
      minLen: 12,
      formatDescription: 'Must be at least 12 characters',
    };

    if (rule.expectedPrefix && !trimmed.startsWith(rule.expectedPrefix)) {
      return {
        valid: false,
        message: `Invalid format: ${providerName} keys must start with "${rule.expectedPrefix}".`,
      };
    }

    if (trimmed.length < rule.minLen) {
      return {
        valid: false,
        message: `Key is too short. ${rule.formatDescription}.`,
      };
    }

    return { valid: true, message: '' };
  };

  const keyValidation = useMemo(() => {
    return validateKey(apiKey, activeProvider);
  }, [apiKey, activeProvider]);

  const canProceedStep2 = useMemo(() => {
    return keyValidation.valid && connectionName.trim().length > 0;
  }, [keyValidation, connectionName]);

  const handleTestHandshake = () => {
    setKeyTouched(true);
    if (!keyValidation.valid) {
      showToast('Cannot test: Please enter a valid API key first.');
      return;
    }

    setHandshakeState('testing');
    setTimeout(() => {
      const mockLatency = Math.floor(Math.random() * 12) + 12; // 12-24ms
      setHandshakeLatency(mockLatency);
      setHandshakeState('success');
      showToast(`Handshake Verified (${mockLatency}ms)`);
    }, 750);
  };

  const handleProceedToStep3 = () => {
    setKeyTouched(true);
    if (!canProceedStep2) {
      showToast('Validation Error: Please correct the invalid fields.');
      return;
    }
    setCurrentStep(3);
  };

  const effectiveModelIdentifier = customModelId.trim() || targetModelId || activeModel.modelId;

  const getCodeSnippet = () => {
    if (codeSnippetLang === 'typescript') {
      return `import { createOpenAI } from '@ai-sdk/openai';

// OstraOps Hosted Team Gateway Client
export const gateway = createOpenAI({
  baseURL: 'https://gateway.ostraops.com/v1',
  apiKey: process.env.OSTRAOPS_TEAM_KEY, // Dynamic key swap active
});

// Drop-in streaming invocation with intra-family failover
const result = await gateway.chat('${effectiveModelIdentifier}', {
  messages: [{ role: 'user', content: 'Execute mission-critical task' }],
});`;
    }

    if (codeSnippetLang === 'python') {
      return `from openai import OpenAI
import os

client = OpenAI(
    base_url="https://gateway.ostraops.com/v1",
    api_key=os.environ.get("OSTRAOPS_TEAM_KEY"),
)

response = client.chat.completions.create(
    model="${effectiveModelIdentifier}",
    messages=[{"role": "user", "content": "Execute mission-critical task"}],
)`;
    }

    return `curl -X POST "https://gateway.ostraops.com/v1/chat/completions" \\
  -H "Authorization: Bearer $OSTRAOPS_TEAM_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${effectiveModelIdentifier}",
    "messages": [{"role": "user", "content": "Ping gateway proxy"}]
  }'`;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-mono flex items-center gap-2 border border-[#3F3F46] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C59E5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* TOP HEADER: ENTERPRISE MODEL GATEWAY                          */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE5DC] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#9C7938] text-[10px] font-bold font-mono tracking-wider uppercase border border-[#E5DBCA]">
              Enterprise Model Gateway
            </span>
            <span className="text-[11px] font-mono text-charcoal-400">40 Active Frontier Models</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-charcoal-900 tracking-tight font-sans">
            AI Provider Integrations & Model Catalog
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-2xl">
            Browse our curated 40-model production catalog with authentic logos, connect upstream master credentials, and generate 1-line gateway proxy snippets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenModelIntegrate(CATALOG_MODELS[0])}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C59E5F] hover:bg-[#B38D4F] text-white text-xs font-bold transition-all shadow-subtle hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Upstream Provider</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4 STATS METRICS CARDS (OstraOps Warm Sandstone Palette)      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-charcoal-500 tracking-wide uppercase font-mono">
              Available Catalog Models
            </span>
            <div className="w-7 h-7 rounded-xl bg-sandstone-200 text-charcoal-700 flex items-center justify-center">
              <Layers className="w-4 h-4 text-[#C59E5F]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-charcoal-900 font-mono tracking-tight">
            40
          </div>
          <div className="text-[11px] text-charcoal-500 mt-1 font-mono">
            9 Active Provider Families
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-charcoal-500 tracking-wide uppercase font-mono">
              Active Workspace Keys
            </span>
            <div className="w-7 h-7 rounded-xl bg-sandstone-200 text-charcoal-700 flex items-center justify-center">
              <Key className="w-4 h-4 text-[#C59E5F]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-charcoal-900 font-mono tracking-tight">
            12
          </div>
          <div className="text-[11px] text-charcoal-500 mt-1 font-mono">
            Connected & authorized for proxy
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-charcoal-500 tracking-wide uppercase font-mono">
              Credential Security
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-lg font-bold text-emerald-700 font-mono flex items-center gap-1.5 mt-1">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>AES-256-GCM Vault</span>
          </div>
          <div className="text-[11px] text-charcoal-500 mt-1 font-mono">
            Zero plaintext key storage in transit
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-charcoal-500 tracking-wide uppercase font-mono">
              Gateway Status
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-charcoal-900 font-mono tracking-tight">
            100%
          </div>
          <div className="text-[11px] text-charcoal-500 mt-1 font-mono">
            Dynamic routing & FinOps operational
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FILTER TABS & SEARCH BAR                                     */}
      {/* ============================================================ */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#C59E5F] tracking-wider block">
              Direct Model Catalog & 1-Click Integration
            </span>
            <h2 className="text-lg font-bold text-charcoal-900 tracking-tight">
              Choose a Model to Integrate
            </h2>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search gpt-5.6, gemini-3.8, claude-opus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-[#EAE5DC] text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#C59E5F] transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Provider Tabs with Mini Logos */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterProviders.map((prov) => {
            const isActive = selectedProvider === prov.value;
            return (
              <button
                key={prov.value}
                onClick={() => setSelectedProvider(prov.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#18181B] text-white font-semibold shadow-xs'
                    : 'bg-white hover:bg-[#F5F2EB] text-charcoal-600 border border-[#EAE5DC]'
                }`}
              >
                {prov.value !== 'All' && (
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                    <ProviderLogo provider={prov.value} className="w-3.5 h-3.5 object-contain" />
                  </div>
                )}
                <span>{prov.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-[#27272A] text-ostraGold-300' : 'bg-sandstone-200 text-charcoal-500'
                  }`}
                >
                  {prov.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODEL CARDS GRID (3 COLUMNS)                                 */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModels.map((model) => {
          const isShowcase = model.isShowcase;
          return (
            <div
              key={model.id}
              className={`rounded-2xl p-5 shadow-subtle hover:shadow-md transition-all flex flex-col justify-between group ${
                isShowcase
                  ? 'bg-gradient-to-b from-[#FFFDF9] to-white border-2 border-[#C59E5F] ring-2 ring-[#C59E5F]/10'
                  : 'bg-white border border-[#EAE5DC] hover:border-[#D6BA84]'
              }`}
            >
              <div>
                {/* Header: Provider official logo & badges */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    {/* Official Provider Logo Container */}
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center p-1.5 shadow-2xs transition-all flex-shrink-0 ${
                        isShowcase
                          ? 'bg-[#FAF6ED] border-[#D6BA84]'
                          : 'bg-[#FAF8F5] border-[#EAE5DC] group-hover:border-[#C59E5F]/60 group-hover:bg-white'
                      }`}
                    >
                      <ProviderLogo provider={model.provider} className="w-6 h-6 object-contain" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-charcoal-500 block tracking-wider leading-none">
                        {model.provider}
                      </span>
                      <h3 className="text-sm font-bold text-charcoal-900 group-hover:text-[#18181B] transition-colors leading-tight mt-0.5 flex items-center gap-1.5">
                        <span>{model.name}</span>
                        {isShowcase && <Sparkles className="w-3.5 h-3.5 text-[#C59E5F]" />}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1 flex-shrink-0 justify-end max-w-[170px]">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                      <span>{model.status}</span>
                    </span>
                    {model.badgeLabel && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#FAF3E0] text-[#9C7938] border border-[#EEDDB8]">
                        {model.badgeLabel}
                      </span>
                    )}
                    {model.isFastest && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#EBF5FF] text-[#1E6091] border border-[#CCE4FF]">
                        FASTEST
                      </span>
                    )}
                    {model.isNew && !model.badgeLabel && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]">
                        NEW
                      </span>
                    )}
                  </div>
                </div>

                {/* Model ID Pill */}
                <div className="mt-1 mb-3 px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between font-mono text-[11px] text-charcoal-700">
                  <span className="truncate">ID: <span className="text-charcoal-900 font-semibold">{model.modelId}</span></span>
                  <button
                    onClick={() => copyToClipboard(model.modelId, model.modelId)}
                    className="text-charcoal-400 hover:text-charcoal-800 p-0.5 transition-colors cursor-pointer"
                    title="Copy Model ID"
                  >
                    {copiedKey === model.modelId ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-charcoal-600 leading-relaxed mb-4 min-h-[38px]">
                  {model.description}
                </p>

                {/* Specs Box: Context Window & Token Cost */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] mb-3.5">
                  <div>
                    <span className="text-[10px] text-charcoal-400 block font-mono">Context Window</span>
                    <span className="text-xs font-bold font-mono text-charcoal-900">{model.contextWindow}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-400 block font-mono">Token Cost ($/1M)</span>
                    <span className="text-xs font-bold font-mono text-charcoal-900">{model.tokenCost}</span>
                  </div>
                </div>

                {/* Capability Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {model.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#F5F2EB] text-charcoal-700 border border-[#E5E0D5]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Fallback routing note */}
                <div className="text-[10px] font-mono text-charcoal-400 truncate mb-4">
                  Fallback: <span className="text-charcoal-600">{model.fallback}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenModelIntegrate(model)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn cursor-pointer ${
                  isShowcase
                    ? 'bg-[#C59E5F] hover:bg-[#B38D4F] text-white shadow-xs'
                    : 'bg-[#FAF8F5] hover:bg-[#18181B] text-charcoal-900 hover:text-white border border-[#EAE5DC] hover:border-[#18181B]'
                }`}
              >
                <span>Configure & Proxy Model</span>
                <ArrowUpRight className={`w-3.5 h-3.5 transition-colors ${isShowcase ? 'text-white' : 'text-charcoal-500 group-hover/btn:text-white'}`} />
              </button>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 3-STEP INTEGRATION WIZARD MODAL (Matching Reference Layout)   */}
      {/* ============================================================ */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-[#EAE5DC] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Top Header */}
            <div className="px-6 py-4 border-b border-[#EAE5DC] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF3E0] border border-[#EEDDB8] flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-[#C59E5F]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-charcoal-900 font-sans">
                      Connect Upstream Model & Provider
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#18181B] text-white uppercase tracking-wider">
                      STEP {currentStep} OF 3
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-500">
                    {currentStep === 1
                      ? 'Select an upstream model provider family to authorize.'
                      : currentStep === 2
                      ? 'Enter your provider API key, select models, and test upstream connectivity.'
                      : 'Copy your drop-in gateway proxy snippet and verify live routing.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWizardOpen(false)}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-900 hover:bg-sandstone-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Step Tabs Navigation Bar */}
            <div className="grid grid-cols-3 border-b border-[#EAE5DC] text-xs font-mono">
              {/* Step 1 Tab */}
              <button
                onClick={() => setCurrentStep(1)}
                className={`py-3 px-4 flex items-center justify-center gap-2 border-r border-[#EAE5DC] transition-colors cursor-pointer ${
                  currentStep === 1
                    ? 'bg-[#F5EFE0] text-[#9C7938] font-bold'
                    : 'bg-white hover:bg-sandstone-100 text-charcoal-600'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Provider</span>
              </button>

              {/* Step 2 Tab */}
              <button
                onClick={() => setCurrentStep(2)}
                className={`py-3 px-4 flex items-center justify-center gap-2 border-r border-[#EAE5DC] transition-colors cursor-pointer ${
                  currentStep === 2
                    ? 'bg-[#F5EFE0] text-[#9C7938] font-bold'
                    : currentStep > 2
                    ? 'bg-white text-emerald-700'
                    : 'bg-white hover:bg-sandstone-100 text-charcoal-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentStep === 2
                      ? 'bg-[#C59E5F] text-white'
                      : currentStep > 2
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-sandstone-300 text-charcoal-700'
                  }`}
                >
                  {currentStep > 2 ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '2'}
                </div>
                <span>Credentials</span>
              </button>

              {/* Step 3 Tab */}
              <button
                onClick={() => {
                  if (canProceedStep2) setCurrentStep(3);
                }}
                disabled={!canProceedStep2 && currentStep < 3}
                className={`py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
                  currentStep === 3
                    ? 'bg-[#F5EFE0] text-[#9C7938] font-bold cursor-pointer'
                    : canProceedStep2
                    ? 'bg-white hover:bg-sandstone-100 text-charcoal-600 cursor-pointer'
                    : 'bg-[#FAF8F5] text-charcoal-400 cursor-not-allowed opacity-60'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentStep === 3
                      ? 'bg-[#C59E5F] text-white'
                      : 'bg-sandstone-200 text-charcoal-500'
                  }`}
                >
                  3
                </div>
                <span>Gateway Snippet</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
              
              {/* ============================================================ */}
              {/* STEP 1: CHANGE / SELECT PROVIDER FAMILY                      */}
              {/* ============================================================ */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-xs text-charcoal-600">
                    Select an upstream AI provider to vault credentials and generate your gateway proxy route:
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      'Google',
                      'OpenAI',
                      'Anthropic',
                      'Mistral',
                      'xAI',
                      'DeepSeek',
                      'Qwen',
                      'Meta',
                      'Cohere',
                    ].map((provName) => {
                      const isSel = activeProvider === provName;
                      return (
                        <button
                          key={provName}
                          onClick={() => {
                            const found = CATALOG_MODELS.find((m) => m.provider === provName) || CATALOG_MODELS[0];
                            setActiveProvider(found.provider);
                            setActiveModel(found);
                            setConnectionName(`${found.provider} Gateway Connection`);
                            setTargetModelId(found.modelId);
                            setFallbackModelId(found.fallback);
                            setCurrentStep(2);
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                            isSel
                              ? 'bg-white border-[#C59E5F] shadow-sm ring-1 ring-[#C59E5F]'
                              : 'bg-white border-[#EAE5DC] hover:border-[#D6BA84] hover:bg-sandstone-100'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center p-1.5 flex-shrink-0">
                            <ProviderLogo provider={provName} className="w-5 h-5 object-contain" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-charcoal-900 block leading-tight font-sans">
                              {provName}
                            </span>
                            <span className="text-[10px] text-charcoal-400 font-mono">
                              {CATALOG_MODELS.filter((m) => m.provider === provName).length} models
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* STEP 2: CREDENTIALS (Matching user reference layout exactly) */}
              {/* ============================================================ */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  
                  {/* Field 1: Connection Name */}
                  <div>
                    <label className="text-xs font-bold text-charcoal-700 block mb-1.5 font-mono uppercase tracking-wide">
                      Connection Name
                    </label>
                    <input
                      type="text"
                      value={connectionName}
                      onChange={(e) => setConnectionName(e.target.value)}
                      placeholder="e.g. Production Anthropic Cluster"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F] transition-all"
                    />
                  </div>

                  {/* Field 2: Upstream API Key / Secret with Security Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-charcoal-700 font-mono uppercase tracking-wide">
                        Upstream API Key / Secret
                      </label>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-700">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span>Encrypted with AES-256-GCM</span>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          setKeyTouched(true);
                          setHandshakeState('idle');
                        }}
                        onBlur={() => setKeyTouched(true)}
                        placeholder={
                          PROVIDER_RULES[activeProvider]?.placeholder || 'Enter upstream secret key...'
                        }
                        className={`w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white text-xs font-mono transition-all focus:outline-none ${
                          keyTouched && !keyValidation.valid
                            ? 'border-2 border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500'
                            : keyTouched && keyValidation.valid
                            ? 'border border-emerald-400 text-charcoal-900 focus:border-emerald-500'
                            : 'border border-[#EAE5DC] text-charcoal-900 focus:border-[#C59E5F]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
                        title={showApiKey ? 'Hide Key' : 'Show Key'}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Validation Error Message */}
                    {keyTouched && !keyValidation.valid && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 font-mono animate-in fade-in duration-150">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span>{keyValidation.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Field 3: Target Model Identifier Pills */}
                  <div>
                    <label className="text-xs font-bold text-charcoal-700 block mb-1.5 font-mono uppercase tracking-wide">
                      Target Model Identifier
                    </label>

                    {/* Model Pills from this Provider */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {providerModels.map((m) => {
                        const isSelected = targetModelId === m.modelId && !customModelId;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setTargetModelId(m.modelId);
                              setCustomModelId('');
                              setFallbackModelId(m.fallback);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#18181B] text-[#C59E5F] border border-[#C59E5F] font-bold shadow-xs'
                                : 'bg-white text-charcoal-700 border border-[#EAE5DC] hover:border-[#D6BA84]'
                            }`}
                          >
                            {m.modelId}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Model ID Input */}
                    <input
                      type="text"
                      value={customModelId}
                      onChange={(e) => setCustomModelId(e.target.value)}
                      placeholder="Or enter custom model ID (e.g. meta-llama/Llama-3.3-70B-Instruct, custom-lora-v1)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#C59E5F] transition-all"
                    />
                  </div>

                  {/* Field 4: Test Upstream Handshake Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handleTestHandshake}
                      disabled={handshakeState === 'testing' || !canProceedStep2}
                      className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        !canProceedStep2
                          ? 'bg-sandstone-100 text-charcoal-400 border-[#EAE5DC] cursor-not-allowed opacity-60'
                          : handshakeState === 'success'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-white border-[#EAE5DC] hover:border-[#C59E5F] text-charcoal-800 hover:bg-sandstone-100'
                      }`}
                    >
                      {handshakeState === 'testing' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C59E5F]" />
                          <span>Pinging Upstream Endpoint...</span>
                        </>
                      ) : handshakeState === 'success' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Handshake Successful • {handshakeLatency}ms Latency • Enclave Verified</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-[#C59E5F]" />
                          <span>Test Upstream Handshake</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Field 5 & 6: 2 Columns (Monthly Spend Limit & Budget Fallback Model) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-charcoal-600 block mb-1 font-mono uppercase">
                        Monthly Spend Limit (Optional)
                      </label>
                      <input
                        type="text"
                        value={monthlySpendLimit}
                        onChange={(e) => setMonthlySpendLimit(e.target.value)}
                        placeholder="$ e.g. 500"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-charcoal-600 block mb-1 font-mono uppercase">
                        Budget Fallback Model (Optional)
                      </label>
                      <input
                        type="text"
                        value={fallbackModelId}
                        onChange={(e) => setFallbackModelId(e.target.value)}
                        placeholder="e.g. gemini-3.5-flash-lite, gpt-5.4-mini"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* STEP 3: GATEWAY SNIPPET                                      */}
              {/* ============================================================ */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  {/* Success Status Banner */}
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>
                        <strong>{activeProvider} Master Vault Active:</strong> Model <code className="bg-emerald-100 px-1 py-0.5 rounded font-bold">{effectiveModelIdentifier}</code> routed through gateway.
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded-full font-bold uppercase">
                      READY
                    </span>
                  </div>

                  {/* 1-Line Gateway Base URL Box */}
                  <div>
                    <label className="text-xs font-bold text-charcoal-700 block mb-1.5 font-mono uppercase">
                      1-Line Gateway Base URL
                    </label>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#EAE5DC] font-mono text-xs text-charcoal-900">
                      <span className="text-emerald-700 font-semibold">https://gateway.ostraops.com/v1</span>
                      <button
                        onClick={() => copyToClipboard('https://gateway.ostraops.com/v1', 'Gateway URL')}
                        className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sandstone-100 hover:bg-sandstone-200 text-charcoal-700 font-sans text-xs font-semibold cursor-pointer"
                      >
                        {copiedKey === 'Gateway URL' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Code Snippet Tabs */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-charcoal-700 font-mono uppercase">
                        Drop-In Client Snippet
                      </label>
                      <div className="flex items-center gap-1">
                        {(['typescript', 'python', 'curl'] as const).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setCodeSnippetLang(lang)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer ${
                              codeSnippetLang === lang
                                ? 'bg-[#18181B] text-white'
                                : 'bg-white text-charcoal-600 border border-[#EAE5DC] hover:bg-sandstone-100'
                            }`}
                          >
                            {lang === 'typescript' ? 'TS (Vercel AI)' : lang === 'python' ? 'Python' : 'cURL'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Snippet Code Container */}
                    <div className="relative rounded-2xl bg-[#18181B] text-white p-4 font-mono text-xs border border-[#27272A] shadow-inner">
                      <button
                        onClick={() => copyToClipboard(getCodeSnippet(), 'Snippet')}
                        className="absolute right-3 top-3 px-2 py-1 rounded-md bg-[#27272A] hover:bg-[#3F3F46] text-xs text-charcoal-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3 h-3 text-[#C59E5F]" />
                        <span>{copiedKey === 'Snippet' ? 'Copied!' : 'Copy'}</span>
                      </button>
                      <pre className="overflow-x-auto whitespace-pre leading-relaxed pr-16 text-neutral-200">
                        {getCodeSnippet()}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="px-6 py-4 bg-white border-t border-[#EAE5DC] flex items-center justify-between">
              {currentStep === 1 ? (
                <div></div>
              ) : currentStep === 2 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Provider</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Credentials</span>
                </button>
              )}

              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C59E5F] hover:bg-[#B38D4F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <span>Continue to Credentials</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : currentStep === 2 ? (
                <button
                  type="button"
                  onClick={handleProceedToStep3}
                  disabled={!canProceedStep2}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    canProceedStep2
                      ? 'bg-[#C59E5F] hover:bg-[#B38D4F] text-white cursor-pointer shadow-subtle hover:shadow-md'
                      : 'bg-charcoal-300 text-charcoal-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>Connect & Generate Snippet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setWizardOpen(false);
                    showToast('Gateway Connection successfully saved.');
                  }}
                  className="px-5 py-2 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Done
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
