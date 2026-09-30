import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  Copy,
  Printer,
  ChevronRight,
  Sliders,
  Zap,
  Globe2,
  Lock
} from 'lucide-react';
import { LegalNavHeader } from '../components/LegalNavHeader';

interface TermsOfServicePageProps {
  onNavigate: (route: string) => void;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onNavigate }) => {
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
    { id: 'acceptance', title: '1. Acceptance of Terms & Master Agreement' },
    { id: 'services-description', title: '2. Description of OstraOps Services' },
    { id: 'accounts-roles', title: '3. Accounts, Workspaces & Security' },
    { id: 'byok-upstream', title: '4. Virtual Keys & Upstream Provider Relations' },
    { id: 'budget-guardrails', title: '5. Hard Budget Limits & Circuit Breakers' },
    { id: 'acceptable-use', title: '6. Acceptable Use Policy (AUP)' },
    { id: 'ip-ownership', title: '7. Customer Data & Intellectual Property' },
    { id: 'fees-billing', title: '8. Subscriptions, Fees & Billing Terms' },
    { id: 'sla-uptime', title: '9. Service Level Agreement (SLA) & Uptime' },
    { id: 'warranties-disclaimer', title: '10. Warranties & Disclaimers' },
    { id: 'liability-limitation', title: '11. Limitation of Liability' },
    { id: 'indemnification', title: '12. Mutual Indemnification' },
    { id: 'termination', title: '13. Term, Suspension & Termination' },
    { id: 'governing-law', title: '14. Governing Law & Dispute Resolution' },
    { id: 'legal-contact', title: '15. Legal Notices & Contact' },
  ];

  return (
    <div className="min-h-screen bg-[#07090C] text-zinc-100 font-sans selection:bg-[#C59E5F]/20 selection:text-[#FFF4D6] pb-24">
      {/* Top Header Navigation */}
      <LegalNavHeader currentPage="terms" onNavigate={onNavigate} />

      {/* Hero Header Banner */}
      <section className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-[#0D1117] via-[#090C10] to-[#07090C] pt-14 pb-12 sm:pt-20 sm:pb-16 px-4 sm:px-6 lg:px-8">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-[#C59E5F]/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C59E5F]/10 border border-[#C59E5F]/30 text-[#E5C38D] text-xs font-mono font-semibold tracking-wide">
            <Scale className="w-3.5 h-3.5" />
            <span>ENTERPRISE MASTER SERVICES AGREEMENT</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-sans">
            Terms of Service &amp; Conditions
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            The legal terms governing access to the OstraOps AI Gateway, FinOps control plane, virtual key proxies, and spend management platform.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Effective: January 1, 2026
            </span>
            <span className="text-zinc-600">•</span>
            <span>Last Revised: March 26, 2026</span>
            <span className="text-zinc-600">•</span>
            <span className="text-[#E5C38D] font-semibold">Version: 3.1-Commercial</span>
          </div>

          {/* Action Toolbar */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Terms</span>
            </button>
            <button
              onClick={() => handleCopyLink('ip-ownership')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              {copiedSection === 'ip-ownership' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Ownership Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy IP Ownership Clause</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 4 Pillars Summary Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0D1016] border border-[#C59E5F]/30 shadow-xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#C59E5F]/15 flex items-center justify-center text-[#E5C38D]">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">100% Customer IP Ownership</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You own all prompts, completions, and fine-tuned models. OstraOps never claims rights over your AI data.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1016] border border-white/[0.08] shadow-xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">BYOK Direct Billing</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You maintain direct relationships with OpenAI/Anthropic. OstraOps provides governance and budget enforcement.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1016] border border-white/[0.08] shadow-xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Automated Circuit Breakers</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Hard budget limits cut off runaway loops automatically, safeguarding against surprise LLM billing spikes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1016] border border-white/[0.08] shadow-xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
              <Globe2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">99.9% Gateway Uptime SLA</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enterprise-grade high availability, multi-region routing failover, and local disk spooling.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Sticky Table of Contents */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C38D]">
                    Terms Navigation
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">15 Sections</span>
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
                    onClick={() => onNavigate('privacy')}
                    className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-xs font-semibold text-zinc-300 hover:text-[#E5C38D] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Privacy Policy &amp; Zero-Storage</span>
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

          {/* Right Column: In-Depth Terms Text */}
          <div className="lg:col-span-8 space-y-12 leading-relaxed text-zinc-300">
            {/* 1. Acceptance */}
            <section id="acceptance" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  1. Acceptance of Terms &amp; Master Agreement
                </h2>
                <button onClick={() => handleCopyLink('acceptance')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm">
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between your organization (&quot;Customer&quot;, &quot;you&quot;, or &quot;your&quot;) 
                and <strong className="text-white">OstraOps Technologies Inc.</strong> (&quot;OstraOps&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). 
                By creating an account, running the OstraOps gateway proxy binary, utilizing the OstraOps SDKs, or accessing our web management consoles, you expressly accept and agree to be bound by these Terms.
              </p>
              <p className="text-sm text-zinc-400">
                If you are entering into these Terms on behalf of an enterprise or other corporate entity, you represent and warrant that you possess full legal authority to bind that entity to this agreement.
              </p>
            </section>

            {/* 2. Services Description */}
            <section id="services-description" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  2. Description of OstraOps Services
                </h2>
                <button onClick={() => handleCopyLink('services-description')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm">
                OstraOps provides enterprise-grade AI infrastructure, including:
              </p>
              <ul className="text-xs sm:text-sm list-disc list-inside space-y-1.5 text-zinc-400 pl-2">
                <li><strong className="text-white">Intelligent Reverse Gateway Proxy:</strong> High-throughput HTTP/gRPC proxy forwarding prompts directly to upstream LLM APIs (OpenAI, Anthropic, Gemini, DeepSeek, Mistral, Kimi, Ollama) with sub-millisecond overhead.</li>
                <li><strong className="text-white">Real-Time FinOps &amp; Token Telemetry Engine:</strong> Parsing and calculating token usage, latency, Time-To-First-Token (TTFT), and financial dollar cost in real time.</li>
                <li><strong className="text-white">Virtual API Key Management:</strong> Provisioning cryptographically hashed virtual keys (<code className="text-[#E5C38D] font-mono">ostra-live-...</code>) configured with granular per-project and per-team budget limits.</li>
                <li><strong className="text-white">Hard Budget Guardrails &amp; Circuit Breakers:</strong> Automated enforcement engines stopping runaway programmatic loops or excessive token expenditures.</li>
                <li><strong className="text-white">Local Resiliency &amp; Dead-Letter Spooling:</strong> Local buffer persistence (<code className="text-[#E5C38D] font-mono">ostraops_spool.db</code>) ensuring continuous operation even in offline or intermittent edge conditions.</li>
              </ul>
            </section>

            {/* 3. Accounts & Roles */}
            <section id="accounts-roles" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  3. Accounts, Workspaces &amp; Security
                </h2>
                <button onClick={() => handleCopyLink('accounts-roles')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm">
                You must provide accurate, current, and verifiable corporate identity information during account registration and onboarding. You are solely responsible for:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1">
                  <span className="text-white font-semibold block">Virtual Secret Key Custody</span>
                  <span className="text-zinc-400">Restricting access to raw virtual keys. Plaintext keys are shown once upon creation and cannot be retrieved later.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1">
                  <span className="text-white font-semibold block">Team Role Allocations</span>
                  <span className="text-zinc-400">Managing user seat assignments (Admin, Developer, Billing Viewer) and revoking access for terminated personnel.</span>
                </div>
              </div>
            </section>

            {/* 4. BYOK & Upstream Relations */}
            <section id="byok-upstream" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  4. Virtual Keys &amp; Upstream Provider Relations
                </h2>
                <button onClick={() => handleCopyLink('byok-upstream')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 rounded-xl bg-[#0B0E14] border border-[#C59E5F]/30 text-xs sm:text-sm space-y-2">
                <div className="text-[#E5C38D] font-bold font-mono">BRING YOUR OWN KEY (BYOK) PARADIGM:</div>
                <p className="text-zinc-300 leading-relaxed">
                  OstraOps acts as an orchestration, proxy, and FinOps telemetry plane. You must maintain your own valid, paid developer accounts directly with model providers (such as OpenAI LLC, Anthropic PBC, Google LLC, Amazon Web Services).
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  You are solely responsible for all raw token inference costs billed directly by those model providers. OstraOps does not resell model inference tokens or mark up provider token rates unless expressly stated in an Enterprise Managed Unified Billing contract.
                </p>
              </div>
            </section>

            {/* 5. Hard Budget Limits */}
            <section id="budget-guardrails" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  5. Hard Budget Limits &amp; Circuit Breakers
                </h2>
                <button onClick={() => handleCopyLink('budget-guardrails')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm">
                When you configure a hard spend cap or virtual key budget limit, OstraOps monitors aggregate spend in real time. Upon crossing the specified threshold:
              </p>
              <ul className="text-xs sm:text-sm list-disc list-inside space-y-1.5 text-zinc-400 pl-2">
                <li>Subsequent inbound requests using that virtual key receive an immediate <code className="text-[#E5C38D] font-mono">HTTP 429 RateLimitExceeded / BudgetCapReached</code> response.</li>
                <li>Upstream network dispatches are blocked at the edge before incurring additional provider spend.</li>
                <li><strong className="text-white">Concurrency Notice:</strong> Requests already in flight at the microsecond the threshold is crossed will complete normally. A nominal buffer variance may occur due to simultaneous parallel asynchronous socket streaming.</li>
              </ul>
            </section>

            {/* 6. Acceptable Use Policy */}
            <section id="acceptable-use" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  6. Acceptable Use Policy (AUP)
                </h2>
                <button onClick={() => handleCopyLink('acceptable-use')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm">You agree not to use OstraOps to:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-zinc-300 space-y-1">
                  <strong className="text-red-400 block font-semibold">Prohibited Content Generation</strong>
                  <span>Circumvent safety filters to generate illegal, CSAM, terrorist, malware, or biological weapon materials.</span>
                </div>
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-zinc-300 space-y-1">
                  <strong className="text-red-400 block font-semibold">Gateway Exploitation</strong>
                  <span>Decompile, reverse-engineer, or disassemble the gateway binary, or conduct uncoordinated volumetric DDoS attacks.</span>
                </div>
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-zinc-300 space-y-1">
                  <strong className="text-red-400 block font-semibold">Key Fraud &amp; Abuse</strong>
                  <span>Share single virtual keys across unauthorized third parties outside your designated organizational tenant boundary.</span>
                </div>
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-zinc-300 space-y-1">
                  <strong className="text-red-400 block font-semibold">Upstream Terms Violation</strong>
                  <span>Violate OpenAI, Anthropic, or Google policies through unmetered scraping or unauthorized synthetic data distillation.</span>
                </div>
              </div>
            </section>

            {/* 7. IP Ownership */}
            <section id="ip-ownership" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>7. Customer Data &amp; Intellectual Property</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30">
                    YOU OWN 100%
                  </span>
                </h2>
                <button onClick={() => handleCopyLink('ip-ownership')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-3">
                <p className="text-sm font-semibold text-white">
                  Customer Retains Sole and Exclusive Ownership of:
                </p>
                <ul className="text-xs sm:text-sm list-disc list-inside space-y-1 text-zinc-300 pl-2">
                  <li>All prompt texts, instructions, user inputs, code repositories, document embeddings, and context payloads.</li>
                  <li>All completions, generated responses, code artifacts, and reasoning traces produced by model inference.</li>
                  <li>All proprietary fine-tuned model checkpoints and custom organizational business logic.</li>
                </ul>
                <div className="pt-2 border-t border-white/[0.06] text-xs text-zinc-400 leading-relaxed">
                  OstraOps retains all rights, title, and interest in and to the platform software, gateway proxy architecture, algorithms, UI designs, trademarks, and documentation.
                </div>
              </div>
            </section>

            {/* 8. Fees & Billing */}
            <section id="fees-billing" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  8. Subscriptions, Fees &amp; Billing Terms
                </h2>
                <button onClick={() => handleCopyLink('fees-billing')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm">
                OstraOps platform fees are billed on a recurring monthly or annual subscription basis according to your chosen plan tier (Hobby, Developer, Team Scale, Enterprise). Payments are processed securely via our billing partner Stripe Inc.
              </p>
              <ul className="text-xs sm:text-sm list-disc list-inside space-y-1 text-zinc-400 pl-2">
                <li><strong className="text-white">Invoicing &amp; Payment Methods:</strong> Valid credit card or approved enterprise Net-30 invoicing for Enterprise contracts.</li>
                <li><strong className="text-white">Cancellation:</strong> You may cancel your subscription at any time via the console. Access persists until the end of the current paid billing cycle.</li>
                <li><strong className="text-white">Refunds:</strong> Platform subscription fees are non-refundable except where mandated by local consumer protection statutes.</li>
              </ul>
            </section>

            {/* 9. SLA */}
            <section id="sla-uptime" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  9. Service Level Agreement (SLA) &amp; Uptime
                </h2>
                <button onClick={() => handleCopyLink('sla-uptime')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm">
                For Enterprise tier customers, OstraOps commits to a <strong className="text-white">99.9% Monthly Gateway Proxy Uptime</strong>.
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Uptime excludes scheduled maintenance announced at least 48 hours in advance, upstream model provider outages (e.g. an OpenAI API service disruption), or Force Majeure events. Real-time platform status is monitored publicly at <code className="text-[#E5C38D] font-mono">status.ostraops.com</code>.
              </p>
            </section>

            {/* 10. Warranties & Disclaimers */}
            <section id="warranties-disclaimer" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  10. Warranties &amp; Disclaimers
                </h2>
                <button onClick={() => handleCopyLink('warranties-disclaimer')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono text-zinc-400 space-y-2 uppercase leading-relaxed">
                EXCEPT AS EXPRESSLY PROVIDED HEREIN, THE OSTRAOPS PLATFORM AND GATEWAY ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. OSTRAOPS DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT GENERATIVE AI COMPLETIONS RETURNED BY UPSTREAM PROVIDERS ARE FACTUAL, ACCURATE, UNBIASED, OR FREE OF HALLUCINATION.
              </div>
            </section>

            {/* 11. Limitation of Liability */}
            <section id="liability-limitation" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  11. Limitation of Liability
                </h2>
                <button onClick={() => handleCopyLink('liability-limitation')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL OSTRAOPS OR ITS OFFICERS, DIRECTORS, OR EMPLOYEES BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS INTERRUPTION.
              </p>
              <p className="text-sm text-zinc-400">
                OSTRAOPS&apos; TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL BE STRICTLY LIMITED TO THE TOTAL AMOUNT ACTUALLY PAID BY CUSTOMER TO OSTRAOPS IN THE TWELVE (12) MONTHS PRECEDING THE INCIDENT GIVING RISE TO LIABILITY.
              </p>
            </section>

            {/* 12. Mutual Indemnification */}
            <section id="indemnification" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  12. Mutual Indemnification
                </h2>
                <button onClick={() => handleCopyLink('indemnification')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm">
                <strong className="text-white">By Customer:</strong> You agree to defend, indemnify, and hold harmless OstraOps from and against any third-party claims, liabilities, or expenses arising from your violation of our Acceptable Use Policy, illegal content generated through your account, or breach of upstream model provider agreements.
              </p>
              <p className="text-sm text-zinc-400">
                <strong className="text-white">By OstraOps:</strong> OstraOps agrees to defend and indemnify Customer against any claim by a third party alleging that the core OstraOps gateway software infringes a valid patent or copyright, provided Customer promptly notifies OstraOps and permits sole control of defense.
              </p>
            </section>

            {/* 13. Termination */}
            <section id="termination" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  13. Term, Suspension &amp; Termination
                </h2>
                <button onClick={() => handleCopyLink('termination')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm">
                Either party may terminate this agreement at any time by cancelling account access. OstraOps reserves the right to immediately suspend or restrict API key gateway proxying if we detect active security compromises, non-payment, or volumetric infrastructure abuse posing risk to our platform stability.
              </p>
            </section>

            {/* 14. Governing Law */}
            <section id="governing-law" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  14. Governing Law &amp; Dispute Resolution
                </h2>
                <button onClick={() => handleCopyLink('governing-law')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm">
                These Terms are governed by and construed under the laws of the State of Delaware, United States, without regard to conflict of law principles. Any dispute arising out of or related to these Terms shall be resolved through confidential, binding arbitration administered by JAMS or AAA under its Commercial Arbitration Rules.
              </p>
              <p className="text-xs text-zinc-400">
                Both parties agree that all claims must be brought on an individual basis and waive any right to participate in a class, collective, or representative action lawsuit.
              </p>
            </section>

            {/* 15. Legal Notices */}
            <section id="legal-contact" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  15. Legal Notices &amp; Contact
                </h2>
                <button onClick={() => handleCopyLink('legal-contact')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-2">
                <p className="text-sm text-zinc-300">
                  Legal notices, subpoenas, or enterprise MSA inquiries should be addressed to our legal counsel:
                </p>
                <div className="text-xs font-mono text-zinc-400 space-y-1">
                  <div><strong className="text-white">Email:</strong> legal@ostraops.com</div>
                  <div><strong className="text-white">Enterprise Contracts:</strong> enterprise@ostraops.com</div>
                  <div><strong className="text-white">Entity:</strong> OstraOps Technologies Inc. (Attn: General Counsel)</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
