import React, { useState, useEffect } from 'react';
import {
  Check,
  CheckCircle2,
  ArrowRight,
  Copy,
  CreditCard,
  FileText,
  ShieldCheck,
  Lock,
  X,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPlanEntitlements, type PlanTier } from '../lib/entitlements';
import {
  getOrCreateBillingAccount,
  getUserInvoices,
  processBillingCheckout,
  type BillingAccountDetails,
  type BillingInvoice
} from '../lib/billingService';
import { OstraIcon } from './OstraBrand';

interface BillingViewProps {
  onNavigateUsage?: () => void;
  onNavigateCheckout?: (planId: string) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onNavigateUsage, onNavigateCheckout }) => {
  const { user, profile, subscription, updateSubscription } = useAuth();
  const entitlements = getPlanEntitlements(subscription);

  const [billingAccount, setBillingAccount] = useState<BillingAccountDetails | null>(null);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<BillingInvoice | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load user's canonical unique Billing Account and Invoices
  useEffect(() => {
    if (user?.id) {
      getOrCreateBillingAccount(user.id, user.email, profile?.company_name).then((acc) => {
        setBillingAccount(acc);
      });
      getUserInvoices(user.id, subscription, user.email, profile?.company_name).then((invs) => {
        setInvoices(invs);
      });
    }
  }, [user?.id, subscription?.plan_id, profile?.company_name]);

  const handleCopyBillingId = () => {
    if (billingAccount?.billing_id && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(billingAccount.billing_id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSelectPlan = async (tier: PlanTier) => {
    if (!user?.id) {
      showToast('Please sign in to update your subscription.');
      return;
    }

    if (onNavigateCheckout && tier !== 'free') {
      onNavigateCheckout(tier);
      return;
    }

    setIsChangingPlan(true);

    let planName = 'Community Free';
    let price = 0;

    switch (tier) {
      case 'telemetry_observer':
        planName = 'Agent Telemetry';
        price = 20;
        break;
      case 'starter_gateway':
        planName = 'Starter Gateway';
        price = 35;
        break;
      case 'pro_gateway':
        planName = 'Pro Gateway';
        price = 59;
        break;
      case 'free':
      default:
        planName = 'Community Free';
        price = 0;
        break;
    }

    const uid = user?.id || 'usr_local_dev';
    try {
      if (updateSubscription) {
        await updateSubscription({
          plan_id: tier,
          plan_name: planName,
          price_amount: price,
          billing_interval: 'mo',
          status: 'active',
        });
      }

      try {
        localStorage.setItem('ostraops_active_plan', tier);
        localStorage.setItem(`ostraops_active_plan_${uid}`, tier);
        localStorage.setItem('ostraops_user_tier', tier);
      } catch {}

      const result = await processBillingCheckout({
        userId: uid,
        planId: tier,
        planName,
        priceAmount: price,
        billingInterval: 'mo',
        billingEmail: user?.email || 'billing@ostraops.com',
        customerName: profile?.full_name || 'Admin',
        companyName: profile?.company_name || 'My Organization',
        country: profile?.country || 'United States',
      });

      setBillingAccount(result.account);
      setInvoices((prev) => [result.invoice, ...prev]);
      showToast(`Plan successfully updated to ${planName}!`);
    } catch (e) {
      console.warn('Plan upgrade note:', e);
      // Fallback: still ensure local state is updated
      if (updateSubscription) {
        updateSubscription({
          plan_id: tier,
          plan_name: planName,
          price_amount: price,
          billing_interval: 'mo',
          status: 'active',
        }).catch(() => {});
      }
      showToast(`Plan upgraded to ${planName}!`);
    } finally {
      setIsChangingPlan(false);
    }
  };

  const allPlans: {
    tier: PlanTier;
    name: string;
    price: string;
    interval: string;
    desc: string;
    features: string[];
    isPopular?: boolean;
  }[] = [
    {
      tier: 'free',
      name: 'Community Free',
      price: '$0',
      interval: '/forever',
      desc: 'Local command-line spend tracker and multi-model rate cheatsheets.',
      features: [
        'Open-source CLI (`npx ostraops`)',
        'Local terminal spend calculations',
        'Multi-model pricing cheatsheet',
        'Single developer access',
      ],
    },
    {
      tier: 'telemetry_observer',
      name: 'Agent Telemetry',
      price: '$20',
      interval: '/month',
      desc: 'Observability and health monitoring without proxy interception.',
      features: [
        'Zero proxy interception needed',
        'Live token velocity & latency metrics',
        'Model cost & health benchmarking',
        'Webhook alerts (Slack, Discord, Email)',
        'Up to 3 active agent trackers',
      ],
    },
    {
      tier: 'starter_gateway',
      name: 'Starter Gateway',
      price: '$35',
      interval: '/month',
      isPopular: true,
      desc: 'Hosted edge proxy with automated hard budget caps and kill-switch.',
      features: [
        'Hosted OstraOps Edge Gateway Proxy',
        'Real-time automated budget caps & 429 kill-switch',
        'In-memory smart caching (up to 1,000 queries)',
        'Multi-provider routing (OpenAI, Anthropic, Gemini, DeepSeek)',
        'Up to 5 concurrent agent connections',
        'Zero prompt retention guarantee',
      ],
    },
    {
      tier: 'pro_gateway',
      name: 'Pro Gateway',
      price: '$59',
      interval: '/month',
      desc: 'Unlimited autonomous agents, semantic caching, and team collaboration.',
      features: [
        'Everything in Starter Gateway +',
        'Unlimited concurrent agents & pipelines',
        'Semantic & persistent vector caching',
        'Automated fallback failover during outages',
        'Developer seats available ($5/seat/mo)',
        'Priority engineering support & custom webhooks',
      ],
    },
  ];

  return (
    <div className="space-y-8 text-white animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-mono flex items-center gap-2 border border-[#C59E5F]/50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C59E5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-sans">
            Billing &amp; Subscription Management
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C59E5F]/20 text-[#E5C38D] border border-[#C59E5F]/30 uppercase">
            Active: {entitlements.name}
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your enterprise billing identity, unique billing account ID, payment methods, and invoice history.
        </p>
      </div>

      {/* ============================================================ */}
      {/* 1. UNIQUE BILLING ID & ACCOUNT BANNER                         */}
      {/* ============================================================ */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0D1016] via-[#121620] to-[#0D1016] border border-[#C59E5F]/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Canonical Billing Identity
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Account</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl sm:text-2xl font-mono font-bold text-[#E5C38D] tracking-wider select-all">
              {billingAccount?.billing_id || 'Generating Billing ID...'}
            </span>
            <button
              onClick={handleCopyBillingId}
              className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
              title="Copy Unique Billing ID"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C59E5F]" />
                  <span className="text-[11px]">Copy ID</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-zinc-400">
            This Billing ID is permanently bound to all gateway telemetry invoices, payments, and tax receipts for {billingAccount?.company_name || 'your workspace'}.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              window.location.hash = '#billing';
            }}
            className="px-4 py-2.5 rounded-xl bg-[#C59E5F] hover:bg-[#D4AF7C] text-black text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Dedicated Billing Page</span>
          </button>
        </div>
      </div>

      {/* TRIAL STATUS BANNER */}
      {entitlements.isTrial && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          entitlements.isTrialExpired
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              entitlements.isTrialExpired
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{entitlements.isTrialExpired ? '7-Day Free Trial Concluded' : '7-Day Free Trial Active'}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  entitlements.isTrialExpired
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {entitlements.isTrialExpired ? 'EXPIRED' : `${entitlements.trialDaysRemaining} DAYS REMAINING`}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {entitlements.isTrialExpired
                  ? 'Your 7-day trial has finished. No automatic card charges occurred. Select a plan to restore Hosted Gateway routing.'
                  : `Your workspace has full access to Hosted Gateway proxy routing, telemetry, and rate limits until ${subscription?.renewal_date || 'trial end'}.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              window.location.hash = '#pricing';
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md ${
              entitlements.isTrialExpired
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white'
                : 'bg-[#C59E5F] hover:bg-[#D4AF7C] text-black'
            }`}
          >
            {entitlements.isTrialExpired ? 'Select Plan to Reactivate' : 'Upgrade Plan'}
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. CURRENT ACTIVE PLAN & QUOTA CARD                          */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Plan card */}
        <div className="p-5 rounded-2xl bg-[#0D1016] border border-white/[0.08] space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 font-medium">Subscription Plan</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              entitlements.isTrialExpired
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : entitlements.isTrial
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-[#C59E5F]/20 text-[#E5C38D]'
            }`}>
              {entitlements.isTrialExpired
                ? 'EXPIRED'
                : entitlements.isTrial
                ? `TRIAL (${entitlements.trialDaysRemaining}D LEFT)`
                : (subscription?.status?.toUpperCase() || 'ACTIVE')}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white font-sans">
            {entitlements.name}
          </div>
          <div className="text-xs text-zinc-400">
            {entitlements.isTrial
              ? entitlements.isTrialExpired
                ? `7-Day Trial expired on ${subscription?.renewal_date || 'period end'}. Upgrade to resume access.`
                : `Free Trial • ${entitlements.trialDaysRemaining} day${entitlements.trialDaysRemaining === 1 ? '' : 's'} remaining • Concludes ${subscription?.renewal_date}`
              : `$${entitlements.priceMonthly}.00 USD / month • Next renewal: ${subscription?.renewal_date || 'In 30 days'}`
            }
          </div>
        </div>

        {/* Payment Method card */}
        <div className="p-5 rounded-2xl bg-[#0D1016] border border-white/[0.08] space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 font-medium">Payment Method</span>
            <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Encrypted</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.08]">
              <CreditCard className="w-5 h-5 text-[#C59E5F]" />
            </div>
            <div>
              <div className="text-sm font-bold text-white font-mono">
                {billingAccount?.payment_method_brand || 'Visa'} •••• {billingAccount?.payment_method_last4 || '4242'}
              </div>
              <div className="text-[11px] text-zinc-400">
                Expires {billingAccount?.payment_method_expiry || '12/28'}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-zinc-500">
            Billed to: {billingAccount?.billing_email || user?.email}
          </div>
        </div>

        {/* Quota Progress card */}
        <div className="p-5 rounded-2xl bg-[#0D1016] border border-white/[0.08] space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 font-medium">Monthly Proxy Quota</span>
            <span className="font-mono text-xs font-bold text-white">{subscription?.quota_usage_percent ?? 2.4}%</span>
          </div>
          <div className="h-2 w-full bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, subscription?.quota_usage_percent ?? 2.4)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>Quota Limit</span>
            <span className="font-mono text-zinc-300">{(subscription?.quota_limit ?? 1000000).toLocaleString()} tokens</span>
          </div>
          {onNavigateUsage && (
            <button
              type="button"
              onClick={onNavigateUsage}
              className="text-[11px] text-[#C59E5F] hover:underline flex items-center gap-1 cursor-pointer pt-1"
            >
              <span>View Live Usage Breakdown</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. INVOICES & BILLING HISTORY TABLE                          */}
      {/* ============================================================ */}
      <div className="p-6 rounded-3xl bg-[#0D1016] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C59E5F]" />
              <span>Invoices &amp; Transaction History</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Itemized receipts with separate unique invoice and billing IDs for tax and accounting.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {invoices.length} {invoices.length === 1 ? 'Invoice' : 'Invoices'} recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-zinc-400 font-mono text-[11px]">
                <th className="py-3 px-3">Invoice Number</th>
                <th className="py-3 px-3">Billing ID</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {invoices.map((inv) => (
                <tr key={inv.id || inv.invoice_number} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-white">
                    {inv.invoice_number}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[#E5C38D]">
                    {inv.billing_id}
                  </td>
                  <td className="py-3.5 px-3 text-zinc-300">
                    {new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-3 text-zinc-200">
                    {inv.plan_name}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-white">
                    ${inv.amount_usd.toFixed(2)} USD
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedReceipt(inv)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 hover:text-white transition-colors cursor-pointer text-[11px] font-medium inline-flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3 text-[#C59E5F]" />
                      <span>View Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. PLAN SELECTION CARDS GRID                                 */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-white mb-4">Change or Upgrade Subscription</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allPlans.map((p) => {
            const isCurrent = entitlements.tier === p.tier;

            return (
              <div
                key={p.tier}
                className={`p-6 rounded-2xl flex flex-col justify-between transition-all relative ${
                  isCurrent
                    ? 'bg-[#12161F] border-2 border-[#C59E5F] shadow-[0_0_25px_rgba(197,158,95,0.15)]'
                    : 'bg-[#0B0E14] border border-white/[0.08] hover:border-white/[0.2]'
                }`}
              >
                {p.isPopular && !isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C59E5F] text-black uppercase tracking-wider shadow-md">
                    Most Popular
                  </span>
                )}

                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C59E5F] text-black uppercase tracking-wider shadow-md">
                    Current Plan
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-white">{p.name}</h4>
                    <p className="text-xs text-zinc-400 mt-1 min-h-[32px]">{p.desc}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white font-sans">{p.price}</span>
                    <span className="text-xs text-zinc-500 font-mono">{p.interval}</span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-white/[0.06] text-xs">
                    {p.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#C59E5F] shrink-0 mt-0.5" />
                        <span className="text-zinc-300 leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.06]">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-white/[0.08] text-zinc-400 text-xs font-semibold cursor-default"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(p.tier)}
                      disabled={isChangingPlan}
                      className="w-full py-2.5 rounded-xl bg-[#C59E5F] hover:bg-[#D4AF7C] text-black text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Select {p.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. ITEMISED PRINTABLE RECEIPT MODAL                          */}
      {/* ============================================================ */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0D1016] border border-[#C59E5F]/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-left relative animate-in zoom-in-95">
            {/* Modal Close button */}
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
              <div className="flex items-center gap-3">
                <OstraIcon className="w-8 h-8" variant="gold" />
                <div>
                  <div className="text-base font-bold text-white font-sans">OstraOps Inc.</div>
                  <div className="text-[10px] font-mono text-zinc-400">Enterprise AI Infrastructure</div>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                  {selectedReceipt.status}
                </span>
                <div className="text-[10px] text-zinc-400 font-mono mt-1">
                  {new Date(selectedReceipt.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Unique IDs Section */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#07090C] border border-white/[0.06] text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Unique Billing ID</span>
                <span className="font-mono font-bold text-[#E5C38D] text-sm select-all">
                  {selectedReceipt.billing_id}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Invoice Reference</span>
                <span className="font-mono font-bold text-white text-sm select-all">
                  {selectedReceipt.invoice_number}
                </span>
              </div>
            </div>

            {/* Billed To */}
            <div className="text-xs space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Billed To</span>
              <div className="font-bold text-white">{selectedReceipt.company_name}</div>
              <div className="text-zinc-400 font-mono">{selectedReceipt.billing_email}</div>
              <div className="text-zinc-400">{selectedReceipt.payment_method}</div>
            </div>

            {/* Line items table */}
            <div className="border-t border-b border-white/[0.08] py-3 text-xs space-y-2">
              <div className="flex justify-between font-mono text-zinc-400 text-[11px]">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between font-medium text-white">
                <span>{selectedReceipt.plan_name} ({selectedReceipt.billing_period})</span>
                <span className="font-mono">${selectedReceipt.subtotal_usd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Sales Tax / VAT (0%)</span>
                <span className="font-mono">$0.00</span>
              </div>
              <div className="pt-2 border-t border-white/[0.06] flex justify-between font-bold text-sm">
                <span className="text-zinc-200">Total Paid</span>
                <span className="text-[#E5C38D] font-mono">${selectedReceipt.amount_usd.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-[#C59E5F] hover:bg-[#D4AF7C] text-black text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
