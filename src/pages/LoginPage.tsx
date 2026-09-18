import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  OstraLogoAuth,
  GoogleAuthIcon,
  GitHubAuthIcon,
} from '../components/AuthGraphics';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { signIn, signInWithGoogle, signInWithGithub, updateSubscription, subscription } = useAuth();

  // Inspect if a plan was pre-selected on the pricing page
  const [pendingPlan] = useState<{
    planId: string;
    name: string;
    type: string;
    amount: number;
    billingInterval: string;
    currency?: string;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('osterdops_pending_plan');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const resolveTargetConsole = async (): Promise<string> => {
    try {
      const pendingRaw = sessionStorage.getItem('osterdops_pending_plan');
      if (pendingRaw) {
        const parsed = JSON.parse(pendingRaw);
        const isHosted = parsed.type === 'hosted' || parsed.planId === 'team_scale';
        await updateSubscription({
          plan_id: isHosted ? 'team_scale' : 'solo_pro',
          plan_name: isHosted ? 'Team Hosted Gateway' : 'Solo Pro',
          price_amount: parsed.amount || (isHosted ? 49 : 12),
          billing_interval: parsed.billingInterval || 'mo',
          status: 'active',
          quota_limit: isHosted ? 500000 : 100000,
          quota_used: isHosted ? 12000 : 74000,
          quota_usage_percent: isHosted ? 2.4 : 74,
          renewal_date: '18 Oct, 2026',
        });
        sessionStorage.removeItem('osterdops_pending_plan');
        return isHosted ? 'dashboard' : 'solo-guard';
      }
    } catch (e) {
      console.warn('Sub sync error on login:', e);
    }
    return subscription?.plan_id === 'solo_pro' ? 'solo-guard' : 'dashboard';
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid work email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setErrors({
        password: error.message || 'Invalid credentials. Please try again.',
      });
      showToast(error.message || 'Authentication failed.');
    } else {
      const target = await resolveTargetConsole();
      showToast(target === 'dashboard' ? 'Welcome back! Loading Hosted Gateway console...' : 'Welcome back! Loading Solo Guard...');
      setTimeout(() => onNavigate(target), 600);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    const { error } = provider === 'google' ? await signInWithGoogle() : await signInWithGithub();
    setLoading(false);
    if (error) {
      showToast(error.message);
    } else {
      const target = await resolveTargetConsole();
      showToast(target === 'dashboard' ? 'Signed in! Loading Hosted Gateway console...' : 'Signed in! Loading Solo Guard...');
      setTimeout(() => onNavigate(target), 600);
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
      <div className="w-full max-w-[1180px] rounded-[28px] border border-white/10 bg-[#0B0E12] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        {/* Left Column: Branding, Welcome Back Headline & Seamless 3D Artwork */}
        <div className="lg:col-span-6 bg-[#070A0D] p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden min-h-[640px] lg:min-h-[760px]">
          {/* Full-bleed 3D Photorealistic Octane Hero Background */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
            <img
              src="/ostra_hero_vertical.jpg"
              alt="Ostra 3D Eclipse Architecture"
              className="w-full h-full object-cover object-center transform hover:scale-[1.01] transition-transform duration-1000"
            />
            {/* Subtle atmospheric gradients for crystal-clear readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#070A0D]/70 via-transparent to-[#070A0D]/85" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070A0D]/40 via-transparent to-transparent" />
          </div>

          {/* Top Brand Logo & Headline */}
          <div className="relative z-10 space-y-10">
            <div className="flex items-center justify-between">
              <OstraLogoAuth className="w-8 h-8" textClassName="text-2xl font-bold tracking-tight text-white font-sans" />
              <button
                onClick={() => onNavigate('home')}
                className="text-[11px] font-mono text-[#8F9CA7] hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10"
              >
                ← Back to home
              </button>
            </div>

            <div className="space-y-2.5 pt-2">
              <h1 className="text-4xl sm:text-[42px] font-semibold text-white tracking-tight leading-tight">
                Welcome back
              </h1>
              <p className="text-sm sm:text-[15px] text-[#9AA5B1] leading-relaxed max-w-xs">
                Log in to continue managing your AI infrastructure.
              </p>
            </div>
          </div>

          {/* Bottom Value Prop */}
          <div className="relative z-10 pt-8 space-y-1.5">
            <div className="w-10 h-[2px] bg-[#C59E5F] rounded-full mb-3" />
            <div className="text-sm sm:text-[15px] font-medium text-white tracking-tight">
              Better infrastructure.
            </div>
            <div className="text-sm sm:text-[15px] text-[#8F9CA7]">
              Smarter decisions.
            </div>
          </div>
        </div>

        {/* Right Column: Log In Form */}
        <div className="lg:col-span-6 bg-[#0B0E12] p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <div className="flex justify-end text-xs text-[#8F9CA7] mb-8">
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('signup')}
                  className="text-white hover:text-[#E2BA7D] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors hover:underline ml-1"
                >
                  <span>Sign up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </span>
            </div>

            <div className="space-y-1.5 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Log in
              </h2>
              <p className="text-xs sm:text-sm text-[#8F9CA7]">
                Enter your details to access your account.
              </p>
            </div>

            {/* Pending Plan Notice if arrived from Pricing */}
            {pendingPlan && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#17202A] via-[#1C1F26] to-[#1F1C16] border border-[#E2BA7D]/40 mb-6 flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#E2BA7D]/20 text-[#E2BA7D] flex items-center justify-center font-bold text-xs shrink-0">
                    {pendingPlan.type === 'hosted' ? '☁️' : '⚡'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                      <span>Activating:</span>
                      <span className="text-[#E2BA7D] font-mono">{pendingPlan.name}</span>
                    </div>
                    <p className="text-[11px] text-[#9AA5B1] truncate">
                      {pendingPlan.type === 'hosted'
                        ? 'Sign in to access your Hosted Gateway console.'
                        : 'Sign in to access your Solo Guard console.'}
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

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-2">
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
                    } rounded-xl pr-3.5 py-3 text-xs text-white placeholder:text-[#525A64] focus:outline-none focus:border-[#E2BA7D] focus:ring-1 focus:ring-[#E2BA7D]/30 transition-all font-sans shadow-xs`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#C8D1D9] block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6E7681] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                    className={`w-full bg-[#11161B] border ${
                      errors.password ? 'border-rose-400 ring-1 ring-rose-400/30' : 'border-white/10'
                    } rounded-xl py-3 text-xs text-white placeholder:text-[#525A64] focus:outline-none focus:border-[#E2BA7D] focus:ring-1 focus:ring-[#E2BA7D]/30 transition-all font-sans shadow-xs`}
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

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 text-[#8F9CA7] hover:text-[#C8D1D9] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#11161B] border-white/20 text-[#D4AF7A] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#E2BA7D]"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[#E2BA7D] hover:underline font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#F0D5A5] via-[#E5C287] to-[#D8B06F] text-[#0C1116] font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0C1116]" />
                ) : (
                  <>
                    <span>Log in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative bg-[#0B0E12] px-3 text-[11px] text-[#6E7681]">or</span>
            </div>

            <div className="space-y-3">
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

          <div className="pt-6 text-center text-[11px] text-[#525A64]">
            Protected by OsterdOps Guard Sentinel 2.0 telemetry and TLS encryption.
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
};

export default LoginPage;
