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
  Globe,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PricingPageProps {
  onNavigateHome?: () => void;
  onNavigateLogin?: () => void;
  onNavigateOnboarding?: () => void;
}

export type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'GBP';

interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  flag: string;
  name: string;
  country: string;
  regionLabel: string;
  soloMonthly: number;
  soloAnnualMonthly: number;
  teamMonthly: number;
  teamAnnualMonthly: number;
  teamSeatPrice: number;
  paymentMethods: string[];
  gatewayNote: string;
}

const CURRENCY_CONFIGS: Record<SupportedCurrency, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    flag: '🇮🇳',
    name: 'Indian Rupee',
    country: 'India',
    regionLabel: 'India Region (UPI / RuPay / NetBanking)',
    soloMonthly: 799,
    soloAnnualMonthly: 649, // 20% discount
    teamMonthly: 3499,
    teamAnnualMonthly: 2799,
    teamSeatPrice: 499,
    paymentMethods: ['UPI (GPay / PhonePe / Paytm)', 'RuPay / Visa / Mastercard Debit & Credit', 'Net Banking (All Indian Banks)', 'GST Invoicing available'],
    gatewayNote: 'Razorpay / Cashfree PCI-DSS compliant direct settlement',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    flag: '🇺🇸',
    name: 'US Dollar',
    country: 'United States & Global',
    regionLabel: 'Global Default (Stripe / International)',
    soloMonthly: 12,
    soloAnnualMonthly: 10,
    teamMonthly: 49,
    teamAnnualMonthly: 39,
    teamSeatPrice: 10,
    paymentMethods: ['Credit / Debit Cards (Visa, Mastercard, Amex)', 'Apple Pay / Google Pay', 'ACH Bank Transfer (Annual teams)'],
    gatewayNote: 'Stripe Global Payments with zero foreign markup',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    flag: '🇪🇺',
    name: 'Euro',
    country: 'European Union',
    regionLabel: 'Europe / SEPA (GDPR Compliant)',
    soloMonthly: 11,
    soloAnnualMonthly: 9,
    teamMonthly: 45,
    teamAnnualMonthly: 36,
    teamSeatPrice: 9,
    paymentMethods: ['SEPA Direct Debit', 'Cards (Cartes Bancaires, Visa, MC)', 'iDEAL / Sofort / Bancontact'],
    gatewayNote: 'Local European acquirers with native reverse-charge VAT handling',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    flag: '🇬🇧',
    name: 'British Pound',
    country: 'United Kingdom',
    regionLabel: 'UK Region (BACS / Cards)',
    soloMonthly: 9.5,
    soloAnnualMonthly: 8,
    teamMonthly: 39,
    teamAnnualMonthly: 31,
    teamSeatPrice: 8,
    paymentMethods: ['UK Cards', 'BACS Direct Debit', 'Apple Pay'],
    gatewayNote: 'FCA-regulated UK gateway handling with UK VAT invoices',
  },
};

export const PricingPage: React.FC<PricingPageProps> = ({ 
  onNavigateHome, 
  onNavigateLogin,
  onNavigateOnboarding,
}) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // Selected Currency State
  const [currency, setCurrency] = useState<SupportedCurrency>('INR');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [detectedCountry, setDetectedCountry] = useState<string>('Detecting location...');
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Background Automatic Geo & Locale detection
  useEffect(() => {
    // 1. Check if user already manually selected a currency in previous session
    const savedCurrency = localStorage.getItem('ostraops_user_currency') as SupportedCurrency | null;
    if (savedCurrency && CURRENCY_CONFIGS[savedCurrency]) {
      setCurrency(savedCurrency);
      setDetectedCountry(`Saved preference: ${CURRENCY_CONFIGS[savedCurrency].flag} ${CURRENCY_CONFIGS[savedCurrency].name}`);
      setIsAutoDetected(false);
      return;
    }

    // 2. High-precision client-side timezone & locale inspection
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const tzOffset = new Date().getTimezoneOffset(); // India is -330 (-5.5 hours UTC)
      const languages = (navigator.languages && navigator.languages.length > 0)
        ? navigator.languages
        : [navigator.language || ''];
      
      const hasIndianLocale = languages.some(l => {
        const lower = (l || '').toLowerCase();
        return lower === 'en-in' || lower.endsWith('-in') || lower === 'hi' || lower.startsWith('hi-');
      });
      const isIndianTz = tzOffset === -330 || timeZone.includes('Calcutta') || timeZone.includes('Kolkata');

      if (isIndianTz || hasIndianLocale) {
        setCurrency('INR');
        setDetectedCountry('🇮🇳 India (Local pricing in ₹ INR)');
      } else if (timeZone.includes('London') || timeZone.includes('Belfast')) {
        setCurrency('GBP');
        setDetectedCountry('🇬🇧 United Kingdom (£ GBP)');
      } else if (timeZone.startsWith('Europe/')) {
        setCurrency('EUR');
        setDetectedCountry('🇪🇺 Europe (€ EUR)');
      } else {
        setCurrency('USD');
        setDetectedCountry('🌐 International / Foreign ($ USD)');
      }

      // 3. Fast async IP geo check to refine if user is foreign or traveling
      fetch('https://api.country.is')
        .then(res => res.json())
        .then(data => {
          if (data && data.country) {
            const countryCode = String(data.country).toUpperCase();
            if (countryCode === 'IN') {
              setCurrency('INR');
              setDetectedCountry('🇮🇳 India (Detected via IP)');
            } else if (countryCode === 'GB') {
              setCurrency('GBP');
              setDetectedCountry('🇬🇧 United Kingdom (Detected via IP)');
            } else if (['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'PT', 'FI', 'GR', 'PL', 'SE'].includes(countryCode)) {
              setCurrency('EUR');
              setDetectedCountry('🇪🇺 Europe (Detected via IP)');
            } else {
              setCurrency('USD');
              setDetectedCountry(`🌐 Foreign / ${countryCode} (Detected via IP)`);
            }
          }
        })
        .catch(() => {
          // Keep timezone result as fallback
        });
    } catch {
      setCurrency('INR');
      setDetectedCountry('🇮🇳 India (Default)');
    }
  }, []);

  const handleSelectCurrency = (code: SupportedCurrency) => {
    setCurrency(code);
    setIsAutoDetected(false);
    localStorage.setItem('ostraops_user_currency', code);
    setDetectedCountry(`Manual: ${CURRENCY_CONFIGS[code].flag} ${CURRENCY_CONFIGS[code].name}`);
  };

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
  const gatewayDisplayPrice = isAnnual ? currentCfg.teamAnnualMonthly : currentCfg.teamMonthly;

  const handleOpenCheckout = (name: string, monthlyAmount: number) => {
    const finalAmount = isAnnual ? monthlyAmount * 12 : monthlyAmount;
    
    // Persist user's selected plan for seamless onboarding & signup fulfillment
    const pendingPlan = {
      planId: 'team_scale',
      name: 'Hosted Gateway',
      type: 'hosted',
      amount: finalAmount,
      billingInterval: isAnnual ? 'yr' : 'mo',
      currency: currentCfg.code,
    };
    try {
      localStorage.setItem('ostraops_active_plan', 'team_scale');
      localStorage.setItem('ostraops_user_tier', 'team');
      sessionStorage.setItem('ostraops_pending_plan', JSON.stringify(pendingPlan));
      localStorage.setItem('ostraops_pending_plan', JSON.stringify(pendingPlan));
    } catch {}

    // Pricing page redirects to login page (if not logged in) or directly to onboarding step 3 (if already logged in)
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

    // User is already logged in: route to onboarding step 3 to complete payment there
    showToast(`Loading ${name} checkout on your onboarding console...`);
    setTimeout(() => {
      if (onNavigateOnboarding) {
        onNavigateOnboarding();
      } else {
        window.location.hash = '#onboarding?step=3';
      }
    }, 400);
  };

  const comparisonRows = [
    {
      feature: 'Solo Guard (Local Loopback)',
      solo: 'Included (Localhost CLI)',
      team: 'Included (Full Dashboard Console + Local Daemon)',
      icon: Laptop,
    },
    {
      feature: 'Cloud Edge Gateway',
      solo: 'None (Local only)',
      team: 'gateway.ostraops.com/v1',
      icon: Server,
    },
    {
      feature: 'API Keys Security',
      solo: "Developer's local environment",
      team: 'AES-256 Encrypted Cloud Master Vault',
      icon: Key,
    },
    {
      feature: 'Code / Prompt Visibility',
      solo: 'Zero external transit',
      team: 'Zero-retention ephemeral stream (No logs stored)',
      icon: EyeOff,
    },
    {
      feature: 'Spend Enforcement',
      solo: 'Local session kill-switch',
      team: 'Central quota freeze per engineer virtual key',
      icon: Zap,
    },
    {
      feature: 'Multi-Developer Governance',
      solo: 'No (Single machine)',
      team: 'Yes (5 seats included + Admin Controls)',
      icon: Users,
    },
  ];

  return (
    <div className="pt-24 pb-20 overflow-hidden bg-[#FAF8F5] relative min-h-screen">
      
      {/* Background warm ambient radial light */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-ostraGold-300/12 via-sandstone-300/20 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-charcoal-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-charcoal-800 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-[11px] font-bold tracking-[0.2em] text-charcoal-500 uppercase block mb-3 font-mono">
            SIMPLE / TRANSPARENT / LOCALIZED PRICING
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-charcoal-900 tracking-tight leading-[1.12]">
            Choose Your Deployment Model
          </h1>

          <p className="mt-4 text-sm sm:text-base text-charcoal-600 max-w-2xl mx-auto leading-relaxed">
            Local-first execution for solo developers, or zero-trust hosted gateway for teams. Transparent pricing localized for your currency.
          </p>

          {/* Geo Location Detector Badge & Currency Switcher Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            
            {/* Auto-detected pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EAE5DC] text-xs shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-charcoal-600 font-medium">
                {isAutoDetected ? 'Auto-detected Region:' : 'Region:'}
              </span>
              <span className="font-bold text-charcoal-900">
                {detectedCountry}
              </span>
            </div>

            {/* Currency Selector Pills */}
            <div className="p-1 rounded-2xl bg-[#EFEAE0] border border-[#E6DFD1] inline-flex items-center gap-1 shadow-inner">
              {(Object.keys(CURRENCY_CONFIGS) as SupportedCurrency[]).map((code) => {
                const cfg = CURRENCY_CONFIGS[code];
                const isActive = currency === code;
                return (
                  <button
                    key={code}
                    onClick={() => handleSelectCurrency(code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white text-charcoal-900 shadow-xs scale-100'
                        : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-white/50'
                    }`}
                  >
                    <span>{cfg.flag}</span>
                    <span>{cfg.code} ({cfg.symbol})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monthly / Annual Billing Toggle */}
          <div className="mt-6 inline-flex items-center gap-3 p-1 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-charcoal-900 text-white shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-charcoal-900 text-white shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-md bg-[#E8DCC4] text-charcoal-900 text-[10px] font-bold font-mono">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 2 Deployment Models Side-by-Side */}
        {/* 2 Deployment Options: Free Open Source CLI vs Complete Hosted Gateway Subscription */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-16">
          
          {/* Card 1: Free Community CLI (Warm Sandstone) */}
          <div className="relative p-7 sm:p-9 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-6">
              
              {/* Card Title & Icon */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-charcoal-500 uppercase font-mono">
                  <div className="w-7 h-7 rounded-lg bg-sandstone-200 flex items-center justify-center text-charcoal-800">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <span>OPEN SOURCE CLI</span>
                </div>

                <h2 className="text-2xl sm:text-[26px] font-extrabold text-charcoal-900 tracking-tight leading-snug">
                  Community Local Daemon
                </h2>

                <p className="text-xs sm:text-[13px] text-charcoal-600 leading-relaxed">
                  Standalone zero-telemetry CLI binary for developers. Runs completely on your machine with 0 external network hops.
                </p>
              </div>

              {/* Price Box */}
              <div className="p-5 rounded-2xl bg-[#FCFBF9] border border-[#EAE5DC] flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-charcoal-900">
                      {currentCfg.symbol}0
                    </span>
                    <span className="text-xs text-charcoal-500 font-medium">/ forever</span>
                  </div>
                  <span className="text-[11px] text-charcoal-500 block mt-1 font-mono">
                    Free open-source MIT licensed binary
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-[#F2EDE2] text-[10.5px] font-bold text-charcoal-700 font-mono">
                  Standalone Local
                </span>
              </div>

              {/* Key Features */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-bold text-charcoal-900 block">Features Included</span>
                
                <div className="space-y-2.5 text-xs text-charcoal-700">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-charcoal-700 shrink-0 mt-0.5" />
                    <span>Binds to 127.0.0.1:8080 (0 external network hops)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-charcoal-700 shrink-0 mt-0.5" />
                    <span>Real-time local terminal telemetry UI (:4040)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-charcoal-700 shrink-0 mt-0.5" />
                    <span>Hard session spend circuit-breakers (halts runaway loops)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-charcoal-700 shrink-0 mt-0.5" />
                    <span>Supports Cursor, Cline, Roo-Code &amp; OpenAI/Anthropic SDKs</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-charcoal-700 shrink-0 mt-0.5" />
                    <span>100% prompt privacy — logs persist in local SQLite (~/.ostraops)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-charcoal-400">
                    <span className="text-charcoal-400 shrink-0 mt-0.5">—</span>
                    <span>No cloud sync, no virtual keys, no team dashboard</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-8 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Terminal copy pill */}
                <button
                  onClick={copyGuardCmd}
                  className="w-full py-3 px-4 rounded-xl bg-[#141416] text-white font-mono text-xs flex items-center justify-between hover:bg-black transition-colors"
                  title="Click to copy"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-zinc-300 font-bold">$ npx ostraops-guard</span>
                  </div>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                </button>
              </div>

              {/* Bottom Reassurance */}
              <div className="flex items-center justify-between text-xs text-charcoal-500 pt-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-charcoal-600" />
                  <span>No account or payment required. Free forever.</span>
                </div>
                <span className="text-[11px] font-mono text-charcoal-400">Open Source</span>
              </div>
            </div>

          </div>

          {/* Card 2: The Only Subscription: Hosted Gateway (Deep Charcoal & Gold) */}
          <div className="relative p-7 sm:p-9 rounded-3xl bg-[#141416] text-white border-2 border-ostraGold-500/50 shadow-2xl flex flex-col justify-between hover:border-ostraGold-500/80 transition-all overflow-hidden ring-4 ring-ostraGold-500/10">
            
            {/* Generative gold waves in background bottom */}
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 500 350" preserveAspectRatio="none">
                <path d="M0,260 C150,160 300,320 500,200" stroke="#C59E5F" strokeWidth="1.2" fill="none" />
                <path d="M0,280 C200,180 350,300 500,230" stroke="#C59E5F" strokeWidth="1" fill="none" />
              </svg>
            </div>

            <div className="relative z-10 space-y-6">
              
              {/* Card Title & Icon */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-ostraGold-300 uppercase font-mono">
                    <div className="w-7 h-7 rounded-lg bg-ostraGold-500/20 flex items-center justify-center text-ostraGold-300">
                      <Users className="w-4 h-4" />
                    </div>
                    <span>COMPLETE FINANCIAL GATEWAY</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-ostraGold-500 text-charcoal-950 font-bold text-[10px] font-mono tracking-wide uppercase">
                    Solo Guard Included
                  </span>
                </div>

                <h2 className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight leading-snug">
                  Hosted Gateway &amp; Governance
                </h2>

                <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
                  The complete production gateway. Central cloud edge routing, scoped virtual keys, spending ceilings, and the full Solo Developer Guard included for free on your dashboard.
                </p>
              </div>

              {/* Price Box */}
              <div className="p-5 rounded-2xl bg-[#1C1C1F] border border-[#2B2B30] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-200 block">Hosted Gateway Subscription</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-ostraGold-500/20 text-ostraGold-300 font-mono">
                      {currentCfg.flag} {currentCfg.code}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                      {currentCfg.symbol}{gatewayDisplayPrice}
                    </span>
                    <span className="text-xs text-zinc-400">
                      / {isAnnual ? 'month (billed annually)' : 'month'}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 pt-1 font-mono">
                    Includes 5 developer seats ({currentCfg.symbol}{currentCfg.teamSeatPrice}/mo per additional seat)
                  </div>
                </div>

                <div className="text-right space-y-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => handleOpenCheckout('Hosted Gateway', gatewayDisplayPrice)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-ostraGold-400 hover:bg-ostraGold-300 text-charcoal-950 font-bold text-xs shadow-md transition-all whitespace-nowrap cursor-pointer hover:shadow-ostraGold-500/25"
                  >
                    Deploy Hosted Gateway →
                  </button>
                  <span className="text-[10px] text-zinc-400 font-medium block text-center sm:text-right">
                    14-Day Free Trial • Cancel anytime
                  </span>
                </div>
              </div>

              {/* Payment Info Callout */}
              <div className="p-3 rounded-xl bg-[#1F1F24] border border-[#2D2D35] text-[11px] text-zinc-300 flex items-center justify-between">
                <span className="font-mono text-zinc-400">Payment Methods:</span>
                <span className="font-semibold text-zinc-200">{currentCfg.paymentMethods.join(' • ')}</span>
              </div>

              {/* Key Features */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-bold text-zinc-200 block">Everything Included in One Subscription</span>
                
                <div className="space-y-2.5 text-xs text-zinc-300">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Solo Developer Guard INCLUDED:</strong> Full local daemon (<code>127.0.0.1:8080</code>) visible on your dashboard</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Endpoint: <strong className="text-white">gateway.ostraops.com/v1</strong> (Zero-trust cloud edge proxy)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>AES-256 encrypted Central Key Vault (engineers never see master production keys)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Scoped virtual tokens per developer (<code>ost_live_...</code>) with model restrictions</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Enforced monthly spend caps per engineer with automated hard kill-switch</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Unified workspace analytics, CSV audit trails &amp; Slack/Discord webhooks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Card Security Badge */}
            <div className="relative z-10 pt-8">
              <div className="p-3.5 rounded-2xl bg-[#1A1A1E] border border-[#27272C] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-ostraGold-400 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-100">Enterprise-grade security.</div>
                    <div className="text-[11px] text-zinc-400">SOC2 compliant data routing &amp; zero data retention.</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                  <Globe className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{currentCfg.code}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Quick Comparison Section */}
        <div className="mb-14">
          
          {/* Header Row with Hand-Written note */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sandstone-200 flex items-center justify-center text-charcoal-800">
                  <Scale className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-extrabold text-charcoal-900 tracking-tight">Quick Comparison</h3>
              </div>
              <p className="text-xs text-charcoal-500">See how the two options stack up.</p>
            </div>

            {/* Playful script annotation */}
            <div className="text-right">
              <span className="font-serif italic text-amber-700/90 text-sm font-semibold tracking-wide">
                Same core security. Different deployment. ⤦
              </span>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EAE5DC] shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#F0ECE4] bg-[#FCFBF9]">
                    <th className="py-4 px-6 font-bold text-charcoal-700 w-[26%]">Feature</th>
                    <th className="py-4 px-6 font-bold text-charcoal-900 w-[37%] bg-sandstone-50/50">
                      <div>Community CLI (Free $0)</div>
                      <div className="text-[11px] font-normal text-charcoal-400 font-mono">Standalone offline binary (127.0.0.1:8080)</div>
                    </th>
                    <th className="py-4 px-6 font-bold text-charcoal-900 w-[37%] bg-[#FAF8F5]">
                      <div>Hosted Gateway Subscription</div>
                      <div className="text-[11px] font-normal text-charcoal-400 font-mono">gateway.ostraops.com + Included Solo Guard</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE4]">
                  {comparisonRows.map((row) => {
                    const Icon = row.icon;
                    return (
                      <tr key={row.feature} className="hover:bg-sandstone-50/70 transition-colors">
                        <td className="py-4 px-6 font-semibold text-charcoal-800 flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-sandstone-200/80 flex items-center justify-center text-charcoal-700 shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span>{row.feature}</span>
                        </td>
                        <td className="py-4 px-6 font-mono text-charcoal-700 bg-sandstone-50/30">
                          {row.solo}
                        </td>
                        <td className="py-4 px-6 font-mono text-charcoal-900 font-medium bg-[#FAF8F5]/40">
                          {row.team}
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
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE5DC] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-700 shadow-subtle">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-sandstone-200 flex items-center justify-center text-charcoal-800 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>
              <strong>Built for the way you code.</strong> From solo hackers to scaling teams in India and worldwide, OstraOps keeps your AI spend, agents and data under control.
            </span>
          </div>

          <button
            onClick={onNavigateHome}
            className="font-bold text-charcoal-900 hover:text-ostraGold-600 transition-colors whitespace-nowrap flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>Explore our docs →</span>
          </button>
        </div>

      </div>

    </div>
  );
};
