import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Users, 
  Copy, 
  Check, 
  Lock, 
  Scale, 
  Server, 
  Key, 
  EyeOff, 
  Zap, 
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  Terminal,
  ArrowRight,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PricingPageProps {
  onNavigateHome?: () => void;
  onNavigateLogin?: () => void;
}

export type SupportedCurrency = 'USD' | 'INR' | 'EUR' | 'GBP';

interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  flag: string;
  name: string;
  telemetryMonthly: number;
  telemetryAnnualMonthly: number;
  starterMonthly: number;
  starterAnnualMonthly: number;
  proMonthly: number;
  proAnnualMonthly: number;
  seatPriceMonthly: number;
  paymentMethods: string[];
}

const CURRENCY_CONFIGS: Record<SupportedCurrency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    flag: '🇺🇸',
    name: 'US Dollar',
    telemetryMonthly: 20,
    telemetryAnnualMonthly: 16,
    starterMonthly: 35,
    starterAnnualMonthly: 28,
    proMonthly: 59,
    proAnnualMonthly: 47,
    seatPriceMonthly: 5,
    paymentMethods: ['Credit / Debit Cards (Visa, Mastercard, Amex)', 'Apple Pay / Google Pay', 'Bank Wire'],
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    flag: '🇮🇳',
    name: 'Indian Rupee',
    telemetryMonthly: 1650,
    telemetryAnnualMonthly: 1320,
    starterMonthly: 2890,
    starterAnnualMonthly: 2390,
    proMonthly: 4890,
    proAnnualMonthly: 3990,
    seatPriceMonthly: 399,
    paymentMethods: ['UPI (GPay / PhonePe / Paytm)', 'RuPay / Cards', 'Net Banking (All Indian Banks)', 'GST Invoicing'],
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    flag: '🇪🇺',
    name: 'Euro',
    telemetryMonthly: 19,
    telemetryAnnualMonthly: 15,
    starterMonthly: 32,
    starterAnnualMonthly: 26,
    proMonthly: 55,
    proAnnualMonthly: 44,
    seatPriceMonthly: 5,
    paymentMethods: ['SEPA Direct Debit', 'Cards (Visa, MC)', 'iDEAL / Sofort / Bancontact'],
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    flag: '🇬🇧',
    name: 'British Pound',
    telemetryMonthly: 16,
    telemetryAnnualMonthly: 13,
    starterMonthly: 28,
    starterAnnualMonthly: 22,
    proMonthly: 48,
    proAnnualMonthly: 38,
    seatPriceMonthly: 4,
    paymentMethods: ['UK Cards', 'BACS Direct Debit', 'Apple Pay'],
  },
};

export const PricingPage: React.FC<PricingPageProps> = ({ 
  onNavigateHome, 
  onNavigateLogin,
}) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // Selected Currency State - Defaults to USD ($)
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Background Automatic IP Geo-detection (Defaults to USD)
  useEffect(() => {
    fetch('https://api.country.is')
      .then(res => res.json())
      .then(data => {
        if (data && data.country) {
          const countryCode = String(data.country).toUpperCase();
          if (countryCode === 'IN') {
            setCurrency('INR');
          } else if (countryCode === 'GB') {
            setCurrency('GBP');
          } else if (['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'PT', 'FI', 'GR', 'PL', 'SE'].includes(countryCode)) {
            setCurrency('EUR');
          } else {
            setCurrency('USD');
          }
        }
      })
      .catch(() => {
        try {
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
          if (timeZone.includes('Calcutta') || timeZone.includes('Kolkata')) {
            setCurrency('INR');
          } else if (timeZone.includes('London')) {
            setCurrency('GBP');
          } else if (timeZone.startsWith('Europe/')) {
            setCurrency('EUR');
          } else {
            setCurrency('USD');
          }
        } catch {
          setCurrency('USD');
        }
      });
  }, []);

  const copyGuardCmd = () => {
    navigator.clipboard.writeText('npx ostraops-guard');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentCfg = CURRENCY_CONFIGS[currency];
  const isAnnual = billingCycle === 'annual';

  // Price calculations based on selected currency and billing cycle
  const telemetryDisplayPrice = isAnnual ? currentCfg.telemetryAnnualMonthly : currentCfg.telemetryMonthly;
  const starterDisplayPrice = isAnnual ? currentCfg.starterAnnualMonthly : currentCfg.starterMonthly;
  const proDisplayPrice = isAnnual ? currentCfg.proAnnualMonthly : currentCfg.proMonthly;
  const seatDisplayPrice = currentCfg.seatPriceMonthly;

  const handleOpenCheckout = (planId: 'telemetry' | 'starter' | 'pro', name: string, monthlyAmount: number) => {
    const finalAmount = isAnnual ? monthlyAmount * 12 : monthlyAmount;
    
    // Persist user's selected plan for seamless signup fulfillment
    const pendingPlan = {
      planId: planId === 'telemetry' ? 'telemetry_observer' : planId === 'starter' ? 'starter_gateway' : 'pro_gateway',
      name,
      type: planId === 'telemetry' ? 'telemetry' : 'hosted',
      amount: finalAmount,
      billingInterval: isAnnual ? 'yr' : 'mo',
      currency: currentCfg.code,
    };
    try {
      localStorage.setItem('ostraops_active_plan', pendingPlan.planId);
      localStorage.setItem('ostraops_user_tier', planId === 'telemetry' ? 'telemetry' : 'team');
      sessionStorage.setItem('ostraops_pending_plan', JSON.stringify(pendingPlan));
      localStorage.setItem('ostraops_pending_plan', JSON.stringify(pendingPlan));
    } catch {}

    // Pricing page redirects to login page (if not logged in) or directly to dashboard (if already logged in)
    if (!user) {
      showToast(`Selected ${name}. Please log in to complete your setup & payment.`);
      setTimeout(() => {
        if (onNavigateLogin) {
          onNavigateLogin();
        } else {
          window.location.hash = '#login';
        }
      }, 400);
      return;
    }

    // User is already logged in: route to dashboard to complete payment there
    showToast(`Loading ${name} checkout on your dashboard...`);
    setTimeout(() => {
      window.location.hash = '#dashboard';
    }, 400);
  };

  const comparisonRows = [
    {
      feature: 'Deployment',
      cli: 'Localhost CLI (127.0.0.1:8080)',
      telemetry: 'SDK / Direct Telemetry Ingestion',
      starter: 'Instant Cloud Proxy URL',
      pro: 'High-Throughput Dedicated Proxy',
      icon: Server,
    },
    {
      feature: 'Monthly Capacity',
      cli: 'Unlimited local execution',
      telemetry: '100,000 telemetry events / mo',
      starter: '500,000 requests / mo',
      pro: '3,000,000 requests / mo',
      icon: Zap,
    },
    {
      feature: 'Team Seats Included',
      cli: '1 (Single developer)',
      telemetry: '1 Developer seat',
      starter: '3 Developer seats',
      pro: '10 Developer seats',
      icon: Users,
    },
    {
      feature: 'Observability & Token Metrics',
      cli: 'Local CLI charts',
      telemetry: 'Full Cloud Trace & Pacing Dashboards',
      starter: 'Full Cloud Trace & Pacing Dashboards',
      pro: 'Enterprise Traces + Sub-Agent Attribution',
      icon: Activity,
    },
    {
      feature: 'Additional Seats Option',
      cli: 'Not available (Local only)',
      telemetry: 'Not available',
      starter: `${currentCfg.symbol}${seatDisplayPrice} / seat / mo`,
      pro: `${currentCfg.symbol}${seatDisplayPrice} / seat / mo`,
      icon: UserPlus,
    },
    {
      feature: 'Response Caching',
      cli: 'None',
      telemetry: 'Locked (Observability only)',
      starter: 'Exact-Match Prompt Caching',
      pro: 'Smart Semantic Caching (40%+ savings)',
      icon: ShieldCheck,
    },
    {
      feature: 'Zero-Downtime Failover',
      cli: 'None',
      telemetry: 'Locked (Observability only)',
      starter: 'Locked (Pro tier)',
      pro: 'Auto-Switch (OpenAI ➔ Claude ➔ Gemini)',
      icon: Lock,
    },
    {
      feature: 'Developer Budget Limits',
      cli: 'Local session kill-switch',
      telemetry: 'Passive tracking & email alerts',
      starter: 'Workspace-wide spend limit',
      pro: 'Per-developer hard quota caps & alerts',
      icon: Key,
    },
    {
      feature: 'Data Privacy & Redaction',
      cli: 'Local SQLite (100% offline)',
      telemetry: 'Zero Prompt Storage (Metadata only)',
      starter: 'AES-256 Vault + Zero Log Storage',
      pro: 'Automated PII Redaction + Zero Log Storage',
      icon: EyeOff,
    },
  ];

  return (
    <div className="pt-24 pb-20 overflow-hidden bg-[#07090C] text-zinc-100 relative min-h-screen">
      
      {/* Background warm ambient radial light */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#C59E5F]/10 via-[#E5C38D]/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#0B0E14] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/[0.1] animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
            <span>Smart LLM Gateway Pricing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Stop overpaying on LLM tokens.
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Drop-in hosted AI proxy gateways with instant response caching, zero-downtime provider failover, and granular developer spend limits.
          </p>

          {/* Monthly vs Annual Toggle */}
          <div className="pt-2 flex items-center justify-center">
            <div className="p-1 rounded-2xl bg-[#0B0E14] border border-white/[0.08] flex items-center shadow-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  !isAnnual
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isAnnual
                    ? 'bg-gradient-to-r from-[#E5C38D] to-[#C59E5F] text-black font-bold shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                  isAnnual ? 'bg-black text-[#E5C38D]' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Main Plans: Agent Telemetry vs Starter Gateway vs Pro Gateway */}
        <div className="grid grid-cols-1 lg:grid-cols-3 max-w-7xl mx-auto gap-6 items-stretch mb-16">
          
          {/* Card 1: Agent Telemetry ($20 / month) - Observability Only */}
          <div className="relative p-7 sm:p-8 rounded-3xl bg-[#0B0E14] text-white border border-emerald-500/30 shadow-xl flex flex-col justify-between hover:border-emerald-500/60 transition-all">
            <div className="space-y-6">
              
              {/* Card Title & Icon */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-emerald-400 uppercase font-mono">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Activity className="w-4 h-4" />
                    </div>
                    <span>OBSERVABILITY ONLY</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold text-[10px] font-mono tracking-wide uppercase border border-emerald-500/30">
                    Telemetry Only
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
                  Agent Telemetry
                </h2>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Pure observability &amp; token spend intelligence for autonomous AI agents. Real-time cost pacing, TTFT latency, and model trace analytics.
                </p>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-2xl bg-[#07090C] border border-white/[0.08] space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-300">Telemetry Tier</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    {currentCfg.flag} {currentCfg.code}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                    {currentCfg.symbol}{telemetryDisplayPrice}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    / {isAnnual ? 'month (billed annually)' : 'month'}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 pt-0.5 font-mono">
                  100,000 telemetry events/mo • 1 seat included
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-bold text-zinc-200 block">Included Features</span>
                
                <div className="space-y-2.5 text-xs text-zinc-300">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Real-Time Cost Tracking:</strong> Live USD spend pacing across all model APIs</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Agent Execution Traces:</strong> TTFT, token counts, and upstream response latencies</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Model Spend Velocity:</strong> OpenAI, Claude, Gemini &amp; DeepSeek burn charts</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Zero Proxy Latency:</strong> Async telemetry ingestion without routing delays</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-zinc-500">
                    <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Reverse Proxy Routing (Available in Starter &amp; Pro)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-zinc-500">
                    <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Exact-Match &amp; Semantic Caching (Available in Gateway plans)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-zinc-500">
                    <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Zero-Downtime Provider Failover (Available in Pro)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-8 space-y-3">
              <button
                onClick={() => handleOpenCheckout('telemetry', 'Agent Telemetry', telemetryDisplayPrice)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Select Telemetry ({currentCfg.symbol}{telemetryDisplayPrice})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="text-[10px] text-zinc-400 text-center font-mono">
                Pure observability • Cancel anytime with 1-click
              </div>
            </div>
          </div>

          {/* Card 2: Starter Gateway ($35 / month) */}
          <div className="relative p-7 sm:p-8 rounded-3xl bg-[#0E121A] text-white border border-blue-500/30 shadow-xl flex flex-col justify-between hover:border-blue-500/60 transition-all">
            <div className="space-y-6">
              
              {/* Card Title & Icon */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-blue-400 uppercase font-mono">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <span>STARTER TIER</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-bold text-[10px] font-mono tracking-wide uppercase border border-blue-500/30">
                    7-Day Free Trial
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
                  Starter Gateway
                </h2>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Ideal for indie developers and small teams up to 3 engineers. Centralize provider keys, cut repetitive prompt costs, and prevent accidental runaway spending.
                </p>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-2xl bg-[#090C12] border border-white/[0.08] space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-300">Starter Plan</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
                    {currentCfg.flag} {currentCfg.code}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                    {currentCfg.symbol}{starterDisplayPrice}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    / {isAnnual ? 'month (billed annually)' : 'month'}
                  </span>
                </div>
                <div className="text-[11px] text-blue-400 pt-0.5 font-mono">
                  500,000 requests/mo • 3 developer seats included
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-bold text-zinc-200 block">Included Features</span>
                
                <div className="space-y-2.5 text-xs text-zinc-300">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Central Proxy URL:</strong> Instant baseURL swap with zero code refactoring</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Exact-Match Caching:</strong> Zero token cost on identical prompt queries</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Encrypted Multi-Model Vault:</strong> AES-256 secure storage for OpenAI, Claude, Gemini</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Workspace Spending Cap:</strong> Hard spend limit to eliminate billing shocks</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-zinc-500">
                    <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Zero-Downtime Failover (Available in Pro)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-zinc-500">
                    <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Smart Semantic Caching (Available in Pro)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-8 space-y-3">
              <button
                onClick={() => handleOpenCheckout('starter', 'Starter Gateway', starterDisplayPrice)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Select Starter ({currentCfg.symbol}{starterDisplayPrice})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="text-[10px] text-zinc-400 text-center font-mono">
                7-Day Free Trial • Cancel anytime with 1-click
              </div>
            </div>
          </div>

          {/* Card 2: Pro Gateway ($59 / month) - All In */}
          <div className="relative p-7 sm:p-8 rounded-3xl bg-[#141416] text-white border-2 border-ostraGold-500/60 shadow-2xl flex flex-col justify-between hover:border-ostraGold-500 transition-all ring-4 ring-ostraGold-500/10">
            <div className="space-y-6">
              
              {/* Card Title & Icon */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-ostraGold-300 uppercase font-mono">
                    <div className="w-7 h-7 rounded-lg bg-ostraGold-500/20 flex items-center justify-center text-ostraGold-300">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span>A TO Z UNLOCKED</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-ostraGold-500 text-charcoal-950 font-bold text-[10px] font-mono tracking-wide uppercase">
                    MOST POPULAR
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
                  Pro Gateway
                </h2>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Engineered for scaling production apps and demanding engineering teams. Zero downtime failover, semantic caching, and granular spend limits.
                </p>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-2xl bg-[#1C1C1F] border border-[#2B2B30] space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-200">Pro Gateway Plan</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-ostraGold-500/20 text-ostraGold-300 font-mono">
                    {currentCfg.flag} {currentCfg.code}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                    {currentCfg.symbol}{proDisplayPrice}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    / {isAnnual ? 'month (billed annually)' : 'month'}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 pt-0.5 font-mono">
                  3,000,000 requests/mo • 10 developer seats included
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-bold text-zinc-200 block">Everything in Starter plus:</span>
                
                <div className="space-y-2.5 text-xs text-zinc-300">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Zero-Downtime Failover:</strong> Auto-switch from OpenAI to Claude/Gemini during outages</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Smart Semantic Caching:</strong> Save up to 40%+ token spend on semantically similar queries</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Per-Developer Budgets:</strong> Enforce individual monthly spending caps per engineer</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Automated PII Redaction:</strong> Strip sensitive customer data and keys before upstream requests</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Priority Cloud Routing:</strong> Dedicated high-throughput proxy queue with SLA guarantees</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-8 space-y-3">
              <button
                onClick={() => handleOpenCheckout('pro', 'Pro Gateway', proDisplayPrice)}
                className="w-full py-3 rounded-xl bg-ostraGold-400 hover:bg-ostraGold-300 text-charcoal-950 font-bold text-xs shadow-md transition-all cursor-pointer hover:shadow-ostraGold-500/25 flex items-center justify-center gap-1.5"
              >
                <span>Get Started with Pro ({currentCfg.symbol}{proDisplayPrice})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="text-[10px] text-zinc-400 text-center font-mono">
                7-Day Free Trial • No charges today
              </div>
            </div>
          </div>

        </div>

        {/* Section: Need Extra Developer Seats? */}
        <div className="max-w-5xl mx-auto mb-16 p-6 sm:p-8 rounded-3xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-mono font-semibold">
                <UserPlus className="w-3.5 h-3.5" />
                TEAM SCALING ADD-ON
              </div>
              
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Need more developer seats?
              </h3>
              
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
                Expand your team anytime. Additional developer seats can be added to any Starter or Pro plan with prorated billing and individual virtual key management.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Individual virtual keys per engineer</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom monthly spend quotas</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Granular per-seat token telemetry</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant 1-click magic link invites</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 p-5 rounded-2xl bg-[#0E121B] border border-white/[0.08] text-center space-y-2">
              <div className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">
                ADD-ON SEAT PRICING
              </div>
              <div className="flex items-baseline justify-center gap-1 font-mono">
                <span className="text-3xl font-black text-white">{currentCfg.symbol}{seatDisplayPrice}</span>
                <span className="text-xs text-zinc-400">/ seat / month</span>
              </div>
              <div className="text-[11px] text-zinc-400">
                Starter includes 3 seats · Pro includes 10 seats
              </div>
              <div className="pt-2">
                <span className="inline-block text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                  Adjust seats anytime in Team Settings
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Section: Free Open Source Community CLI */}
        <div className="max-w-5xl mx-auto mb-16 p-7 sm:p-9 rounded-3xl bg-[#090C12] border border-white/[0.08] shadow-2xl relative overflow-hidden">
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wider text-emerald-400 uppercase font-mono">
                  <Terminal className="w-4 h-4" />
                  <span>OPEN SOURCE · 100% LOCAL</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white tracking-tight">
                  Prefer local offline coding? Try the Free Community CLI.
                </h3>
                <p className="text-xs text-zinc-400 max-w-2xl">
                  Run a standalone proxy daemon entirely on your workstation. Zero external network hops, zero telemetry stored in the cloud, and 100% free forever.
                </p>
              </div>

              <div className="shrink-0 text-left sm:text-right">
                <div className="text-2xl font-black text-white font-mono">$0</div>
                <div className="text-[10px] text-emerald-400 font-mono">Free Forever · MIT Licensed</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Zero Cloud Transit</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Binds directly to 127.0.0.1:8080. Prompts, completions, and keys remain strictly in your local SQLite store (~/.ostraops).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-400" />
                  <span>Local Telemetry UI</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Inspect token consumption, streaming speed, and latency on an offline web UI at http://localhost:4040.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Session Circuit Breakers</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Instantly kills runaway loops from Cursor, Cline, or autonomous coding agents before unexpected token charges occur.
                </p>
              </div>
            </div>

            {/* Terminal Copy Action */}
            <div className="p-4 rounded-2xl bg-[#05070A] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
                <span className="font-mono text-xs text-zinc-300 font-bold">$ npx ostraops-guard</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={copyGuardCmd}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/[0.1]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copy Install Command</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Comparison Section */}
        <div className="max-w-5xl mx-auto mb-14">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[#E5C38D]">
                  <Scale className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">Feature Comparison</h3>
              </div>
              <p className="text-xs text-zinc-400">Detailed breakdown of Community CLI vs Hosted Gateway tiers.</p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-[#0B0E14] rounded-2xl sm:rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                    <th className="py-4 px-5 font-bold text-zinc-300 w-[20%]">Feature</th>
                    <th className="py-4 px-5 font-bold text-zinc-100 w-[20%] bg-white/[0.02]">
                      <div>Community CLI ($0)</div>
                      <div className="text-[11px] font-normal text-zinc-400 font-mono">Standalone local binary</div>
                    </th>
                    <th className="py-4 px-5 font-bold text-emerald-400 w-[20%] bg-emerald-500/[0.03]">
                      <div>Agent Telemetry ({currentCfg.symbol}{telemetryDisplayPrice}/mo)</div>
                      <div className="text-[11px] font-normal text-emerald-300/70 font-mono">Observability &amp; cost tracking</div>
                    </th>
                    <th className="py-4 px-5 font-bold text-blue-400 w-[20%] bg-blue-500/[0.03]">
                      <div>Starter Gateway ({currentCfg.symbol}{starterDisplayPrice}/mo)</div>
                      <div className="text-[11px] font-normal text-blue-300/70 font-mono">Essential proxy + caching</div>
                    </th>
                    <th className="py-4 px-5 font-bold text-[#E5C38D] w-[20%] bg-[#C59E5F]/[0.06]">
                      <div>Pro Gateway ({currentCfg.symbol}{proDisplayPrice}/mo)</div>
                      <div className="text-[11px] font-normal text-[#C59E5F]/70 font-mono">All-in enterprise resilience</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {comparisonRows.map((row) => {
                    const Icon = row.icon;
                    return (
                      <tr key={row.feature} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 px-5 font-semibold text-zinc-200 flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-[#C59E5F]/15 flex items-center justify-center text-[#E5C38D] shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span>{row.feature}</span>
                        </td>
                        <td className="py-4 px-5 font-mono text-zinc-400 bg-white/[0.01]">
                          {row.cli}
                        </td>
                        <td className="py-4 px-5 font-mono text-emerald-300 bg-emerald-500/[0.01]">
                          {row.telemetry}
                        </td>
                        <td className="py-4 px-5 font-mono text-zinc-200 bg-blue-500/[0.01]">
                          {row.starter}
                        </td>
                        <td className="py-4 px-5 font-mono text-zinc-100 font-medium bg-[#C59E5F]/[0.02]">
                          {row.pro}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Docs & Reassurance Banner */}
        <div className="max-w-5xl mx-auto p-4 sm:p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-300 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[#E5C38D] shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>
              <strong className="text-white">Developer-First AI Gateway.</strong> Keep your API spend, agents, and tokens strictly protected with zero latency overhead.
            </span>
          </div>

          <button
            onClick={onNavigateHome}
            className="font-bold text-[#E5C38D] hover:text-white transition-colors whitespace-nowrap flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>Explore our docs →</span>
          </button>
        </div>

      </div>

    </div>
  );
};
