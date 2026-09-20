import React, { useState } from 'react';
import {
  Download,
  Check,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  Zap,
  Receipt,
  Layers,
  Info,
  Sparkles,
  X,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface BillingViewProps {
  onNavigateUsage?: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onNavigateUsage }) => {
  // Modal states
  const [managePlanOpen, setManagePlanOpen] = useState(false);
  const [cancelPlanOpen, setCancelPlanOpen] = useState(false);
  const [allInvoicesModalOpen, setAllInvoicesModalOpen] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cancel flow state
  const [cancelReason, setCancelReason] = useState('temporary_pause');
  const [isCanceledPending, setIsCanceledPending] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadInvoice = (invId: string) => {
    showToast(`Downloading tax invoice ${invId}.pdf...`);
  };

  const handleUpgradePlan = (planName: string) => {
    setManagePlanOpen(false);
    showToast(`Plan upgrade request to ${planName} initialized. Invoice prorated.`);
  };

  const handleConfirmCancel = () => {
    setIsCanceledPending(true);
    setCancelPlanOpen(false);
    showToast('Subscription scheduled for downgrade to Community on May 25, 2026.');
  };

  // Invoices list
  const invoices = [
    { id: 'OST-1042', date: 'May 1, 2026', period: 'May 1 – May 31, 2026', amount: '$149.00', status: 'Paid', method: 'Visa •••• 4242' },
    { id: 'OST-0987', date: 'Apr 1, 2026', period: 'Apr 1 – Apr 30, 2026', amount: '$149.00', status: 'Paid', method: 'Visa •••• 4242' },
    { id: 'OST-0912', date: 'Mar 1, 2026', period: 'Mar 1 – Mar 31, 2026', amount: '$149.00', status: 'Paid', method: 'Visa •••• 4242' },
    { id: 'OST-0845', date: 'Feb 1, 2026', period: 'Feb 1 – Feb 28, 2026', amount: '$149.00', status: 'Paid', method: 'Visa •••• 4242' },
    { id: 'OST-0780', date: 'Jan 1, 2026', period: 'Jan 1 – Jan 31, 2026', amount: '$149.00', status: 'Paid', method: 'Visa •••• 4242' },
    { id: 'OST-0715', date: 'Dec 1, 2025', period: 'Dec 1 – Dec 31, 2025', amount: '$149.00', status: 'Paid', method: 'Visa •••• 4242' },
    { id: 'OST-0650', date: 'Nov 1, 2025', period: 'Nov 1 – Nov 30, 2025', amount: '$148.00', status: 'Paid', method: 'Visa •••• 4242' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-mono flex items-center gap-2 border border-[#3F3F46] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C59E5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. TOP SUMMARY & CURRENT PLAN HERO CARD                      */}
      {/* ============================================================ */}
      <div className="rounded-2xl bg-white border border-[#EAE5DC] p-6 lg:p-7 shadow-subtle space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE5DC] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-[#F4EFE6] text-[#9C7938] text-[10px] font-bold font-mono tracking-wider uppercase border border-[#E5DBCA]">
                OstraOps Subscription
              </span>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Active · Good Standing
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-charcoal-900 tracking-tight font-sans">
              Billing & Subscription
            </h2>
            <p className="text-xs text-charcoal-500 mt-1 max-w-2xl">
              Manage your OstraOps subscription tier, payment details, usage quotas, and historical invoices.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setManagePlanOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-[#C59E5F]" />
              <span>Manage Plan</span>
            </button>
            <button
              onClick={() => setCancelPlanOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#EAE5DC] hover:border-rose-300 hover:text-rose-700 text-charcoal-600 text-xs font-medium transition-all cursor-pointer hover:bg-rose-50/40"
            >
              Cancel Plan
            </button>
          </div>
        </div>

        {/* Current Plan Details Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center bg-[#FAF8F5] p-5 rounded-xl border border-[#EAE5DC]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-500 font-bold">
              Current Tier
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-charcoal-900 font-mono tracking-tight">
                SOLO PRO
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#C59E5F] text-white">
                RECOMMENDED
              </span>
            </div>
            <p className="text-xs text-charcoal-500 font-sans">
              Full cloud synchronization, alerts, and multi-device telemetry governance.
            </p>
          </div>

          <div className="space-y-1 md:border-l md:border-[#EAE5DC] md:pl-5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-500 font-bold">
              Billing Amount
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-charcoal-900 font-mono">$149.00</span>
              <span className="text-xs text-charcoal-500 font-mono">/ month</span>
            </div>
            <div className="text-[11px] text-charcoal-500 font-mono flex items-center gap-1">
              <Calendar className="w-3 h-3 text-charcoal-400" />
              <span>
                {isCanceledPending ? 'Downgrades to Free on May 25, 2026' : 'Renews May 25, 2026'}
              </span>
            </div>
          </div>

          <div className="space-y-1 md:border-l md:border-[#EAE5DC] md:pl-5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-500 font-bold">
              Subscription Status
            </span>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Active · Good Standing</span>
            </div>
            <div className="text-[11px] text-charcoal-500 font-mono">
              Next scheduled renewal on May 25, 2026.
            </div>
          </div>
        </div>

        {isCanceledPending && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Subscription cancellation scheduled.</span> Your Solo Pro features remain fully operational until May 25, 2026. After that date, your organization will revert to the Community tier with 0 ongoing charges.
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. PLAN USAGE VS. AI PROVIDER SPEND (SIDE-BY-SIDE CARDS)     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* CARD A: PLAN USAGE (OstraOps Platform Quota) */}
        <div className="rounded-2xl bg-white border border-[#EAE5DC] p-6 shadow-subtle flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-3">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#C59E5F] block">
                  Platform Allocation
                </span>
                <h3 className="text-base font-bold text-charcoal-900 font-sans">
                  Plan Quota Usage
                </h3>
              </div>
              <span className="text-xs font-mono text-charcoal-500 bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#EAE5DC]">
                This billing period
              </span>
            </div>

            {/* Overall Quota Bar */}
            <div className="space-y-2 bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE5DC]">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-charcoal-700 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#C59E5F]" />
                  <span>Overall Quota Consumption</span>
                </span>
                <span className="font-bold text-charcoal-900">74% used</span>
              </div>
              <div className="h-2.5 w-full bg-[#EAE5DC] rounded-full overflow-hidden">
                <div className="h-full bg-[#C59E5F] rounded-full transition-all duration-500 w-[74%]" />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-charcoal-500 pt-0.5">
                <span>Active load</span>
                <span>Resets May 25, 2026</span>
              </div>
            </div>

            {/* Detailed Allocation Rows */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-sandstone-100 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-charcoal-800 font-medium">Projects</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-[#EAE5DC] rounded-full overflow-hidden hidden sm:block">
                    <div className="h-full bg-charcoal-800 rounded-full w-[80%]" />
                  </div>
                  <span className="font-bold text-charcoal-900">8 / 10</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-sandstone-100 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-charcoal-800 font-medium">Team Members</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-mono">
                    Near Limit
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-[#EAE5DC] rounded-full overflow-hidden hidden sm:block">
                    <div className="h-full bg-amber-600 rounded-full w-[96%]" />
                  </div>
                  <span className="font-bold text-charcoal-900">24 / 25</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-sandstone-100 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-charcoal-800 font-medium">API Vault Keys</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-[#EAE5DC] rounded-full overflow-hidden hidden sm:block">
                    <div className="h-full bg-charcoal-800 rounded-full w-[40%]" />
                  </div>
                  <span className="font-bold text-charcoal-900">4 / 10</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-sandstone-100 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-charcoal-800 font-medium">Cloud Telemetry Sync</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-[#EAE5DC] rounded-full overflow-hidden hidden sm:block">
                    <div className="h-full bg-charcoal-800 rounded-full w-[24%]" />
                  </div>
                  <span className="font-bold text-charcoal-900">1.2 GB / 5 GB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#EAE5DC] flex items-center justify-between text-xs text-charcoal-500 font-mono">
            <span>Next quota refresh:</span>
            <span className="font-bold text-charcoal-800">May 25, 2026</span>
          </div>
        </div>

        {/* CARD B: AI PROVIDER SPEND (Upstream Model Costs) */}
        <div className="rounded-2xl bg-white border border-[#EAE5DC] p-6 shadow-subtle flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-3">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-charcoal-400 block">
                  Upstream Infrastructure
                </span>
                <h3 className="text-base font-bold text-charcoal-900 font-sans">
                  AI Provider Spend
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Direct Inference
              </span>
            </div>

            {/* Essential Callout: Clarifying separation of fees */}
            <div className="p-3.5 rounded-xl bg-[#F5F2EB] border border-[#EAE5DC] text-charcoal-700 text-xs leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#9C7938] flex-shrink-0 mt-0.5" />
              <div className="font-sans">
                <strong className="text-charcoal-900 font-semibold">Separate billing entity:</strong> Your AI model execution costs are billed directly by your model providers (OpenAI, Anthropic, Google), not OstraOps. OstraOps monitors, caches, and governs this spend.
              </div>
            </div>

            {/* Breakdown by Provider */}
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10A37F]" />
                  <div>
                    <span className="font-bold text-charcoal-900 block leading-tight">OpenAI</span>
                    <span className="text-[10px] text-charcoal-500">GPT-5.6, GPT-5.4-mini · 12.4M tokens</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-charcoal-900">$42.18</span>
                  <span className="text-[10px] text-charcoal-400 block">53.8%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                  <div>
                    <span className="font-bold text-charcoal-900 block leading-tight">Anthropic</span>
                    <span className="text-[10px] text-charcoal-500">Claude Sonnet 4.6, Opus 4.8 · 5.1M tokens</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-charcoal-900">$21.64</span>
                  <span className="text-[10px] text-charcoal-400 block">27.6%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                  <div>
                    <span className="font-bold text-charcoal-900 block leading-tight">Google Gemini</span>
                    <span className="text-[10px] text-charcoal-500">Gemini 3.8 Flash, 3.1 Pro · 18.2M tokens</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-charcoal-900">$14.60</span>
                  <span className="text-[10px] text-charcoal-400 block">18.6%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#EAE5DC] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-charcoal-500 font-bold block">
                Total Upstream AI Spend
              </span>
              <span className="text-lg font-black text-charcoal-900 font-mono">
                $78.42
              </span>
            </div>

            <button
              onClick={() => {
                if (onNavigateUsage) {
                  onNavigateUsage();
                } else {
                  window.location.hash = '#usage';
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-[#F5F2EB] hover:bg-[#EAE5DC] text-charcoal-900 text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer border border-[#E5DBCA]"
            >
              <span>View Usage & Costs</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#C59E5F]" />
            </button>
          </div>
        </div>
      </div>



      {/* ============================================================ */}
      {/* 4. INVOICES TABLE & BILLING HISTORY                          */}
      {/* ============================================================ */}
      <div className="rounded-2xl bg-white border border-[#EAE5DC] p-6 lg:p-7 shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE5DC] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#9C7938] text-[10px] font-bold font-mono tracking-wider uppercase border border-[#E5DBCA]">
                Settlement History
              </span>
              <span className="text-xs font-mono text-charcoal-500">7 Total Invoices</span>
            </div>
            <h3 className="text-base font-bold text-charcoal-900 font-sans">
              Invoices & Statements
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block font-mono">
              <span className="text-[10px] text-charcoal-400 block uppercase">Total Paid (2026 YTD)</span>
              <span className="text-sm font-extrabold text-charcoal-900">$1,042.00</span>
            </div>

            <button
              onClick={() => setAllInvoicesModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#F5F2EB] hover:bg-[#EAE5DC] text-charcoal-800 text-xs font-bold font-mono transition-all cursor-pointer border border-[#E5DBCA]"
            >
              View All Invoices
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-[#EAE5DC] text-[11px] font-mono text-charcoal-500 uppercase tracking-wider">
                <th className="pb-3 font-bold">Invoice</th>
                <th className="pb-3 font-bold">Billing Date</th>
                <th className="pb-3 font-bold">Period</th>
                <th className="pb-3 font-bold">Amount</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE5DC] font-mono">
              {invoices.slice(0, 4).map((inv) => (
                <tr key={inv.id} className="hover:bg-sandstone-100 transition-colors group">
                  <td className="py-3.5 pr-4 font-bold text-charcoal-900 flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-[#C59E5F] transition-colors" />
                    <span>{inv.id}</span>
                  </td>
                  <td className="py-3.5 pr-4 text-charcoal-600">{inv.date}</td>
                  <td className="py-3.5 pr-4 text-charcoal-500 text-[11px] font-sans">{inv.period}</td>
                  <td className="py-3.5 pr-4 font-bold text-charcoal-900">{inv.amount}</td>
                  <td className="py-3.5 pr-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>{inv.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(inv.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#EAE5DC] hover:border-[#C59E5F] text-charcoal-800 hover:text-[#9C7938] text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3 h-3 text-[#C59E5F]" />
                      <span>Download PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mini Breakdown / Timeline summary banner */}
        <div className="mt-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#18181B] text-white flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#C59E5F]" />
            </div>
            <div>
              <span className="font-bold text-charcoal-900 block font-sans">
                Billing Reliability: 100%
              </span>
              <span className="text-[11px] text-charcoal-500">
                All 7 monthly charges settled on scheduled dates with zero chargebacks.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Exporting complete billing statements to CSV...')}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#EAE5DC] hover:border-charcoal-400 text-charcoal-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              Export CSV Ledger
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: MANAGE PLAN COMPARISON MODAL                        */}
      {/* ============================================================ */}
      {managePlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#EAE5DC] w-full max-w-4xl rounded-2xl shadow-2xl p-6 lg:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#C59E5F] block">
                  Subscription Plans
                </span>
                <h3 className="text-xl font-extrabold text-charcoal-900 font-sans">
                  Choose Your OstraOps Plan
                </h3>
              </div>
              <button
                onClick={() => setManagePlanOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center text-charcoal-600 hover:text-charcoal-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Plan 1: Community */}
              <div className="p-5 rounded-2xl border border-[#EAE5DC] bg-[#FAF8F5] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-charcoal-600">
                      Community
                    </span>
                    <span className="text-[10px] font-mono bg-[#EAE5DC] text-charcoal-700 px-2 py-0.5 rounded">
                      Free Tier
                    </span>
                  </div>
                  <div>
                    <span className="text-3xl font-black font-mono text-charcoal-900">$0</span>
                    <span className="text-xs text-charcoal-500 font-mono"> / forever</span>
                  </div>
                  <p className="text-xs text-charcoal-600 font-sans">
                    Essential local telemetry, spend caps, and proxy controls for individual developers.
                  </p>
                  <ul className="space-y-2 text-xs font-sans text-charcoal-700 pt-2 border-t border-[#EAE5DC]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] flex-shrink-0" />
                      <span>Local SQLite telemetry</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] flex-shrink-0" />
                      <span>Hard spend rate caps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] flex-shrink-0" />
                      <span>Single seat (1 user)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] flex-shrink-0" />
                      <span>Up to 2 projects</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setManagePlanOpen(false);
                    setCancelPlanOpen(true);
                  }}
                  className="w-full py-2 rounded-xl bg-white border border-[#EAE5DC] hover:border-charcoal-400 text-charcoal-800 text-xs font-bold font-mono transition-all cursor-pointer"
                >
                  Downgrade
                </button>
              </div>

              {/* Plan 2: Solo Pro (Current) */}
              <div className="p-5 rounded-2xl border-2 border-[#18181B] bg-white flex flex-col justify-between space-y-4 relative shadow-md">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#18181B] text-white text-[10px] font-bold font-mono uppercase tracking-wider px-3 py-0.5 rounded-full border border-white/20">
                  Current Plan
                </div>
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#C59E5F]">
                      Solo Pro
                    </span>
                    <span className="text-[10px] font-mono bg-[#F4EFE6] text-[#9C7938] px-2 py-0.5 rounded font-bold border border-[#E5DBCA]">
                      Active
                    </span>
                  </div>
                  <div>
                    <span className="text-3xl font-black font-mono text-charcoal-900">$149</span>
                    <span className="text-xs text-charcoal-500 font-mono"> / month</span>
                  </div>
                  <p className="text-xs text-charcoal-600 font-sans">
                    For serious builders demanding multi-device cloud sync and automated cost alerts.
                  </p>
                  <ul className="space-y-2 text-xs font-sans text-charcoal-700 pt-2 border-t border-[#EAE5DC]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] flex-shrink-0" />
                      <span>Everything in Community</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] flex-shrink-0" />
                      <span>End-to-end Cloud Sync</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] flex-shrink-0" />
                      <span>Telegram & Slack cost alerts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] flex-shrink-0" />
                      <span>Up to 25 team members</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] flex-shrink-0" />
                      <span>Up to 10 projects & API keys</span>
                    </li>
                  </ul>
                </div>

                <button
                  disabled
                  className="w-full py-2 rounded-xl bg-[#F5F2EB] text-charcoal-400 text-xs font-bold font-mono cursor-not-allowed border border-[#EAE5DC]"
                >
                  Current Plan
                </button>
              </div>

              {/* Plan 3: Team / Enterprise */}
              <div className="p-5 rounded-2xl border border-[#EAE5DC] bg-[#FAF8F5] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-purple-700">
                      Team Enterprise
                    </span>
                    <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                      Enterprise
                    </span>
                  </div>
                  <div>
                    <span className="text-3xl font-black font-mono text-charcoal-900">$499</span>
                    <span className="text-xs text-charcoal-500 font-mono"> / month</span>
                  </div>
                  <p className="text-xs text-charcoal-600 font-sans">
                    Complete AI governance with dedicated HSM Vault, custom RBAC, and SOC2 audit logs.
                  </p>
                  <ul className="space-y-2 text-xs font-sans text-charcoal-700 pt-2 border-t border-[#EAE5DC]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-700 flex-shrink-0" />
                      <span>Everything in Solo Pro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-700 flex-shrink-0" />
                      <span>Dedicated Proxy Gateway</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-700 flex-shrink-0" />
                      <span>HSM Hardware Key Vault</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-700 flex-shrink-0" />
                      <span>Unlimited seats & projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-700 flex-shrink-0" />
                      <span>99.99% SLA & 24/7 dedicated support</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgradePlan('Team Enterprise')}
                  className="w-full py-2 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C59E5F]" />
                  <span>Upgrade to Team</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}



      {/* ============================================================ */}
      {/* MODAL 3: CANCEL PLAN CONFIRMATION MODAL                      */}
      {/* ============================================================ */}
      {cancelPlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#EAE5DC] w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-charcoal-900">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-charcoal-900 font-sans">
                  Cancel Solo Pro Subscription?
                </h3>
                <span className="text-[11px] text-charcoal-500 font-mono">
                  Downgrade to Community tier
                </span>
              </div>
            </div>

            <p className="text-xs text-charcoal-600 leading-relaxed font-sans">
              You will retain all Solo Pro features until the conclusion of your current billing period on <strong>May 25, 2026</strong>. After that date, your organization will automatically transition to the free Community tier.
            </p>

            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] text-xs font-sans space-y-1.5 text-charcoal-700">
              <span className="font-bold text-charcoal-900 font-mono block text-[11px] uppercase">
                What changes on downgrade:
              </span>
              <p>· Team members reduced to 1 owner seat</p>
              <p>· Cloud telemetry sync disabled (local SQLite preserved)</p>
              <p>· Slack & Telegram alert webhooks paused</p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-charcoal-700 uppercase block">
                Reason for canceling (optional)
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono text-charcoal-800 focus:outline-none focus:border-charcoal-400"
              >
                <option value="temporary_pause">Pausing AI development temporarily</option>
                <option value="budget_constraint">Budget constraints / optimizing cost</option>
                <option value="missing_feature">Missing key feature or provider integration</option>
                <option value="other">Other reason</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE5DC]">
              <button
                onClick={() => setCancelPlanOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-sandstone-200 cursor-pointer"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-mono cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: ALL INVOICES DIALOG                                 */}
      {/* ============================================================ */}
      {allInvoicesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#EAE5DC] w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-3">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#C59E5F] block">
                  Complete Ledger
                </span>
                <h3 className="text-base font-bold text-charcoal-900 font-sans">
                  All Historical Invoices
                </h3>
              </div>
              <button
                onClick={() => setAllInvoicesModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center text-charcoal-600 hover:text-charcoal-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-[#EAE5DC] font-mono text-xs">
              {invoices.map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-charcoal-900">{inv.id}</span>
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px] font-bold">
                        {inv.status}
                      </span>
                    </div>
                    <span className="text-charcoal-500 block text-[11px]">{inv.period} · {inv.method}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-charcoal-900">{inv.amount}</span>
                    <button
                      onClick={() => handleDownloadInvoice(inv.id)}
                      className="text-[#C59E5F] hover:text-[#9C7938] text-[11px] font-bold cursor-pointer flex items-center gap-1 border border-[#E5DBCA] px-2 py-1 rounded bg-[#FAF8F5]"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#EAE5DC] flex justify-end">
              <button
                onClick={() => setAllInvoicesModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#18181B] text-white text-xs font-bold font-mono cursor-pointer"
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
