import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  Zap,
  Layers,
  Info,
  Sparkles,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface BillingViewProps {
  onNavigateUsage?: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onNavigateUsage }) => {
  const { subscription } = useAuth();
  const storedPlan = typeof window !== 'undefined' ? localStorage.getItem('ostraops_active_plan') : null;
  const planId = subscription?.plan_id || storedPlan || 'pro_gateway';

  const isTelemetry = planId === 'telemetry_observer';
  const isStarter = planId === 'starter_gateway';
  const isTrial = planId === 'team_trial';

  const currentTierName = isTelemetry
    ? 'AGENT TELEMETRY'
    : isStarter
    ? 'STARTER GATEWAY'
    : isTrial
    ? '7-DAY TRIAL'
    : 'PRO GATEWAY';

  const currentTierBadge = isTelemetry
    ? 'OBSERVABILITY ONLY'
    : isStarter
    ? '3 SEATS INCLUDED'
    : isTrial
    ? 'FREE EVALUATION'
    : '10 SEATS INCLUDED';

  const currentTierDesc = isTelemetry
    ? 'Pure agent observability, token pacing, TTFT metrics, and cost attribution.'
    : isStarter
    ? 'Central edge proxy, encrypted key vault, spending limits, and exact prompt caching.'
    : isTrial
    ? 'Full evaluation access to live cost tracker, spend alerts, and runaway cutoff.'
    : 'Zero-downtime failover, smart semantic caching, and granular spend limits.';

  const currentTierPrice = isTelemetry
    ? '$20.00'
    : isStarter
    ? '$35.00'
    : isTrial
    ? '$0.00'
    : '$59.00';

  // Modal states
  const [managePlanOpen, setManagePlanOpen] = useState(false);
  const [cancelPlanOpen, setCancelPlanOpen] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cancel flow state
  const [cancelReason, setCancelReason] = useState('temporary_pause');
  const [isCanceledPending, setIsCanceledPending] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpgradePlan = (planName: string) => {
    setManagePlanOpen(false);
    showToast(`Plan upgrade request to ${planName} initialized. Active immediately.`);
  };

  const handleConfirmCancel = () => {
    setIsCanceledPending(true);
    setCancelPlanOpen(false);
    showToast('Subscription scheduled for downgrade to Community on May 25, 2026.');
  };

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
      <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] p-6 lg:p-7 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-[#C59E5F]/15 text-[#E5C38D] text-[10px] font-bold font-mono tracking-wider uppercase border border-[#C59E5F]/30">
                OstraOps Subscription
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Active · Good Standing
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-sans">
              Billing &amp; Subscription
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              Manage your OstraOps subscription tier, payment details, usage quotas, and spend governance.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setManagePlanOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer border border-white/[0.08]"
            >
              <Layers className="w-3.5 h-3.5 text-[#C59E5F]" />
              <span>Manage Plan</span>
            </button>
            <button
              onClick={() => setCancelPlanOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] hover:border-rose-500/50 hover:text-rose-400 text-zinc-400 text-xs font-medium transition-all cursor-pointer hover:bg-rose-500/10"
            >
              Cancel Plan
            </button>
          </div>
        </div>

        {/* Current Plan Details Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center bg-[#07090C] p-5 rounded-xl border border-white/[0.08]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Current Tier
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white font-mono tracking-tight">
                {currentTierName}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#C59E5F] text-white">
                {currentTierBadge}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              {currentTierDesc}
            </p>
          </div>

          <div className="space-y-1 md:border-l md:border-white/[0.08] md:pl-5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Billing Amount
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white font-mono">{currentTierPrice}</span>
              <span className="text-xs text-zinc-400 font-mono">/ month</span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-500" />
              <span>
                {isCanceledPending ? 'Downgrades to Free on May 25, 2026' : 'Renews May 25, 2026'}
              </span>
            </div>
          </div>

          <div className="space-y-1 md:border-l md:border-white/[0.08] md:pl-5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Subscription Status
            </span>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Active · Good Standing</span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              Next scheduled renewal on May 25, 2026.
            </div>
          </div>
        </div>

        {isCanceledPending && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Subscription cancellation scheduled.</span> Your Hosted Gateway features remain fully operational until May 25, 2026. After that date, your organization will revert to the Community tier with 0 ongoing charges.
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. PLAN USAGE VS. AI PROVIDER SPEND (SIDE-BY-SIDE CARDS)     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* CARD A: PLAN USAGE (OstraOps Platform Quota) */}
        <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#C59E5F] block">
                  Platform Allocation
                </span>
                <h3 className="text-base font-bold text-white font-sans">
                  Plan Quota Usage
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400 bg-[#07090C] px-2.5 py-1 rounded-lg border border-white/[0.08]">
                This billing period
              </span>
            </div>

            {/* Overall Quota Bar */}
            <div className="space-y-2 bg-[#07090C] p-4 rounded-xl border border-white/[0.08]">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#C59E5F]" />
                  <span>Overall Quota Consumption</span>
                </span>
                <span className="font-bold text-white">74% used</span>
              </div>
              <div className="h-2.5 w-full bg-[#EAE5DC] rounded-full overflow-hidden">
                <div className="h-full bg-[#C59E5F] rounded-full transition-all duration-500 w-[74%]" />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-400 pt-0.5">
                <span>Active load</span>
                <span>Resets May 25, 2026</span>
              </div>
            </div>

            {/* Detailed Allocation Rows */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-200 font-medium">Projects</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-[#EAE5DC] rounded-full overflow-hidden hidden sm:block">
                    <div className="h-full bg-charcoal-800 rounded-full w-[80%]" />
                  </div>
                  <span className="font-bold text-white">8 / 10</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-200 font-medium">Team Members</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-mono">
                    Near Limit
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-[#EAE5DC] rounded-full overflow-hidden hidden sm:block">
                    <div className="h-full bg-amber-600 rounded-full w-[96%]" />
                  </div>
                  <span className="font-bold text-white">24 / 25</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-200 font-medium">API Vault Keys</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-[#EAE5DC] rounded-full overflow-hidden hidden sm:block">
                    <div className="h-full bg-charcoal-800 rounded-full w-[40%]" />
                  </div>
                  <span className="font-bold text-white">4 / 10</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-200 font-medium">Cloud Telemetry Sync</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-[#EAE5DC] rounded-full overflow-hidden hidden sm:block">
                    <div className="h-full bg-charcoal-800 rounded-full w-[24%]" />
                  </div>
                  <span className="font-bold text-white">1.2 GB / 5 GB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Next quota refresh:</span>
            <span className="font-bold text-zinc-200">May 25, 2026</span>
          </div>
        </div>

        {/* CARD B: AI PROVIDER SPEND (Upstream Model Costs) */}
        <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-500 block">
                  Upstream Infrastructure
                </span>
                <h3 className="text-base font-bold text-white font-sans">
                  AI Provider Spend
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Direct Inference
              </span>
            </div>

            {/* Essential Callout: Clarifying separation of fees */}
            <div className="p-3.5 rounded-xl bg-[#07090C] border border-white/[0.08] text-zinc-300 text-xs leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#E5C38D] flex-shrink-0 mt-0.5" />
              <div className="font-sans">
                <strong className="text-white font-semibold">Separate billing entity:</strong> Your AI model execution costs are billed directly by your model providers (OpenAI, Anthropic, Google), not OstraOps. OstraOps monitors, caches, and governs this spend.
              </div>
            </div>

            {/* Breakdown by Provider */}
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#07090C] border border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10A37F]" />
                  <div>
                    <span className="font-bold text-white block leading-tight">OpenAI</span>
                    <span className="text-[10px] text-zinc-400">GPT-5.6, GPT-5.4-mini · 12.4M tokens</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white">$42.18</span>
                  <span className="text-[10px] text-zinc-500 block">53.8%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#07090C] border border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                  <div>
                    <span className="font-bold text-white block leading-tight">Anthropic</span>
                    <span className="text-[10px] text-zinc-400">Claude Sonnet 4.6, Opus 4.8 · 5.1M tokens</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white">$21.64</span>
                  <span className="text-[10px] text-zinc-500 block">27.6%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#07090C] border border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                  <div>
                    <span className="font-bold text-white block leading-tight">Google Gemini</span>
                    <span className="text-[10px] text-zinc-400">Gemini 3.8 Flash, 3.1 Pro · 18.2M tokens</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white">$14.60</span>
                  <span className="text-[10px] text-zinc-500 block">18.6%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                Total Upstream AI Spend
              </span>
              <span className="text-lg font-black text-white font-mono">
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
              className="px-3.5 py-2 rounded-xl bg-[#07090C] hover:bg-[#EAE5DC] text-white text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer border border-[#C59E5F]/30"
            >
              <span>View Usage & Costs</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#C59E5F]" />
            </button>
          </div>
        </div>
      </div>



      {/* ============================================================ */}

      {/* ============================================================ */}
      {/* MODAL 1: MANAGE PLAN COMPARISON MODAL                        */}
      {/* ============================================================ */}
      {managePlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#0B0E14] border border-white/[0.08] w-full max-w-4xl rounded-2xl shadow-2xl p-6 lg:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#C59E5F] block">
                  Subscription Plans
                </span>
                <h3 className="text-xl font-extrabold text-white font-sans">
                  Choose Your OstraOps Plan
                </h3>
              </div>
              <button
                onClick={() => setManagePlanOpen(false)}
                className="w-8 h-8 rounded-full bg-[#07090C] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Plan 1: Community */}
              <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#07090C] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400">
                      Community
                    </span>
                    <span className="text-[10px] font-mono bg-[#EAE5DC] text-zinc-300 px-2 py-0.5 rounded">
                      Free Tier
                    </span>
                  </div>
                  <div>
                    <span className="text-3xl font-black font-mono text-white">$0</span>
                    <span className="text-xs text-zinc-400 font-mono"> / forever</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">
                    Essential local telemetry, spend caps, and proxy controls for individual developers.
                  </p>
                  <ul className="space-y-2 text-xs font-sans text-zinc-300 pt-2 border-t border-white/[0.08]">
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
                  className="w-full py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] hover:border-charcoal-400 text-zinc-200 text-xs font-bold font-mono transition-all cursor-pointer"
                >
                  Downgrade
                </button>
              </div>

              {/* Plan 2: Hosted Gateway (Current) */}
              <div className="p-5 rounded-2xl border-2 border-[#18181B] bg-[#0B0E14] flex flex-col justify-between space-y-4 relative shadow-md">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#18181B] text-white text-[10px] font-bold font-mono uppercase tracking-wider px-3 py-0.5 rounded-full border border-white/20">
                  Current Plan
                </div>
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#C59E5F]">
                      Hosted Gateway
                    </span>
                    <span className="text-[10px] font-mono bg-[#C59E5F]/15 text-[#E5C38D] px-2 py-0.5 rounded font-bold border border-[#C59E5F]/30">
                      Active
                    </span>
                  </div>
                  <div>
                    <span className="text-3xl font-black font-mono text-white">$49</span>
                    <span className="text-xs text-zinc-400 font-mono"> / month</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">
                    Complete Hosted Gateway with centralized key vault, governance, and Solo Developer Guard included.
                  </p>
                  <ul className="space-y-2 text-xs font-sans text-zinc-300 pt-2 border-t border-white/[0.08]">
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
                  className="w-full py-2 rounded-xl bg-[#07090C] text-zinc-500 text-xs font-bold font-mono cursor-not-allowed border border-white/[0.08]"
                >
                  Current Plan
                </button>
              </div>

              {/* Plan 3: Team / Enterprise */}
              <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#07090C] flex flex-col justify-between space-y-4">
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
                    <span className="text-3xl font-black font-mono text-white">$499</span>
                    <span className="text-xs text-zinc-400 font-mono"> / month</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">
                    Complete AI governance with dedicated HSM Vault, custom RBAC, and SOC2 audit logs.
                  </p>
                  <ul className="space-y-2 text-xs font-sans text-zinc-300 pt-2 border-t border-white/[0.08]">
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
          <div className="bg-[#0B0E14] border border-white/[0.08] w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Cancel Solo Pro Subscription?
                </h3>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Downgrade to Community tier
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              You will retain all Solo Pro features until the conclusion of your current billing period on <strong>May 25, 2026</strong>. After that date, your organization will automatically transition to the free Community tier.
            </p>

            <div className="p-3 bg-[#07090C] rounded-xl border border-white/[0.08] text-xs font-sans space-y-1.5 text-zinc-300">
              <span className="font-bold text-white font-mono block text-[11px] uppercase">
                What changes on downgrade:
              </span>
              <p>· Team members reduced to 1 owner seat</p>
              <p>· Cloud telemetry sync disabled (local SQLite preserved)</p>
              <p>· Slack & Telegram alert webhooks paused</p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-zinc-300 uppercase block">
                Reason for canceling (optional)
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-mono text-zinc-200 focus:outline-none focus:border-charcoal-400"
              >
                <option value="temporary_pause">Pausing AI development temporarily</option>
                <option value="budget_constraint">Budget constraints / optimizing cost</option>
                <option value="missing_feature">Missing key feature or provider integration</option>
                <option value="other">Other reason</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => setCancelPlanOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-white/[0.06] cursor-pointer"
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

    </div>
  );
};
