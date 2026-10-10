import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Building,
  Loader2,
  BadgeCheck,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { OstraIcon } from '../components/OstraBrand';
import { processBillingCheckout, type BillingInvoice, type BillingAccountDetails } from '../lib/billingService';

interface BillingPageProps {
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
  onNavigateSettings?: () => void;
  initialPlanId?: string;
}

export const BillingPage: React.FC<BillingPageProps> = ({
  onNavigateHome,
  onNavigateDashboard,
  onNavigateSettings,
  initialPlanId,
}) => {
  const { user, profile, subscription, updateSubscription } = useAuth();

  // Plan configuration
  const [selectedPlan, setSelectedPlan] = useState<'starter_gateway' | 'pro_gateway' | 'telemetry_observer'>(() => {
    const fromProp = initialPlanId as any;
    if (fromProp && ['starter_gateway', 'pro_gateway', 'telemetry_observer'].includes(fromProp)) {
      return fromProp;
    }
    const fromSub = subscription?.plan_id;
    if (fromSub && ['starter_gateway', 'pro_gateway', 'telemetry_observer'].includes(fromSub)) {
      return fromSub as any;
    }
    return 'starter_gateway';
  });

  const [billingInterval, setBillingInterval] = useState<'mo' | 'yr'>('mo');
  const [companyName, setCompanyName] = useState(
    profile?.company_name || (user?.email ? `${user.email.split('@')[0].toUpperCase()} Labs` : 'Acme AI Systems')
  );
  const [billingEmail, setBillingEmail] = useState(profile?.email || user?.email || 'billing@acme.ai');
  const [country, setCountry] = useState(profile?.country || 'United States');
  const [taxId, setTaxId] = useState('');

  // Checkout Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<BillingInvoice | null>(null);
  const [completedAccount, setCompletedAccount] = useState<BillingAccountDetails | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Pricing Matrix
  const plans = {
    telemetry_observer: {
      id: 'telemetry_observer',
      name: 'Agent Telemetry',
      monthlyPrice: 20,
      annualPrice: 16,
      quota: '500,000 queries / mo',
      desc: 'Live observability, health monitoring & multi-channel webhook alerts.',
      features: [
        'Zero-proxy passive interception',
        'Real-time token velocity & TTFT metrics',
        'Slack, Discord & Email webhook alerts',
        'Multi-model pricing cheatsheet access',
      ],
    },
    starter_gateway: {
      id: 'starter_gateway',
      name: 'Starter Gateway',
      monthlyPrice: 35,
      annualPrice: 28,
      quota: '1,000,000 tokens / mo',
      desc: 'Hosted proxy with real-time budget guardrails and automated 429 kill-switch.',
      features: [
        'Hosted OstraOps Edge Gateway Proxy',
        'Real-time automated budget caps & hard kill-switch',
        'In-memory smart caching (up to 1,000 queries)',
        'Multi-provider routing (OpenAI, Anthropic, Gemini, DeepSeek)',
        'Up to 5 concurrent agent connections',
      ],
    },
    pro_gateway: {
      id: 'pro_gateway',
      name: 'Pro Gateway',
      monthlyPrice: 59,
      annualPrice: 47,
      quota: '10,000,000 tokens / mo',
      desc: 'Enterprise capabilities with unlimited autonomous agents and semantic caching.',
      features: [
        'Everything in Starter Gateway +',
        'Unlimited concurrent agents & pipelines',
        'Semantic & persistent vector caching',
        'Automated fallback failover during provider outages',
        'Extra developer seats ($5/seat/mo)',
        'Priority SLA engineering support',
      ],
    },
  };

  const currentPlanMeta = plans[selectedPlan];
  const unitPrice = billingInterval === 'yr' ? currentPlanMeta.annualPrice * 12 : currentPlanMeta.monthlyPrice;
  const subtotal = unitPrice;
  const discount = billingInterval === 'yr' ? (currentPlanMeta.monthlyPrice * 12) - subtotal : 0;
  const tax = 0.00;
  const totalDue = subtotal + tax;

  const handleCopyBillingId = (id: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(id);
    }
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleExecuteCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsProcessing(true);

    try {
      // Simulate real-time secure gateway authorization handshake
      await new Promise((res) => setTimeout(res, 1200));

      const result = await processBillingCheckout({
        userId: user.id,
        planId: selectedPlan,
        planName: currentPlanMeta.name,
        priceAmount: totalDue,
        billingInterval,
        billingEmail: billingEmail.trim(),
        customerName: profile?.full_name || companyName.trim() || 'Admin',
        companyName: companyName.trim() || 'Organization',
        taxId: taxId.trim(),
        country,
        cardLast4: 'INV-CORP',
        cardBrand: 'Corporate Invoicing',
      });

      if (updateSubscription) {
        await updateSubscription({
          plan_id: selectedPlan,
          plan_name: currentPlanMeta.name,
          price_amount: totalDue,
          billing_interval: billingInterval,
          status: 'active',
        });
      }

      setCompletedInvoice(result.invoice);
      setCompletedAccount(result.account);
      setCheckoutComplete(true);
    } catch (err) {
      console.error('Checkout execution error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090C] text-white flex flex-col font-sans selection:bg-[#C59E5F]/30 selection:text-white relative">
      {/* Background Atmosphere Lights */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#C59E5F]/[0.03] blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[400px] bg-[#E5C38D]/[0.02] blur-[140px] pointer-events-none rounded-full" />

      {/* Top Header */}
      <header className="border-b border-white/[0.08] bg-[#07090C]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <OstraIcon className="w-8 h-8 group-hover:scale-105 transition-transform" variant="gold" />
            <span className="font-sans font-bold text-lg text-white">OstraOps</span>
          </button>
          <div className="h-4 w-px bg-white/[0.1] hidden sm:block" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 hidden sm:block">
            Enterprise Gateway Billing
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateDashboard}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-zinc-300 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {checkoutComplete && completedInvoice && completedAccount ? (
          /* ============================================================ */
          /* SUCCESS STATE: UNIQUE BILLING ID & CONFIRMED INVOICE         */
          /* ============================================================ */
          <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 fade-in duration-300">
            {/* Success Card */}
            <div className="p-8 rounded-3xl bg-[#0D1016] border border-[#C59E5F]/40 shadow-[0_0_50px_rgba(197,158,95,0.15)] text-center space-y-6 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-[#C59E5F]/15 border border-[#C59E5F]/40 flex items-center justify-center mx-auto text-[#E5C38D]">
                <BadgeCheck className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Payment Confirmed &amp; Activated
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
                  Welcome to {completedInvoice.plan_name}
                </h1>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Your payment has been authorized and your dedicated hosted proxy route with budget limits is active.
                </p>
              </div>

              {/* Unique Billing ID Box */}
              <div className="p-4 rounded-2xl bg-[#07090C] border border-[#C59E5F]/30 space-y-2 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Your Unique Billing ID</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Permanent Account Reference
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-lg sm:text-xl font-mono font-bold text-[#E5C38D] tracking-wider select-all">
                    {completedAccount.billing_id}
                  </span>
                  <button
                    onClick={() => handleCopyBillingId(completedAccount.billing_id)}
                    className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
                    title="Copy Billing ID"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-[#C59E5F]" />
                        <span className="text-[11px]">Copy ID</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Receipt Summary Breakdown */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-2.5 text-left">
                <div className="flex justify-between text-zinc-400">
                  <span>Invoice Number</span>
                  <span className="font-mono text-white font-semibold">{completedInvoice.invoice_number}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Billing Period</span>
                  <span className="font-mono text-white">{completedInvoice.billing_period}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Payment Method</span>
                  <span className="text-white">{completedInvoice.payment_method}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Organization</span>
                  <span className="text-white font-medium">{completedInvoice.company_name}</span>
                </div>
                <div className="pt-2 border-t border-white/[0.08] flex justify-between text-sm font-bold">
                  <span className="text-zinc-200">Amount Paid</span>
                  <span className="text-[#E5C38D] font-mono">${completedInvoice.amount_usd.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={onNavigateDashboard}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#C59E5F] hover:bg-[#D4AF7C] text-black font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Go to Gateway Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {onNavigateSettings && (
                  <button
                    onClick={onNavigateSettings}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 text-xs font-semibold transition-colors cursor-pointer border border-white/[0.08]"
                  >
                    View in Settings &rarr; Billing
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* BILLING CHECKOUT FORM                                        */
          /* ============================================================ */
          <div className="space-y-8">
            {/* Header intro */}
            <div>
              <span className="text-xs font-mono font-bold text-[#E5C38D] uppercase tracking-wider">
                Step 2 of 2 &bull; Secure Checkout
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Configure Billing &amp; Subscription
              </h1>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                A unique, permanent Billing ID will be generated upon activation and visible anytime under your Account Settings.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Plan Picker + Customer Details Form (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Plan Selection Cards */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white uppercase tracking-wider">
                      Select Gateway Tier
                    </label>
                    {/* Interval Toggle */}
                    <div className="flex items-center bg-[#0D1016] border border-white/[0.08] p-0.5 rounded-xl text-[11px]">
                      <button
                        type="button"
                        onClick={() => setBillingInterval('mo')}
                        className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                          billingInterval === 'mo' ? 'bg-[#C59E5F] text-black font-bold' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingInterval('yr')}
                        className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                          billingInterval === 'yr' ? 'bg-[#C59E5F] text-black font-bold' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span>Yearly</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded">Save 20%</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(Object.keys(plans) as (keyof typeof plans)[]).map((key) => {
                      const p = plans[key];
                      const isSelected = selectedPlan === key;
                      const price = billingInterval === 'yr' ? p.annualPrice : p.monthlyPrice;

                      return (
                        <div
                          key={key}
                          onClick={() => setSelectedPlan(key)}
                          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                            isSelected
                              ? 'bg-[#121620] border-[#C59E5F] shadow-[0_0_20px_rgba(197,158,95,0.15)] ring-1 ring-[#C59E5F]'
                              : 'bg-[#0D1016] border-white/[0.08] hover:border-white/[0.2]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-white">{p.name}</span>
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#C59E5F] bg-[#C59E5F]' : 'border-zinc-600'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                            </div>
                          </div>
                          <div className="text-xl font-extrabold text-white font-sans">
                            ${price} <span className="text-[10px] text-zinc-400 font-normal">/mo</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                            {p.quota}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form: Customer & Billing Contact Details */}
                <form id="billing-checkout-form" onSubmit={handleExecuteCheckout} className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[#0D1016] border border-white/[0.08] space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-[#C59E5F]" />
                      <span>Billing &amp; Tax Information</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-zinc-400 block mb-1">Company / Organization Legal Name</label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Acme AI Systems Inc."
                          className="w-full bg-[#07090C] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-[#C59E5F]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-zinc-400 block mb-1">Billing Email (For Invoices)</label>
                        <input
                          type="email"
                          required
                          value={billingEmail}
                          onChange={(e) => setBillingEmail(e.target.value)}
                          placeholder="invoices@acme.ai"
                          className="w-full bg-[#07090C] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-[#C59E5F]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-zinc-400 block mb-1">Country</label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full bg-[#07090C] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#C59E5F]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-zinc-400 block mb-1">Tax / GST / VAT ID (Optional)</label>
                        <input
                          type="text"
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value)}
                          placeholder="e.g. US98421098"
                          className="w-full bg-[#07090C] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-[#C59E5F]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Corporate Invoicing & Direct Activation (No Card Required) */}
                  <div className="p-5 rounded-2xl bg-[#0D1016] border border-emerald-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Corporate Invoicing &amp; Instant Provisioning</span>
                      </h3>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Zero Card Required</span>
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Instant gateway provisioning with itemized corporate invoicing. Invoices are dispatched to your billing email on standard Net-30 payment terms with full GST / VAT / SEPA receipts.
                    </p>
                  </div>
                </form>
              </div>

              {/* Right Column: Order Summary & Instant Checkout CTA (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-6 rounded-3xl bg-[#0D1016] border border-white/[0.1] space-y-5 sticky top-24">
                  <h3 className="text-sm font-bold text-white">Order Summary</h3>

                  {/* Selected Tier Capsule */}
                  <div className="p-3.5 rounded-2xl bg-[#07090C] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{currentPlanMeta.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {billingInterval === 'yr' ? 'Billed annually' : 'Billed monthly'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-white font-mono">${subtotal.toFixed(2)}</div>
                      {discount > 0 && (
                        <div className="text-[10px] text-emerald-400 font-mono font-medium">Save ${discount}</div>
                      )}
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
                    {currentPlanMeta.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-[#C59E5F] shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Calculations breakdown */}
                  <div className="space-y-2 pt-3 border-t border-white/[0.06] text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal</span>
                      <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Tax (Reverse charge / 0%)</span>
                      <span className="font-mono text-white">$0.00</span>
                    </div>
                    <div className="pt-2 border-t border-white/[0.08] flex justify-between items-baseline">
                      <span className="text-sm font-bold text-white">Total Due Today</span>
                      <span className="text-xl font-extrabold text-[#E5C38D] font-mono">
                        ${totalDue.toFixed(2)} <span className="text-xs font-normal text-zinc-400 font-sans">USD</span>
                      </span>
                    </div>
                  </div>

                  {/* Checkout Submit Button */}
                  <button
                    type="submit"
                    form="billing-checkout-form"
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#C59E5F] hover:bg-[#D4AF7C] text-black font-bold text-xs transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Securing Billing ID &amp; Activating...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm &amp; Generate Billing ID</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="text-[10px] text-zinc-500 text-center space-y-1">
                    <p>Cancel anytime with 1-click in your account settings.</p>
                    <p>Immediate refund within 7-day guarantee window.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
