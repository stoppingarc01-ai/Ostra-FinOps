import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPlanEntitlements, type PlanTier } from '../lib/entitlements';
import { updateUserSubscription } from '../lib/subscriptionService';

interface BillingViewProps {
  onNavigateUsage?: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onNavigateUsage }) => {
  const { user, subscription, updateSubscription } = useAuth();
  const entitlements = getPlanEntitlements(subscription);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectPlan = async (tier: PlanTier) => {
    if (!user?.id) {
      showToast('Please sign in to update your subscription.');
      return;
    }
    setIsChangingPlan(true);

    let planName = 'Community Free';
    let price = 0;
    let limit = 10000;

    switch (tier) {
      case 'telemetry_observer':
        planName = 'Agent Telemetry';
        price = 20;
        limit = 500000;
        break;
      case 'starter_gateway':
        planName = 'Starter Gateway';
        price = 35;
        limit = 2000000;
        break;
      case 'pro_gateway':
        planName = 'Pro Gateway';
        price = 59;
        limit = 10000000;
        break;
      case 'free':
      default:
        planName = 'Community Free';
        price = 0;
        limit = 10000;
        break;
    }

    try {
      const updates = {
        plan_id: tier,
        plan_name: planName,
        price_amount: price,
        billing_interval: 'mo' as const,
        status: 'active' as const,
        quota_limit: limit,
      };

      await updateUserSubscription(user.id, updates);
      if (updateSubscription) {
        await updateSubscription(updates);
      }
      showToast(`Workspace plan successfully switched to ${planName}. Benefits unlocked!`);
    } catch {
      showToast('Failed to update subscription. Please try again.');
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
    <div className="space-y-8 text-white animate-in fade-in duration-150">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-mono flex items-center gap-2 border border-[#3F3F46] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C59E5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-sans">
            Subscription &amp; Plan Management
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C59E5F]/20 text-[#E5C38D] border border-[#C59E5F]/30 uppercase">
            Active: {entitlements.name}
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Switch between plans instantly. Entitlements, budget caps, and proxy routes update in real time.
        </p>
      </div>

      {/* Current Active Plan Overview Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B0E14] via-[#141820] to-[#0B0E14] border border-[#C59E5F]/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Current Tier</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#C59E5F]/20 text-[#E5C38D] border border-[#C59E5F]/30">
              {entitlements.name.toUpperCase()}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-sans">
            ${entitlements.priceMonthly}.00 <span className="text-xs font-normal text-zinc-400">/ month</span>
          </div>
          <p className="text-xs text-zinc-300 max-w-md">
            {entitlements.tier === 'free'
              ? 'Community Free active. Upgrade to Starter or Pro to route requests through the hosted gateway.'
              : entitlements.tier === 'telemetry_observer'
              ? 'Agent Telemetry active. Real-time observability, health monitoring, and webhooks unlocked.'
              : entitlements.tier === 'starter_gateway'
              ? 'Starter Gateway active. Automated budget guardrails, edge caching, and 5 agents unlocked.'
              : 'Pro Gateway active. Unlimited agents, semantic caching, fallback failover, and team collaboration unlocked.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {onNavigateUsage && (
            <button
              onClick={onNavigateUsage}
              className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
            >
              View Usage
            </button>
          )}
        </div>
      </div>

      {/* Plan Selection Cards Grid */}
      <div>
        <h3 className="text-base font-bold text-white mb-4">Choose Your Tier</h3>
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

      {/* Developer Seats Section */}
      <div className="p-6 rounded-3xl bg-[#0B0E14] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">Extra Developer Seats</h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
              $5 / seat / month
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Invite engineering team members with granular RBAC permissions (Admin, Developer, Viewer, Billing), individual spend attribution, and isolated API keys without sharing master credentials. Included with Pro Gateway.
          </p>
        </div>

        {entitlements.canInviteTeamMembers ? (
          <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shrink-0">
            ✓ Developer Seats Unlocked
          </span>
        ) : (
          <button
            onClick={() => handleSelectPlan('pro_gateway')}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-zinc-200 transition-colors shrink-0 cursor-pointer"
          >
            Upgrade to Pro for Seats
          </button>
        )}
      </div>

    </div>
  );
};
