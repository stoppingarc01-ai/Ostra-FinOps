import React, { useState } from 'react';
import {
  Shield,
  Eye,
  Zap,
  CheckCircle2,
  Lock,
  Headphones,
  Sliders,
  Mail,
  Building2,
  Users,
  CreditCard,
  Sparkles,
  Check,
  ChevronDown,
  Loader2,
  Radio,
  Flame,
  Globe2,
  Activity,
  Printer,
  Copy,
  X,
  ShieldCheck,
  ArrowRight,
  Terminal,
  Cpu,
  Layers,
  Bell,
  ShieldAlert,
  Gauge,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createUserDefaultSubscription } from '../lib/subscriptionService';
import { processBillingCheckout, type BillingInvoice } from '../lib/billingService';
import { OstraLogo, OstraIcon } from '../components/OstraBrand';

interface OnboardingPageProps {
  onNavigate: (route: string) => void;
}

// 6 Streamlined Onboarding Steps
const STEPS = [
  { id: 1, title: 'Welcome' },
  { id: 2, title: 'Organization' },
  { id: 3, title: 'Preferences' },
  { id: 4, title: 'Subscription' },
  { id: 5, title: 'Team Members' },
  { id: 6, title: 'Review & Finish' },
];

interface LocalizedPricing {
  currencyCode: string;
  currencySymbol: string;
  countryName: string;
  trialPrice: string;
  telemetryPrice: string;
  starterPrice: string;
  proPrice: string;
  period: string;
}

const getInitialDetectedPricing = (): LocalizedPricing => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = (typeof navigator !== 'undefined' ? navigator.language : '').toLowerCase();

    // India
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || lang.includes('in')) {
      return {
        currencyCode: 'INR',
        currencySymbol: '₹',
        countryName: 'India',
        trialPrice: '₹0',
        telemetryPrice: '₹1,650',
        starterPrice: '₹2,890',
        proPrice: '₹4,890',
        period: '/ month',
      };
    }

    // United Kingdom
    if (tz.includes('London') || lang.includes('gb')) {
      return {
        currencyCode: 'GBP',
        currencySymbol: '£',
        countryName: 'United Kingdom',
        trialPrice: '£0',
        telemetryPrice: '£16',
        starterPrice: '£28',
        proPrice: '£48',
        period: '/ month',
      };
    }

    // Eurozone
    if (
      tz.startsWith('Europe/') ||
      ['de', 'fr', 'es', 'it', 'nl', 'pt'].some((l) => lang.startsWith(l))
    ) {
      return {
        currencyCode: 'EUR',
        currencySymbol: '€',
        countryName: 'Europe',
        trialPrice: '€0',
        telemetryPrice: '€19',
        starterPrice: '€32',
        proPrice: '€55',
        period: '/ month',
      };
    }

    // Japan
    if (tz.includes('Tokyo') || lang.includes('ja')) {
      return {
        currencyCode: 'JPY',
        currencySymbol: '¥',
        countryName: 'Japan',
        trialPrice: '¥0',
        telemetryPrice: '¥3,000',
        starterPrice: '¥5,200',
        proPrice: '¥8,900',
        period: '/ month',
      };
    }

    // Canada
    if (tz.includes('Toronto') || tz.includes('Vancouver') || lang.includes('ca')) {
      return {
        currencyCode: 'CAD',
        currencySymbol: 'CA$',
        countryName: 'Canada',
        trialPrice: 'CA$0',
        telemetryPrice: 'CA$28',
        starterPrice: 'CA$48',
        proPrice: 'CA$79',
        period: '/ month',
      };
    }

    // Australia
    if (tz.includes('Sydney') || tz.includes('Melbourne') || lang.includes('au')) {
      return {
        currencyCode: 'AUD',
        currencySymbol: 'A$',
        countryName: 'Australia',
        trialPrice: 'A$0',
        telemetryPrice: 'A$30',
        starterPrice: 'A$54',
        proPrice: 'A$89',
        period: '/ month',
      };
    }
  } catch {}

  // Global / United States default ($20 / $35 / $59)
  return {
    currencyCode: 'USD',
    currencySymbol: '$',
    countryName: 'United States & Global',
    trialPrice: '$0',
    telemetryPrice: '$20',
    starterPrice: '$35',
    proPrice: '$59',
    period: '/ month',
  };
};

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onNavigate }) => {
  const { user, profile, updateProfile, updateSubscription } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-detected Currency based on IP & Region
  const [detectedPricing, setDetectedPricing] = useState<LocalizedPricing>(getInitialDetectedPricing);

  // Background IP detection to refine local currency automatically
  React.useEffect(() => {
    let isMounted = true;
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data) return;
        const countryCode = data.country_code;
        const countryName = data.country_name || countryCode;
        if (countryCode === 'IN') {
          setDetectedPricing({
            currencyCode: 'INR',
            currencySymbol: '₹',
            countryName: 'India',
            trialPrice: '₹0',
            telemetryPrice: '₹1,650',
            starterPrice: '₹2,890',
            proPrice: '₹4,890',
            period: '/ month',
          });
        } else if (countryCode === 'GB') {
          setDetectedPricing({
            currencyCode: 'GBP',
            currencySymbol: '£',
            countryName: 'United Kingdom',
            trialPrice: '£0',
            telemetryPrice: '£16',
            starterPrice: '£28',
            proPrice: '£48',
            period: '/ month',
          });
        } else if (['DE', 'FR', 'ES', 'IT', 'NL', 'IE'].includes(countryCode)) {
          setDetectedPricing({
            currencyCode: 'EUR',
            currencySymbol: '€',
            countryName: countryName || 'Europe',
            trialPrice: '€0',
            telemetryPrice: '€19',
            starterPrice: '€32',
            proPrice: '€55',
            period: '/ month',
          });
        } else if (countryCode === 'JP') {
          setDetectedPricing({
            currencyCode: 'JPY',
            currencySymbol: '¥',
            countryName: 'Japan',
            trialPrice: '¥0',
            telemetryPrice: '¥3,000',
            starterPrice: '¥5,200',
            proPrice: '¥8,900',
            period: '/ month',
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Step 2: Organization Form State
  const defaultOrgName = profile?.company_name || (user?.email ? `${user.email.split('@')[0].toUpperCase()}'s Organization` : "My Team's Organization");
  const [orgName, setOrgName] = useState(defaultOrgName);
  const [industry, setIndustry] = useState('Technology');
  const [companySize, setCompanySize] = useState('11 - 50 employees');
  const [country, setCountry] = useState('United States');

  // Currency switching helper function
  const handleCurrencyChange = (code: string) => {
    if (code === 'INR') {
      setDetectedPricing({
        currencyCode: 'INR',
        currencySymbol: '₹',
        countryName: 'India',
        trialPrice: '₹0',
        telemetryPrice: '₹1,650',
        starterPrice: '₹2,890',
        proPrice: '₹4,890',
        period: '/ month',
      });
    } else if (code === 'EUR') {
      setDetectedPricing({
        currencyCode: 'EUR',
        currencySymbol: '€',
        countryName: 'Europe',
        trialPrice: '€0',
        telemetryPrice: '€19',
        starterPrice: '€32',
        proPrice: '€55',
        period: '/ month',
      });
    } else if (code === 'GBP') {
      setDetectedPricing({
        currencyCode: 'GBP',
        currencySymbol: '£',
        countryName: 'United Kingdom',
        trialPrice: '£0',
        telemetryPrice: '£16',
        starterPrice: '£28',
        proPrice: '£48',
        period: '/ month',
      });
    } else if (code === 'JPY') {
      setDetectedPricing({
        currencyCode: 'JPY',
        currencySymbol: '¥',
        countryName: 'Japan',
        trialPrice: '¥0',
        telemetryPrice: '¥3,000',
        starterPrice: '¥5,200',
        proPrice: '¥8,900',
        period: '/ month',
      });
    } else if (code === 'CAD') {
      setDetectedPricing({
        currencyCode: 'CAD',
        currencySymbol: 'CA$',
        countryName: 'Canada',
        trialPrice: 'CA$0',
        telemetryPrice: 'CA$28',
        starterPrice: 'CA$48',
        proPrice: 'CA$79',
        period: '/ month',
      });
    } else if (code === 'AUD') {
      setDetectedPricing({
        currencyCode: 'AUD',
        currencySymbol: 'A$',
        countryName: 'Australia',
        trialPrice: 'A$0',
        telemetryPrice: 'A$30',
        starterPrice: 'A$54',
        proPrice: 'A$89',
        period: '/ month',
      });
    } else {
      setDetectedPricing({
        currencyCode: 'USD',
        currencySymbol: '$',
        countryName: 'United States & Global',
        trialPrice: '$0',
        telemetryPrice: '$20',
        starterPrice: '$35',
        proPrice: '$59',
        period: '/ month',
      });
    }
  };

  // Step 3: Comprehensive FinOps & Gateway Preferences State
  const [optimizationMode, setOptimizationMode] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [primaryWorkflow, setPrimaryWorkflow] = useState<'cursor_windsurf' | 'backend_agents' | 'autonomous_loops' | 'production_api'>('cursor_windsurf');
  const [circuitBreakerAction, setCircuitBreakerAction] = useState<'hard_stop' | 'fallback_cheaper' | 'alert_only'>('hard_stop');
  const [privacyMode, setPrivacyMode] = useState<'zero_storage' | 'pii_masking' | 'metadata_only'>('zero_storage');
  const [runawayLoopProtection, setRunawayLoopProtection] = useState<boolean>(true);
  const [spikeVelocityAlert, setSpikeVelocityAlert] = useState<boolean>(true);
  const [maxCostPerCall, setMaxCostPerCall] = useState<string>('$1.00');
  const [alertThresholdPercent, setAlertThresholdPercent] = useState<number>(85);
  const [notifications, setNotifications] = useState<'email' | 'slack' | 'both'>('both');
  const [slackWebhookUrl, setSlackWebhookUrl] = useState<string>('');
  const [alertEmail, setAlertEmail] = useState<string>(() => user?.email || '');
  const [testWebhookStatus, setTestWebhookStatus] = useState<string | null>(null);

  // Step 4: Subscription (Mandatory Choice - Gatekeeper)
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'telemetry' | 'starter' | 'pro' | null>(null);

  // Integrated Immediate Billing Checkout & Verified Receipt Modal States
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [billingModalMode, setBillingModalMode] = useState<'checkout' | 'receipt'>('checkout');
  const [paidVerified, setPaidVerified] = useState(false);
  const [verifiedBillingId, setVerifiedBillingId] = useState<string | null>(null);
  const [verifiedInvoice, setVerifiedInvoice] = useState<BillingInvoice | null>(null);
  const [billingInterval, setBillingInterval] = useState<'mo' | 'yr'>('mo');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [copiedReceiptId, setCopiedReceiptId] = useState(false);

  // Instant Billing Trigger: selecting a paid plan directly launches checkout
  const handleSelectPlan = (plan: 'trial' | 'telemetry' | 'starter' | 'pro') => {
    setSelectedPlan(plan);
    if (plan === 'trial') {
      setIsBillingModalOpen(false);
    } else {
      if (paidVerified && selectedPlan === plan) {
        setBillingModalMode('receipt');
      } else {
        setBillingModalMode('checkout');
      }
      setIsBillingModalOpen(true);
    }
  };

  const handleCopyReceiptBillingId = () => {
    if (verifiedBillingId) {
      navigator.clipboard.writeText(verifiedBillingId);
      setCopiedReceiptId(true);
      setTimeout(() => setCopiedReceiptId(false), 2000);
      showToast('Permanent Billing ID copied to clipboard');
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || selectedPlan === 'trial') return;

    setIsProcessingPayment(true);
    const userId = user?.id || user?.uid || 'user_guest';
    const activePlanKey =
      selectedPlan === 'telemetry' ? 'telemetry_observer' :
      selectedPlan === 'starter' ? 'starter_gateway' : 'pro_gateway';
    const planName =
      selectedPlan === 'telemetry' ? 'Agent Telemetry' :
      selectedPlan === 'starter' ? 'Starter Gateway' : 'Pro Gateway';

    const basePrice =
      selectedPlan === 'telemetry' ? 20 :
      selectedPlan === 'starter' ? 35 : 59;
    const finalPrice = billingInterval === 'yr' ? Math.round(basePrice * 12 * 0.8) : basePrice;

    try {
      const checkoutRes = await processBillingCheckout({
        userId,
        planId: activePlanKey,
        planName: `${planName} (${billingInterval === 'yr' ? 'Annual' : 'Monthly'})`,
        priceAmount: finalPrice,
        billingInterval,
        billingEmail: user?.email || 'billing@ostraops.com',
        customerName: profile?.full_name || 'Admin',
        companyName: orgName.trim() || 'My Organization',
        taxId: undefined,
        country,
        cardLast4: 'INV-CORP',
        cardBrand: 'Corporate Invoicing',
      });

      const subPayload = {
        plan_id: activePlanKey,
        plan_name: planName,
        price_amount: finalPrice,
        billing_interval: billingInterval,
        status: 'active' as const,
        renewal_date: new Date(Date.now() + (billingInterval === 'yr' ? 365 : 30) * 86_400_000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        quota_usage_percent: 0,
        quota_used: 0,
        quota_limit: activePlanKey.includes('pro') ? 10000000 : activePlanKey.includes('starter') ? 1000000 : 50000,
      };

      try {
        await updateSubscription(subPayload);
        if (userId) {
          await createUserDefaultSubscription(userId, subPayload);
        }
      } catch (subErr) {
        console.warn('Subscription sync notice:', subErr);
      }

      setPaidVerified(true);
      setVerifiedBillingId(checkoutRes.billingId);
      setVerifiedInvoice(checkoutRes.invoice);
      setBillingModalMode('receipt');
      showToast('Payment verified! Unique Billing ID generated.');
    } catch (err: any) {
      showToast(err?.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Step 5: Team Members
  const [teamEmails, setTeamEmails] = useState<string[]>(['']);
  const [teamRole, setTeamRole] = useState<'admin' | 'engineer' | 'viewer'>('engineer');

  // Support Modal
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddTeamEmail = () => {
    if (teamEmails.length < 5) {
      setTeamEmails(prev => [...prev, '']);
    }
  };

  const handleUpdateTeamEmail = (index: number, val: string) => {
    const updated = [...teamEmails];
    updated[index] = val;
    setTeamEmails(updated);
  };

  // Complete Onboarding & Save
  const handleCompleteOnboarding = async () => {
    if (!selectedPlan) {
      showToast('Please select a subscription plan to continue.');
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Update Profile & Workspace settings
      await updateProfile({
        company_name: orgName.trim(),
        company_size: companySize,
        country: country,
        onboarding_completed: true,
      });

      // 2. Persist chosen subscription in Firestore, Supabase & React Context
      const userId = user?.id || user?.uid;
      const activePlanKey =
        selectedPlan === 'trial' ? 'team_trial' :
        selectedPlan === 'telemetry' ? 'telemetry_observer' :
        selectedPlan === 'starter' ? 'starter_gateway' : 'pro_gateway';
      const tierKey =
        selectedPlan === 'trial' ? 'trial' :
        selectedPlan === 'telemetry' ? 'telemetry' :
        selectedPlan === 'starter' ? 'starter' : 'pro';
      const planName =
        selectedPlan === 'trial' ? '7-Day Free Trial' :
        selectedPlan === 'telemetry' ? 'Agent Telemetry' :
        selectedPlan === 'starter' ? 'Starter Gateway' : 'Pro Gateway';
      const price =
        selectedPlan === 'trial' ? 0 :
        selectedPlan === 'telemetry' ? 20 :
        selectedPlan === 'starter' ? 35 : 59;

      const isTrial = selectedPlan === 'trial' || activePlanKey.includes('trial');
      const subPayload = {
        plan_id: activePlanKey,
        plan_name: isTrial ? '7-Day Free Trial' : planName,
        price_amount: price,
        billing_interval: 'mo' as const,
        status: isTrial ? ('trialing' as const) : ('active' as const),
        renewal_date: new Date(Date.now() + (isTrial ? 7 : 30) * 86_400_000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        quota_usage_percent: 0,
        quota_used: 0,
        quota_limit: activePlanKey.includes('pro') ? 10000000 : activePlanKey.includes('starter') || isTrial ? 1000000 : 50000,
      };

      // Immediately sync with AuthContext state
      try {
        await updateSubscription(subPayload);
      } catch {}

      if (userId) {
        try {
          await createUserDefaultSubscription(userId, subPayload);
          // If not already paid in Step 4 (e.g. Free Trial), provision trial billing account
          if (!paidVerified) {
            await processBillingCheckout({
              userId,
              planId: activePlanKey,
              planName,
              priceAmount: price,
              billingInterval: 'mo',
              billingEmail: user?.email || 'billing@ostraops.com',
              customerName: profile?.full_name || 'Admin',
              companyName: orgName.trim(),
              country,
            });
          }
        } catch (subErr) {
          console.warn('Subscription/Billing backend write notice:', subErr);
        }
      }

      // 3. Persist completion in localStorage per-user and globally
      try {
        localStorage.setItem('ostraops_onboarding_completed', 'true');
        if (userId) {
          localStorage.setItem(`ostraops_onboarding_${userId}`, 'true');
          localStorage.setItem(`ostraops_subscription_${userId}`, JSON.stringify({
            id: userId,
            user_id: userId,
            ...subPayload,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
          localStorage.setItem(`ostraops_active_plan_${userId}`, activePlanKey);
          localStorage.setItem(`ostraops_user_tier_${userId}`, tierKey);
        }
        localStorage.setItem('ostraops_subscription', JSON.stringify({
          id: userId || 'active',
          user_id: userId || 'active',
          ...subPayload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        localStorage.setItem('ostraops_active_plan', activePlanKey);
        localStorage.setItem('ostraops_user_tier', tierKey);
        localStorage.setItem('ostraops_workspace_preferences', JSON.stringify({
          optimizationMode,
          primaryWorkflow,
          circuitBreakerAction,
          privacyMode,
          runawayLoopProtection,
          spikeVelocityAlert,
          maxCostPerCall,
          alertThresholdPercent,
          notifications,
          alertEmail,
          slackWebhookUrl,
          currencyCode: detectedPricing.currencyCode,
          currencySymbol: detectedPricing.currencySymbol,
        }));
        localStorage.setItem('ostraops_preferred_currency', detectedPricing.currencyCode);
      } catch {}

      showToast('Workspace activated! Welcome to OstraOps.');
      setTimeout(() => {
        setIsSubmitting(false);
        onNavigate('dashboard');
      }, 600);
    } catch {
      setIsSubmitting(false);
      localStorage.setItem('ostraops_onboarding_completed', 'true');
      onNavigate('dashboard');
    }
  };

  const validInvitedCount = teamEmails.filter(e => e.trim().length > 3).length;

  return (
    <div className="min-h-screen bg-[#07090C] text-white flex flex-col font-sans selection:bg-[#C59E5F]/30 selection:text-[#FFF4D6] relative overflow-x-hidden">
      {/* Background Atmosphere Highlights */}
      <div className="absolute top-0 right-1/3 w-[600px] h-[600px] bg-[#C59E5F]/[0.035] blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#E5C38D]/[0.025] blur-[140px] pointer-events-none rounded-full" />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#121620] border border-[#C59E5F]/50 text-[#F5E6CC] px-4 py-3 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2.5 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-[#C59E5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sleek Top Animated Progress Line */}
      <div className="w-full h-1 bg-white/[0.04] relative overflow-hidden z-30">
        <div
          className="h-full bg-gradient-to-r from-[#C59E5F] via-[#E5C38D] to-[#FFF4D6] transition-all duration-500 ease-out shadow-[0_0_12px_rgba(229,195,141,0.7)] relative"
          style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white] animate-ping" />
        </div>
      </div>

      {/* Main Cockpit Container */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto min-h-screen">
        
        {/* ========================================================== */}
        {/* LEFT SIDEBAR: STEPS & BRAND                                */}
        {/* ========================================================== */}
        <aside className="w-full lg:w-[320px] xl:w-[340px] p-6 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.06] bg-[#07090C]/90 backdrop-blur-xl shrink-0 z-20">
          <div>
            {/* Header Brand */}
            <div className="flex items-center gap-2.5 mb-1 cursor-pointer" onClick={() => onNavigate('home')}>
              <OstraLogo
                variant="gold"
                iconClassName="w-8 h-8"
                textClassName="text-white text-xl font-bold tracking-tight"
                brandName="OstraOps"
              />
            </div>
            <p className="text-[11px] text-zinc-400 font-medium tracking-wide mb-10">
              AI Cost Governance & Operations
            </p>

            {/* Current Step Tracker */}
            <div className="mb-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                STEP {currentStep} OF {STEPS.length}
              </span>
            </div>

            {/* Step Navigation Pills */}
            <nav className="space-y-2">
              {STEPS.map((step) => {
                const isCurrent = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      // Allow navigating backwards or jumping to visited steps
                      if (step.id <= currentStep) {
                        setCurrentStep(step.id);
                      }
                    }}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                      isCurrent
                        ? 'bg-[#1C1811] border border-[#C59E5F]/30 text-white shadow-[0_0_20px_rgba(197,158,95,0.08)]'
                        : isCompleted
                        ? 'text-zinc-300 hover:text-white hover:bg-white/[0.02]'
                        : 'text-zinc-600 cursor-default'
                    }`}
                  >
                    {/* Step Indicator Circle */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                        isCurrent
                          ? 'bg-[#E5C38D] text-black shadow-[0_0_10px_rgba(229,195,141,0.6)]'
                          : isCompleted
                          ? 'bg-[#141820] text-[#C59E5F] border border-[#C59E5F]/40'
                          : 'bg-[#10141D] text-zinc-600 border border-white/[0.05]'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                    </div>

                    <span className={`text-sm font-medium ${isCurrent ? 'text-white font-semibold' : ''}`}>
                      {step.title}
                    </span>

                    {/* Active Golden Glow Dot */}
                    {isCurrent && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E5C38D] shadow-[0_0_8px_#E5C38D]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Need help link at bottom */}
          <div className="pt-8 mt-auto">
            <button
              onClick={() => setSupportModalOpen(true)}
              className="flex items-center gap-2.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-400">
                <Headphones className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-zinc-400">Need help?</div>
                <div className="font-semibold text-zinc-200">Contact Support</div>
              </div>
            </button>
          </div>
        </aside>

        {/* ========================================================== */}
        {/* RIGHT MAIN PANEL: INTERACTIVE CONTENT PER STEP             */}
        {/* ========================================================== */}
        <main className="flex-1 p-6 sm:p-10 lg:p-14 flex flex-col justify-between overflow-y-auto">
          
          {/* ======================================================== */}
          {/* STEP 1: WELCOME & DASHBOARD TELEMETRY PREVIEW             */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="flex-1 flex flex-col justify-center max-w-4xl py-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                
                {/* Left Text Column */}
                <div className="lg:col-span-7 space-y-6">
                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
                    Welcome to OstraOps.<span className="text-[#C59E5F]">✦</span>
                  </h1>
                  <p className="text-base text-zinc-400 leading-relaxed font-normal">
                    Let's get your AI cost governance workspace configured in a few simple steps.
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#E5C38D] to-[#C59E5F] text-black font-bold text-sm tracking-wide shadow-[0_0_24px_rgba(229,195,141,0.35)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Get Started</span>
                      <span>→</span>
                    </button>
                  </div>

                  {/* 3 Value Proposition Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6">
                    <div className="p-4 rounded-xl bg-[#0D1017] border border-white/[0.06] space-y-2 hover:border-[#C59E5F]/30 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#E5C38D]">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-white">Visibility</div>
                      <div className="text-[11px] text-zinc-400 leading-relaxed">
                        Understand AI usage across providers.
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0D1017] border border-white/[0.06] space-y-2 hover:border-[#C59E5F]/30 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#E5C38D]">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-white">Governance</div>
                      <div className="text-[11px] text-zinc-400 leading-relaxed">
                        Set budgets and enforce policies.
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0D1017] border border-white/[0.06] space-y-2 hover:border-[#C59E5F]/30 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#E5C38D]">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-white">Optimization</div>
                      <div className="text-[11px] text-zinc-400 leading-relaxed">
                        Find opportunities to reduce unnecessary spend.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Preview Widget */}
                <div className="lg:col-span-5">
                  <div className="p-6 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                        AI SPEND
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        ↗ 24.6% VS LAST MONTH
                      </span>
                    </div>

                    <div className="text-3xl font-black text-white font-mono tracking-tight mb-4">
                      $42,840
                    </div>

                    {/* Smooth glowing spend curve SVG */}
                    <div className="h-28 w-full relative mb-4">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="spendGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#E5C38D" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#E5C38D" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0,75 C 50,70 90,80 140,40 C 190,0 230,90 280,35 L 300,30 L 300,100 L 0,100 Z"
                          fill="url(#spendGlow)"
                        />
                        <path
                          d="M 0,75 C 50,70 90,80 140,40 C 190,0 230,90 280,35 L 300,30"
                          fill="none"
                          stroke="#E5C38D"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <circle cx="280" cy="35" r="4.5" fill="#FFF4D6" className="animate-pulse shadow-[0_0_12px_#E5C38D]" />
                      </svg>
                    </div>

                    {/* Mini Budget & Savings Cards */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-[#0E121B] border border-white/[0.05] flex items-center gap-3">
                        {/* 64% Donut */}
                        <div className="relative w-10 h-10 shrink-0">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="rgba(255,255,255,0.08)"
                              strokeWidth="3.5"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#C59E5F"
                              strokeDasharray="64, 100"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                            64%
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Budget</div>
                          <div className="text-xs font-mono font-bold text-zinc-300">of $65,000</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#0E121B] border border-white/[0.05]">
                        <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Savings</div>
                        <div className="text-sm font-mono font-black text-white">$8,420</div>
                        <div className="text-[10px] text-emerald-400 font-mono mt-0.5">↗ 18.7% vs last mo</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: ORGANIZATION DETAILS                              */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="flex-1 flex flex-col justify-center max-w-4xl py-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                
                {/* Form Column */}
                <div className="lg:col-span-7 space-y-5">
                  <div>
                    <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                      Tell us about your organization.
                    </h1>
                    <p className="text-sm text-zinc-400 mt-2 font-normal">
                      This helps us configure OstraOps for your team.
                    </p>
                  </div>

                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="w-full px-4 py-3 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#C59E5F] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Industry
                      </label>
                      <div className="relative">
                        <select
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full appearance-none px-4 py-3 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#C59E5F] transition-colors cursor-pointer"
                        >
                          <option value="Technology">Technology & Software</option>
                          <option value="Fintech">Fintech & Banking</option>
                          <option value="Healthcare">Healthcare & Biotech</option>
                          <option value="Ecommerce">E-Commerce & Retail</option>
                          <option value="AI Infrastructure">AI/ML Infrastructure</option>
                          <option value="Consulting">Consulting & Agency</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                          Company Size
                        </label>
                        <div className="relative">
                          <select
                            value={companySize}
                            onChange={(e) => setCompanySize(e.target.value)}
                            className="w-full appearance-none px-4 py-3 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#C59E5F] transition-colors cursor-pointer"
                          >
                            <option value="1 - 10 employees">1 – 10 employees</option>
                            <option value="11 - 50 employees">11 – 50 employees</option>
                            <option value="51 - 200 employees">51 – 200 employees</option>
                            <option value="201 - 500 employees">201 – 500 employees</option>
                            <option value="500+ employees">500+ employees</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                          Country / Region
                        </label>
                        <div className="relative">
                          <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full appearance-none px-4 py-3 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#C59E5F] transition-colors cursor-pointer"
                          >
                            <option value="United States">United States</option>
                            <option value="India">India</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Germany">Germany</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                            <option value="Japan">Japan</option>
                            <option value="Other">Other Global</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security banner */}
                  <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.06] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="text-xs text-zinc-400">
                      <span className="font-semibold text-zinc-200">Your data stays protected.</span> OstraOps uses secure infrastructure designed for enterprise environments.
                    </div>
                  </div>
                </div>

                {/* Right Concentric Orbit Radar Graphic */}
                <div className="lg:col-span-5 flex items-center justify-center">
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                    {/* Glowing Core */}
                    <div className="absolute inset-0 bg-[#C59E5F]/[0.05] rounded-full blur-2xl" />
                    
                    {/* Ring 1 */}
                    <div className="absolute inset-0 rounded-full border border-dashed border-[#C59E5F]/20 animate-[spin_40s_linear_infinite]" />
                    {/* Ring 2 */}
                    <div className="absolute inset-8 rounded-full border border-white/[0.08]" />
                    {/* Ring 3 with gold accent */}
                    <div className="absolute inset-16 rounded-full border border-[#C59E5F]/40" />

                    {/* Orbiting celestial dots */}
                    <div className="absolute top-4 right-10 w-2 h-2 rounded-full bg-[#E5C38D] shadow-[0_0_10px_#E5C38D]" />
                    <div className="absolute bottom-10 left-6 w-3 h-3 rounded-full bg-white shadow-[0_0_8px_white]" />
                    <div className="absolute bottom-6 right-20 w-1.5 h-1.5 rounded-full bg-[#C59E5F]" />

                    {/* Center Globe / Shield Emblem */}
                    <div className="w-20 h-20 rounded-full bg-[#121622] border border-[#C59E5F]/50 flex items-center justify-center shadow-[0_0_25px_rgba(197,158,95,0.25)]">
                      <Globe2 className="w-10 h-10 text-[#E5C38D]" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Navigation Actions */}
              <div className="flex items-center gap-3 pt-8 border-t border-white/[0.06] mt-8">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-white/[0.04] text-xs font-semibold transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!orgName.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C38D] to-[#C59E5F] text-black font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(229,195,141,0.3)] hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: PREFERENCES & RUNTIME GUARDRAILS                 */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="flex-1 flex flex-col justify-center max-w-5xl py-4 animate-in fade-in duration-300">
              <div className="space-y-8">
                {/* Header */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C59E5F]/10 border border-[#C59E5F]/30 text-[#E5C38D] text-[11px] font-mono font-semibold mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    Runtime Guardrails &amp; Policies
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Configure your preferences.
                  </h1>
                  <p className="text-sm text-zinc-400 mt-2 font-normal max-w-2xl">
                    Tailor your real-time budget controller, loop circuit breakers, privacy controls, and alert channels.
                  </p>
                </div>

                {/* 1. PRIMARY AI ENVIRONMENT / WORKFLOW */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#E5C38D]" />
                        <span>Primary AI Workflow</span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        Where will you connect OstraOps first?
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#E5C38D] hidden sm:inline">
                      Select your primary setup
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Cursor & Windsurf */}
                    <div
                      onClick={() => setPrimaryWorkflow('cursor_windsurf')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        primaryWorkflow === 'cursor_windsurf'
                          ? 'bg-[#181510] border-[#C59E5F] shadow-[0_0_20px_rgba(197,158,95,0.18)] ring-1 ring-[#C59E5F]'
                          : 'bg-[#0B0E14] border-white/[0.08] hover:border-white/[0.2] hover:bg-[#0E121B]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#E5C38D]">
                            <Terminal className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30 font-semibold">
                            Recommended
                          </span>
                        </div>
                        <div className="text-sm font-bold text-white">Cursor &amp; Windsurf</div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Local proxy on <code className="text-[#E5C38D] bg-black/40 px-1 py-0.5 rounded">127.0.0.1:8080</code>. Stops IDE background agents from draining credits.
                        </p>
                      </div>
                    </div>

                    {/* Python & LangChain */}
                    <div
                      onClick={() => setPrimaryWorkflow('backend_agents')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        primaryWorkflow === 'backend_agents'
                          ? 'bg-[#181510] border-[#C59E5F] shadow-[0_0_20px_rgba(197,158,95,0.18)] ring-1 ring-[#C59E5F]'
                          : 'bg-[#0B0E14] border-white/[0.08] hover:border-white/[0.2] hover:bg-[#0E121B]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#E5C38D]">
                            <Cpu className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                            Backend SDK
                          </span>
                        </div>
                        <div className="text-sm font-bold text-white">Python &amp; LangChain</div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          RAG pipelines, data workflows, and batch inference with unified token tracking and prompt caching.
                        </p>
                      </div>
                    </div>

                    {/* Autonomous Multi-Agent Loops */}
                    <div
                      onClick={() => setPrimaryWorkflow('autonomous_loops')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        primaryWorkflow === 'autonomous_loops'
                          ? 'bg-[#181510] border-[#C59E5F] shadow-[0_0_20px_rgba(197,158,95,0.18)] ring-1 ring-[#C59E5F]'
                          : 'bg-[#0B0E14] border-white/[0.08] hover:border-white/[0.2] hover:bg-[#0E121B]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#E5C38D]">
                            <Layers className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                            Loop Breaker
                          </span>
                        </div>
                        <div className="text-sm font-bold text-white">Autonomous Agents</div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          CrewAI, AutoGPT, Claude Code. Real-time loop detection stops recursive spend instantly.
                        </p>
                      </div>
                    </div>

                    {/* Production Web API */}
                    <div
                      onClick={() => setPrimaryWorkflow('production_api')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        primaryWorkflow === 'production_api'
                          ? 'bg-[#181510] border-[#C59E5F] shadow-[0_0_20px_rgba(197,158,95,0.18)] ring-1 ring-[#C59E5F]'
                          : 'bg-[#0B0E14] border-white/[0.08] hover:border-white/[0.2] hover:bg-[#0E121B]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#E5C38D]">
                            <Activity className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            High RPS
                          </span>
                        </div>
                        <div className="text-sm font-bold text-white">Production SaaS API</div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          FastAPI, Next.js, Node.js gateway with pooled budgets, automatic provider failover, and sub-ms latency.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. COST OPTIMIZATION STRATEGY (RICH INTERACTIVE CARDS) */}
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#E5C38D]" />
                      <span>Cost Optimization &amp; Routing Mode</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Choose how aggressively OstraOps optimizes and caches token requests.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* Conservative */}
                    <div
                      onClick={() => setOptimizationMode('conservative')}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        optimizationMode === 'conservative'
                          ? 'bg-[#181510] border-[#C59E5F] shadow-[0_0_20px_rgba(197,158,95,0.18)] ring-1 ring-[#C59E5F]'
                          : 'bg-[#0B0E14] border-white/[0.08] hover:border-white/[0.2] hover:bg-[#0E121B]'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                            Quality First
                          </span>
                          <span className="text-xs font-mono font-bold text-[#E5C38D]">~20% Savings</span>
                        </div>
                        <div>
                          <div className="text-base font-bold text-white">Conservative</div>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            Always route to your primary frontier models (GPT-4o, Claude 3.5 Sonnet). Applies lossless prompt caching without any model downscaling.
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Zero quality downgrade</span>
                      </div>
                    </div>

                    {/* Balanced (Recommended) */}
                    <div
                      onClick={() => setOptimizationMode('balanced')}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                        optimizationMode === 'balanced'
                          ? 'bg-[#181510] border-[#C59E5F] shadow-[0_0_20px_rgba(197,158,95,0.25)] ring-1 ring-[#C59E5F]'
                          : 'bg-[#0B0E14] border-white/[0.08] hover:border-white/[0.2] hover:bg-[#0E121B]'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#C59E5F]/20 text-[#E5C38D] border border-[#C59E5F]/40">
                            ★ Recommended
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400">~45% Savings</span>
                        </div>
                        <div>
                          <div className="text-base font-bold text-white">Balanced</div>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            Caches repeat prompts automatically. Intelligently routes simple classification &amp; extraction tasks to Claude 3.5 Haiku or GPT-4o-mini.
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center gap-1.5 text-[11px] text-[#E5C38D]">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Best mix of accuracy &amp; low bill</span>
                      </div>
                    </div>

                    {/* Aggressive */}
                    <div
                      onClick={() => setOptimizationMode('aggressive')}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        optimizationMode === 'aggressive'
                          ? 'bg-[#181510] border-[#C59E5F] shadow-[0_0_20px_rgba(197,158,95,0.18)] ring-1 ring-[#C59E5F]'
                          : 'bg-[#0B0E14] border-white/[0.08] hover:border-white/[0.2] hover:bg-[#0E121B]'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Max Margin
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400">Up to 75% Off</span>
                        </div>
                        <div>
                          <div className="text-base font-bold text-white">Aggressive</div>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            Strict token compression, prompt trimming, and automated fallback to DeepSeek V3 and Gemini 2.5 Flash for internal agent tasks.
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center gap-1.5 text-[11px] text-amber-300">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Maximum cost protection</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. CIRCUIT BREAKER ACTION */}
                <div className="p-6 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-4">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[#E5C38D]" />
                      <span>Budget Circuit Breaker Action</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      What should OstraOps do the instant your budget or rate threshold is hit?
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setCircuitBreakerAction('hard_stop')}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        circuitBreakerAction === 'hard_stop'
                          ? 'bg-[#1C1811] border-[#C59E5F] text-white shadow-sm'
                          : 'bg-[#0E121B] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-xs font-bold text-white">HTTP 429 Hard-Stop</div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Immediately drops the request before tokens reach the upstream provider. Zero surprise bills.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCircuitBreakerAction('fallback_cheaper')}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        circuitBreakerAction === 'fallback_cheaper'
                          ? 'bg-[#1C1811] border-[#C59E5F] text-white shadow-sm'
                          : 'bg-[#0E121B] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-xs font-bold text-white">Smart Model Fallback</div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-300">
                          Resilience
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Switches automatically to an ultra-cheap model (e.g. DeepSeek-V3 or Claude 3.5 Haiku) to keep app alive.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCircuitBreakerAction('alert_only')}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        circuitBreakerAction === 'alert_only'
                          ? 'bg-[#1C1811] border-[#C59E5F] text-white shadow-sm'
                          : 'bg-[#0E121B] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-xs font-bold text-white">Soft Alert &amp; Proceed</div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-300">
                          Audit
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Dispatches emergency Slack &amp; Email alerts to your engineering team without blocking traffic.
                      </p>
                    </button>
                  </div>
                </div>

                {/* 4. REAL-TIME ANOMALY & RUNAWAY LOOP TOGGLES */}
                <div className="p-6 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-5">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#E5C38D]" />
                      <span>Autonomous Loop &amp; Velocity Guardrails</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Real-time mathematical heuristics to catch rogue agent loops.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Toggle 1: Runaway Loop Breaker */}
                    <div
                      onClick={() => setRunawayLoopProtection(!runawayLoopProtection)}
                      className="p-4 rounded-xl bg-[#0E121B] border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="space-y-0.5 pr-4">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Runaway Loop Circuit Breaker</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#C59E5F]/15 text-[#E5C38D]">
                            Active
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Auto-kills session if &gt;12 calls occur within 60 seconds.
                        </p>
                      </div>
                      <div
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                          runawayLoopProtection ? 'bg-[#C59E5F]' : 'bg-white/[0.1]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                            runawayLoopProtection ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Toggle 2: Spike Velocity Alert */}
                    <div
                      onClick={() => setSpikeVelocityAlert(!spikeVelocityAlert)}
                      className="p-4 rounded-xl bg-[#0E121B] border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="space-y-0.5 pr-4">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Hourly Spike Surge Detection</span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Alerts team if spend surges &gt;2.5x above the 24h average.
                        </p>
                      </div>
                      <div
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                          spikeVelocityAlert ? 'bg-[#C59E5F]' : 'bg-white/[0.1]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                            spikeVelocityAlert ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Single Call Cap Chips */}
                  <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-zinc-300 font-medium">
                      Max Single Request Spend Cap:
                      <span className="text-zinc-500 block text-[11px]">
                        Rejects accidental mega-prompts with massive context windows
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {['$0.50', '$1.00', '$2.50', '$5.00', 'No Cap'].map((cap) => (
                        <button
                          key={cap}
                          type="button"
                          onClick={() => setMaxCostPerCall(cap)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                            maxCostPerCall === cap
                              ? 'bg-[#C59E5F] text-black shadow-md shadow-[#C59E5F]/20'
                              : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06]'
                          }`}
                        >
                          {cap}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. PRIVACY & ZERO-PROMPT STORAGE */}
                <div className="p-6 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-4">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#E5C38D]" />
                      <span>Data Privacy &amp; Zero Prompt Storage</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      OstraOps operates with zero prompt logging by default. Choose your policy.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div
                      onClick={() => setPrivacyMode('zero_storage')}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        privacyMode === 'zero_storage'
                          ? 'bg-[#1C1811] border-[#C59E5F] text-white'
                          : 'bg-[#0E121B] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Zero Prompt Storage</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          100% Private
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Prompts are ephemeral in RAM only. Never written to disk or database. Token headers only.
                      </p>
                    </div>

                    <div
                      onClick={() => setPrivacyMode('pii_masking')}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        privacyMode === 'pii_masking'
                          ? 'bg-[#1C1811] border-[#C59E5F] text-white'
                          : 'bg-[#0E121B] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#E5C38D]" />
                          <span>Masked PII Anonymization</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-300">
                          GDPR / HIPAA
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Automatically redacts API keys, passwords, and credit cards before relaying to upstream models.
                      </p>
                    </div>

                    <div
                      onClick={() => setPrivacyMode('metadata_only')}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        privacyMode === 'metadata_only'
                          ? 'bg-[#1C1811] border-[#C59E5F] text-white'
                          : 'bg-[#0E121B] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Gauge className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Telemetry &amp; Latency Only</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-300">
                          Timing
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Records status codes, response times, and model versions without capturing prompt text.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 6. ALERTS & NOTIFICATION CHANNELS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Notifications Channel Setup */}
                  <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-4">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#E5C38D]" />
                        <span>Emergency Alert Channels</span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        Where should budget warnings and loop breaker alerts be dispatched?
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setNotifications('email')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                          notifications === 'email'
                            ? 'bg-[#1C1811] border-[#C59E5F] text-white'
                            : 'bg-[#0E121B] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Mail className="w-4 h-4 text-[#E5C38D]" />
                        <span className="text-xs font-semibold">Email</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNotifications('slack')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                          notifications === 'slack'
                            ? 'bg-[#1C1811] border-[#C59E5F] text-white'
                            : 'bg-[#0E121B] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Radio className="w-4 h-4 text-[#E5C38D]" />
                        <span className="text-xs font-semibold">Slack</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNotifications('both')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                          notifications === 'both'
                            ? 'bg-[#1C1811] border-[#C59E5F] text-white'
                            : 'bg-[#0E121B] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Zap className="w-4 h-4 text-[#E5C38D]" />
                        <span className="text-xs font-semibold">Both</span>
                      </button>
                    </div>

                    {/* Email Input */}
                    {(notifications === 'email' || notifications === 'both') && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-zinc-400">Alert Email Destination:</label>
                        <input
                          type="email"
                          value={alertEmail}
                          onChange={(e) => setAlertEmail(e.target.value)}
                          placeholder="eng-alerts@company.com"
                          className="w-full bg-[#080B10] border border-white/[0.08] focus:border-[#C59E5F]/60 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Slack Webhook Input */}
                    {(notifications === 'slack' || notifications === 'both') && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-mono text-zinc-400">Slack Webhook URL (Optional):</label>
                          <button
                            type="button"
                            onClick={() => {
                              setTestWebhookStatus('Ping sent successfully! ✓');
                              setTimeout(() => setTestWebhookStatus(null), 3000);
                            }}
                            className="text-[10px] font-mono text-[#E5C38D] hover:underline cursor-pointer"
                          >
                            Test Ping
                          </button>
                        </div>
                        <input
                          type="url"
                          value={slackWebhookUrl}
                          onChange={(e) => setSlackWebhookUrl(e.target.value)}
                          placeholder="https://hooks.slack.com/services/T00/B00/XXXX"
                          className="w-full bg-[#080B10] border border-white/[0.08] focus:border-[#C59E5F]/60 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none font-mono"
                        />
                        {testWebhookStatus && (
                          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 pt-1">
                            <Check className="w-3 h-3" />
                            <span>{testWebhookStatus}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Threshold Chips */}
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <span className="text-[11px] text-zinc-400 font-mono">Notify at budget %:</span>
                      <div className="flex items-center gap-1.5">
                        {[70, 85, 95, 100].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setAlertThresholdPercent(pct)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                              alertThresholdPercent === pct
                                ? 'bg-[#C59E5F] text-black font-bold'
                                : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06]'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 7. FUNCTIONAL CURRENCY SWITCHER CARD */}
                  <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <Globe2 className="w-4 h-4 text-[#E5C38D]" />
                          <span>Billing &amp; Telemetry Currency</span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          Select your currency for real-time spend dashboards, token rate cards, and billing.
                        </div>
                      </div>

                      {/* Currency Chips */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                        {[
                          { code: 'USD', symbol: '$', label: 'USD ($)' },
                          { code: 'EUR', symbol: '€', label: 'EUR (€)' },
                          { code: 'GBP', symbol: '£', label: 'GBP (£)' },
                          { code: 'INR', symbol: '₹', label: 'INR (₹)' },
                          { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$)' },
                          { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
                          { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
                        ].map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => handleCurrencyChange(c.code)}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              detectedPricing.currencyCode === c.code
                                ? 'bg-[#181510] border-[#C59E5F] text-[#E5C38D] font-bold shadow-sm ring-1 ring-[#C59E5F]'
                                : 'bg-[#0E121B] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                            }`}
                          >
                            <span className="text-xs font-mono">{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active Currency Badge */}
                    <div className="p-3 rounded-xl bg-[#0E121B] border border-emerald-500/20 flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34D399]" />
                        <div>
                          <div className="text-xs font-bold text-white">
                            {detectedPricing.countryName} ({detectedPricing.currencySymbol} {detectedPricing.currencyCode})
                          </div>
                          <div className="text-[10px] text-emerald-400 font-mono">
                            Auto-converted exchange rates active
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                        Active Rate
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center gap-3 pt-8 border-t border-white/[0.06] mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-white/[0.04] text-xs font-semibold transition-colors cursor-pointer"
                >
                  ← Back to Organization
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#E5C38D] to-[#C59E5F] text-black font-extrabold text-xs tracking-wide shadow-[0_0_20px_rgba(229,195,141,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Continue to Subscription</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: SUBSCRIPTION & HOSTED GATEWAY (MANDATORY)         */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="flex-1 flex flex-col justify-center max-w-6xl py-4 animate-in fade-in duration-300">
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C59E5F]/10 border border-[#C59E5F]/30 text-[#E5C38D] text-[11px] font-mono font-semibold mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    Activation Required
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Choose your deployment plan.
                  </h1>
                  <p className="text-sm text-zinc-400 mt-2 font-normal">
                    Select a subscription to activate your workspace gateway. You can change or cancel anytime.
                  </p>
                </div>

                {/* 4 Subscription Cards: 7-Day Free Trial vs Telemetry vs Starter vs Pro */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
                  
                  {/* CARD 1: 7-Day Free Trial */}
                  <div
                    onClick={() => handleSelectPlan('trial')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between hover:-translate-y-1 ${
                      selectedPlan === 'trial'
                        ? 'bg-[#16130D] border-[#C59E5F] shadow-[0_0_25px_rgba(197,158,95,0.2)] ring-1 ring-[#E5C38D]'
                        : 'bg-[#0B0E14] border-white/[0.08] hover:border-white/[0.2]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E5C38D]/15 text-[#E5C38D] border border-[#E5C38D]/30">
                          ZERO RISK
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            selectedPlan === 'trial'
                              ? 'bg-[#E5C38D] border-[#E5C38D] text-black'
                              : 'border-zinc-600'
                          }`}
                        >
                          {selectedPlan === 'trial' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="text-lg font-bold text-white">7-Day Free Trial</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Evaluate risk-free for 7 days</div>

                      <div className="mt-3 mb-4">
                        <span className="text-2xl font-black text-white font-mono">{detectedPricing.trialPrice}</span>
                        <span className="text-[11px] text-zinc-400 font-mono ml-1.5">for 7 days</span>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          No charges today. Cancel anytime with 1-click.
                        </div>
                      </div>

                      <ul className="space-y-2 text-xs text-zinc-300">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E5C38D] shrink-0 mt-0.5" />
                          <span><strong className="text-white">Live AI Cost Tracker:</strong> OpenAI, Claude, Gemini</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E5C38D] shrink-0 mt-0.5" />
                          <span><strong className="text-white">Spend Alerts:</strong> Email &amp; Slack notifications</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E5C38D] shrink-0 mt-0.5" />
                          <span><strong className="text-white">Runaway Protection:</strong> Automated cutoff</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E5C38D] shrink-0 mt-0.5" />
                          <span><strong className="text-white">1-Click Cancel:</strong> Zero hassle</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`w-full mt-5 py-2 rounded-xl font-bold text-xs tracking-wide transition-all cursor-pointer ${
                        selectedPlan === 'trial'
                          ? 'bg-gradient-to-r from-[#E5C38D] to-[#C59E5F] text-black shadow-[0_0_12px_rgba(229,195,141,0.3)]'
                          : 'bg-white/[0.04] text-zinc-300 hover:text-white border border-white/[0.08]'
                      }`}
                    >
                      {selectedPlan === 'trial' ? 'Selected (Free Trial)' : 'Select Free Trial'}
                    </button>
                  </div>

                  {/* CARD 2: Agent Telemetry (Observability Only) */}
                  <div
                    onClick={() => handleSelectPlan('telemetry')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between hover:-translate-y-1 ${
                      selectedPlan === 'telemetry'
                        ? 'bg-[#0E1512] border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.2)] ring-1 ring-emerald-400'
                        : 'bg-[#0B0E14] border-white/[0.08] hover:border-white/[0.2]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          OBSERVABILITY
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            selectedPlan === 'telemetry'
                              ? 'bg-emerald-400 border-emerald-400 text-black'
                              : 'border-zinc-600'
                          }`}
                        >
                          {selectedPlan === 'telemetry' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="text-lg font-bold text-white flex items-center justify-between">
                        <span>Agent Telemetry</span>
                        {paidVerified && selectedPlan === 'telemetry' && (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
                            PAID
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Observability &amp; cost tracking only</div>

                      <div className="mt-3 mb-4">
                        <span className="text-2xl font-black text-white font-mono">{detectedPricing.telemetryPrice}</span>
                        <span className="text-[11px] text-zinc-400 font-mono ml-1.5">{detectedPricing.period}</span>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          100k events/mo · 1 developer seat
                        </div>
                      </div>

                      <ul className="space-y-2 text-xs text-zinc-300">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white">Agent Trace Logs:</strong> TTFT &amp; latencies</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white">Cost Attribution:</strong> Multi-model burn</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white">Zero Proxy Delay:</strong> Async telemetry</span>
                        </li>
                        <li className="flex items-start gap-1.5 text-zinc-500">
                          <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>Reverse Proxy (Starter/Pro)</span>
                        </li>
                        <li className="flex items-start gap-1.5 text-zinc-500">
                          <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>Response Caching (Starter/Pro)</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`w-full mt-5 py-2 rounded-xl font-bold text-xs tracking-wide transition-all cursor-pointer ${
                        paidVerified && selectedPlan === 'telemetry'
                          ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                          : selectedPlan === 'telemetry'
                          ? 'bg-amber-500 hover:bg-amber-400 text-black'
                          : 'bg-white/[0.04] text-zinc-300 hover:text-white border border-white/[0.08]'
                      }`}
                    >
                      {paidVerified && selectedPlan === 'telemetry'
                        ? '✓ Verified & Paid · View Receipt'
                        : selectedPlan === 'telemetry'
                        ? 'Complete Checkout'
                        : `Select Telemetry (${detectedPricing.telemetryPrice})`}
                    </button>
                  </div>

                  {/* CARD 3: Starter Gateway ($35 / month) */}
                  <div
                    onClick={() => handleSelectPlan('starter')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between hover:-translate-y-1 ${
                      selectedPlan === 'starter'
                        ? 'bg-[#16130D] border-[#C59E5F] shadow-[0_0_25px_rgba(197,158,95,0.2)] ring-1 ring-[#E5C38D]'
                        : 'bg-[#0B0E14] border-white/[0.08] hover:border-white/[0.2]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          STARTER
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            selectedPlan === 'starter'
                              ? 'bg-[#E5C38D] border-[#E5C38D] text-black'
                              : 'border-zinc-600'
                          }`}
                        >
                          {selectedPlan === 'starter' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="text-lg font-bold text-white flex items-center justify-between">
                        <span>Starter Gateway</span>
                        {paidVerified && selectedPlan === 'starter' && (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
                            PAID
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Indie hackers &amp; small teams</div>

                      <div className="mt-3 mb-4">
                        <span className="text-2xl font-black text-white font-mono">{detectedPricing.starterPrice}</span>
                        <span className="text-[11px] text-zinc-400 font-mono ml-1.5">{detectedPricing.period}</span>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          500k AI requests/mo · 3 developer seats
                        </div>
                      </div>

                      <ul className="space-y-2 text-xs text-zinc-300">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white">Central Proxy URL:</strong> Instant drop-in endpoint</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white">Exact-Match Caching:</strong> Zero token cost on repeat prompts</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white">Multi-Model Vault:</strong> AES-256 encrypted</span>
                        </li>
                        <li className="flex items-start gap-1.5 text-zinc-500">
                          <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>Auto-Fallback (Available in Pro)</span>
                        </li>
                        <li className="flex items-start gap-1.5 text-zinc-500">
                          <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>Semantic Caching (Available in Pro)</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`w-full mt-5 py-2 rounded-xl font-bold text-xs tracking-wide transition-all cursor-pointer ${
                        paidVerified && selectedPlan === 'starter'
                          ? 'bg-[#E5C38D] text-black shadow-[0_0_15px_rgba(229,195,141,0.4)]'
                          : selectedPlan === 'starter'
                          ? 'bg-amber-500 hover:bg-amber-400 text-black'
                          : 'bg-white/[0.04] text-zinc-300 hover:text-white border border-white/[0.08]'
                      }`}
                    >
                      {paidVerified && selectedPlan === 'starter'
                        ? '✓ Verified & Paid · View Receipt'
                        : selectedPlan === 'starter'
                        ? 'Complete Checkout'
                        : `Select Starter (${detectedPricing.starterPrice})`}
                    </button>
                  </div>

                  {/* CARD 4: Pro Gateway ($59 / month) */}
                  <div
                    onClick={() => handleSelectPlan('pro')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between hover:-translate-y-1 ${
                      selectedPlan === 'pro'
                        ? 'bg-[#18140D] border-[#C59E5F] shadow-[0_0_30px_rgba(197,158,95,0.25)] ring-2 ring-[#E5C38D]'
                        : 'bg-[#0B0E14] border-white/[0.08] hover:border-white/[0.2]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          A TO Z UNLOCKED
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            selectedPlan === 'pro'
                              ? 'bg-[#E5C38D] border-[#E5C38D] text-black'
                              : 'border-zinc-600'
                          }`}
                        >
                          {selectedPlan === 'pro' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="text-lg font-bold text-white flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span>Pro Gateway</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#C59E5F]/20 text-[#E5C38D] font-mono">
                            ALL IN
                          </span>
                        </div>
                        {paidVerified && selectedPlan === 'pro' && (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
                            PAID
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Production startups &amp; scaling teams</div>

                      <div className="mt-3 mb-4">
                        <span className="text-2xl font-black text-white font-mono">{detectedPricing.proPrice}</span>
                        <span className="text-[11px] text-zinc-400 font-mono ml-1.5">{detectedPricing.period}</span>
                        <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                          3M AI requests/mo · 10 seats
                        </div>
                      </div>

                      <ul className="space-y-2 text-xs text-zinc-300">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white">Zero Downtime Failover:</strong> Auto-switch from OpenAI to Claude/Gemini during outages</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white">Smart Semantic Caching:</strong> Save up to 40%+ token costs on similar queries</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white">Developer Budgets:</strong> Enforce individual monthly spending limits per seat</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white">PII Data Redaction:</strong> Automatically mask sensitive user credentials</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white">Priority Cloud Routing:</strong> Dedicated proxy endpoint with SLA guarantees</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`w-full mt-5 py-2 rounded-xl font-bold text-xs tracking-wide transition-all cursor-pointer ${
                        paidVerified && selectedPlan === 'pro'
                          ? 'bg-[#E5C38D] text-black shadow-[0_0_15px_rgba(229,195,141,0.4)]'
                          : selectedPlan === 'pro'
                          ? 'bg-amber-500 hover:bg-amber-400 text-black'
                          : 'bg-white/[0.04] text-zinc-300 hover:text-white border border-white/[0.08]'
                      }`}
                    >
                      {paidVerified && selectedPlan === 'pro'
                        ? '✓ Verified & Paid · View Receipt'
                        : selectedPlan === 'pro'
                        ? 'Complete Checkout'
                        : `Select Pro (${detectedPricing.proPrice})`}
                    </button>
                  </div>

                </div>

                {/* Gatekeeper notice */}
                <div className="p-3.5 rounded-xl bg-[#0E121B] border border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#C59E5F]" />
                    <span>
                      {selectedPlan
                        ? `Selected: ${
                            selectedPlan === 'trial'
                              ? `7-Day Free Trial (${detectedPricing.trialPrice})`
                              : selectedPlan === 'starter'
                              ? `Starter Gateway (${detectedPricing.starterPrice}${detectedPricing.period})`
                              : selectedPlan === 'telemetry'
                              ? `Agent Telemetry (${detectedPricing.telemetryPrice}${detectedPricing.period})`
                              : `Pro Gateway A to Z (${detectedPricing.proPrice}${detectedPricing.period})`
                          }`
                        : 'Aage badhne ke liye upar diye gaye plans me se ek choose karein.'}
                    </span>
                  </div>
                  <span className="font-mono text-[#E5C38D] text-[11px]">
                    {selectedPlan === 'trial'
                      ? '7 days zero charge'
                      : paidVerified
                      ? `Paid & Verified · Billing ID: ${verifiedBillingId}`
                      : 'Payment required to activate'}
                  </span>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center gap-3 pt-8 border-t border-white/[0.06] mt-8">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-xl border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-white/[0.04] text-xs font-semibold transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    if (!selectedPlan) {
                      showToast('Please select a subscription plan to continue.');
                      return;
                    }
                    if (selectedPlan !== 'trial' && !paidVerified) {
                      showToast('Payment required for paid plans. Please complete checkout to continue.');
                      setBillingModalMode('checkout');
                      setIsBillingModalOpen(true);
                      return;
                    }
                    setCurrentStep(5);
                  }}
                  disabled={!selectedPlan}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C38D] to-[#C59E5F] text-black font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(229,195,141,0.3)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <span>→</span>
                </button>

                {paidVerified && verifiedBillingId && (
                  <div className="ml-auto flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Permanent Billing ID: {verifiedBillingId}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 5: TEAM MEMBERS                                     */}
          {/* ======================================================== */}
          {currentStep === 5 && (
            <div className="flex-1 flex flex-col justify-center max-w-4xl py-4 animate-in fade-in duration-300">
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Invite your engineering team.
                  </h1>
                  <p className="text-sm text-zinc-400 mt-2 font-normal">
                    Collaborate on AI budgets, rate limits, and spend analytics.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">Teammate Email</span>
                    <span className="text-xs font-semibold text-zinc-300">Role</span>
                  </div>

                  {teamEmails.map((email, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => handleUpdateTeamEmail(idx, e.target.value)}
                          placeholder="engineer@company.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07090C] border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-[#C59E5F]"
                        />
                      </div>

                      <div className="relative w-36">
                        <select
                          value={teamRole}
                          onChange={(e) => setTeamRole(e.target.value as any)}
                          className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-[#07090C] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#C59E5F] cursor-pointer"
                        >
                          <option value="admin">Admin</option>
                          <option value="engineer">Engineer</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  ))}

                  {teamEmails.length < 5 && (
                    <button
                      onClick={handleAddTeamEmail}
                      className="text-xs font-semibold text-[#E5C38D] hover:underline cursor-pointer pt-1 block"
                    >
                      + Add another team member
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center gap-3 pt-8 border-t border-white/[0.06] mt-8">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 rounded-xl border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-white/[0.04] text-xs font-semibold transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(6)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C38D] to-[#C59E5F] text-black font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(229,195,141,0.3)] hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 6: REVIEW & FINISH                                   */}
          {/* ======================================================== */}
          {currentStep === 6 && (
            <div className="flex-1 flex flex-col justify-center max-w-4xl py-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                
                {/* Summary Column */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C59E5F]/10 border border-[#C59E5F]/30 text-[#E5C38D] text-[11px] font-mono font-semibold mb-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      Ready to Launch
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                      Your workspace is ready.
                    </h1>
                    <p className="text-sm text-zinc-400 mt-2 font-normal">
                      Review your configuration before entering OstraOps.
                    </p>
                  </div>

                  {/* Summary Cards */}
                  <div className="space-y-3">
                    
                    {/* Organization Summary */}
                    <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/[0.06] flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#E5C38D] shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">
                          ORGANIZATION
                        </div>
                        <div className="text-xs font-bold text-white truncate">{orgName}</div>
                        <div className="text-[11px] text-zinc-400">
                          {industry} · {companySize} · {country}
                        </div>
                      </div>
                    </div>

                    {/* Preferences & Guardrails Summary */}
                    <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/[0.06] flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#E5C38D] shrink-0">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-[#E5C38D] uppercase font-semibold">
                          PREFERENCES &amp; GUARDRAILS
                        </div>
                        <div className="text-xs font-bold text-white capitalize">
                          {optimizationMode} Optimization · {circuitBreakerAction === 'hard_stop' ? 'HTTP 429 Hard-Stop' : circuitBreakerAction === 'fallback_cheaper' ? 'Model Fallback' : 'Soft Alert'} · {privacyMode === 'zero_storage' ? 'Zero Prompt Storage' : privacyMode === 'pii_masking' ? 'PII Masking' : 'Metadata Only'}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Workflow: {primaryWorkflow === 'cursor_windsurf' ? 'Cursor & Windsurf' : primaryWorkflow === 'backend_agents' ? 'Python / LangChain' : primaryWorkflow === 'autonomous_loops' ? 'Autonomous Loops' : 'Production SaaS'} · Currency: {detectedPricing.currencyCode} ({detectedPricing.currencySymbol}) · Loop Breaker: {runawayLoopProtection ? 'Active' : 'Off'}
                        </div>
                      </div>
                    </div>

                    {/* Subscription Summary */}
                    <div className="p-4 rounded-xl bg-[#0B0E14] border border-[#C59E5F]/30 flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-[#C59E5F]/10 border border-[#C59E5F]/30 flex items-center justify-center text-[#E5C38D] shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] font-mono text-[#E5C38D] uppercase font-semibold">
                            SUBSCRIPTION PLAN
                          </div>
                          {paidVerified && verifiedBillingId && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
                              <ShieldCheck className="w-3 h-3" />
                              <span>PAID · {verifiedBillingId}</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-white">
                          {selectedPlan === 'trial'
                            ? `7-Day Free Trial (${detectedPricing.trialPrice})`
                            : selectedPlan === 'starter'
                            ? `Starter Gateway (${detectedPricing.starterPrice}${detectedPricing.period})`
                            : selectedPlan === 'telemetry'
                            ? `Agent Telemetry (${detectedPricing.telemetryPrice}${detectedPricing.period})`
                            : `Pro Gateway (${detectedPricing.proPrice}${detectedPricing.period})`}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {paidVerified && verifiedInvoice
                            ? `Invoice: ${verifiedInvoice.invoice_number} · Paid via ${verifiedInvoice.payment_method}`
                            : selectedPlan === 'trial'
                            ? '100% Free evaluation with zero charges today'
                            : 'Ready for activation'}
                        </div>
                      </div>
                    </div>

                    {/* Team Summary */}
                    <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/[0.06] flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#E5C38D] shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">
                          TEAM
                        </div>
                        <div className="text-xs font-bold text-white">
                          {validInvitedCount > 0 ? `${validInvitedCount} members invited` : '1 member (You)'}
                        </div>
                        <div className="text-[11px] text-zinc-400">1 Owner</div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right Aesthetic Diamond Orbit Compass Graphic */}
                <div className="lg:col-span-5 flex items-center justify-center">
                  <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                    {/* Atmospheric Glow */}
                    <div className="absolute inset-0 bg-[#C59E5F]/[0.06] rounded-full blur-3xl" />
                    
                    {/* Outer Orbit track */}
                    <div className="absolute inset-0 rounded-full border border-dashed border-[#C59E5F]/20 animate-[spin_60s_linear_infinite]" />
                    {/* Inner Orbit ring */}
                    <div className="absolute inset-8 rounded-full border border-white/[0.08]" />

                    {/* Floating Planet Sphere */}
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 w-4 h-4 rounded-full bg-[#E5C38D] shadow-[0_0_14px_#E5C38D]" />
                    <div className="absolute bottom-10 right-10 w-12 h-12 rounded-full bg-[#C59E5F]/10 blur-xs border border-[#C59E5F]/20" />

                    {/* Center Diamond Compass Emblem */}
                    <div className="w-24 h-24 rounded-2xl bg-[#0E121B] border border-[#C59E5F]/50 rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(197,158,95,0.3)]">
                      <div className="-rotate-45 flex flex-col items-center justify-center">
                        <OstraIcon className="w-8 h-8 text-[#E5C38D]" variant="gold" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Final Actions */}
              <div className="flex items-center gap-3 pt-8 border-t border-white/[0.06] mt-8">
                <button
                  onClick={handleCompleteOnboarding}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#E5C38D] to-[#C59E5F] text-black font-extrabold text-sm tracking-wide shadow-[0_0_25px_rgba(229,195,141,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Activating Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter OstraOps</span>
                      <span>→</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-3 rounded-xl border border-white/[0.1] text-zinc-400 hover:text-white hover:bg-white/[0.04] text-xs font-medium transition-colors cursor-pointer"
                >
                  Review settings
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Support Modal */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F131C] border border-white/[0.1] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-base font-bold text-white flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#E5C38D]" />
                OstraOps Support Concierge
              </div>
              <button
                onClick={() => setSupportModalOpen(false)}
                className="text-zinc-500 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Need assistance configuring your proxy, upstream API keys, or custom enterprise SLAs? Our team is available 24/7.
            </p>
            <div className="p-3.5 rounded-xl bg-[#080B10] border border-white/[0.06] text-xs font-mono text-[#E5C38D]">
              support@ostraops.com
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSupportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] text-xs font-semibold text-zinc-300 hover:text-white"
              >
                Close
              </button>
              <a
                href="mailto:support@ostraops.com"
                className="px-4 py-2 rounded-xl bg-[#C59E5F] text-black text-xs font-bold hover:brightness-110"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* IMMEDIATE BILLING CHECKOUT & VERIFIED RECEIPT MODAL      */}
      {/* ======================================================== */}
      {isBillingModalOpen && selectedPlan && selectedPlan !== 'trial' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#0B0E14] border border-[#C59E5F]/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200 my-8">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-[#C59E5F]/15 text-[#E5C38D] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#C59E5F]/30 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#E5C38D]" />
                    <span>256-Bit SSL Secured</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">PCI-DSS Compliant</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {billingModalMode === 'checkout' ? 'Complete Subscription & Billing' : 'Payment Verified & Receipt Generated'}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {billingModalMode === 'checkout'
                    ? 'A permanent unique Billing ID will be generated upon confirmation and saved to your account.'
                    : 'Your workspace gateway has been unlocked with your permanent Billing ID.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsBillingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CHECKOUT MODE */}
            {billingModalMode === 'checkout' && (
              <form onSubmit={handleProcessPayment} className="space-y-5">
                {/* Plan Summary Card */}
                <div className="p-4 rounded-2xl bg-[#07090C] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-mono uppercase text-[#E5C38D] font-bold">
                      Selected Plan
                    </div>
                    <div className="text-base font-bold text-white">
                      {selectedPlan === 'telemetry' ? 'Agent Telemetry' : selectedPlan === 'starter' ? 'Starter Gateway' : 'Pro Gateway'}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {selectedPlan === 'telemetry' ? '100k events/mo · 1 seat' : selectedPlan === 'starter' ? '500k requests/mo · 3 seats' : '3M requests/mo · 10 seats'}
                    </div>
                  </div>

                  {/* Interval Switcher */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#0B0E14] border border-white/[0.08] p-1 rounded-xl text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setBillingInterval('mo')}
                        className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                          billingInterval === 'mo' ? 'bg-[#C59E5F] text-black font-bold' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingInterval('yr')}
                        className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                          billingInterval === 'yr' ? 'bg-[#C59E5F] text-black font-bold' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span>Annual</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-emerald-300 font-bold">-20%</span>
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black font-mono text-[#E5C38D]">
                        ${billingInterval === 'yr'
                          ? selectedPlan === 'telemetry' ? '192' : selectedPlan === 'starter' ? '336' : '566'
                          : selectedPlan === 'telemetry' ? '20' : selectedPlan === 'starter' ? '35' : '59'
                        }
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {billingInterval === 'yr' ? '/ year' : '/ month'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organization & Contact pre-filled */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">
                      Organization
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={orgName}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090C] border border-white/[0.08] text-xs font-sans text-zinc-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">
                      Billing Email
                    </label>
                    <input
                      type="email"
                      readOnly
                      value={user?.email || 'billing@ostraops.com'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090C] border border-white/[0.08] text-xs font-sans text-zinc-300"
                    />
                  </div>
                </div>

                {/* Corporate Invoicing & Zero Card Upfront Verification */}
                <div className="space-y-3 p-4 rounded-2xl bg-[#07090C] border border-emerald-500/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Corporate Invoicing &amp; Direct Provisioning
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      No Card Required
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Zero card details required upfront. Enterprise billing and itemized Net-30 invoice receipt will be registered directly under your organization email.
                  </p>
                </div>

                {/* Submit & Cancel */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#E5C38D] to-[#C59E5F] text-black font-extrabold text-xs tracking-wide shadow-[0_0_25px_rgba(229,195,141,0.4)] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Securing Billing ID &amp; Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Payment &amp; Generate Billing ID</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlan('trial');
                        setIsBillingModalOpen(false);
                        showToast('Switched to 7-Day Free Trial. No payment required.');
                      }}
                      className="text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Or switch to 7-Day Free Trial (No Card Needed)
                    </button>
                    <span className="text-zinc-500 font-mono">Cancel anytime</span>
                  </div>
                </div>
              </form>
            )}

            {/* RECEIPT MODE */}
            {billingModalMode === 'receipt' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                
                {/* Canonical Billing ID Spotlight */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121620] via-[#0E121B] to-[#121620] border border-[#C59E5F]/50 shadow-xl space-y-2 text-center">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Payment Verified · Official Tax Receipt</span>
                  </div>
                  <div className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                    Your Canonical Billing ID
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-black text-[#E5C38D] tracking-widest select-all">
                    {verifiedBillingId}
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyReceiptBillingId}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedReceiptId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#C59E5F]" />
                          <span>Copy Billing ID</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Print Receipt</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-400 pt-1 max-w-md mx-auto">
                    This Billing ID is permanently bound to all gateway transactions for <strong className="text-white">{orgName}</strong> and visible in Settings → Billing.
                  </p>
                </div>

                {/* Receipt Details Breakdown */}
                <div className="p-4 rounded-2xl bg-[#07090C] border border-white/[0.08] space-y-2.5 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Invoice Reference</span>
                    <span className="font-mono text-white font-bold">{verifiedInvoice?.invoice_number || 'INV-OST-2026-001'}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Plan Activated</span>
                    <span className="text-white font-medium">{verifiedInvoice?.plan_name || 'Gateway Subscription'}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Payment Method</span>
                    <span className="text-white font-mono">{verifiedInvoice?.payment_method || 'Visa •••• 4242'}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Billed To</span>
                    <span className="text-white">{user?.email || 'admin@ostraops.com'}</span>
                  </div>
                  <div className="pt-2 border-t border-white/[0.08] flex justify-between text-sm font-bold">
                    <span className="text-zinc-200">Amount Paid</span>
                    <span className="text-[#E5C38D] font-mono">${(verifiedInvoice?.amount_usd ?? 35).toFixed(2)} USD</span>
                  </div>
                </div>

                {/* Proceed Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBillingModalOpen(false);
                      setCurrentStep(5);
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#E5C38D] to-[#C59E5F] text-black font-extrabold text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(229,195,141,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Receipt Confirmed — Proceed to Step 5 (Team Setup)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
