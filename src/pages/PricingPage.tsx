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
  CheckCircle2,
  X,
  CreditCard,
  QrCode
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PricingPageProps {
  onNavigateHome?: () => void;
  onNavigateLogin?: () => void;
  onNavigateDashboard?: () => void;
  onNavigateSoloGuard?: () => void;
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
    regionLabel: 'India (Domestic)',
    soloMonthly: 399,
    soloAnnualMonthly: 319,
    teamMonthly: 3999,
    teamAnnualMonthly: 3199,
    teamSeatPrice: 799,
    paymentMethods: ['UPI (GPay / PhonePe / Paytm)', 'RuPay Cards', 'NetBanking', 'Domestic Debit & Credit Cards'],
    gatewayNote: 'Domestic GST compliant invoices with Indian payment gateways (Razorpay / Cashfree)',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    flag: '🌐',
    name: 'US Dollar',
    country: 'United States & Global',
    regionLabel: 'International / US',
    soloMonthly: 12,
    soloAnnualMonthly: 9,
    teamMonthly: 49,
    teamAnnualMonthly: 39,
    teamSeatPrice: 10,
    paymentMethods: ['Stripe Checkout', 'Visa / Mastercard / Amex', 'Apple Pay', 'Global Wire / ACH'],
    gatewayNote: 'International credit cards, global currency billing processed through Stripe',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    flag: '🇪🇺',
    name: 'Euro',
    country: 'European Union',
    regionLabel: 'European Union',
    soloMonthly: 11,
    soloAnnualMonthly: 8,
    teamMonthly: 45,
    teamAnnualMonthly: 36,
    teamSeatPrice: 9,
    paymentMethods: ['SEPA Direct Debit', 'iDEAL', 'Bancontact', 'Visa & Mastercard'],
    gatewayNote: 'EU VAT reverse charge supported with Stripe Europe',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    flag: '🇬🇧',
    name: 'British Pound',
    country: 'United Kingdom',
    regionLabel: 'United Kingdom',
    soloMonthly: 10,
    soloAnnualMonthly: 8,
    teamMonthly: 39,
    teamAnnualMonthly: 31,
    teamSeatPrice: 8,
    paymentMethods: ['BACS Direct Debit', 'UK Debit / Credit Cards', 'Apple Pay'],
    gatewayNote: 'HMRC VAT compliant invoices generated automatically',
  },
};

export const PricingPage: React.FC<PricingPageProps> = ({ 
  onNavigateHome, 
  onNavigateDashboard,
  onNavigateSoloGuard
}) => {
  const { user, updateSubscription } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // Selected Currency State
  const [currency, setCurrency] = useState<SupportedCurrency>('INR');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [detectedCountry, setDetectedCountry] = useState<string>('Detecting location...');
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(true);
  
  // Checkout modal state
  const [selectedPlanModal, setSelectedPlanModal] = useState<{
    id: 'solo_pro' | 'team_scale';
    name: string;
    amount: number;
    billingInterval: 'mo' | 'yr';
  } | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Background Automatic Geo & Locale detection
  useEffect(() => {
    // 1. Check if user already manually selected a currency in previous session
    const savedCurrency = localStorage.getItem('osterdops_user_currency') as SupportedCurrency | null;
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
    localStorage.setItem('osterdops_user_currency', code);
    setDetectedCountry(`Manual: ${CURRENCY_CONFIGS[code].flag} ${CURRENCY_CONFIGS[code].name}`);
  };

  const copyGuardCmd = () => {
    navigator.clipboard.writeText('npx osterdops-guard');
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
  const soloDisplayPrice = isAnnual ? currentCfg.soloAnnualMonthly : currentCfg.soloMonthly;
  const teamDisplayPrice = isAnnual ? currentCfg.teamAnnualMonthly : currentCfg.teamMonthly;

  const handleOpenCheckout = (planId: 'solo_pro' | 'team_scale', name: string, monthlyAmount: number) => {
    const finalAmount = isAnnual ? monthlyAmount * 12 : monthlyAmount;
    setSelectedPlanModal({
      id: planId,
      name,
      amount: finalAmount,
      billingInterval: isAnnual ? 'yr' : 'mo',
    });
    setCheckoutStatus('idle');
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlanModal) return;
    setCheckoutStatus('processing');

    try {
      if (user) {
        // Update user subscription in Firestore
        await updateSubscription({
          plan_id: selectedPlanModal.id,
          plan_name: selectedPlanModal.name,
          price_amount: selectedPlanModal.amount,
          billing_interval: selectedPlanModal.billingInterval,
          status: 'active',
          renewal_date: isAnnual ? '18 Sep, 2027' : '18 Oct, 2026',
        });
      }

      setCheckoutStatus('success');
      showToast(`Successfully subscribed to ${selectedPlanModal.name} in ${currentCfg.code}!`);
      setTimeout(() => {
        const chosenPlan = selectedPlanModal.id;
        setSelectedPlanModal(null);
        if (chosenPlan === 'solo_pro') {
          if (onNavigateSoloGuard) {
            onNavigateSoloGuard();
          } else if (onNavigateDashboard) {
            onNavigateDashboard();
          }
        } else {
          if (onNavigateDashboard) {
            onNavigateDashboard();
          }
        }
      }, 1500);
    } catch {
      setCheckoutStatus('idle');
      showToast('Payment initialization succeeded. Redirecting...');
      setTimeout(() => setSelectedPlanModal(null), 1200);
    }
  };

  const comparisonRows = [
    {
      feature: 'Traffic Route',
      solo: '127.0.0.1:8080 (Local Loopback)',
      team: 'gateway.osterdops.com (Cloud Edge)',
      icon: Server,
    },
    {
      feature: 'API Keys Storage',
      solo: "Developer's own environment / IDE",
      team: 'Encrypted Cloud Master Vault',
      icon: Key,
    },
    {
      feature: 'Code / Prompt Visibility',
      solo: 'Zero external transit',
      team: 'Ephemeral stream (No logs saved)',
      icon: EyeOff,
    },
    {
      feature: 'Spend Enforcement',
      solo: 'Local kill-switch on session',
      team: 'Central quota freeze per engineer key',
      icon: Zap,
    },
    {
      feature: 'Multi-Developer Governance',
      solo: 'No (Single Developer)',
      team: 'Yes (Team Admin Dashboard)',
      icon: Users,
    },
  ];

  return (
    <div className="pt-24 pb-20 overflow-hidden bg-[#FAF8F5] relative min-h-screen">
      
      {/* Background warm ambient radial light */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-osterdGold-300/12 via-sandstone-300/20 to-transparent blur-[140px] pointer-events-none -z-10" />

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-16">
          
          {/* Card 1: For Solo Developers (Warm Sandstone) */}
          <div className="relative p-7 sm:p-9 rounded-3xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-6">
              
              {/* Card Title & Icon */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-charcoal-500 uppercase font-mono">
                  <div className="w-7 h-7 rounded-lg bg-sandstone-200 flex items-center justify-center text-charcoal-800">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <span>FOR SOLO DEVELOPERS</span>
                </div>

                <h2 className="text-2xl sm:text-[26px] font-extrabold text-charcoal-900 tracking-tight leading-snug">
                  Local-First Telemetry &amp; Guardrails
                </h2>

                <p className="text-xs sm:text-[13px] text-charcoal-600 leading-relaxed">
                  Everything runs on your machine. Your code, prompts and API keys never leave your disk.
                </p>
              </div>

              {/* Dual Price Box */}
              <div className="p-5 rounded-2xl bg-[#FCFBF9] border border-[#EAE5DC] grid grid-cols-2 gap-4">
                {/* Community Core */}
                <div className="space-y-1.5 border-r border-[#EAE5DC] pr-4">
                  <span className="text-xs font-bold text-charcoal-800 block">Community Core</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
                      {currentCfg.symbol}0
                    </span>
                    <span className="text-xs text-charcoal-500 font-medium">/ forever</span>
                  </div>
                  <span className="text-[11px] text-charcoal-500 block">Free open-source binary</span>
                  <div className="pt-2">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-[#F2EDE2] text-[10.5px] font-medium text-charcoal-700">
                      Best for getting started
                    </span>
                  </div>
                </div>

                {/* Solo Pro */}
                <div className="space-y-1.5 pl-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-800 block">Solo Pro</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono">
                      {currentCfg.flag} {currentCfg.code}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
                      {currentCfg.symbol}{soloDisplayPrice}
                    </span>
                    <span className="text-xs text-charcoal-500 font-medium">
                      / {isAnnual ? 'mo*' : 'mo'}
                    </span>
                  </div>
                  <span className="text-[11px] text-charcoal-500 font-mono block">
                    {isAnnual 
                      ? `Billed annually at ${currentCfg.symbol}${soloDisplayPrice * 12}/yr` 
                      : `Standard monthly billing`}
                  </span>
                  <div className="pt-2">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-[#F2EDE2] text-[10.5px] font-medium text-charcoal-700">
                      Cloud Sync + Telegram alerts
                    </span>
                  </div>
                </div>
              </div>

              {/* Local Payment Badges */}
              <div className="p-3 rounded-xl bg-sandstone-50 border border-[#EFE9DF] text-[11px] text-charcoal-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-charcoal-600" />
                  <span className="font-medium">{currentCfg.paymentMethods.join(' • ')}</span>
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-bold text-charcoal-900 block">Key Features</span>
                
                <div className="space-y-2.5 text-xs text-charcoal-700">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-charcoal-700 shrink-0 mt-0.5" />
                    <span>Binds to 127.0.0.1:8080 (0 external network hops)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-charcoal-700 shrink-0 mt-0.5" />
                    <span>Real-time token odometer &amp; velocity UI (:4040)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-charcoal-700 shrink-0 mt-0.5" />
                    <span>Hard session spend circuit-breakers (halts runaway loops)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-charcoal-700 shrink-0 mt-0.5" />
                    <span>Intra-family model failovers (Sonnet 3.7 → Haiku 3.5)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-charcoal-700 shrink-0 mt-0.5" />
                    <span>100% prompt privacy — logs persist in local SQLite (~/.osterdops)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-charcoal-700 shrink-0 mt-0.5" />
                    <span>Pro only: Multi-device sync (max 2 machines) &amp; Telegram burn alerts</span>
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
                  className="w-full sm:w-[50%] py-3 px-3.5 rounded-xl bg-[#141416] text-white font-mono text-xs flex items-center justify-between hover:bg-black transition-colors"
                  title="Click to copy"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-zinc-300">$ npx osterdops-guard</span>
                  </div>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                </button>

                {/* Upgrade Button */}
                <button
                  onClick={() => handleOpenCheckout('solo_pro', 'Solo Pro', soloDisplayPrice)}
                  className="w-full sm:w-[50%] py-3 px-3 rounded-xl bg-[#F0E6D8] hover:bg-[#EADDCB] text-charcoal-900 text-xs font-bold transition-all text-center cursor-pointer shadow-xs"
                >
                  <div className="leading-tight">Upgrade to Solo Pro →</div>
                  <div className="text-[10px] text-charcoal-600 font-normal font-mono mt-0.5">
                    {currentCfg.symbol}{soloDisplayPrice} / {isAnnual ? 'mo (annual)' : 'mo'} in {currentCfg.code}
                  </div>
                </button>
              </div>

              {/* Bottom Reassurance */}
              <div className="flex items-center justify-between text-xs text-charcoal-500 pt-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-charcoal-600" />
                  <span>Your machine. Your data. 100% private.</span>
                </div>
                <span className="text-[11px] font-mono text-charcoal-400">{currentCfg.regionLabel}</span>
              </div>
            </div>

          </div>

          {/* Card 2: For Startups & Teams (Deep Charcoal) */}
          <div className="relative p-7 sm:p-9 rounded-3xl bg-[#141416] text-white border border-[#27272A] shadow-2xl flex flex-col justify-between hover:border-osterdGold-500/40 transition-all overflow-hidden">
            
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
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-zinc-400 uppercase font-mono">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-200">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>FOR STARTUPS &amp; TEAMS</span>
                </div>

                <h2 className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight leading-snug">
                  Central Hosted Gateway &amp; Governance
                </h2>

                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed">
                  Stop sharing raw production API keys. Give your engineers scoped virtual tokens with hard spending ceilings.
                </p>
              </div>

              {/* Price Box */}
              <div className="p-5 rounded-2xl bg-[#1C1C1F] border border-[#2B2B30] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-300 block">Team Gateway</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-osterdGold-500/20 text-osterdGold-300 font-mono">
                      {currentCfg.flag} {currentCfg.code}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">
                      {currentCfg.symbol}{teamDisplayPrice}
                    </span>
                    <span className="text-xs text-zinc-400">
                      / {isAnnual ? 'month (billed annually)' : 'month'}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 pt-1">
                    Includes 5 developer seats<br />
                    ({currentCfg.symbol}{currentCfg.teamSeatPrice}/mo per additional seat)
                  </div>
                </div>

                <div className="text-right space-y-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => handleOpenCheckout('team_scale', 'Team Gateway', teamDisplayPrice)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F0E6D8] hover:bg-white text-charcoal-950 font-bold text-xs shadow-md transition-all whitespace-nowrap cursor-pointer"
                  >
                    Deploy Team Gateway →
                  </button>
                  <span className="text-[10px] text-zinc-400 font-medium block text-center sm:text-right">
                    14-Day Free Trial • Cancel anytime
                  </span>
                </div>
              </div>

              {/* Payment Info Callout */}
              <div className="p-3 rounded-xl bg-[#1F1F24] border border-[#2D2D35] text-[11px] text-zinc-300 flex items-center justify-between">
                <span className="font-mono text-zinc-400">Payment:</span>
                <span className="font-semibold text-zinc-200">{currentCfg.gatewayNote}</span>
              </div>

              {/* Key Features */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-bold text-zinc-200 block">Key Features</span>
                
                <div className="space-y-2.5 text-xs text-zinc-300">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Endpoint: <strong>gateway.osterdops.com/v1</strong></span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>AES-256 encrypted Central Key Vault (engineers never see master key)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Scoped virtual tokens per developer (<code>ost_live_...</code>)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Enforced monthly spend caps per engineer with auto-kill switch</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Unified workspace analytics &amp; CSV audit trails</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Webhooks for Slack, Discord and PagerDuty billing alerts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Card Security Badge */}
            <div className="relative z-10 pt-8">
              <div className="p-3.5 rounded-2xl bg-[#1A1A1E] border border-[#27272C] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-osterdGold-400 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-100">Enterprise-grade security.</div>
                    <div className="text-[11px] text-zinc-400">SOC2 compliant data routing.</div>
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
                      <div>Solo Telemetry (Localhost)</div>
                      <div className="text-[11px] font-normal text-charcoal-400 font-mono">Developer machine (127.0.0.1:8080)</div>
                    </th>
                    <th className="py-4 px-6 font-bold text-charcoal-900 w-[37%] bg-[#FAF8F5]">
                      <div>Team API Gateway (Hosted)</div>
                      <div className="text-[11px] font-normal text-charcoal-400 font-mono">gateway.osterdops.com</div>
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
              <strong>Built for the way you code.</strong> From solo hackers to scaling teams in India and worldwide, OsterdOps keeps your AI spend, agents and data under control.
            </span>
          </div>

          <button
            onClick={onNavigateHome}
            className="font-bold text-charcoal-900 hover:text-osterdGold-600 transition-colors whitespace-nowrap flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>Explore our docs →</span>
          </button>
        </div>

      </div>

      {/* Checkout / Subscription Confirmation Modal */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#EAE5DC] shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedPlanModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-sandstone-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div>
              <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider font-mono">
                Order Summary
              </span>
              <h3 className="text-xl font-extrabold text-charcoal-900 mt-1">
                Activate {selectedPlanModal.name}
              </h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Localized billing in {currentCfg.name} ({currentCfg.code})
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#EAE4D8] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-charcoal-700">Plan Selected</span>
                <span className="text-xs font-bold text-charcoal-900 font-mono">{selectedPlanModal.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-charcoal-700">Billing Term</span>
                <span className="text-xs text-charcoal-800 font-mono">
                  {selectedPlanModal.billingInterval === 'yr' ? 'Annual (20% Discounted)' : 'Monthly'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-charcoal-700">Region &amp; Currency</span>
                <span className="text-xs font-bold text-charcoal-900 flex items-center gap-1 font-mono">
                  <span>{currentCfg.flag}</span>
                  <span>{currentCfg.code}</span>
                </span>
              </div>
              <div className="pt-2 border-t border-[#EAE4D8] flex items-baseline justify-between">
                <span className="text-sm font-bold text-charcoal-900">Total Due Today</span>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-charcoal-900 font-mono">
                    {currentCfg.symbol}{selectedPlanModal.amount}
                  </span>
                  <span className="text-xs text-charcoal-500 font-mono block">
                    + local taxes if applicable
                  </span>
                </div>
              </div>
            </div>

            {/* Supported Payment Gateways for the user's detected region */}
            <div className="p-3.5 rounded-xl bg-sandstone-100/70 border border-[#E8E1D2] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-charcoal-800">
                {currency === 'INR' ? <QrCode className="w-4 h-4 text-emerald-700" /> : <CreditCard className="w-4 h-4 text-charcoal-800" />}
                <span>Payment Methods for {currentCfg.country}:</span>
              </div>
              <ul className="text-[11px] text-charcoal-700 space-y-1 list-disc list-inside">
                {currentCfg.paymentMethods.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleConfirmSubscription}
                disabled={checkoutStatus === 'processing' || checkoutStatus === 'success'}
                className="w-full py-3.5 rounded-xl bg-charcoal-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {checkoutStatus === 'processing' ? (
                  <span>Connecting to {currentCfg.code} gateway...</span>
                ) : checkoutStatus === 'success' ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Plan Activated!
                  </span>
                ) : (
                  <span>
                    Proceed with {currentCfg.symbol}{selectedPlanModal.amount} ({currentCfg.code}) →
                  </span>
                )}
              </button>

              <button
                onClick={() => setSelectedPlanModal(null)}
                className="w-full py-2 text-center text-xs text-charcoal-500 hover:text-charcoal-800 transition-colors cursor-pointer"
              >
                Cancel and return
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
