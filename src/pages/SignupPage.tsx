import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Activity,
  Sliders,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  OstraLogoAuth,
  GoogleAuthIcon,
  GitHubAuthIcon,
} from '../components/AuthGraphics';
import { useAuth } from '../contexts/AuthContext';

interface SignupPageProps {
  onNavigate: (route: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { signUp, signInWithGoogle, signInWithGithub } = useAuth();

  // Inspect if user arrived having pre-selected a plan from Pricing Page
  const [pendingPlan] = useState<{
    planId: string;
    name: string;
    type: string;
    amount: number;
    billingInterval: string;
    currency?: string;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('ostraops_pending_plan');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountType, setAccountType] = useState<'solo' | 'team'>('solo');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!fullName.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (!email.trim()) {
      newErrors.email = 'Work email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please provide a valid work email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      setErrors({
        password: error.message || 'Signup failed. Please try again.',
      });
      showToast(error.message || 'Registration failed.');
    } else {
      const isHosted = accountType === 'team' || pendingPlan?.type === 'hosted' || pendingPlan?.planId === 'team_scale';
      const chosenPlan = isHosted ? 'team_scale' : 'solo_pro';
      try {
        localStorage.setItem('ostraops_active_plan', chosenPlan);
        localStorage.setItem('ostraops_user_tier', isHosted ? 'team' : 'solo');
      } catch {}

      showToast('Account created! Taking you to workspace setup & onboarding...');
      setTimeout(() => onNavigate('onboarding'), 400);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    const { error } = provider === 'google' ? await signInWithGoogle() : await signInWithGithub();
    setLoading(false);
    if (error) {
      showToast(error.message);
    } else {
      const isHosted = accountType === 'team' || pendingPlan?.type === 'hosted' || pendingPlan?.planId === 'team_scale';
      const chosenPlan = isHosted ? 'team_scale' : 'solo_pro';
      try {
        localStorage.setItem('ostraops_active_plan', chosenPlan);
        localStorage.setItem('ostraops_user_tier', isHosted ? 'team' : 'solo');
      } catch {}

      showToast('Signed in! Taking you to workspace setup & onboarding...');
      setTimeout(() => onNavigate('onboarding'), 400);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090C] text-white flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-[#E5C287]/20 selection:text-[#FFF4D6]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#161C22] text-[#FFF4D6] px-4 py-3 rounded-2xl shadow-2xl border border-[#E5C287]/30 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#E5C287]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Card Container */}
      <div className="w-full max-w-[1240px] rounded-[28px] border border-white/10 bg-[#0B0E12] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        {/* ============================================================ */}
        {/* Left Column: Branding, Hero Headline, Artwork & 3 Features   */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 bg-[#070A0D] p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden min-h-[640px] lg:min-h-[820px]">
          {/* Full-bleed 3D Photorealistic Octane Hero Background */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
            <img
              src="/ostra_hero_vertical.jpg"
              alt="Ostra 3D Architecture Scene"
              className="w-full h-full object-cover object-center transform hover:scale-[1.01] transition-transform duration-1000"
            />
            {/* Subtle atmospheric gradients for crystal-clear readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#070A0D]/70 via-transparent to-[#070A0D]/85" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070A0D]/40 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 space-y-8">
            {/* Top Brand Logo */}
            <div className="flex items-center justify-between">
              <OstraLogoAuth className="w-8 h-8" textClassName="text-2xl font-bold tracking-tight text-white font-sans" />
              <button
                onClick={() => onNavigate('home')}
                className="text-[11px] font-mono text-[#8F9CA7] hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10"
              >
                ← Back to home
              </button>
            </div>

            {/* Welcome to Ostra Headline */}
            <div className="pt-2 space-y-2">
              <div className="text-3xl sm:text-4xl font-light text-white tracking-tight">
                Welcome to
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                Ostra
              </div>
              <div className="text-xs sm:text-sm text-[#9AA5B1] space-y-0.5 pt-2 leading-relaxed">
                <p>The AI infrastructure for builders.</p>
                <p>Control. Observe. Optimize.</p>
              </div>
            </div>
          </div>

          {/* Bottom 3 Micro Feature Columns */}
          <div className="relative z-10 grid grid-cols-3 gap-3 pt-6 border-t border-white/10 select-none bg-black/30 backdrop-blur-xs -mx-4 px-4 py-3 rounded-2xl">
            {/* Feature 1: Track Usage */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-white">
                <Activity className="w-4 h-4 text-[#E2BA7D]" />
              </div>
              <div className="text-xs font-semibold text-white tracking-tight">
                Track Usage
              </div>
              <div className="text-[10.5px] text-[#8F9CA7] leading-snug">
                Know where your money goes.
              </div>
            </div>

            {/* Feature 2: Set Limits */}
            <div className="space-y-1 border-l border-white/10 pl-3">
              <div className="flex items-center gap-1.5 text-white">
                <Sliders className="w-4 h-4 text-[#E2BA7D]" />
              </div>
              <div className="text-xs font-semibold text-white tracking-tight">
                Set Limits
              </div>
              <div className="text-[10.5px] text-[#8F9CA7] leading-snug">
                Stay in control with smart caps.
              </div>
            </div>

            {/* Feature 3: Optimize */}
            <div className="space-y-1 border-l border-white/10 pl-3">
              <div className="flex items-center gap-1.5 text-white">
                <ShieldCheck className="w-4 h-4 text-[#E2BA7D]" />
              </div>
              <div className="text-xs font-semibold text-white tracking-tight">
                Optimize
              </div>
              <div className="text-[10.5px] text-[#8F9CA7] leading-snug">
                Get better performance & cost.
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Right Column: Create Account Form                            */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 bg-[#0B0E12] p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Top Right Navigation to Log In */}
            <div className="flex justify-end text-xs text-[#8F9CA7] mb-6">
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-white hover:text-[#E2BA7D] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors hover:underline ml-1"
                >
                  <span>Log in</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-1 mb-5">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Create your account
              </h2>
              <p className="text-xs sm:text-sm text-[#8F9CA7]">
                Start in minutes. No credit card required.
              </p>
            </div>

            {/* Pending Plan Selection Ribbon */}
            {pendingPlan && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#17202A] via-[#1C1F26] to-[#1F1C16] border border-[#E2BA7D]/40 mb-5 flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#E2BA7D]/20 text-[#E2BA7D] flex items-center justify-center font-bold text-xs shrink-0">
                    {pendingPlan.type === 'hosted' ? '☁️' : '⚡'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                      <span>Selected:</span>
                      <span className="text-[#E2BA7D] font-mono">{pendingPlan.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                        Ready to activate
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9AA5B1] truncate">
                      {pendingPlan.type === 'hosted'
                        ? '14-Day Free Trial included. Cloud Edge Gateway workspace.'
                        : 'Local-first zero prompt retention proxy for solo builders.'}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <div className="text-xs font-bold text-white">
                    {pendingPlan.currency === 'INR' ? '₹' : '$'}{pendingPlan.amount}
                  </div>
                  <div className="text-[10px] text-[#8F9CA7]">
                    /{pendingPlan.billingInterval === 'yr' ? 'yr' : 'mo'}
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Full name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#C8D1D9] block">
                  Full name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6E7681] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    style={{ paddingLeft: '2.5rem' }}
                    className={`w-full bg-[#11161B] border ${
                      errors.name ? 'border-rose-400 ring-1 ring-rose-400/30' : 'border-white/10'
                    } rounded-xl pr-3.5 py-2.5 text-xs text-white placeholder:text-[#525A64] focus:outline-none focus:border-[#E2BA7D] focus:ring-1 focus:ring-[#E2BA7D]/30 transition-all font-sans shadow-xs`}
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Work email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#C8D1D9] block">
                  Work email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6E7681] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    style={{ paddingLeft: '2.5rem' }}
                    className={`w-full bg-[#11161B] border ${
                      errors.email ? 'border-rose-400 ring-1 ring-rose-400/30' : 'border-white/10'
                    } rounded-xl pr-3.5 py-2.5 text-xs text-white placeholder:text-[#525A64] focus:outline-none focus:border-[#E2BA7D] focus:ring-1 focus:ring-[#E2BA7D]/30 transition-all font-sans shadow-xs`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#C8D1D9] block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6E7681] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                    className={`w-full bg-[#11161B] border ${
                      errors.password ? 'border-rose-400 ring-1 ring-rose-400/30' : 'border-white/10'
                    } rounded-xl py-2.5 text-xs text-white placeholder:text-[#525A64] focus:outline-none focus:border-[#E2BA7D] focus:ring-1 focus:ring-[#E2BA7D]/30 transition-all font-sans shadow-xs`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6E7681] hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#C8D1D9] block">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6E7681] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                    className={`w-full bg-[#11161B] border ${
                      errors.confirmPassword ? 'border-rose-400 ring-1 ring-rose-400/30' : 'border-white/10'
                    } rounded-xl py-2.5 text-xs text-white placeholder:text-[#525A64] focus:outline-none focus:border-[#E2BA7D] focus:ring-1 focus:ring-[#E2BA7D]/30 transition-all font-sans shadow-xs`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6E7681] hover:text-white transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* Account type radio cards */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-medium text-[#C8D1D9] block">
                  Account type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Card 1: Solo Developer */}
                  <div
                    onClick={() => setAccountType('solo')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      accountType === 'solo'
                        ? 'bg-[#141B21] border-[#E2BA7D] ring-1 ring-[#E2BA7D]/30'
                        : 'bg-[#11161B] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          accountType === 'solo' ? 'border-[#E2BA7D] bg-[#E2BA7D]' : 'border-[#6E7681]'
                        }`}
                      >
                        {accountType === 'solo' && <div className="w-1.5 h-1.5 rounded-full bg-[#0C1116]" />}
                      </div>
                      <span className="text-xs font-semibold text-white">Solo Developer</span>
                    </div>
                    <p className="text-[11px] text-[#8F9CA7] mt-1.5 leading-snug pl-5.5">
                      Perfect for individual builders and indie hackers.
                    </p>
                  </div>

                  {/* Card 2: Team / Organization */}
                  <div
                    onClick={() => setAccountType('team')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      accountType === 'team'
                        ? 'bg-[#141B21] border-[#E2BA7D] ring-1 ring-[#E2BA7D]/30'
                        : 'bg-[#11161B] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          accountType === 'team' ? 'border-[#E2BA7D] bg-[#E2BA7D]' : 'border-[#6E7681]'
                        }`}
                      >
                        {accountType === 'team' && <div className="w-1.5 h-1.5 rounded-full bg-[#0C1116]" />}
                      </div>
                      <span className="text-xs font-semibold text-white">Team / Organization</span>
                    </div>
                    <p className="text-[11px] text-[#8F9CA7] mt-1.5 leading-snug pl-5.5">
                      For teams with multiple developers and projects.
                    </p>
                  </div>
                </div>
              </div>

              {/* Create account CTA button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#F0D5A5] via-[#E5C287] to-[#D8B06F] text-[#0C1116] font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0C1116]" />
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative bg-[#0B0E12] px-3 text-[11px] text-[#6E7681]">or</span>
            </div>

            {/* Social Logins */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                className="w-full bg-[#11161B] hover:bg-[#161D24] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white font-medium flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs"
              >
                <GoogleAuthIcon className="w-4 h-4" />
                <span>Continue with Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth('github')}
                className="w-full bg-[#11161B] hover:bg-[#161D24] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white font-medium flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs"
              >
                <GitHubAuthIcon className="w-4 h-4 text-white" />
                <span>Continue with GitHub</span>
              </button>
            </div>
          </div>

          {/* Bottom Terms Disclaimer */}
          <div className="pt-5 text-center text-[11px] text-[#6E7681] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8F9CA7] shrink-0" />
            <span>
              By creating an account, you agree to our{' '}
              <a href="#terms" className="text-[#C8D1D9] hover:underline">Terms of Service</a> and{' '}
              <a href="#privacy" className="text-[#C8D1D9] hover:underline">Privacy Policy</a>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
