import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Cpu,
  EyeOff,
  CheckCircle2,
  FileCheck,
  Copy,
  Printer,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import { LegalNavHeader } from '../components/LegalNavHeader';

interface PrivacyPolicyPageProps {
  onNavigate: (route: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyLink = (sectionId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
    navigator.clipboard.writeText(url);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const sections = [
    { id: 'introduction', title: '1. Overview & Architectural Scope' },
    { id: 'zero-prompt-pledge', title: '2. The Zero-Prompt-Storage Pledge' },
    { id: 'data-we-collect', title: '3. Data & Metadata We Collect' },
    { id: 'data-we-never-collect', title: '4. Data We Explicitly Never Collect' },
    { id: 'telemetry-finops', title: '5. How Telemetry & FinOps Are Calculated' },
    { id: 'upstream-providers', title: '6. Upstream LLM Providers & Pass-Through' },
    { id: 'security-kms', title: '7. Key Management & Cryptographic Security' },
    { id: 'retention-spooling', title: '8. Data Retention & Dead-Letter Spooling' },
    { id: 'gdpr-ccpa-rights', title: '9. Your Rights Under GDPR & CCPA/CPRA' },
    { id: 'subprocessors', title: '10. Authorized Subprocessors' },
    { id: 'international-transfers', title: '11. Cross-Border Data Transfers' },
    { id: 'contact-dpo', title: '12. Contact & Data Protection Officer' },
  ];

  return (
    <div className="min-h-screen bg-[#07090C] text-zinc-100 font-sans selection:bg-[#C59E5F]/20 selection:text-[#FFF4D6] pb-24">
      {/* Top Header Navigation */}
      <LegalNavHeader currentPage="privacy" onNavigate={onNavigate} />

      {/* Hero Header Banner */}
      <section className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-[#0D1117] via-[#090C10] to-[#07090C] pt-14 pb-12 sm:pt-20 sm:pb-16 px-4 sm:px-6 lg:px-8">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-[#C59E5F]/10 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C59E5F]/10 border border-[#C59E5F]/30 text-[#E5C38D] text-xs font-mono font-semibold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ENTERPRISE PRIVACY &amp; DATA GOVERNANCE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-sans">
            OstraOps Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Our architectural commitment to zero prompt storage, end-to-end cryptographic key protection, and mathematical FinOps spend tracking.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Effective: January 1, 2026
            </span>
            <span className="text-zinc-600">•</span>
            <span>Last Revised: March 26, 2026</span>
            <span className="text-zinc-600">•</span>
            <span className="text-[#E5C38D] font-semibold">Version: 2.4-Production</span>
          </div>

          {/* Action Toolbar */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Policy</span>
            </button>
            <button
              onClick={() => handleCopyLink('zero-prompt-pledge')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              {copiedSection === 'zero-prompt-pledge' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Pledge Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Zero-Storage Pledge</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 4 Pillars Callout Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0D1016] border border-[#C59E5F]/30 shadow-xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#C59E5F]/15 flex items-center justify-center text-[#E5C38D]">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Zero Prompt Retention</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We never inspect, store, or train on prompts, completions, embeddings, or code context.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1016] border border-white/[0.08] shadow-xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">AES-256-GCM Vault</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Provider API keys encrypted at rest with hardware-isolated KMS keys and ephemeral memory decryptions.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1016] border border-white/[0.08] shadow-xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Telemetry-Only FinOps</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Token usage integers, latency milliseconds, and cost calculations are all we process.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1016] border border-white/[0.08] shadow-xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400">
              <FileCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">GDPR &amp; SOC-2 Aligned</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Full data subject rights, immediate audit trail export, and automated compliance logging.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Layout with Sticky Table of Contents */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Sticky Table of Contents */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C38D]">
                    Table of Contents
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">12 Sections</span>
                </div>

                <nav className="space-y-1">
                  {sections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all truncate"
                    >
                      {sec.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Related Policies Box */}
              <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Related Documents
                </span>
                <div className="space-y-2">
                  <button
                    onClick={() => onNavigate('terms')}
                    className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-xs font-semibold text-zinc-300 hover:text-[#E5C38D] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Terms of Service</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigate('cookies')}
                    className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-xs font-semibold text-zinc-300 hover:text-[#E5C38D] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Cookie &amp; Data Governance</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Full Detailed Content */}
          <div className="lg:col-span-8 space-y-12 leading-relaxed text-zinc-300">
            {/* 1. Overview */}
            <section id="introduction" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  1. Overview &amp; Architectural Scope
                </h2>
                <button
                  onClick={() => handleCopyLink('introduction')}
                  className="text-zinc-500 hover:text-[#E5C38D] p-1 transition-colors"
                  title="Copy section link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm">
                This Privacy Policy details the data protection, operational boundaries, and security protocols enforced by{' '}
                <strong className="text-white">OstraOps Technologies Inc.</strong> (&quot;OstraOps&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). 
                OstraOps develops and hosts high-performance AI Gateway proxies, spend optimization governance systems, real-time token tracking engines, and FinOps analytics dashboards.
              </p>
              <p className="text-sm">
                This policy applies to all interactions with the OstraOps software suite, including:
              </p>
              <ul className="text-xs sm:text-sm list-disc list-inside space-y-1 text-zinc-400 pl-2">
                <li>The OstraOps Intelligent Reverse Gateway (<code className="text-[#E5C38D] font-mono">gateway.ostraops.com</code> and local proxy daemons <code className="text-[#E5C38D] font-mono">http://localhost:8080</code>).</li>
                <li>The OstraOps Management Console, Team Analytics Hub, and Virtual Key Management Portal.</li>
                <li>The OstraOps SDKs, CLI utilities (<code className="text-[#E5C38D] font-mono">ostraops-guard</code>, <code className="text-[#E5C38D] font-mono">vss server</code>), and automated CI/CD guardrail plugins.</li>
              </ul>
            </section>

            {/* 2. Zero-Prompt-Storage Pledge */}
            <section id="zero-prompt-pledge" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>2. The Zero-Prompt-Storage Pledge</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    NON-NEGOTIABLE CORE
                  </span>
                </h2>
                <button
                  onClick={() => handleCopyLink('zero-prompt-pledge')}
                  className="text-zinc-500 hover:text-[#E5C38D] p-1 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#0F141C] border border-[#C59E5F]/40 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-[#E5C38D] font-bold text-sm font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  <span>ARCHITECTURAL PROMISE: ZERO PROMPT LOGGING</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  OstraOps was architected from line one with an absolute zero-data-retention invariant for all generative payload contents. 
                  When your application dispatches a request to OpenAI, Anthropic, Gemini, DeepSeek, or an on-premise model through OstraOps, 
                  <strong className="text-white"> your prompt text, messages, chat history, tool calls, and LLM generated output stream directly between your client and the model provider in an ephemeral stream.</strong>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/[0.06] text-zinc-300">
                    <span className="text-red-400 font-bold">✗</span>
                    <span>No prompt logging into database</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/[0.06] text-zinc-300">
                    <span className="text-red-400 font-bold">✗</span>
                    <span>No completion or response caching</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/[0.06] text-zinc-300">
                    <span className="text-red-400 font-bold">✗</span>
                    <span>No AI model training on customer data</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/[0.06] text-zinc-300">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Pure cryptographic token telemetry only</span>
                  </div>
                </div>
              </div>

              <p className="text-sm">
                Our streaming parser extracts only the numerical metrics returned in HTTP response headers and terminal chunk envelopes (such as <code className="text-[#E5C38D] font-mono">usage.prompt_tokens</code> and <code className="text-[#E5C38D] font-mono">usage.completion_tokens</code>). Prompt bodies are immediately freed from memory buffers following network packet transmission.
              </p>
            </section>

            {/* 3. Data We Collect */}
            <section id="data-we-collect" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  3. Data &amp; Metadata We Collect
                </h2>
                <button
                  onClick={() => handleCopyLink('data-we-collect')}
                  className="text-zinc-500 hover:text-[#E5C38D] p-1 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm">
                To provide spend guardrails, hard budget caps, latency alerting, and team allocation reporting, OstraOps collects and processes the following strict categories of data:
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C59E5F]" />
                    <span>A. Computational Telemetry &amp; Gateway Accounting Metadata</span>
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Collected automatically during gateway proxying:
                  </p>
                  <ul className="text-xs list-disc list-inside space-y-1 text-zinc-400 pl-2 font-mono">
                    <li>Input token count, output token count, cached token savings.</li>
                    <li>Request duration, Time to First Token (TTFT), and latency in milliseconds.</li>
                    <li>Computed financial cost in USD according to current public provider rate cards.</li>
                    <li>Upstream model identifier (e.g. <code className="text-zinc-300">gpt-4o-mini</code>, <code className="text-zinc-300">claude-3-5-sonnet</code>).</li>
                    <li>HTTP response status code (e.g. 200, 429, 500) and upstream error category codes.</li>
                    <li>Virtual API Key SHA-256 fingerprint (we never store plain virtual secret keys).</li>
                    <li>Client IP address and User-Agent solely for volumetric rate-limiting and DDoS defense.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>B. Account &amp; Workspace Organization Identity</span>
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Provided during registration or onboarding:
                  </p>
                  <ul className="text-xs list-disc list-inside space-y-1 text-zinc-400 pl-2">
                    <li>Work email address, user display name, and avatar URL.</li>
                    <li>Organization / company name, website, country, state, city, and phone number.</li>
                    <li>Team member permissions, roles (Admin, Developer, Viewer), and invite records.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>C. Encrypted Upstream Provider Credentials</span>
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    When you configure Bring Your Own Key (BYOK) for OpenAI, Anthropic, Gemini, or DeepSeek, keys are encrypted client-side or during ingress using authenticated AES-256-GCM. Plaintext provider keys are never exposed in log files, telemetry exports, or client dashboards.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Data We Explicitly Never Collect */}
            <section id="data-we-never-collect" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  4. Data We Explicitly Never Collect
                </h2>
                <button
                  onClick={() => handleCopyLink('data-we-never-collect')}
                  className="text-zinc-500 hover:text-[#E5C38D] p-1 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm">
                To guarantee enterprise compliance under HIPAA, SOC-2, and GDPR, our software contains hard assertions preventing the capture of:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-zinc-300 space-y-1">
                  <strong className="text-red-400 block font-semibold">No Prompt &amp; System Instructions</strong>
                  <span>We never record the instructions, code, document fragments, or prompts you send to models.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-zinc-300 space-y-1">
                  <strong className="text-red-400 block font-semibold">No Model Completion Payloads</strong>
                  <span>The generative responses produced by LLMs are never saved to disk or relational databases.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-zinc-300 space-y-1">
                  <strong className="text-red-400 block font-semibold">No Vector Embeddings &amp; RAG Chunks</strong>
                  <span>Embedding vectors or retrieved knowledge fragments are never persisted by OstraOps.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-zinc-300 space-y-1">
                  <strong className="text-red-400 block font-semibold">No Customer Model Training</strong>
                  <span>We do not build, train, fine-tune, or calibrate any machine learning models on your activity.</span>
                </div>
              </div>
            </section>

            {/* 5. How Telemetry & FinOps Are Calculated */}
            <section id="telemetry-finops" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  5. How Telemetry &amp; FinOps Are Calculated
                </h2>
                <button
                  onClick={() => handleCopyLink('telemetry-finops')}
                  className="text-zinc-500 hover:text-[#E5C38D] p-1 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm">
                OstraOps applies a real-time mathematical billing engine against your telemetry streams:
              </p>
              <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-mono space-y-2 text-zinc-300">
                <div className="text-[#E5C38D] font-bold">Cost Formula:</div>
                <div className="p-2.5 rounded-lg bg-black/50 border border-white/[0.05] text-zinc-300">
                  Total_Cost = (Input_Tokens * Input_Rate) + (Output_Tokens * Output_Rate) - (Cached_Tokens * Cache_Discount)
                </div>
                <p className="text-[11.5px] font-sans text-zinc-400 pt-1">
                  Rates are synchronized hourly from public pricing schedules released by OpenAI, Anthropic, Google, and DeepSeek. Custom negotiated enterprise rates can be configured per organization in your dashboard.
                </p>
              </div>
            </section>

            {/* 6. Upstream LLM Providers */}
            <section id="upstream-providers" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  6. Upstream LLM Providers &amp; Pass-Through
                </h2>
                <button
                  onClick={() => handleCopyLink('upstream-providers')}
                  className="text-zinc-500 hover:text-[#E5C38D] p-1 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm">
                When you make an inference call, OstraOps acts as an authorized proxy router forwarding your request to the upstream AI provider designated by your request routing configuration (e.g. OpenAI API, Anthropic API, Google Vertex AI / Gemini API, Kimi (Moonshot AI), DeepSeek).
              </p>
              <p className="text-sm text-zinc-400">
                Your relationship with upstream LLM providers is governed directly by your agreements with those respective companies. OstraOps does not claim ownership or assume provider liability for upstream model outputs, service outages, or provider-side retention policies (such as OpenAI&apos;s zero-retention enterprise opt-outs).
              </p>
            </section>

            {/* 7. Key Management & Cryptographic Security */}
            <section id="security-kms" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  7. Key Management &amp; Cryptographic Security
                </h2>
                <button
                  onClick={() => handleCopyLink('security-kms')}
                  className="text-zinc-500 hover:text-[#E5C38D] p-1 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm">
                Security is foundational to our enterprise FinOps gateway. We implement industry-leading standards:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1">
                  <span className="text-[#E5C38D] font-bold block">AES-256-GCM Envelope Encryption</span>
                  <span className="text-zinc-400">All stored provider credentials utilize unique Initialization Vectors (IV) and Galois/Counter Mode authentication tags.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1">
                  <span className="text-[#E5C38D] font-bold block">Salted SHA-256 Virtual Key Hashes</span>
                  <span className="text-zinc-400">Virtual keys (<code className="text-zinc-300 font-mono">ostra-live-...</code>) are hashed with unique organizational salts. Plaintext keys are displayed once upon creation.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1">
                  <span className="text-[#E5C38D] font-bold block">TLS 1.3 Strict In-Transit Encription</span>
                  <span className="text-zinc-400">All traffic across gateways, API endpoints, and dashboards requires TLS 1.3 with Perfect Forward Secrecy (PFS).</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1">
                  <span className="text-[#E5C38D] font-bold block">Role-Based Access Control (RBAC)</span>
                  <span className="text-zinc-400">Strict separation of duties between Workspace Owners, Billing Managers, and Read-Only Auditors.</span>
                </div>
              </div>
            </section>

            {/* 8. Retention & Dead-Letter Spooling */}
            <section id="retention-spooling" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  8. Data Retention &amp; Dead-Letter Spooling
                </h2>
                <button
                  onClick={() => handleCopyLink('retention-spooling')}
                  className="text-zinc-500 hover:text-[#E5C38D] p-1 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm">
                Telemetry log entries (token metrics, request latency, cost allocations) are retained in our analytics engine according to your chosen plan tier:
              </p>
              <ul className="text-xs sm:text-sm list-disc list-inside space-y-1 text-zinc-400 pl-2">
                <li><strong className="text-white">Developer / Hobby Tier:</strong> 30 calendar days.</li>
                <li><strong className="text-white">Team &amp; Scale Tier:</strong> 90 calendar days.</li>
                <li><strong className="text-white">Enterprise Tier:</strong> 365 calendar days or custom retention schedule with direct S3/GCS bucket sink integration.</li>
              </ul>
              <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs space-y-1.5 mt-2">
                <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4" />
                  <span>Resilient Dead-Letter Disk Spooling</span>
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  In local proxy environments, if network connectivity to the central FinOps telemetry sink is temporarily unreachable, events are spooled locally to a secure, encrypted disk file (<code className="text-zinc-300 font-mono">ostraops_spool.db</code>). This file strictly holds token integers and timestamps, never prompt contents, and is flushed immediately upon reconnection.
                </p>
              </div>
            </section>

            {/* 9. GDPR & CCPA/CPRA Rights */}
            <section id="gdpr-ccpa-rights" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  9. Your Rights Under GDPR &amp; CCPA/CPRA
                </h2>
                <button
                  onClick={() => handleCopyLink('gdpr-ccpa-rights')}
                  className="text-zinc-500 hover:text-[#E5C38D] p-1 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm">
                Regardless of your geographic location, OstraOps grants all customer organizations and developers comprehensive data autonomy:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <strong className="text-white block">Right to Access &amp; Portability</strong>
                  <span className="text-zinc-400">Download a full machine-readable JSON/CSV export of all telemetry records, virtual key mappings, and audit logs.</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <strong className="text-white block">Right to Erasure (Forgotten)</strong>
                  <span className="text-zinc-400">Close your workspace to trigger automated cascade purges of identity profiles, encrypted keys, and historical usage logs within 72 hours.</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <strong className="text-white block">Right to Rectification</strong>
                  <span className="text-zinc-400">Request updates or revisions to organization legal details or billing contacts through verified administrator requests.</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <strong className="text-white block">No Sale of Personal Data</strong>
                  <span className="text-zinc-400">We do not sell, rent, monetize, or trade customer metadata, token metrics, or personal data to data brokers or advertisers.</span>
                </div>
              </div>
            </section>

            {/* 10. Subprocessors */}
            <section id="subprocessors" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  10. Authorized Subprocessors
                </h2>
                <button
                  onClick={() => handleCopyLink('subprocessors')}
                  className="text-zinc-500 hover:text-[#E5C38D] p-1 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm">
                OstraOps maintains contractual Data Processing Agreements (DPAs) with strict technical safeguards with our primary cloud infrastructure vendors:
              </p>
              <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0B0E14] text-zinc-400 border-b border-white/[0.08] font-mono">
                    <tr>
                      <th className="py-2.5 px-4">Subprocessor</th>
                      <th className="py-2.5 px-4">Role / Purpose</th>
                      <th className="py-2.5 px-4">Location</th>
                      <th className="py-2.5 px-4">Security Standards</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-zinc-300 font-mono">
                    <tr>
                      <td className="py-2.5 px-4 text-white font-semibold">Supabase Inc.</td>
                      <td className="py-2.5 px-4">PostgreSQL Telemetry DB &amp; Edge Sync</td>
                      <td className="py-2.5 px-4">United States / EU</td>
                      <td className="py-2.5 px-4 text-emerald-400">SOC 2 Type II, ISO 27001</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-white font-semibold">Google Cloud / Firebase</td>
                      <td className="py-2.5 px-4">User Authentication &amp; Profile Directory</td>
                      <td className="py-2.5 px-4">Global / Multi-Region</td>
                      <td className="py-2.5 px-4 text-emerald-400">SOC 1/2/3, FedRAMP, GDPR</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-white font-semibold">Stripe Inc.</td>
                      <td className="py-2.5 px-4">Subscription Billing &amp; Invoicing</td>
                      <td className="py-2.5 px-4">United States</td>
                      <td className="py-2.5 px-4 text-emerald-400">PCI-DSS Level 1</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-white font-semibold">Amazon Web Services (AWS)</td>
                      <td className="py-2.5 px-4">KMS &amp; Cloud Gateway Edge Nodes</td>
                      <td className="py-2.5 px-4">US-East / Frankfurt / Tokyo</td>
                      <td className="py-2.5 px-4 text-emerald-400">SOC 1/2/3, ISO 27001</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 11. International Transfers */}
            <section id="international-transfers" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  11. Cross-Border Data Transfers
                </h2>
                <button
                  onClick={() => handleCopyLink('international-transfers')}
                  className="text-zinc-500 hover:text-[#E5C38D] p-1 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm">
                Where telemetry data is transferred outside the European Economic Area (EEA), United Kingdom, or Switzerland, OstraOps relies on the European Commission&apos;s Standard Contractual Clauses (SCCs) and UK International Data Transfer Addendum (IDTA), complemented by strict encryption in transit and at rest.
              </p>
            </section>

            {/* 12. Contact & DPO */}
            <section id="contact-dpo" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  12. Contact &amp; Data Protection Officer
                </h2>
                <button
                  onClick={() => handleCopyLink('contact-dpo')}
                  className="text-zinc-500 hover:text-[#E5C38D] p-1 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-3">
                <p className="text-sm text-zinc-300">
                  If you have questions, compliance requests, or wish to exercise data subject rights under GDPR or CCPA, our privacy engineering team and Data Protection Officer (DPO) can be reached directly:
                </p>
                <div className="space-y-1 text-xs font-mono text-zinc-400">
                  <div><strong className="text-white">Email:</strong> privacy@ostraops.com</div>
                  <div><strong className="text-white">Security Disclosures:</strong> security@ostraops.com</div>
                  <div><strong className="text-white">Legal Entity:</strong> OstraOps Technologies Inc. (Attn: Legal &amp; Privacy)</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
