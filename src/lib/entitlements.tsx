import React from 'react';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import type { UserSubscription } from '../types/database';

export type PlanTier = 'free' | 'telemetry_observer' | 'starter_gateway' | 'pro_gateway' | 'enterprise';

export interface PlanEntitlements {
  tier: PlanTier;
  name: string;
  priceMonthly: number;
  canAccessGateway: boolean;
  canEnforceBudgets: boolean;
  canAccessTelemetry: boolean;
  canUseSmartCache: boolean;
  canUseSemanticCache: boolean;
  canUseFallbackFailover: boolean;
  canInviteTeamMembers: boolean;
  maxConcurrentAgents: number; // 1 for free, 3 for telemetry, 5 for starter, Infinity for pro
  maxVirtualKeys: number;
  prioritySupport: boolean;
}

/**
 * Normalize any plan_id string from database/localStorage into a strict PlanTier
 */
export function normalizePlanTier(planId?: string | null): PlanTier {
  if (!planId) return 'free';
  const clean = planId.toLowerCase().trim();
  if (clean.includes('telemetry')) return 'telemetry_observer';
  if (clean.includes('starter') || clean.includes('team_scale') || clean.includes('solo_pro')) return 'starter_gateway';
  if (clean.includes('pro') || clean.includes('enterprise')) return 'pro_gateway';
  return 'free';
}

/**
 * Return strict capabilities for a given plan tier
 */
export function getPlanEntitlements(subscription?: UserSubscription | null): PlanEntitlements {
  const tier = normalizePlanTier(subscription?.plan_id);

  switch (tier) {
    case 'telemetry_observer':
      return {
        tier: 'telemetry_observer',
        name: 'Agent Telemetry',
        priceMonthly: 20,
        canAccessGateway: false, // Observability only, no edge proxy
        canEnforceBudgets: false, // Budget caps require gateway proxy
        canAccessTelemetry: true,
        canUseSmartCache: false,
        canUseSemanticCache: false,
        canUseFallbackFailover: false,
        canInviteTeamMembers: false,
        maxConcurrentAgents: 3,
        maxVirtualKeys: 3,
        prioritySupport: false,
      };

    case 'starter_gateway':
      return {
        tier: 'starter_gateway',
        name: 'Starter Gateway',
        priceMonthly: 35,
        canAccessGateway: true,
        canEnforceBudgets: true,
        canAccessTelemetry: true,
        canUseSmartCache: true,
        canUseSemanticCache: false, // Pro only
        canUseFallbackFailover: false, // Pro only
        canInviteTeamMembers: false,
        maxConcurrentAgents: 5,
        maxVirtualKeys: 10,
        prioritySupport: false,
      };

    case 'pro_gateway':
    case 'enterprise':
      return {
        tier: 'pro_gateway',
        name: 'Pro Gateway',
        priceMonthly: 59,
        canAccessGateway: true,
        canEnforceBudgets: true,
        canAccessTelemetry: true,
        canUseSmartCache: true,
        canUseSemanticCache: true,
        canUseFallbackFailover: true,
        canInviteTeamMembers: true,
        maxConcurrentAgents: 999999,
        maxVirtualKeys: 100,
        prioritySupport: true,
      };

    case 'free':
    default:
      return {
        tier: 'free',
        name: 'Community Free',
        priceMonthly: 0,
        canAccessGateway: false,
        canEnforceBudgets: false,
        canAccessTelemetry: false,
        canUseSmartCache: false,
        canUseSemanticCache: false,
        canUseFallbackFailover: false,
        canInviteTeamMembers: false,
        maxConcurrentAgents: 1,
        maxVirtualKeys: 1,
        prioritySupport: false,
      };
  }
}

interface FeatureGateProps {
  subscription?: UserSubscription | null;
  feature: 'gateway' | 'budgets' | 'telemetry' | 'semantic_cache' | 'failover' | 'team_seats';
  requiredPlanName?: string;
  onUpgrade?: () => void;
  children: React.ReactNode;
}

/**
 * Reusable visual gatekeeper for views or specific feature sections
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  subscription,
  feature,
  requiredPlanName,
  onUpgrade,
  children,
}) => {
  const entitlements = getPlanEntitlements(subscription);

  let hasAccess = false;
  let defaultRequiredPlan = 'Starter Gateway ($35/mo)';
  let featureDescription = '';

  switch (feature) {
    case 'gateway':
      hasAccess = entitlements.canAccessGateway;
      defaultRequiredPlan = 'Starter Gateway ($35/mo) or Pro Gateway ($59/mo)';
      featureDescription = 'Route your AI traffic through the ultra-low latency Hosted Edge Gateway with automated token rate-limiting.';
      break;
    case 'budgets':
      hasAccess = entitlements.canEnforceBudgets;
      defaultRequiredPlan = 'Starter Gateway ($35/mo) or Pro Gateway ($59/mo)';
      featureDescription = 'Automated budget enforcement & hard kill-switches halt runaway agent loops before cloud bills escalate.';
      break;
    case 'telemetry':
      hasAccess = entitlements.canAccessTelemetry;
      defaultRequiredPlan = 'Agent Telemetry ($20/mo), Starter Gateway ($35/mo), or Pro Gateway ($59/mo)';
      featureDescription = 'Live token velocity tracking, model cost benchmarking, latency metrics, and webhook alerts.';
      break;
    case 'semantic_cache':
      hasAccess = entitlements.canUseSemanticCache;
      defaultRequiredPlan = 'Pro Gateway ($59/mo)';
      featureDescription = 'Semantic vector-based caching for complex agent context queries, eliminating duplicate token costs.';
      break;
    case 'failover':
      hasAccess = entitlements.canUseFallbackFailover;
      defaultRequiredPlan = 'Pro Gateway ($59/mo)';
      featureDescription = 'Automated multi-provider model fallback and intelligent load-balancing during provider outages.';
      break;
    case 'team_seats':
      hasAccess = entitlements.canInviteTeamMembers;
      defaultRequiredPlan = 'Pro Gateway ($59/mo) with Developer Seats ($5/seat)';
      featureDescription = 'Invite engineering team members with granular RBAC permissions, audit logging, and scoped API keys.';
      break;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  const effectiveRequiredPlan = requiredPlanName || defaultRequiredPlan;

  return (
    <div className="relative rounded-2xl border border-amber-500/30 bg-[#0B0E14]/90 backdrop-blur-md p-8 sm:p-12 text-center overflow-hidden my-4">
      {/* Ambient background glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <Lock className="w-6 h-6" />
        </div>

        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mb-3">
          Plan Entitlement Required
        </span>

        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
          Unlock with {effectiveRequiredPlan}
        </h3>

        <p className="text-sm text-zinc-400 leading-relaxed mb-6">
          {featureDescription} Your workspace is currently on the <strong className="text-zinc-200">{entitlements.name}</strong> plan.
        </p>

        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upgrade to Unlock</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
