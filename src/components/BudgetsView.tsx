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
    <div className="space-y-6 pb-14 font-sans selection:bg-[#D4AF7C]/30 selection:text-charcoal-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#0B0F0F] text-[#FAF8F5] px-4 py-3 rounded-2xl shadow-2xl border border-[#D4AF7C]/40 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#D4AF7C]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 font-sans">
              Budgets, Spend Caps & Rate Limits
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#D4AF7C]/20 text-[#8E6B2C] border border-[#D4AF7C]/40">
              Ostra Guardrails
            </span>
          </div>
          <p className="text-xs text-charcoal-500 font-medium">
            Granular per-organization, per-project, model and virtual key financial caps and throughput rate limit controls.
          </p>
        </div>

        {/* Action Controls & Sub-tabs */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 rounded-xl bg-sandstone-200/80 border border-[#EAE5DC] text-xs font-mono">
            <button
              onClick={() => setActiveSubTab('budgets')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'budgets'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-[#D4AF7C]" />
              <span>Spend Budgets ({budgets.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('ratelimits')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'ratelimits'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Gauge className="w-3.5 h-3.5 text-[#00A678]" />
              <span>Model Rate Limits ({rateLimits.length})</span>
            </button>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold transition-all shadow-subtle flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-osterdGold-400" />
            <span>Set New Budget Cap</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Monthly Hard Cap */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-charcoal-500">Monthly Budget Cap</span>
            <div className="w-8 h-8 rounded-xl bg-sandstone-200 text-charcoal-800 flex items-center justify-center font-bold text-xs">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-charcoal-900 font-mono">
                ${totalMonthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-mono text-charcoal-500">
                / ${totalMonthlyCap.toLocaleString()}
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-2.5 space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-charcoal-500">
                <span>Consumed</span>
                <span className="font-bold text-charcoal-800">{spendPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-sandstone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D4AF7C] rounded-full transition-all duration-500"
                  style={{ width: `${spendPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: Projected Month-End */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-charcoal-500">Projected Month-End</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-charcoal-900 font-mono">$4,650.00</span>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold">Within Cap</span>
          </div>
          <div className="text-[11px] text-charcoal-500 mt-2 font-mono">
            Forecast trajectory: $350 buffer remaining
          </div>
        </div>

        {/* Metric 3: Active Warnings */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-charcoal-500">Cap Warnings & Breaches</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-charcoal-900 font-mono">{activeWarningCount}</span>
            <span className="text-[11px] font-mono text-amber-700 font-semibold">Active limits</span>
          </div>
          <div className="text-[11px] text-charcoal-400 mt-2 font-mono">
            1 key blocked, 1 model downgraded
          </div>
        </div>

        {/* Metric 4: Protected Requests */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-charcoal-500">Protected Invocations</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-charcoal-900 font-mono">14,280</span>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold">Guarded</span>
          </div>
          <div className="text-[11px] text-charcoal-400 mt-2 font-mono">
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
                  className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between space-y-4 ${
                    isPaused
                      ? 'border-dashed border-[#D2D9DC] opacity-60 bg-sandstone-50'
                      : isBreached
                      ? 'border-red-500/40 shadow-xs'
                      : isWarning
                      ? 'border-amber-500/40 shadow-xs'
                      : 'border-[#EAE5DC] shadow-subtle hover:border-[#D4AF7C]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Scope & Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-sandstone-200 text-charcoal-700 font-bold">
                        {budget.scope} • {budget.period}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider ${
                          isPaused
                            ? 'bg-neutral-100 text-neutral-600'
                            : isBreached
                            ? 'bg-red-500/15 text-red-700 border border-red-500/30'
                            : isWarning
                            ? 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-700'
                        }`}
                      >
                        {budget.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-charcoal-900 leading-snug">
                        {budget.name}
                      </h3>
                      <p className="text-xs text-charcoal-500 font-mono mt-0.5">
                        {budget.target_name}
                      </p>
                    </div>

                    {/* Spend amount vs Limit */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-lg font-black text-charcoal-900 font-mono">
                          ${budget.current_spend.toFixed(2)}
                        </span>
                        <span className="text-xs font-mono text-charcoal-500">
                          {' '}
                          / ${budget.limit_amount.toLocaleString()}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-mono font-bold ${
                          isBreached ? 'text-red-600' : isWarning ? 'text-amber-700' : 'text-charcoal-700'
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-sandstone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isBreached ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-[#D4AF7C]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Action on Breach Tag */}
                    <div className="p-2.5 rounded-xl bg-sandstone-100/70 border border-[#EAE5DC] text-[11px] font-mono text-charcoal-600 flex items-center justify-between">
                      <span>On limit breach:</span>
                      <span className="font-bold text-charcoal-900">
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
                  <div className="flex items-center justify-between pt-3 border-t border-[#EAE5DC]">
                    <button
                      onClick={() => handleToggleStatus(budget.id)}
                      className="flex items-center gap-1 text-xs font-medium text-charcoal-700 hover:text-charcoal-900 cursor-pointer"
                    >
                      {budget.status !== 'paused' ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-charcoal-400" />
                          <span>Paused</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0B0F0F] to-[#161C20] text-white border border-white/10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00A678]/20 border border-[#00A678]/30 text-[#00A678] flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold font-sans flex items-center gap-2">
                  <span>Upstream Provider Quota Throttling & Burst Queue</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs text-neutral-400 font-mono">
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
                  className="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  <div className="space-y-1 min-w-[240px]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-charcoal-900 font-sans">
                        {tier.model}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          tier.status === 'throttling'
                            ? 'bg-red-500/15 text-red-700'
                            : tier.status === 'warning'
                            ? 'bg-amber-500/15 text-amber-800'
                            : 'bg-emerald-500/15 text-emerald-700'
                        }`}
                      >
                        {tier.status}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-500 font-mono">
                      Provider: {tier.provider}
                    </p>
                  </div>

                  {/* Middle: Gauges */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    {/* TPM Gauge */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-charcoal-500">TPM (Tokens/min)</span>
                        <span className="font-bold text-charcoal-900">
                          {(tier.tpm_current / 1000).toFixed(0)}k / {(tier.tpm_limit / 1000).toFixed(0)}k ({tpmPct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-sandstone-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            tpmPct > 90 ? 'bg-red-500' : tpmPct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, tpmPct)}%` }}
                        />
                      </div>
                    </div>

                    {/* RPM Gauge */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-charcoal-500">RPM (Reqs/min)</span>
                        <span className="font-bold text-charcoal-900">
                          {tier.rpm_current.toLocaleString()} / {tier.rpm_limit.toLocaleString()} ({rpmPct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-sandstone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, rpmPct)}%` }}
                        />
                      </div>
                    </div>

                    {/* Concurrency Gauge */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-charcoal-500">Concurrency</span>
                        <span className="font-bold text-charcoal-900">
                          {tier.concurrency_current} / {tier.concurrency_limit} parallel
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-sandstone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (tier.concurrency_current / tier.concurrency_limit) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Burst Status */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-sandstone-100 text-[11px] font-mono text-charcoal-700">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#EAE5DC] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150 font-sans">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-xl text-charcoal-400 hover:text-charcoal-800 hover:bg-sandstone-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-charcoal-900">Set New Budget Guardrail</h2>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Enforce hard spend limits or graceful automated downgrades in Firestore.
              </p>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-charcoal-800 block mb-1">Budget Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous Agent Pool Cap"
                  value={newBudgetName}
                  onChange={(e) => setNewBudgetName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DC] focus:outline-none focus:border-[#D4AF7C] text-charcoal-900 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-charcoal-800 block mb-1">Scope</label>
                  <select
                    value={newBudgetScope}
                    onChange={(e) => setNewBudgetScope(e.target.value as BudgetScope)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EAE5DC] focus:outline-none focus:border-[#D4AF7C] text-charcoal-900 text-xs cursor-pointer"
                  >
                    <option value="organization">Organization-Wide</option>
                    <option value="project">Specific Project</option>
                    <option value="key">Virtual API Key</option>
                    <option value="model">Specific Model Fleet</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-charcoal-800 block mb-1">Period</label>
                  <select
                    value={newBudgetPeriod}
                    onChange={(e) => setNewBudgetPeriod(e.target.value as BudgetPeriod)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EAE5DC] focus:outline-none focus:border-[#D4AF7C] text-charcoal-900 text-xs cursor-pointer"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="daily">Daily Cap</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-charcoal-800 block mb-1">Target Entity / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Project: swe-agent-v1 or Key: dev-rag-backend"
                  value={newBudgetTarget}
                  onChange={(e) => setNewBudgetTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DC] focus:outline-none focus:border-[#D4AF7C] text-charcoal-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-charcoal-800 block mb-1">Limit Amount ($ USD)</label>
                  <input
                    type="number"
                    min="1"
                    value={newBudgetLimit}
                    onChange={(e) => setNewBudgetLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DC] focus:outline-none focus:border-[#D4AF7C] text-charcoal-900 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-800 block mb-1">Notify Threshold (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={newBudgetNotify}
                    onChange={(e) => setNewBudgetNotify(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DC] focus:outline-none focus:border-[#D4AF7C] text-charcoal-900 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-charcoal-800 block mb-1">Action On Limit Breach</label>
                <select
                  value={newBudgetAction}
                  onChange={(e) => setNewBudgetAction(e.target.value as BudgetBreachAction)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#EAE5DC] focus:outline-none focus:border-[#D4AF7C] text-charcoal-900 text-xs cursor-pointer"
                >
                  <option value="hard_block">🛑 Hard Block: Reject incoming API calls with 429</option>
                  <option value="downgrade_model">🔄 Automated Fallback: Route to cheaper model</option>
                  <option value="throttle_rate">⏳ Rate Clamp: Throttle concurrency by 50%</option>
                  <option value="soft_alert">🔔 Soft Alert: Notify via Slack/Email only</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE5DC]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-sandstone-100 hover:bg-sandstone-200 text-charcoal-800 text-xs font-bold transition-all cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold transition-all shadow-subtle cursor-pointer disabled:opacity-50"
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
