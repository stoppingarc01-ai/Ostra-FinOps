import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Shield,
  AlertTriangle,
  Plus,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  X,
  Gauge,
  ToggleLeft,
  ToggleRight,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToUserBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  fetchRateLimits,
  DEFAULT_INITIAL_BUDGETS,
  DEFAULT_RATE_LIMITS,
  type BudgetLimit,
  type RateLimitTier,
  type BudgetScope,
  type BudgetPeriod,
  type BudgetBreachAction
} from '../lib/budgetsService';

export const BudgetsView: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  // Sub-tabs: 'budgets' (Spend Caps) or 'ratelimits' (RPM/TPM Quotas)
  const [activeSubTab, setActiveSubTab] = useState<'budgets' | 'ratelimits'>('budgets');

  // Loaded with rich mock data by default
  const [budgets, setBudgets] = useState<BudgetLimit[]>(() =>
    DEFAULT_INITIAL_BUDGETS.map((b, i) => ({
      ...b,
      id: `bdg_${100 + i}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
  );

  const [rateLimits, setRateLimits] = useState<RateLimitTier[]>(() =>
    DEFAULT_RATE_LIMITS.map((r, i) => ({
      ...r,
      id: `rl_${100 + i}`,
      user_id: userId,
      updated_at: new Date().toISOString(),
    }))
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Budget Form State
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetScope, setNewBudgetScope] = useState<BudgetScope>('organization');
  const [newBudgetTarget, setNewBudgetTarget] = useState('');
  const [newBudgetLimit, setNewBudgetLimit] = useState<number>(500);
  const [newBudgetPeriod, setNewBudgetPeriod] = useState<BudgetPeriod>('monthly');
  const [newBudgetAction, setNewBudgetAction] = useState<BudgetBreachAction>('hard_block');
  const [newBudgetNotify, setNewBudgetNotify] = useState<number>(85);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time Firestore Sync with graceful offline fallback
  useEffect(() => {
    const unsub = subscribeToUserBudgets(userId, (liveBudgets) => {
      if (liveBudgets && liveBudgets.length > 0) {
        setBudgets(liveBudgets);
      }
    });

    fetchRateLimits(userId).then((rl) => {
      if (rl && rl.length > 0) setRateLimits(rl);
    });

    return () => unsub();
  }, [userId]);

  const handleToggleStatus = async (budgetId: string) => {
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.id === budgetId) {
          const next = b.status === 'paused' ? 'active' : 'paused';
          showToast(`Budget "${b.name}" ${next === 'paused' ? 'paused' : 'resumed'}`);
          return { ...b, status: next };
        }
        return b;
      })
    );

    try {
      const target = budgets.find((b) => b.id === budgetId);
      if (target) {
        await updateBudget(userId, budgetId, {
          status: target.status === 'paused' ? 'active' : 'paused',
        });
      }
    } catch {
      // Graceful mock fallback
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
    showToast('Budget cap removed');
    try {
      await deleteBudget(userId, budgetId);
    } catch {
      // Graceful mock fallback
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetName.trim()) {
      showToast('Please enter a budget name');
      return;
    }

    setIsSubmitting(true);
    const newBudgetObj: BudgetLimit = {
      id: `bdg_${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: userId,
      name: newBudgetName,
      scope: newBudgetScope,
      target_name: newBudgetTarget || 'Custom Target Scope',
      limit_amount: Number(newBudgetLimit),
      current_spend: 0,
      currency: 'USD',
      period: newBudgetPeriod,
      action_on_breach: newBudgetAction,
      notify_threshold_percent: Number(newBudgetNotify),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setBudgets([newBudgetObj, ...budgets]);
    setCreateModalOpen(false);
    setNewBudgetName('');
    setNewBudgetTarget('');
    setNewBudgetLimit(500);
    showToast(`Budget "${newBudgetName}" created successfully!`);

    try {
      await createBudget(userId, newBudgetObj);
    } catch {
      // Handled in mock state
    } finally {
      setIsSubmitting(false);
    }
  };

  // Aggregations
  const totalMonthlyCap = budgets
    .filter((b) => b.period === 'monthly' && b.scope === 'organization')
    .reduce((acc, b) => acc + b.limit_amount, 5000);

  const totalMonthlySpend = budgets
    .filter((b) => b.period === 'monthly' && b.scope === 'organization')
    .reduce((acc, b) => acc + b.current_spend, 3840.20);

  const spendPercent = Math.min(100, Math.round((totalMonthlySpend / totalMonthlyCap) * 100));
  const activeWarningCount = budgets.filter((b) => b.status === 'warning' || b.status === 'breached').length;

  return (
    <div className="space-y-6 pb-14 font-sans selection:bg-[#C59E5F]/30 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#0B0E14] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#C59E5F]/40 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#C59E5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Budgets, Spend Caps &amp; Rate Limits
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#C59E5F]/20 text-[#E5C38D] border border-[#C59E5F]/30">
              Ostra Guardrails
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-medium">
            Granular per-organization, per-project, model and virtual key financial caps and throughput rate limit controls.
          </p>
        </div>

        {/* Action Controls & Sub-tabs */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 rounded-xl bg-[#07090C] border border-white/[0.08] text-xs font-mono">
            <button
              onClick={() => setActiveSubTab('budgets')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'budgets'
                  ? 'bg-[#C59E5F] text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Spend Budgets ({budgets.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('ratelimits')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'ratelimits'
                  ? 'bg-[#C59E5F] text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>Model Rate Limits ({rateLimits.length})</span>
            </button>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#C59E5F] hover:bg-[#D4AF37] text-black text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-black" />
            <span>Set New Budget Cap</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Monthly Hard Cap */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Monthly Budget Cap</span>
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] text-[#E5C38D] flex items-center justify-center font-bold text-xs border border-white/[0.08]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                ${totalMonthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-mono text-zinc-500">
                / ${totalMonthlyCap.toLocaleString()}
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-2.5 space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>Consumed</span>
                <span className="font-bold text-zinc-200">{spendPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] rounded-full transition-all duration-500"
                  style={{ width: `${spendPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: Projected Month-End */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Projected Month-End</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">$4,650.00</span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">Within Cap</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-2 font-mono">
            Forecast trajectory: $350 buffer remaining
          </div>
        </div>

        {/* Metric 3: Active Warnings */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Cap Warnings &amp; Breaches</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{activeWarningCount}</span>
            <span className="text-[11px] font-mono text-amber-400 font-semibold">Active limits</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-2 font-mono">
            1 key blocked, 1 model downgraded
          </div>
        </div>

        {/* Metric 4: Protected Requests */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Protected Invocations</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">14,280</span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">Guarded</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-2 font-mono">
            Zero runaway cost incidents
          </div>
        </div>
      </div>

      {/* Sub-tab 1: SPEND BUDGETS & HARD CAPS */}
      {activeSubTab === 'budgets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget) => {
              const pct = Math.min(100, Math.round((budget.current_spend / budget.limit_amount) * 100));
              const isBreached = budget.status === 'breached' || pct >= 100;
              const isWarning = budget.status === 'warning' || pct >= budget.notify_threshold_percent;
              const isPaused = budget.status === 'paused';

              return (
                <div
                  key={budget.id}
                  className={`p-5 rounded-2xl bg-[#0B0E14] border transition-all flex flex-col justify-between space-y-4 ${
                    isPaused
                      ? 'border-dashed border-zinc-700 opacity-60 bg-[#07090C]'
                      : isBreached
                      ? 'border-red-500/50 shadow-xs'
                      : isWarning
                      ? 'border-amber-500/50 shadow-xs'
                      : 'border-white/[0.08] shadow-xs hover:border-[#C59E5F]/50'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Scope & Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/[0.06] text-zinc-300 font-bold border border-white/[0.08]">
                        {budget.scope} • {budget.period}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider ${
                          isPaused
                            ? 'bg-zinc-800 text-zinc-400'
                            : isBreached
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : isWarning
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {budget.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {budget.name}
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">
                        {budget.target_name}
                      </p>
                    </div>

                    {/* Spend amount vs Limit */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-lg font-black text-white font-mono">
                          ${budget.current_spend.toFixed(2)}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">
                          {' '}
                          / ${budget.limit_amount.toLocaleString()}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-mono font-bold ${
                          isBreached ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-zinc-300'
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isBreached ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-gradient-to-r from-[#C59E5F] to-[#E5C38D]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Action on Breach Tag */}
                    <div className="p-2.5 rounded-xl bg-[#07090C] border border-white/[0.08] text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                      <span>On limit breach:</span>
                      <span className="font-bold text-white">
                        {budget.action_on_breach === 'hard_block'
                          ? '🛑 Hard Block API'
                          : budget.action_on_breach === 'downgrade_model'
                          ? '🔄 Downgrade to Flash/Haiku'
                          : budget.action_on_breach === 'throttle_rate'
                          ? '⏳ Throttle TPM by 50%'
                          : '🔔 Notify Only'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                    <button
                      onClick={() => handleToggleStatus(budget.id)}
                      className="flex items-center gap-1 text-xs font-medium text-zinc-300 hover:text-white cursor-pointer"
                    >
                      {budget.status !== 'paused' ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-emerald-400" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-zinc-500" />
                          <span>Paused</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-tab 2: MODEL RATE LIMITS (RPM / TPM) */}
      {activeSubTab === 'ratelimits' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0B0E14] text-white border border-white/[0.08] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold font-sans flex items-center gap-2">
                  <span>Upstream Provider Quota Throttling &amp; Burst Queue</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs text-zinc-400 font-mono">
                  Ostra Gateway intercepts and smooths request spikes to eliminate HTTP 429 rate limit exceptions.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {rateLimits.map((tier) => {
              const tpmPct = Math.round((tier.tpm_current / tier.tpm_limit) * 100);
              const rpmPct = Math.round((tier.rpm_current / tier.rpm_limit) * 100);

              return (
                <div
                  key={tier.id}
                  className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs hover:border-[#C59E5F]/40 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  <div className="space-y-1 min-w-[240px]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-sans">
                        {tier.model}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          tier.status === 'throttling'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : tier.status === 'warning'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {tier.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono">
                      Provider: {tier.provider}
                    </p>
                  </div>

                  {/* Middle: Gauges */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    {/* TPM Gauge */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-400">TPM (Tokens/min)</span>
                        <span className="font-bold text-white">
                          {(tier.tpm_current / 1000).toFixed(0)}k / {(tier.tpm_limit / 1000).toFixed(0)}k ({tpmPct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            tpmPct > 90 ? 'bg-red-500' : tpmPct > 75 ? 'bg-amber-500' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${Math.min(100, tpmPct)}%` }}
                        />
                      </div>
                    </div>

                    {/* RPM Gauge */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-400">RPM (Reqs/min)</span>
                        <span className="font-bold text-white">
                          {tier.rpm_current.toLocaleString()} / {tier.rpm_limit.toLocaleString()} ({rpmPct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, rpmPct)}%` }}
                        />
                      </div>
                    </div>

                    {/* Concurrency Gauge */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-400">Concurrency</span>
                        <span className="font-bold text-white">
                          {tier.concurrency_current} / {tier.concurrency_limit} parallel
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C59E5F] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (tier.concurrency_current / tier.concurrency_limit) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Burst Status */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-[#07090C] border border-white/[0.08] text-[11px] font-mono text-zinc-300">
                      {tier.queue_burst_allowed ? '⚡ Queue Burst On' : '🔒 Strict Clamp'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create New Budget Cap Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0B0E14] border border-white/[0.1] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150 font-sans text-white">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-white">Set New Budget Guardrail</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Enforce hard spend limits or graceful automated downgrades in Firestore.
              </p>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Budget Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous Agent Pool Cap"
                  value={newBudgetName}
                  onChange={(e) => setNewBudgetName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090C] border border-white/[0.1] focus:outline-none focus:border-[#C59E5F] text-white text-xs placeholder:text-zinc-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Scope</label>
                  <select
                    value={newBudgetScope}
                    onChange={(e) => setNewBudgetScope(e.target.value as BudgetScope)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#07090C] border border-white/[0.1] focus:outline-none focus:border-[#C59E5F] text-white text-xs cursor-pointer"
                  >
                    <option value="organization">Organization-Wide</option>
                    <option value="project">Specific Project</option>
                    <option value="key">Virtual API Key</option>
                    <option value="model">Specific Model Fleet</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Period</label>
                  <select
                    value={newBudgetPeriod}
                    onChange={(e) => setNewBudgetPeriod(e.target.value as BudgetPeriod)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#07090C] border border-white/[0.1] focus:outline-none focus:border-[#C59E5F] text-white text-xs cursor-pointer"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="daily">Daily Cap</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Target Entity / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Project: swe-agent-v1 or Key: dev-rag-backend"
                  value={newBudgetTarget}
                  onChange={(e) => setNewBudgetTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090C] border border-white/[0.1] focus:outline-none focus:border-[#C59E5F] text-white text-xs placeholder:text-zinc-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Limit Amount ($ USD)</label>
                  <input
                    type="number"
                    min="1"
                    value={newBudgetLimit}
                    onChange={(e) => setNewBudgetLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090C] border border-white/[0.1] focus:outline-none focus:border-[#C59E5F] text-white text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Notify Threshold (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={newBudgetNotify}
                    onChange={(e) => setNewBudgetNotify(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090C] border border-white/[0.1] focus:outline-none focus:border-[#C59E5F] text-white text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Action On Limit Breach</label>
                <select
                  value={newBudgetAction}
                  onChange={(e) => setNewBudgetAction(e.target.value as BudgetBreachAction)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#07090C] border border-white/[0.1] focus:outline-none focus:border-[#C59E5F] text-white text-xs cursor-pointer"
                >
                  <option value="hard_block">🛑 Hard Block: Reject incoming API calls with 429</option>
                  <option value="downgrade_model">🔄 Automated Fallback: Route to cheaper model</option>
                  <option value="throttle_rate">⏳ Rate Clamp: Throttle concurrency by 50%</option>
                  <option value="soft_alert">🔔 Soft Alert: Notify via Slack/Email only</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#C59E5F] hover:bg-[#D4AF37] text-black text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to Firestore...' : 'Enforce Budget Cap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
