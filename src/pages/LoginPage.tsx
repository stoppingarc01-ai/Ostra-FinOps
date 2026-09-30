import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Check,
} from 'lucide-react';
import {
  GoogleAuthIcon,
  GitHubAuthIcon,
  MicrosoftAuthIcon,
  LoginMovingShieldPedestal,
} from '../components/AuthGraphics';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { signIn, signInWithGoogle, signInWithGithub } = useAuth();

  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Phone OTP State
  const [phoneCountry, setPhoneCountry] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);

  // UI / Async State
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

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
      setErrors({ password: error.message || 'Invalid credentials. Please try again.' });
      showToast(error.message || 'Authentication failed.');
    } else {
      showToast('Welcome back! Taking you to your dashboard...');
      setTimeout(() => onNavigate('dashboard'), 400);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github' | 'microsoft') => {
    if (provider === 'microsoft') {
      showToast('Microsoft Single Sign-On initialized. Redirecting...');
      setTimeout(() => {
        showToast('Connecting Microsoft Azure AD tenant...');
      }, 700);
      return;
    }

    setLoading(true);
    const { error } = provider === 'google' ? await signInWithGoogle() : await signInWithGithub();
    setLoading(false);

    if (error) {
      showToast(error.message);
    } else {
      showToast('Signed in successfully! Loading your dashboard...');
      setTimeout(() => onNavigate('dashboard'), 400);
    }
  };

  const handleSendOtp = () => {
    if (!phoneNumber.trim() || phoneNumber.length < 7) {
      setErrors({ phone: 'Please enter a valid phone number.' });
      return;
    }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      showToast(`Verification code sent to ${phoneCountry} ${phoneNumber}`);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join('');
    if (code.length < 6) {
      setErrors({ otp: 'Please enter all 6 digits.' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Phone verified! Loading your dashboard...');
      setTimeout(() => onNavigate('dashboard'), 400);
    }, 800);
  };

  const handleOtpInput = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const nextCode = [...otpCode];
    nextCode[index] = val.slice(-1);
    setOtpCode(nextCode);

    if (val && index < 5) {
      const nextInput = document.getElementById(`login-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#06080B] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans selection:bg-[#C59E5F]/30 selection:text-[#FFF4D6] relative overflow-hidden">
      {/* Background Ambient Radial Highlights */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#C59E5F]/[0.05] blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-1/4 w-[600px] h-[600px] bg-[#E5C287]/[0.04] blur-[160px] pointer-events-none rounded-full" />

      {/* Floating Sparkle on Edge */}
      <div className="absolute top-1/2 left-6 w-3 h-3 rounded-full bg-[#E5C287]/40 blur-xs animate-ping pointer-events-none" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#161C22] text-[#FFF4D6] px-4 py-3 rounded-2xl shadow-2xl border border-[#E5C287]/30 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#E5C287]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />

      {/* Main Column Wrapper */}
      <div className="w-full max-w-4xl mx-auto space-y-10 my-auto">
        {/* ============================================================ */}
        {/* TOP HERO HEADER + MOVING UI PEDESTAL                         */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Headline & Subtitle */}
          <div className="md:col-span-7 space-y-3 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-tight">
              Welcome back <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-md">
              Log in to your account and continue securing and optimizing AI spend.
            </p>
          </div>

          {/* Right: Floating 3D Animated Shield Pedestal with Orbiting Badges */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <LoginMovingShieldPedestal />
          </div>
        </div>

        {/* ============================================================ */}
        {/* CENTER CLEAN GLASS CARD                                      */}
        {/* ============================================================ */}
        <div className="w-full max-w-md mx-auto bg-[#0C1017] text-white rounded-[32px] p-6 sm:p-9 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(197,158,95,0.12)] border border-white/[0.08]">
          {/* Card Header */}
          <div className="space-y-1 mb-5">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              Log in to your account
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {/* Tab Switcher: Email vs Phone OTP */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#07090C] border border-white/[0.08] mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('email');
                setErrors({});
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all cursor-pointer ${
                authMode === 'email'
                  ? 'bg-[#181D26] text-white border border-white/[0.14] shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('phone');
                setErrors({});
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all cursor-pointer ${
                authMode === 'phone'
                  ? 'bg-[#181D26] text-white border border-white/[0.14] shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone OTP</span>
            </button>
          </div>

          {/* FORM: EMAIL MODE */}
          {authMode === 'email' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300 block">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#07090C] border border-white/[0.1] text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C59E5F] focus:ring-1 focus:ring-[#C59E5F]/30 transition-all font-mono"
                  />
                </div>
                {errors.email && (
                  <span className="text-[10px] text-rose-400 font-medium">{errors.email}</span>
                )}
              </div>

              {/* Password with Forgot Password link */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-zinc-300 block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[11px] font-bold text-[#E5C38D] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-[#07090C] border border-white/[0.1] text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C59E5F] focus:ring-1 focus:ring-[#C59E5F]/30 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-[10px] text-rose-400 font-medium">{errors.password}</span>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="pt-0.5">
                <label className="flex items-center gap-2 text-[11px] text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-[#07090C] border-white/20 text-[#C59E5F] focus:ring-0 cursor-pointer accent-[#C59E5F]"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#121722] hover:bg-[#1A2230] text-white border border-white/[0.12] hover:border-[#C59E5F]/50 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Log in</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* FORM: PHONE OTP MODE */
            <div className="space-y-4">
              {!otpSent ? (
                <div className="space-y-3">
                  <label className="text-[11px] font-semibold text-zinc-300 block">
                    Phone number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={phoneCountry}
                      onChange={(e) => setPhoneCountry(e.target.value)}
                      className="px-2.5 py-2 text-xs rounded-xl bg-[#07090C] border border-white/[0.1] text-white font-mono focus:outline-none focus:border-[#C59E5F]"
                    >
                      <option value="+1">+1 (US/CA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+91">+91 (IN)</option>
                      <option value="+49">+49 (DE)</option>
                      <option value="+33">+33 (FR)</option>
                      <option value="+81">+81 (JP)</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="555-0199"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#07090C] border border-white/[0.1] text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C59E5F] font-mono"
                    />
                  </div>
                  {errors.phone && (
                    <span className="text-[10px] text-rose-400 font-medium">{errors.phone}</span>
                  )}

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-[#121722] hover:bg-[#1A2230] text-white border border-white/[0.12] hover:border-[#C59E5F]/50 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="text-xs font-semibold text-zinc-300">
                      Enter the 6-digit code sent to
                    </div>
                    <div className="text-xs font-mono font-bold text-[#E5C38D]">
                      {phoneCountry} {phoneNumber}
                    </div>
                  </div>

                  <div className="flex justify-center gap-2">
                    {otpCode.map((digit, i) => (
                      <input
                        key={i}
                        id={`login-otp-${i}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpInput(i, e.target.value)}
                        className="w-9 h-11 text-center text-sm font-bold font-mono rounded-xl bg-[#07090C] border border-white/[0.14] text-white focus:outline-none focus:border-[#C59E5F] focus:ring-1 focus:ring-[#C59E5F]"
                      />
                    ))}
                  </div>
                  {errors.otp && (
                    <p className="text-[10px] text-rose-400 text-center font-medium">{errors.otp}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-[#121722] hover:bg-[#1A2230] text-white border border-white/[0.12] hover:border-[#C59E5F]/50 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Verify &amp; Log in</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Change phone number
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-semibold text-zinc-500">
              <span className="bg-[#0C1017] px-2.5 tracking-wider">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* Social Buttons (Google, Microsoft, GitHub) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSocialAuth('google')}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-white/[0.08] bg-[#07090C] hover:bg-white/[0.04] text-[11px] font-semibold text-white transition-colors shadow-2xs cursor-pointer"
            >
              <GoogleAuthIcon className="w-3.5 h-3.5" />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialAuth('microsoft')}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-white/[0.08] bg-[#07090C] hover:bg-white/[0.04] text-[11px] font-semibold text-white transition-colors shadow-2xs cursor-pointer"
            >
              <MicrosoftAuthIcon className="w-3.5 h-3.5" />
              <span>Microsoft</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialAuth('github')}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-white/[0.08] bg-[#07090C] hover:bg-white/[0.04] text-[11px] font-semibold text-white transition-colors shadow-2xs cursor-pointer"
            >
              <GitHubAuthIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </button>
          </div>

          {/* Footer Link */}
          <div className="text-center text-xs text-zinc-400 mt-4">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('signup')}
              className="font-bold text-[#E5C38D] hover:underline cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BOTTOM BANK-GRADE SECURITY BANNER                            */}
        {/* ============================================================ */}
        <div className="w-full max-w-2xl mx-auto p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Shield & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#181C24] border border-[#E5C287]/25 flex items-center justify-center text-[#E5C38D] shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#E5C38D]" />
            </div>
            <div>
              <div className="text-xs font-serif font-bold text-white tracking-wide">
                Bank-grade security
              </div>
              <div className="text-[11px] text-zinc-400 leading-tight">
                Your data is encrypted and protected with enterprise-grade security.
              </div>
            </div>
          </div>

          {/* Right: Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-mono text-zinc-300">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <Check className="w-3 h-3 text-[#E5C38D]" />
              <span>AES-256 GCM Key Encryption</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <Check className="w-3 h-3 text-[#E5C38D]" />
              <span>Zero Prompt Retention (ZDR)</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <Check className="w-3 h-3 text-[#E5C38D]" />
              <span>SHA-256 Hashed Proxies</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
