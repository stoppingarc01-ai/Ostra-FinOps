import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  CheckCircle2,
  X,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FeatureGate } from '../lib/entitlements';
import {
  fetchUserBudgets,
  subscribeToUserBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  fetchRateLimits,
  type BudgetLimit,
  type RateLimitTier,
  type BudgetScope,
  type BudgetPeriod,
  type BudgetBreachAction
} from '../lib/budgetsService';

export const BudgetsView: React.FC = () => {
  const { user, subscription } = useAuth();
  const userId = user?.id || 'guest_user';

  // Sub-tabs: 'budgets' (Spend Caps) or 'ratelimits' (RPM/TPM Quotas)
  const [activeSubTab, setActiveSubTab] = useState<'budgets' | 'ratelimits'>('budgets');
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimitTier[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Budget Form State
  const [newBudgetName, setNewBudgetName] = useState('');
  const newBudgetScope: BudgetScope = 'organization';
  const newBudgetTarget = 'All Traffic (Global)';
  const [newBudgetLimit, setNewBudgetLimit] = useState<number>(50);
  const [newBudgetPeriod, setNewBudgetPeriod] = useState<BudgetPeriod>('monthly');
  const [newBudgetAction, setNewBudgetAction] = useState<BudgetBreachAction>('hard_block');
  const newBudgetNotify = 85;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (!userId) return;
    
    fetchUserBudgets(userId).then(setBudgets);
    fetchRateLimits(userId).then(setRateLimits);

    const unsub = subscribeToUserBudgets(userId, (liveBudgets: BudgetLimit[]) => {
      if (liveBudgets) {
        setBudgets(liveBudgets);
      }
    });

    return () => unsub();
  }, [userId]);

  const handleToggleStatus = async (budgetId: string) => {
    const target = budgets.find((b) => b.id === budgetId);
    if (!target) return;
    const nextStatus = target.status === 'paused' ? 'active' : 'paused';
    
    setBudgets((prev) =>
      prev.map((b) => (b.id === budgetId ? { ...b, status: nextStatus } : b))
    );
    showToast(`Budget "${target.name}" ${nextStatus === 'paused' ? 'paused' : 'resumed'}`);

    try {
      await updateBudget(userId, budgetId, { status: nextStatus });
    } catch {}
  };

  const handleDeleteBudget = async (budgetId: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
    showToast('Budget rule deleted successfully.');
    try {
      await deleteBudget(userId, budgetId);
    } catch {}
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetName.trim()) {
      showToast('Please enter a budget name');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createBudget(userId, {
        name: newBudgetName.trim(),
        scope: newBudgetScope,
        target_name: newBudgetTarget.trim() || 'Global Workspace',
        limit_amount: Number(newBudgetLimit),
        current_spend: 0,
        currency: 'USD',
        period: newBudgetPeriod,
        action_on_breach: newBudgetAction,
        notify_threshold_percent: Number(newBudgetNotify),
        status: 'active',
      });

      setBudgets((prev) => [...prev, created]);
      setCreateModalOpen(false);
      setNewBudgetName('');
      setNewBudgetLimit(50);
      showToast(`Budget cap "${created.name}" created and active.`);
    } catch {
      showToast('Failed to save budget limit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMonthlySpend = budgets
    .filter((b) => b.period === 'monthly')
    .reduce((sum, b) => sum + (b.current_spend || 0), 0);
  const totalMonthlyCap = budgets
    .filter((b) => b.period === 'monthly')
    .reduce((sum, b) => sum + b.limit_amount, 0);
  const spendPercent = totalMonthlyCap > 0 ? Math.min(100, Math.round((totalMonthlySpend / totalMonthlyCap) * 100)) : 0;
  const warningCount = budgets.filter((b) => b.status === 'warning' || b.status === 'breached').length;

  return (
    <FeatureGate subscription={subscription} feature="budgets">
      <div className="space-y-6 text-white animate-in fade-in duration-150">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-mono flex items-center gap-2 border border-[#3F3F46] animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#C59E5F]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-sans">
                Budget Guardrails &amp; Limits
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C59E5F]/20 text-[#E5C38D] border border-[#C59E5F]/30 uppercase">
                Zero-Downtime Circuit Breaker
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Set automated daily and monthly hard stops. When your threshold is reached, requests halt safely before runaway charges happen.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* View Sub-tabs */}
            <div className="flex items-center p-1 rounded-xl bg-[#0B0E14] border border-white/[0.08]">
              <button
                onClick={() => setActiveSubTab('budgets')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  activeSubTab === 'budgets' ? 'bg-[#C59E5F] text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Spend Caps
              </button>
              <button
                onClick={() => setActiveSubTab('ratelimits')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  activeSubTab === 'ratelimits' ? 'bg-[#C59E5F] text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                RPM / TPM Tiers
              </button>
            </div>

            {activeSubTab === 'budgets' && (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#AA824B] hover:from-[#D4AF7C] hover:to-[#C59E5F] text-black font-semibold text-xs transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Budget Limit</span>
              </button>
            )}
          </div>
        </div>

        {/* Spend Caps Tab */}
        {activeSubTab === 'budgets' && (
          <div className="space-y-6">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs">
                <span className="text-xs font-medium text-zinc-400">Total Monthly Spend</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-white font-mono">
                    ${totalMonthlySpend.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    / ${totalMonthlyCap > 0 ? totalMonthlyCap.toLocaleString() : 'No Limit'}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] rounded-full transition-all duration-500"
                    style={{ width: `${spendPercent}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs">
                <span className="text-xs font-medium text-zinc-400">Configured Guardrails</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-white font-mono">
                    {budgets.length}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">active rules</span>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono mt-2 block">
                  {budgets.filter(b => b.status === 'active').length} actively guarding
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs">
                <span className="text-xs font-medium text-zinc-400">Cap Breaches</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-2xl font-black font-mono ${warningCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {warningCount}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">breaches</span>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono mt-2 block">
                  {warningCount === 0 ? 'All budgets within thresholds' : 'Automated action triggered'}
                </span>
              </div>
            </div>

            {/* List of Budgets */}
            {budgets.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#0B0E14] border border-white/[0.08] text-center flex flex-col items-center">
                <Wallet className="w-12 h-12 text-[#C59E5F] mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No Budget Caps Configured</h3>
                <p className="text-xs text-zinc-400 max-w-sm mb-5">
                  Protect your API credentials from recursive loops. Create a daily or monthly limit to automatically freeze traffic when crossed.
                </p>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C59E5F] text-black font-semibold text-xs cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Budget Limit</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.map((b) => {
                  const pct = b.limit_amount > 0 ? Math.min(100, Math.round(((b.current_spend || 0) / b.limit_amount) * 100)) : 0;
                  return (
                    <div key={b.id} className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs flex flex-col justify-between space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/[0.06] text-zinc-300 font-bold border border-white/[0.08]">
                          {b.scope} • {b.period}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          b.status === 'paused' ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {b.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white">{b.name}</h4>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">{b.target_name}</p>
                      </div>

                      <div>
                        <div className="flex items-baseline justify-between text-xs font-mono mb-1.5">
                          <span className="text-white font-bold text-base">${(b.current_spend || 0).toFixed(2)} / ${b.limit_amount}</span>
                          <span className="text-zinc-400">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                          <div className="h-full bg-[#C59E5F] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#07090C] border border-white/[0.08] text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                        <span>On limit breach:</span>
                        <span className="font-bold text-white">
                          {b.action_on_breach === 'hard_block' ? '🛑 Hard Block 429' : '🔔 Alert Only'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                        <button
                          onClick={() => handleToggleStatus(b.id)}
                          className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {b.status === 'paused' ? 'Resume Guard' : 'Pause Guard'}
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(b.id)}
                          className="text-xs text-red-400/80 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RPM / TPM Tiers Tab */}
        {activeSubTab === 'ratelimits' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rateLimits.map((rl) => (
              <div key={rl.model} className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{rl.model}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                    {rl.status}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 font-mono">Provider: {rl.provider}</div>
                <div className="space-y-1.5 pt-2 border-t border-white/[0.06] text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">RPM Limit:</span>
                    <span className="text-white font-bold">{rl.rpm_limit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">TPM Limit:</span>
                    <span className="text-white font-bold">{rl.tpm_limit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Max Concurrency:</span>
                    <span className="text-white font-bold">{rl.concurrency_limit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Budget Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="bg-[#0B0E14] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/[0.1] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">Create New Budget Guardrail</h3>
                <button onClick={() => setCreateModalOpen(false)} className="text-zinc-500 hover:text-zinc-200 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-zinc-400 font-semibold mb-1 block">Guardrail Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Autonomous Agent Safety Cap"
                    value={newBudgetName}
                    onChange={(e) => setNewBudgetName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-hidden focus:border-[#C59E5F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 font-semibold mb-1 block">Limit Amount ($ USD)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newBudgetLimit}
                      onChange={(e) => setNewBudgetLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-hidden focus:border-[#C59E5F]"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-semibold mb-1 block">Evaluation Period</label>
                    <select
                      value={newBudgetPeriod}
                      onChange={(e) => setNewBudgetPeriod(e.target.value as BudgetPeriod)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-hidden focus:border-[#C59E5F]"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold mb-1 block">Action On Limit Breach</label>
                  <select
                    value={newBudgetAction}
                    onChange={(e) => setNewBudgetAction(e.target.value as BudgetBreachAction)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-hidden focus:border-[#C59E5F]"
                  >
                    <option value="hard_block">🛑 Hard Block API (HTTP 429 - Immediate Cutoff)</option>
                    <option value="soft_alert">🔔 Soft Alert (Log Incident &amp; Notify)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/[0.06] text-zinc-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-[#C59E5F] text-black font-bold cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : 'Deploy Guardrail'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </FeatureGate>
  );
};
