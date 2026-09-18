import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Users,
  Check,
  ChevronDown,
  User,
  Mail,
  CreditCard,
  ArrowDown,
  Edit2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { OstraLogoAuth } from '../components/AuthGraphics';

interface OnboardingPageProps {
  onNavigate: (route: string) => void;
  initialStep?: number;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onNavigate,
  initialStep = 1,
}) => {
  const { user, profile, subscription, updateProfile, updateSubscription } = useAuth();

  const [step, setStep] = useState<number>(() => {
    const hash = window.location.hash;
    const match = hash.match(/step=(\d+)/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (parsed >= 1 && parsed <= 5) return parsed;
    }
    return initialStep;
  });

  // Step 2: Organization Form State
  const [orgName, setOrgName] = useState('Acme Corp');
  const [industry, setIndustry] = useState('AI & Machine Learning');
  const [teamSize, setTeamSize] = useState('2 - 10 members');

  // Step 3: Plan Selection State
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'solo' | 'team' | 'enterprise'>(() => {
    if (subscription?.plan_id === 'team_scale') return 'team';
    if (subscription?.plan_id === 'enterprise') return 'enterprise';
    return 'team'; // Default to Team (Hosted Gateway) or user selection
  });
  const [isFinishing, setIsFinishing] = useState(false);

  // Step 4: Profile State (Prefilled from auth if available)
  const [fullName, setFullName] = useState(profile?.full_name || 'Shaan Prasad');
  const [email, setEmail] = useState(user?.email || 'shaan@example.com');
  const [role, setRole] = useState('Developer');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Sync auth state if it loads after mount
  useEffect(() => {
    if (profile?.full_name && fullName === 'Shaan Prasad') {
      setFullName(profile.full_name);
    }
    if (user?.email && email === 'shaan@example.com') {
      setEmail(user.email);
    }
  }, [profile, user]);

  const goToStep = (targetStep: number) => {
    if (targetStep >= 1 && targetStep <= 5) {
      setStep(targetStep);
      window.history.pushState(null, '', `#onboarding?step=${targetStep}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinishOnboarding = async () => {
    setIsFinishing(true);
    try {
      if (profile || user) {
        await updateProfile({
          full_name: fullName,
          company_name: orgName,
          job_title: role,
        });
      }

      if (selectedPlan === 'team') {
        await updateSubscription({
          plan_id: 'team_scale',
          plan_name: 'Team Scale',
          price_amount: billingCycle === 'monthly' ? 49 : 39,
          billing_interval: billingCycle === 'monthly' ? 'mo' : 'yr',
          status: 'active',
          quota_limit: 500000,
          quota_used: 12000,
          quota_usage_percent: 2.4,
          renewal_date: billingCycle === 'monthly' ? '18 Oct, 2026' : '18 Sep, 2027',
        });
        onNavigate('dashboard');
      } else if (selectedPlan === 'enterprise') {
        await updateSubscription({
          plan_id: 'enterprise',
          plan_name: 'Enterprise Ultra',
          price_amount: 299,
          billing_interval: 'mo',
          status: 'active',
          quota_limit: 5000000,
          quota_used: 45000,
          quota_usage_percent: 0.9,
          renewal_date: '18 Oct, 2026',
        });
        onNavigate('dashboard');
      } else {
        // Solo plan -> Local-First Telemetry & Guard Console
        await updateSubscription({
          plan_id: 'solo_pro',
          plan_name: 'Solo Pro',
          price_amount: billingCycle === 'monthly' ? 12 : 10,
          billing_interval: billingCycle === 'monthly' ? 'mo' : 'yr',
          status: 'active',
          quota_limit: 100000,
          quota_used: 74000,
          quota_usage_percent: 74,
          renewal_date: billingCycle === 'monthly' ? '18 Oct, 2026' : '18 Sep, 2027',
        });
        onNavigate('solo-guard');
      }
    } catch (err) {
      console.warn('Failed to update subscription on onboarding finish:', err);
      if (selectedPlan === 'solo') {
        onNavigate('solo-guard');
      } else {
        onNavigate('dashboard');
      }
    } finally {
      setIsFinishing(false);
    }
  };

  // User initials for Step 4 preview
  const initials = fullName
    ? fullName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SP';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#16181B] font-sans flex flex-col justify-between selection:bg-[#E2BA7D]/30 selection:text-[#16181B]">
      {/* ================================================================ */}
      {/* Global Onboarding Navigation Header                               */}
      {/* ================================================================ */}
      <header className="w-full max-w-[1540px] mx-auto px-6 sm:px-10 lg:px-14 py-6 flex items-center justify-between relative z-30">
        {/* Brand Logo (Dark variant for light background) */}
        <div className="flex items-center gap-3">
          <OstraLogoAuth
            className="w-8 h-8"
            textClassName="text-2xl font-bold tracking-tight text-[#0B0F0F] font-sans"
            variant="charcoal"
          />
        </div>

        {/* Step Indicator and Progress Line */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#8C827A] tracking-wider">
              {step}/5
            </span>
            {/* Progress Track */}
            <div className="w-20 sm:w-28 h-[2.5px] bg-[#E6DFD5] rounded-full overflow-hidden relative">
              <div
                className="h-full bg-[#16181B] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Quick Exit */}
          {step > 1 && (
            <button
              onClick={() => goToStep(step - 1)}
              className="hidden sm:flex items-center gap-1 text-xs font-medium text-[#8C827A] hover:text-[#16181B] transition-colors cursor-pointer ml-3 px-2.5 py-1 rounded-lg hover:bg-black/5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
        </div>
      </header>

      {/* ================================================================ */}
      {/* Step Content Wrapper                                              */}
      {/* ================================================================ */}
      <main className="flex-1 flex items-center justify-center w-full max-w-[1540px] mx-auto px-6 sm:px-10 lg:px-14 py-4 sm:py-8 relative z-20">
        {/* -------------------------------------------------------------- */}
        {/* STEP 1: WELCOME TO OSTRA                                       */}
        {/* -------------------------------------------------------------- */}
        {step === 1 && (
          <div className="w-full rounded-[32px] overflow-hidden border border-[#EBE3D7] bg-[#FAF7F2] shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[640px] lg:min-h-[720px] relative">
            {/* Background 3D Traveler Image (Full-bleed right, soft-gradient into left) */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
              <img
                src="/onboarding_hero_1.jpg"
                alt="Welcome to Ostra 3D Scene"
                className="w-full h-full object-cover object-right lg:object-center"
              />
              {/* Soft Sandstone Gradient Overlay on Left to preserve pure text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/90 to-transparent lg:w-3/5" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2]/80 via-transparent to-transparent lg:hidden" />
            </div>

            {/* Left Content Column */}
            <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative z-10">
              <div className="space-y-6 pt-4 sm:pt-8 max-w-xl">
                <span className="text-[11px] font-mono tracking-widest text-[#968A7C] uppercase font-semibold block">
                  WELCOME TO OSTRA
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#16181B] tracking-tight leading-[1.15]">
                  Your AI infrastructure, under control.
                </h1>
                <div className="space-y-2 pt-2 text-[#635B50] text-sm sm:text-base leading-relaxed max-w-md">
                  <p className="font-semibold text-[#16181B]">
                    Monitor. Govern. Optimize.
                  </p>
                  <p>
                    Ostra gives you complete visibility and control over your
                    LLM usage, costs and agents — so you can build without
                    limits.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-6">
                  <button
                    onClick={() => goToStep(2)}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#16181B] text-white font-medium text-sm hover:bg-black transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => goToStep(5)}
                    className="px-6 py-3.5 rounded-full bg-[#EFE9DF]/80 hover:bg-[#EFE9DF] text-[#635B50] hover:text-[#16181B] font-medium text-sm transition-all border border-[#E2DAD0] cursor-pointer"
                  >
                    Skip for now
                  </button>
                </div>
              </div>

              {/* Bottom Subtle Indicator */}
              <div className="pt-8 flex items-center gap-2 text-xs text-[#968A7C] font-mono">
                <div className="w-5 h-5 rounded-full border border-[#D5CBBF] flex items-center justify-center">
                  <ArrowDown className="w-3 h-3 text-[#968A7C]" />
                </div>
                <span>Scroll to continue</span>
              </div>
            </div>

            {/* Right Column: Empty container so background image shines through */}
            <div className="hidden lg:col-span-6 lg:block relative z-10 pointer-events-none" />
          </div>
        )}

        {/* -------------------------------------------------------------- */}
        {/* STEP 2: TELL US ABOUT YOUR ORGANIZATION                       */}
        {/* -------------------------------------------------------------- */}
        {step === 2 && (
          <div className="w-full rounded-[32px] overflow-hidden border border-[#EBE3D7] bg-[#FAF7F2] shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[640px] lg:min-h-[720px] relative">
            {/* Background Modern Office Image */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
              <img
                src="/onboarding_office_2.jpg"
                alt="Modern Architecture Office"
                className="w-full h-full object-cover object-right"
              />
              {/* Soft Sandstone Gradient Overlay on Left */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/95 to-transparent lg:w-3/5" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2]/90 via-transparent to-transparent lg:hidden" />
            </div>

            {/* Left Form Column */}
            <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative z-10">
              <div className="space-y-6 max-w-lg">
                <div>
                  <span className="text-[11px] font-mono tracking-widest text-[#968A7C] uppercase font-semibold block mb-2">
                    ORGANIZATION
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#16181B] tracking-tight">
                    Tell us about your organization.
                  </h2>
                  <p className="text-sm text-[#736A5E] mt-2 leading-relaxed">
                    This helps us set up your workspace, invite your team and
                    manage permissions.
                  </p>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 pt-2">
                  {/* Org Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A433A] block">
                      Organization name
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full bg-white/90 border border-[#DDD3C5] rounded-xl px-4 py-3 text-sm text-[#16181B] placeholder:text-[#A89F92] focus:outline-none focus:border-[#C59E5F] focus:ring-1 focus:ring-[#C59E5F]/30 shadow-xs transition-all font-sans"
                    />
                  </div>

                  {/* Industry */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A433A] block">
                      Industry
                    </label>
                    <div className="relative">
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full bg-white/90 border border-[#DDD3C5] rounded-xl px-4 py-3 text-sm text-[#16181B] appearance-none focus:outline-none focus:border-[#C59E5F] focus:ring-1 focus:ring-[#C59E5F]/30 shadow-xs transition-all font-sans cursor-pointer"
                      >
                        <option value="AI & Machine Learning">
                          AI & Machine Learning
                        </option>
                        <option value="SaaS & Software">
                          SaaS & Software
                        </option>
                        <option value="Fintech & Banking">
                          Fintech & Banking
                        </option>
                        <option value="Healthcare & Life Sciences">
                          Healthcare & Life Sciences
                        </option>
                        <option value="E-Commerce & Retail">
                          E-Commerce & Retail
                        </option>
                        <option value="DevTools & Infrastructure">
                          DevTools & Infrastructure
                        </option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#8C827A] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Team Size */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A433A] block">
                      Team size
                    </label>
                    <div className="relative">
                      <select
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        className="w-full bg-white/90 border border-[#DDD3C5] rounded-xl px-4 py-3 text-sm text-[#16181B] appearance-none focus:outline-none focus:border-[#C59E5F] focus:ring-1 focus:ring-[#C59E5F]/30 shadow-xs transition-all font-sans cursor-pointer"
                      >
                        <option value="Solo (Just me)">Solo (Just me)</option>
                        <option value="2 - 10 members">2 - 10 members</option>
                        <option value="11 - 50 members">11 - 50 members</option>
                        <option value="51 - 200 members">51 - 200 members</option>
                        <option value="200+ members">200+ members</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#8C827A] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Informational Pill */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#EFE9DF]/80 border border-[#E2DAD0] text-xs text-[#635B50]">
                  <div className="w-7 h-7 rounded-lg bg-[#E2DAD0] flex items-center justify-center shrink-0 text-[#16181B]">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>You can always add more team members later.</span>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="pt-8 flex items-center justify-between border-t border-[#EBE3D7]">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="text-xs font-medium text-[#8C827A] hover:text-[#16181B] transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#16181B] text-white font-medium text-sm hover:bg-black transition-all shadow-md cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="hidden lg:col-span-6 lg:flex items-center justify-center p-12 relative z-10">
              <div className="w-full max-w-[340px] bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-[#E6DFD5] shadow-2xl space-y-4 transform hover:scale-[1.02] transition-transform">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E6DFD5] flex items-center justify-center text-[#16181B]">
                    <Building2 className="w-5 h-5 text-[#C59E5F]" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E6DFD5] text-[#8C827A]">
                    LIVE PREVIEW
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#16181B]">
                    {orgName || 'Acme Corp'}
                  </h3>
                  <p className="text-xs text-[#8C827A] mt-0.5">
                    {industry} · {teamSize}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-between text-xs text-[#635B50]">
                  <div className="flex items-center -space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#16181B] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                      {initials}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#C59E5F] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                      AC
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#EAE3D8] text-[#16181B] text-[9px] font-bold flex items-center justify-center border-2 border-white">
                      +
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#8C827A]">
                    2 members · 1 project
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------- */}
        {/* STEP 3: PICK THE PLAN THAT FITS YOUR NEEDS                    */}
        {/* -------------------------------------------------------------- */}
        {step === 3 && (
          <div className="w-full rounded-[32px] overflow-hidden border border-[#EBE3D7] bg-[#FAF7F2] shadow-xl p-6 sm:p-10 lg:p-12 space-y-8 relative">
            {/* Top Heading & Billing Cycle Switcher */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EBE3D7] pb-6">
              <div className="space-y-1.5 max-w-lg">
                <span className="text-[11px] font-mono tracking-widest text-[#968A7C] uppercase font-semibold block">
                  CHOOSE PLAN
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#16181B] tracking-tight">
                  Pick the plan that fits your needs.
                </h2>
                <p className="text-sm text-[#736A5E]">
                  Start free and scale as you grow. No hidden fees, no
                  long-term commitments.
                </p>
              </div>

              {/* Monthly / Yearly Switcher Pill */}
              <div className="flex items-center gap-1 p-1 rounded-full bg-[#EFE9DF] border border-[#E2DAD0] self-start md:self-auto text-xs font-semibold select-none">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-[#16181B] text-white shadow-xs'
                      : 'text-[#635B50] hover:text-[#16181B]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                    billingCycle === 'yearly'
                      ? 'bg-[#16181B] text-white shadow-xs'
                      : 'text-[#635B50] hover:text-[#16181B]'
                  }`}
                >
                  <span>Yearly</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E2BA7D] text-[#16181B] font-bold">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* 3 Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Solo */}
              <div
                onClick={() => setSelectedPlan('solo')}
                className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all cursor-pointer relative ${
                  selectedPlan === 'solo'
                    ? 'bg-white border-2 border-[#C59E5F] shadow-xl ring-2 ring-[#C59E5F]/15'
                    : 'bg-white/60 hover:bg-white border border-[#E6DFD5] shadow-xs'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#16181B]">Solo</h3>
                      <p className="text-xs text-[#8C827A] mt-0.5">
                        For individual developers
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16181B] text-white">
                      Most Popular
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#16181B]">
                        {billingCycle === 'monthly' ? '$12' : '$10'}
                      </span>
                      <span className="text-xs text-[#8C827A]">/month</span>
                    </div>
                    <span className="text-[11px] text-[#8C827A] block mt-0.5">
                      (global pricing)
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-[#F0EAE1] text-xs text-[#4A433A]">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] shrink-0" />
                      <span>Local-first telemetry</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] shrink-0" />
                      <span>Up to 5 model integrations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] shrink-0" />
                      <span>Basic analytics & alerts</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedPlan === 'solo'
                        ? 'bg-[#16181B] text-white shadow-xs'
                        : 'bg-[#FAF7F2] border border-[#E6DFD5] text-[#16181B]'
                    }`}
                  >
                    {selectedPlan === 'solo' ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
              </div>

              {/* Card 2: Team */}
              <div
                onClick={() => setSelectedPlan('team')}
                className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all cursor-pointer relative ${
                  selectedPlan === 'team'
                    ? 'bg-white border-2 border-[#C59E5F] shadow-xl ring-2 ring-[#C59E5F]/15'
                    : 'bg-white/60 hover:bg-white border border-[#E6DFD5] shadow-xs'
                }`}
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#16181B]">Team</h3>
                    <p className="text-xs text-[#8C827A] mt-0.5">
                      For growing teams
                    </p>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#16181B]">
                        {billingCycle === 'monthly' ? '$49' : '$39'}
                      </span>
                      <span className="text-xs text-[#8C827A]">/month</span>
                    </div>
                    <span className="text-[11px] text-[#8C827A] block mt-0.5">
                      (global pricing)
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-[#F0EAE1] text-xs text-[#4A433A]">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] shrink-0" />
                      <span>Team collaboration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] shrink-0" />
                      <span>Up to 20 integrations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] shrink-0" />
                      <span>Advanced analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] shrink-0" />
                      <span>Role-based access</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedPlan === 'team'
                        ? 'bg-[#16181B] text-white shadow-xs'
                        : 'bg-[#FAF7F2] border border-[#E6DFD5] text-[#16181B]'
                    }`}
                  >
                    {selectedPlan === 'team' ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
              </div>

              {/* Card 3: Enterprise */}
              <div
                onClick={() => setSelectedPlan('enterprise')}
                className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all cursor-pointer relative ${
                  selectedPlan === 'enterprise'
                    ? 'bg-white border-2 border-[#C59E5F] shadow-xl ring-2 ring-[#C59E5F]/15'
                    : 'bg-white/60 hover:bg-white border border-[#E6DFD5] shadow-xs'
                }`}
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#16181B]">
                      Enterprise
                    </h3>
                    <p className="text-xs text-[#8C827A] mt-0.5">
                      For large organizations
                    </p>
                  </div>

                  <div>
                    <div className="text-3xl sm:text-4xl font-extrabold text-[#16181B]">
                      Custom
                    </div>
                    <span className="text-[11px] text-[#8C827A] block mt-0.5">
                      Tailored volume & SLA
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-[#F0EAE1] text-xs text-[#4A433A]">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] shrink-0" />
                      <span>SSO & advanced RBAC</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] shrink-0" />
                      <span>Unlimited integrations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] shrink-0" />
                      <span>Dedicated support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C59E5F] shrink-0" />
                      <span>Custom deployment</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedPlan === 'enterprise'
                        ? 'bg-[#16181B] text-white shadow-xs'
                        : 'bg-[#FAF7F2] border border-[#E6DFD5] text-[#16181B]'
                    }`}
                  >
                    {selectedPlan === 'enterprise' ? 'Selected' : 'Contact Sales'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 flex items-center justify-between border-t border-[#EBE3D7]">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="text-xs font-medium text-[#8C827A] hover:text-[#16181B] transition-colors cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => goToStep(4)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#16181B] text-white font-medium text-sm hover:bg-black transition-all shadow-md cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------- */}
        {/* STEP 4: SET UP YOUR PROFILE                                   */}
        {/* -------------------------------------------------------------- */}
        {step === 4 && (
          <div className="w-full rounded-[32px] overflow-hidden border border-[#EBE3D7] bg-[#FAF7F2] shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[640px] lg:min-h-[720px] relative">
            {/* Background Modern Desk Workspace */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
              <img
                src="/onboarding_desk_4.jpg"
                alt="Modern Workspace Desk"
                className="w-full h-full object-cover object-right"
              />
              {/* Soft Sandstone Gradient Overlay on Left */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/95 to-transparent lg:w-3/5" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2]/90 via-transparent to-transparent lg:hidden" />
            </div>

            {/* Left Form Column */}
            <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative z-10">
              <div className="space-y-6 max-w-lg">
                <div>
                  <span className="text-[11px] font-mono tracking-widest text-[#968A7C] uppercase font-semibold block mb-2">
                    PROFILE
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#16181B] tracking-tight">
                    Set up your profile.
                  </h2>
                  <p className="text-sm text-[#736A5E] mt-2 leading-relaxed">
                    This helps us personalize your experience and keep your
                    account secure.
                  </p>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 pt-2">
                  {/* Full name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A433A] block">
                      Full name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Shaan Prasad"
                        style={{ paddingLeft: '2.5rem' }}
                        className="w-full bg-white/90 border border-[#DDD3C5] rounded-xl pr-4 py-3 text-sm text-[#16181B] placeholder:text-[#A89F92] focus:outline-none focus:border-[#C59E5F] focus:ring-1 focus:ring-[#C59E5F]/30 shadow-xs transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Email address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A433A] block">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="shaan@example.com"
                        style={{ paddingLeft: '2.5rem' }}
                        className="w-full bg-white/90 border border-[#DDD3C5] rounded-xl pr-4 py-3 text-sm text-[#16181B] placeholder:text-[#A89F92] focus:outline-none focus:border-[#C59E5F] focus:ring-1 focus:ring-[#C59E5F]/30 shadow-xs transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A433A] block">
                      Role
                    </label>
                    <div className="relative">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-white/90 border border-[#DDD3C5] rounded-xl px-4 py-3 text-sm text-[#16181B] appearance-none focus:outline-none focus:border-[#C59E5F] focus:ring-1 focus:ring-[#C59E5F]/30 shadow-xs transition-all font-sans cursor-pointer"
                      >
                        <option value="Developer">Developer</option>
                        <option value="Engineering Lead">Engineering Lead</option>
                        <option value="Founder / Executive">
                          Founder / Executive
                        </option>
                        <option value="AI / ML Engineer">AI / ML Engineer</option>
                        <option value="DevOps / Platform SRE">
                          DevOps / Platform SRE
                        </option>
                        <option value="Product Manager">Product Manager</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#8C827A] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-center gap-2 text-xs text-[#635B50] cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 rounded bg-white border-[#DDD3C5] text-[#16181B] focus:ring-0 cursor-pointer accent-[#16181B]"
                    />
                    <span>
                      I agree to the{' '}
                      <span className="underline font-medium text-[#16181B]">
                        Terms of Service
                      </span>{' '}
                      and{' '}
                      <span className="underline font-medium text-[#16181B]">
                        Privacy Policy
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="pt-8 flex items-center justify-between border-t border-[#EBE3D7]">
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="text-xs font-medium text-[#8C827A] hover:text-[#16181B] transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(5)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#16181B] text-white font-medium text-sm hover:bg-black transition-all shadow-md cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Live Profile Preview Card */}
            <div className="hidden lg:col-span-6 lg:flex flex-col items-center justify-center p-12 relative z-10">
              <div className="w-full max-w-[340px] bg-white/85 backdrop-blur-md p-6 rounded-2xl border border-[#E6DFD5] shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[#16181B] text-white font-bold text-sm flex items-center justify-center">
                      {initials}
                    </div>
                    <div className="w-4 h-4 rounded-full bg-[#C59E5F] text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 border border-white text-[8px]">
                      <Edit2 className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#16181B]">
                      {fullName || 'Shaan Prasad'}
                    </h3>
                    <p className="text-xs text-[#8C827A]">
                      {email || 'shaan@example.com'}
                    </p>
                    <span className="inline-block text-[10px] px-2 py-0.5 mt-1 rounded bg-[#EFE9DF] text-[#635B50] font-medium">
                      {role}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-[#F0EAE1] text-xs text-[#635B50]">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-3.5 h-3.5 text-[#8C827A]" />
                    <div>
                      <span className="text-[#8C827A] text-[10.5px] block leading-none">
                        Organization
                      </span>
                      <span className="font-semibold text-[#16181B]">
                        {orgName || 'Acme Corp'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <User className="w-3.5 h-3.5 text-[#8C827A]" />
                    <div>
                      <span className="text-[#8C827A] text-[10.5px] block leading-none">
                        Role
                      </span>
                      <span className="font-semibold text-[#16181B]">{role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#8C827A]" />
                    <div>
                      <span className="text-[#8C827A] text-[10.5px] block leading-none">
                        Plan
                      </span>
                      <span className="font-semibold text-[#16181B]">
                        {selectedPlan === 'solo'
                          ? 'Solo · $12/month'
                          : selectedPlan === 'team'
                          ? 'Team · $49/month'
                          : 'Enterprise · Custom'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Handwritten Note Annotation */}
              <div className="mt-8 text-center select-none font-serif italic text-sm text-[#736A5E]">
                <span>Your journey starts here. ↗</span>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------- */}
        {/* STEP 5: YOU'RE ALL SET!                                       */}
        {/* -------------------------------------------------------------- */}
        {step === 5 && (
          <div className="w-full rounded-[32px] overflow-hidden border border-[#EBE3D7] bg-[#FAF7F2] shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[640px] lg:min-h-[720px] relative">
            {/* Background 3D Tablet Dashboard Image */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
              <img
                src="/onboarding_tablet_5.jpg"
                alt="Ostra Live Telemetry Dashboard Tablet"
                className="w-full h-full object-cover object-right"
              />
              {/* Soft Sandstone Gradient Overlay on Left */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/95 to-transparent lg:w-3/5" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2]/90 via-transparent to-transparent lg:hidden" />
            </div>

            {/* Left Content Column */}
            <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative z-10">
              <div className="space-y-6 pt-4 sm:pt-8 max-w-lg">
                <span className="text-[11px] font-mono tracking-widest text-[#968A7C] uppercase font-semibold block">
                  YOU'RE ALL SET
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#16181B] tracking-tight leading-[1.15]">
                  {selectedPlan === 'solo' ? 'Welcome to Solo Guard!' : 'Welcome to Ostra!'}
                </h1>
                <p className="text-sm sm:text-base text-[#635B50] leading-relaxed max-w-md">
                  {selectedPlan === 'solo'
                    ? 'Your local-first telemetry & guardrail console is ready. Enjoy edge security with zero cloud retention.'
                    : 'Your hosted gateway workspace is ready. High-velocity routing, intra-family failover, and live analytics are active.'}
                </p>

                {/* Primary CTA */}
                <div className="pt-4 space-y-3">
                  <button
                    onClick={handleFinishOnboarding}
                    disabled={isFinishing}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#16181B] text-white font-medium text-sm hover:bg-black transition-all shadow-lg hover:shadow-xl cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
                  >
                    {isFinishing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Configuring environment...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {selectedPlan === 'solo'
                            ? 'Open Local-First Console'
                            : 'Go to Hosted Gateway Dashboard'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div>
                    <button
                      onClick={handleFinishOnboarding}
                      disabled={isFinishing}
                      className="text-xs text-[#8C827A] hover:text-[#16181B] font-medium transition-colors cursor-pointer"
                    >
                      {selectedPlan === 'solo' ? 'Launch CLI & Local Guard' : 'Explore the full platform'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Provider Showcase */}
              <div className="pt-10 border-t border-[#EBE3D7] space-y-2.5">
                <span className="text-[10.5px] font-mono tracking-wider text-[#968A7C] uppercase font-semibold block">
                  Powered by leading models
                </span>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#635B50]">
                  <span className="px-2.5 py-1 rounded-md bg-white/70 border border-[#E6DFD5]">
                    OpenAI
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/70 border border-[#E6DFD5]">
                    Anthropic
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/70 border border-[#E6DFD5]">
                    Gemini
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/70 border border-[#E6DFD5]">
                    DeepSeek
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/70 border border-[#E6DFD5]">
                    Grok
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/70 border border-[#E6DFD5]">
                    Llama
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column with subtle motto at bottom right */}
            <div className="hidden lg:col-span-6 lg:flex flex-col justify-end items-end p-10 relative z-10 pointer-events-none">
              <span className="text-xs font-mono text-[#8C827A] tracking-wider bg-white/60 backdrop-blur-xs px-3 py-1.5 rounded-full border border-[#E6DFD5]">
                — More control. Less chaos.
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Subtle Bottom Footer */}
      <footer className="w-full max-w-[1540px] mx-auto px-6 sm:px-10 lg:px-14 py-4 flex items-center justify-between text-[11px] text-[#968A7C] font-mono relative z-20">
        <span>Ostra 2.0 Platform Setup</span>
        <span>Secure Enclave Telemetry</span>
      </footer>
    </div>
  );
};

export default OnboardingPage;
