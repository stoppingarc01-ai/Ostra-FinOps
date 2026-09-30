import React, { useState } from 'react';
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Copy,
  Clock,
  CreditCard,
  Flame,
  HelpCircle,
  Mail,
  Send,
  Zap,
} from 'lucide-react';
import { LegalNavHeader } from '../components/LegalNavHeader';

interface RefundPolicyPageProps {
  onNavigate: (route: string) => void;
}

export const RefundPolicyPage: React.FC<RefundPolicyPageProps> = ({ onNavigate }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<number>(0);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState('REV-104921');
  const [invoiceId, setInvoiceId] = useState('');
  const [refundReason, setRefundReason] = useState('dissatisfied_platform');

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
    { id: 'four-pillars', title: '1. The 4 Pillars of Our Refund Policy' },
    { id: 'free-trial', title: '2. 7-Day Free Trial Terms & Zero-Billing Guarantee' },
    { id: 'platform-subscriptions', title: '3. Platform Subscriptions & 14-Day Money-Back Guarantee' },
    { id: 'upstream-tokens', title: '4. Pass-Through LLM Tokens & Upstream Inferences' },
    { id: 'circuit-breakers', title: '5. Budget Guardrails, Misconfiguration & Overages' },
    { id: 'sla-service-credits', title: '6. Gateway Outages & SLA Service Credits' },
    { id: 'cancellation-downgrades', title: '7. Cancellation & Plan Downgrades' },
    { id: 'fraud-chargebacks', title: '8. Chargebacks, Fraud Prevention & Key Revocation' },
    { id: 'processing-timelines', title: '9. Payout Timelines, Currencies & Methods' },
    { id: 'how-to-request', title: '10. How to Submit a Refund Review' },
  ];

  const scenarios = [
    {
      title: 'New Team Scale Upgrade (Within 14 Days)',
      badge: '100% Eligible',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'You upgraded from Free to Team Scale 6 days ago, configured virtual keys, but decided your engineering team requires on-prem deployment instead.',
      verdict: 'Full 100% Refund Approved',
      details: 'Eligible under our 14-day initial purchase satisfaction guarantee. Your entire monthly seat fee is refunded directly to your original payment card.',
    },
    {
      title: 'Upstream OpenAI / Anthropic Token Consumption',
      badge: 'Strictly Excluded',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      description: 'Your application ran automated batch testing through the OstraOps loopback proxy, resulting in $185 of GPT-4o and Claude 3.5 Sonnet provider spend.',
      verdict: 'Non-Refundable Upstream COGS',
      details: 'OstraOps acts as a low-latency telemetry and routing gateway. Third-party model providers bill OstraOps in real-time for compute cycles. Consumed tokens cannot be refunded.',
    },
    {
      title: 'Gateway Proxy SLA Disruption (>99.9% Downtime)',
      badge: 'SLA Credit Issued',
      badgeColor: 'bg-[#C59E5F]/15 text-[#E5C38D] border-[#C59E5F]/30',
      description: 'Our primary gateway proxy experienced an unplanned 75-minute routing outage during your critical launch window.',
      verdict: 'Service Credit Equal to 25% Monthly Fee',
      details: 'Per our SLA, system outages below 99.9% uptime result in automatic invoice credits applied directly toward your upcoming billing cycle.',
    },
    {
      title: 'Inactive Renewal (Reported Within 7 Days)',
      badge: 'Courtesy Refund',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      description: 'Your subscription renewed for $49/mo, but audit telemetry verifies 0 API calls, 0 token routing requests, and no developer logins.',
      verdict: '100% Courtesy Refund Granted',
      details: 'If zero requests were processed through the proxy during the renewed period and reported within 7 business days, we refund the renewal in full.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090C] text-zinc-100 font-sans selection:bg-[#C59E5F]/20 selection:text-[#FFF4D6] pb-24">
      {/* Top Header Navigation */}
      <LegalNavHeader currentPage="refund" onNavigate={onNavigate} />

      {/* Hero Header Banner */}
      <section className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-[#0D1117] via-[#090C10] to-[#07090C] pt-14 pb-12 sm:pt-20 sm:pb-16 px-4 sm:px-6 lg:px-8">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-[#C59E5F]/10 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C59E5F]/10 border border-[#C59E5F]/30 text-[#E5C38D] text-xs font-mono font-semibold tracking-wide">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>TRANSPARENT BILLING &amp; FAIR RESOLUTION</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-sans">
            OstraOps Refund Policy
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Clear, balanced terms governing our 7-day free trial, SaaS subscriptions, third-party LLM token pass-throughs, and gateway uptime SLA credits.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              14-Day Money-Back Guarantee
            </span>
            <span className="text-zinc-600">•</span>
            <span>Zero Upfront Card on 7-Day Trial</span>
            <span className="text-zinc-600">•</span>
            <span className="text-[#E5C38D] font-semibold">Version: 2.1-Active</span>
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
              onClick={() => handleCopyLink('four-pillars')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              {copiedSection === 'four-pillars' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Section Link</span>
                </>
              )}
            </button>
            <button
              onClick={() => setTicketModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C59E5F] text-[#080A0E] text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Request Billing Review</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Layout with Sticky Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Sticky Table of Contents */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 space-y-4 p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-md">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                  Table of Contents
                </span>
                <span className="text-[10px] font-mono text-[#E5C38D] bg-[#E5C38D]/10 px-2 py-0.5 rounded">
                  10 Clauses
                </span>
              </div>

              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-xs text-zinc-400 hover:text-[#E5C38D] py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors truncate"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>

              {/* Fast SLA Contact Box */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C59E5F]" />
                  <span>24-Hour Review Turnaround</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Our finance team reviews refund requests within 24 business hours.
                </p>
                <button
                  onClick={() => setTicketModalOpen(true)}
                  className="w-full py-1.5 text-center text-xs font-bold text-[#E5C38D] hover:underline"
                >
                  Submit Ticket &rarr;
                </button>
              </div>
            </div>
          </aside>

          {/* Right Main Policy Content */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-12">

            {/* ========================================================== */}
            {/* CLAUSE 1: THE 4 PILLARS (INTERACTIVE CARDS)                */}
            {/* ========================================================== */}
            <section id="four-pillars" className="scroll-mt-24 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  1. The 4 Pillars of Our Refund Policy
                </h2>
                <button
                  onClick={() => handleCopyLink('four-pillars')}
                  className="text-zinc-500 hover:text-white p-1 rounded"
                  title="Copy link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                OstraOps combines traditional SaaS infrastructure seats with high-frequency, pass-through LLM proxy traffic. To protect both developer flexibility and financial integrity, our refund model operates under four strict, transparent tiers:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Pillar 1 */}
                <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Zero Risk
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">7-Day Free Trial</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    No credit card is required to begin. You will never experience surprise charges during trial access. Cancel anytime with a single click.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-[#C59E5F]/15 text-[#E5C38D]">
                      <RotateCcw className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30">
                      100% Guaranteed
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">14-Day Initial Window</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    If you upgrade to Team Scale or Hosted Gateway and are dissatisfied for any reason within 14 days, we refund 100% of the platform seat fee.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                      <CreditCard className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Pro-Rated
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Annual Commitments</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Annual contracts cancelled within 30 days are refunded for all unused months, adjusted against the standard non-discounted monthly rate.
                  </p>
                </div>

                {/* Pillar 4 */}
                <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <Flame className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      Hard Pass-Through
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Upstream LLM Token Spend</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Tokens consumed through OpenAI, Anthropic, or Google APIs routed via the gateway represent hard upstream COGS and are strictly non-refundable.
                  </p>
                </div>
              </div>
            </section>

            {/* ========================================================== */}
            {/* INTERACTIVE ELIGIBILITY SIMULATOR                           */}
            {/* ========================================================== */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#10141D] to-[#0A0D13] border border-white/[0.1] shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#C59E5F]" />
                  <h3 className="text-base font-bold text-white">
                    Interactive Refund Decision Simulator
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  Select your scenario to verify refund eligibility
                </span>
              </div>

              {/* Scenario Selector Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {scenarios.map((sc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveScenario(idx)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      activeScenario === idx
                        ? 'bg-[#C59E5F]/15 border-[#C59E5F]/50 text-white shadow-sm'
                        : 'bg-[#07090C] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="font-semibold truncate">{sc.title}</div>
                    <div className={`mt-1.5 inline-block text-[10px] font-mono px-2 py-0.5 rounded-full border ${sc.badgeColor}`}>
                      {sc.badge}
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Scenario Verdict Card */}
              <div className="p-4 rounded-2xl bg-[#07090C] border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-500 uppercase">Scenario Verdict</span>
                  <span className="text-xs font-mono font-bold text-[#E5C38D]">
                    {scenarios[activeScenario].verdict}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {scenarios[activeScenario].description}
                </p>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-zinc-400 font-mono">
                  {scenarios[activeScenario].details}
                </div>
              </div>
            </div>

            {/* ========================================================== */}
            {/* CLAUSE 2: 7-DAY FREE TRIAL                                 */}
            {/* ========================================================== */}
            <section id="free-trial" className="scroll-mt-24 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  2. 7-Day Free Trial Terms &amp; Zero-Billing Guarantee
                </h2>
                <button onClick={() => handleCopyLink('free-trial')} className="text-zinc-500 hover:text-white p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
                <p>
                  Every new organization registered on OstraOps begins with an unrestricted <strong>7-Day Free Trial</strong>. During this trial, teams gain complete access to model routing, virtual key generation, budget telemetry, rate limiting, and observability features.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
                  <li><strong>Zero Upfront Payment Method:</strong> No credit card, bank detail, or prepaid deposit is required to initialize your 7-day trial.</li>
                  <li><strong>No Involuntary Conversions:</strong> When your 7-day trial concludes, your account does not auto-bill into an active paid plan. Instead, proxy access pauses gracefully until an administrator explicitly selects and confirms a paid tier.</li>
                  <li><strong>Instant Cancellation:</strong> Users can deactivate or terminate their account at any time with zero financial obligations.</li>
                </ul>
              </div>
            </section>

            {/* ========================================================== */}
            {/* CLAUSE 3: PLATFORM SUBSCRIPTIONS & 14-DAY GUARANTEE        */}
            {/* ========================================================== */}
            <section id="platform-subscriptions" className="scroll-mt-24 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  3. Platform Subscriptions &amp; 14-Day Money-Back Guarantee
                </h2>
                <button onClick={() => handleCopyLink('platform-subscriptions')} className="text-zinc-500 hover:text-white p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
                <p>
                  For paid tiers (such as Team Scale and Hosted Gateway), the recurring fee covers gateway governance infrastructure, observability dashboards, and virtual key circuit breaker pipelines:
                </p>
                
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <h4 className="text-xs font-bold text-[#E5C38D] uppercase font-mono tracking-wider">
                    First-Time Upgrade Grace Period
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    If an organization transitions to a paid subscription and finds the platform unsuitable, an authorized account owner may request a <strong>100% full refund</strong> within <strong>14 calendar days</strong> of the initial charge.
                  </p>
                </div>

                <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
                  <li><strong>Monthly Renewals:</strong> Recurring monthly subscription fees are non-refundable once billed. Account administrators must cancel prior to the renewal date to avoid recurring charges.</li>
                  <li><strong>Annual Subscriptions:</strong> Annual commitments cancelled within 30 days are refunded pro-rata for unused months, computed using the standard single-month tier rate for the consumed period.</li>
                  <li><strong>Downgrades:</strong> Downgrading an account mid-cycle maintains current tier features until the conclusion of the paid term. Unused portions are not disbursed as cash refunds.</li>
                </ul>
              </div>
            </section>

            {/* ========================================================== */}
            {/* CLAUSE 4: UPSTREAM LLM TOKEN SPEND                         */}
            {/* ========================================================== */}
            <section id="upstream-tokens" className="scroll-mt-24 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  4. Pass-Through LLM Tokens &amp; Upstream Inferences
                </h2>
                <button onClick={() => handleCopyLink('upstream-tokens')} className="text-zinc-500 hover:text-white p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
                <p>
                  OstraOps operates as an intelligent loopback proxy and cost guardrail. Any LLM inference queries dispatched through the gateway to third-party providers (including OpenAI, Anthropic, Google Vertex AI, AWS Bedrock, and DeepSeek) incur real infrastructure compute costs.
                </p>

                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-300 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Non-Refundable Infrastructure Expenditure (COGS)</span>
                  </div>
                  <p className="leading-relaxed">
                    Once a request is successfully forwarded to an upstream model and tokens are generated, third-party model providers invoice OstraOps synchronously. As a consequence, token pass-through charges, prompt cache misses, and upstream model errors are strictly non-refundable.
                  </p>
                </div>
              </div>
            </section>

            {/* ========================================================== */}
            {/* CLAUSE 5: CIRCUIT BREAKERS & MISCONFIGURATIONS              */}
            {/* ========================================================== */}
            <section id="circuit-breakers" className="scroll-mt-24 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  5. Budget Guardrails, Misconfiguration &amp; Overages
                </h2>
                <button onClick={() => handleCopyLink('circuit-breakers')} className="text-zinc-500 hover:text-white p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
                <p>
                  OstraOps provides automated circuit breakers, rate limiters, and budget hard caps. Customers are solely responsible for setting appropriate thresholds on their virtual keys:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
                  <li><strong>Prompt Loops &amp; Runaway Scripts:</strong> OstraOps cannot refund charges caused by client-side recursive function loops, prompt routing bugs, or developer-configured model overrides.</li>
                  <li><strong>Zero-Retention Verification:</strong> Because OstraOps adheres to a strict Zero-Prompt Retention policy (ZDR), we never log or inspect prompt payloads to retroactively audit client logic errors.</li>
                </ul>
              </div>
            </section>

            {/* ========================================================== */}
            {/* CLAUSE 6: SLA SERVICE CREDITS                              */}
            {/* ========================================================== */}
            <section id="sla-service-credits" className="scroll-mt-24 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  6. Gateway Outages &amp; SLA Service Credits
                </h2>
                <button onClick={() => handleCopyLink('sla-service-credits')} className="text-zinc-500 hover:text-white p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
                <p>
                  We guarantee 99.9% monthly availability for the OstraOps gateway proxy. In the event of an unplanned outage caused solely by our infrastructure, accounts are compensated via <strong>Service Credits</strong>:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono text-left border border-white/[0.08] rounded-xl overflow-hidden">
                    <thead className="bg-[#0B0E14] text-zinc-400 border-b border-white/[0.08]">
                      <tr>
                        <th className="p-3">Monthly Uptime Percentage</th>
                        <th className="p-3">Service Credit Entitlement</th>
                        <th className="p-3">Remedy Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] bg-black/40">
                      <tr>
                        <td className="p-3 text-white">99.0% &ndash; 99.89%</td>
                        <td className="p-3 text-[#E5C38D]">10% of monthly platform fee</td>
                        <td className="p-3 text-zinc-400">Credit applied to next invoice</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white">95.0% &ndash; 98.99%</td>
                        <td className="p-3 text-[#E5C38D]">25% of monthly platform fee</td>
                        <td className="p-3 text-zinc-400">Credit applied to next invoice</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white">&lt; 95.0%</td>
                        <td className="p-3 text-emerald-400 font-bold">50% of monthly platform fee</td>
                        <td className="p-3 text-zinc-400">Direct credit or billing waiver</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* ========================================================== */}
            {/* CLAUSE 7: CANCELLATIONS & DOWNGRADES                       */}
            {/* ========================================================== */}
            <section id="cancellation-downgrades" className="scroll-mt-24 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  7. Cancellation &amp; Plan Downgrades
                </h2>
                <button onClick={() => handleCopyLink('cancellation-downgrades')} className="text-zinc-500 hover:text-white p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
                <p>
                  You can cancel your subscription at any time without calling support or undergoing retention barriers. Simply navigate to <strong>Dashboard &rarr; Settings &rarr; Billing &rarr; Cancel Subscription</strong>.
                </p>
                <p className="text-zinc-400">
                  Upon cancellation, your existing virtual keys and telemetry dashboards remain fully functional through the end of your current paid billing period. After this date, proxy traffic gracefully pauses without penalizing your production apps.
                </p>
              </div>
            </section>

            {/* ========================================================== */}
            {/* CLAUSE 8: FRAUD & CHARGEBACKS                              */}
            {/* ========================================================== */}
            <section id="fraud-chargebacks" className="scroll-mt-24 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  8. Chargebacks, Fraud Prevention &amp; Key Revocation
                </h2>
                <button onClick={() => handleCopyLink('fraud-chargebacks')} className="text-zinc-500 hover:text-white p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
                <p>
                  We encourage customers to contact our billing team first to resolve any discrepancies. If an unauthorized chargeback or payment reversal is filed through a bank:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
                  <li>All associated gateway virtual keys, proxy endpoints, and org accounts will be immediately locked to prevent bot abuse.</li>
                  <li>A dispute investigation fee of $25 USD may be levied if a chargeback is deemed fraudulent or filed in bad faith.</li>
                </ul>
              </div>
            </section>

            {/* ========================================================== */}
            {/* CLAUSE 9: TIMELINES & METHODS                              */}
            {/* ========================================================== */}
            <section id="processing-timelines" className="scroll-mt-24 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  9. Payout Timelines, Currencies &amp; Methods
                </h2>
                <button onClick={() => handleCopyLink('processing-timelines')} className="text-zinc-500 hover:text-white p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
                  <li><strong>Processing Window:</strong> Approved refunds are dispatched via Stripe or Razorpay within <strong>2 business days</strong>. Banks may require an additional 5&ndash;10 business days to reflect the balance on your statement.</li>
                  <li><strong>Original Source:</strong> Refunds are returned exclusively to the original credit card, bank account, or payment instrument used at checkout.</li>
                  <li><strong>Currency Fluctuation:</strong> Refunds are issued in the currency of the initial invoice (USD). OstraOps is not responsible for international exchange fee differentials applied by the cardholder’s bank.</li>
                </ul>
              </div>
            </section>

            {/* ========================================================== */}
            {/* CLAUSE 10: HOW TO SUBMIT A REQUEST                         */}
            {/* ========================================================== */}
            <section id="how-to-request" className="scroll-mt-24 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  10. How to Submit a Refund Review
                </h2>
                <button onClick={() => handleCopyLink('how-to-request')} className="text-zinc-500 hover:text-white p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] space-y-4">
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  To request a billing adjustment or refund review, submit a request via our in-app billing console or email our dedicated finance desk with your Organization ID and Invoice Number:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#C59E5F]" />
                      <span>Dedicated Finance Desk</span>
                    </div>
                    <div className="text-xs font-mono text-[#E5C38D]">
                      billing@ostraops.com
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Average response time: &lt; 4 business hours
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#C59E5F]" />
                      <span>In-App Resolution</span>
                    </div>
                    <div className="text-xs text-zinc-300">
                      Settings &rarr; Billing &rarr; Request Review
                    </div>
                    <button
                      onClick={() => setTicketModalOpen(true)}
                      className="text-[11px] font-bold text-[#E5C38D] hover:underline block pt-1"
                    >
                      Open Review Ticket Modal &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>

      {/* ============================================================ */}
      {/* REFUND REQUEST MODAL                                         */}
      {/* ============================================================ */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#0B0E14] border border-white/[0.1] shadow-2xl p-6 sm:p-7 space-y-5 text-white relative">
            <button
              onClick={() => {
                setTicketModalOpen(false);
                setTicketSubmitted(false);
              }}
              className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              &times;
            </button>

            {ticketSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Review Request Received</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Your ticket has been logged with ticket ID <span className="font-mono text-[#E5C38D]">#{generatedTicketId}</span>. Our finance team will reply within 24 business hours.
                </p>
                <button
                  onClick={() => {
                    setTicketModalOpen(false);
                    setTicketSubmitted(false);
                  }}
                  className="mt-4 px-5 py-2 rounded-xl bg-[#C59E5F] text-[#080A0E] text-xs font-bold hover:brightness-110"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#C59E5F]" />
                    <span>Submit Billing Review</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Provide your invoice reference so our finance team can review your eligibility.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setGeneratedTicketId(`REV-${Math.floor(100000 + Math.random() * 900000)}`);
                    setTicketSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300 block">
                      Invoice ID / Transaction Ref
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. inv_1P9A2bK98x"
                      value={invoiceId}
                      onChange={(e) => setInvoiceId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#07090C] border border-white/[0.1] rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C59E5F] font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300 block">
                      Reason for Request
                    </label>
                    <select
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#07090C] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#C59E5F]"
                    >
                      <option value="dissatisfied_platform">Dissatisfied with platform (Within 14 days)</option>
                      <option value="inactive_renewal">Accidental renewal with zero usage</option>
                      <option value="annual_prorated">Annual contract adjustment</option>
                      <option value="gateway_sla">Gateway proxy downtime SLA claim</option>
                      <option value="other">Other billing inquiry</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300 block">
                      Additional Details
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Please describe why this charge should be reviewed..."
                      className="w-full px-3 py-2 text-xs bg-[#07090C] border border-white/[0.1] rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C59E5F]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] text-[#080A0E] text-xs font-bold hover:brightness-105 transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Review Request</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
