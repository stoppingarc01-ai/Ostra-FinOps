import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Smartphone,
  ArrowRight,
  Shield,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  GoogleAuthIcon,
  GitHubAuthIcon,
  MicrosoftAuthIcon,
  SignupMovingPedestal,
} from '../components/AuthGraphics';
import { useAuth } from '../contexts/AuthContext';

interface SignupPageProps {
  onNavigate: (route: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { signUp, signInWithGoogle, signInWithGithub, updateProfile } = useAuth();

  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Phone OTP State
  const [phoneCountry, setPhoneCountry] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);

  // UI / Async State
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Password strength calculation (0 to 5 bars)
  const calculateStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, label: 'Weak password', color: 'bg-rose-500' };
    if (score <= 4) return { score, label: 'Medium strength', color: 'bg-amber-500' };
    return { score: 5, label: 'Strong password', color: 'bg-[#C59E5F]' };
  };

  const strength = calculateStrength(password);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required.';

    if (!email.trim()) {
      newErrors.email = 'Work email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please provide a valid work email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the Terms of Service & Privacy Policy.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      setErrors({ password: error.message || 'Registration failed. Please try again.' });
      showToast(error.message || 'Registration failed.');
    } else {
      if (companyName.trim()) {
        updateProfile({ company_name: companyName.trim() }).catch(() => {});
      }
      try {
        localStorage.removeItem('ostraops_onboarding_completed');
        localStorage.setItem('ostraops_active_plan', 'team_trial');
        localStorage.setItem('ostraops_user_tier', 'trial');
      } catch {}

      showToast('Account created! Setting up your workspace...');
      onNavigate('onboarding');
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
      try {
        localStorage.setItem('ostraops_active_plan', 'team_trial');
        localStorage.setItem('ostraops_user_tier', 'trial');
      } catch {}

      const isCompleted = localStorage.getItem('ostraops_onboarding_completed') === 'true';
      showToast(isCompleted ? 'Signed in! Taking you to your dashboard...' : 'Account ready! Setting up your workspace...');
      onNavigate(isCompleted ? 'dashboard' : 'onboarding');
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
      const isCompleted = localStorage.getItem('ostraops_onboarding_completed') === 'true';
      showToast(isCompleted ? 'Phone verified! Loading dashboard...' : 'Phone verified! Setting up your workspace...');
      onNavigate(isCompleted ? 'dashboard' : 'onboarding');
    }, 400);
  };

  const handleOtpInput = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const nextCode = [...otpCode];
    nextCode[index] = val.slice(-1);
    setOtpCode(nextCode);

    if (val && index < 5) {
      const nextInput = document.getElementById(`signup-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#06080B] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans selection:bg-[#C59E5F]/30 selection:text-[#FFF4D6] relative overflow-hidden">
      {/* Background Ambient Radial Highlights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#C59E5F]/[0.05] blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-[#E5C287]/[0.04] blur-[160px] pointer-events-none rounded-full" />

      {/* Floating Sparkle on Edge */}
      <div className="absolute top-1/2 right-6 w-3 h-3 rounded-full bg-[#E5C287]/40 blur-xs animate-ping pointer-events-none" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#161C22] text-[#FFF4D6] px-4 py-3 rounded-2xl shadow-2xl border border-[#E5C287]/30 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#E5C287]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Column Wrapper */}
      <div className="w-full max-w-4xl mx-auto space-y-10 my-auto">
        {/* ============================================================ */}
        {/* TOP HERO HEADER + MOVING UI PEDESTAL                         */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Headline & Subtitle */}
          <div className="md:col-span-7 space-y-3 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-tight">
              Create your account <span className="text-[#E5C38D] text-2xl sm:text-3xl inline-block animate-pulse">✦</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-md">
              Join thousands of teams already optimizing with OstraOps.
            </p>
          </div>

          {/* Right: Floating 3D Animated Pedestal with Dashboard Card */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <SignupMovingPedestal />
          </div>
        </div>

        {/* ============================================================ */}
        {/* CENTER CLEAN GLASS CARD                                      */}
        {/* ============================================================ */}
        <div className="w-full max-w-lg mx-auto bg-[#0C1017] text-white rounded-[32px] p-6 sm:p-9 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(197,158,95,0.12)] border border-white/[0.08]">
          {/* Card Header */}
          <div className="space-y-1 mb-5">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              Create your account
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              Start your 7-day free trial. No credit card required.
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
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300 block">
                    First name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#07090C] border border-white/[0.1] text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C59E5F] focus:ring-1 focus:ring-[#C59E5F]/30 transition-all font-sans"
                    />
                  </div>
                  {errors.firstName && (
                    <span className="text-[10px] text-rose-400 font-medium">{errors.firstName}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300 block">
                    Last name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }));
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#07090C] border border-white/[0.1] text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C59E5F] focus:ring-1 focus:ring-[#C59E5F]/30 transition-all font-sans"
                    />
                  </div>
                  {errors.lastName && (
                    <span className="text-[10px] text-rose-400 font-medium">{errors.lastName}</span>
                  )}
                </div>
              </div>

              {/* Row 2: Work Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300 block">
                  Work email
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
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#07090C] border border-white/[0.1] text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C59E5F] focus:ring-1 focus:ring-[#C59E5F]/30 transition-all font-sans"
                  />
                </div>
                {errors.email && (
                  <span className="text-[10px] text-rose-400 font-medium">{errors.email}</span>
                )}
              </div>

              {/* Row 3: Company Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300 block">
                  Company name
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#07090C] border border-white/[0.1] text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C59E5F] focus:ring-1 focus:ring-[#C59E5F]/30 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Row 4: Password with 5-segment meter */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300 block">
                  Password
                </label>
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

                {/* 5-segment golden strength meter */}
                <div className="pt-1.5 space-y-1">
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-1.5 rounded-full transition-all ${
                          lvl <= strength.score ? strength.color : 'bg-white/[0.08]'
                        }`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <div className="text-[10px] text-zinc-400 font-medium flex justify-between">
                      <span>{strength.label}</span>
                      <span className="text-[#E5C38D] font-semibold">Min 6 characters</span>
                    </div>
                  )}
                </div>
                {errors.password && (
                  <span className="text-[10px] text-rose-400 font-medium">{errors.password}</span>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 text-[11px] text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-3.5 h-3.5 rounded mt-0.5 bg-[#07090C] border-white/20 text-[#C59E5F] focus:ring-0 cursor-pointer accent-[#C59E5F]"
                  />
                  <span>
                    I agree to the:{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('terms')}
                      className="font-bold text-[#E5C38D] hover:underline"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('privacy')}
                      className="font-bold text-[#E5C38D] hover:underline"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-[10px] text-rose-400 font-medium pt-0.5">{errors.terms}</p>
                )}
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
                    <span>Create account</span>
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
                        id={`signup-otp-${i}`}
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
                        <span>Verify &amp; Create account</span>
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
              <span className="bg-[#0C1017] px-2.5 tracking-wider">OR SIGN UP WITH</span>
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
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-bold text-[#E5C38D] hover:underline cursor-pointer"
            >
              Log in
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BOTTOM FEATURE CARDS                                         */}
        {/* ============================================================ */}
        <div className="w-full max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] text-center">
          <div className="flex flex-col items-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#181C24] border border-[#E5C287]/20 flex items-center justify-center text-[#E5C38D] mb-1">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white">7-day free trial</div>
            <div className="text-[11px] text-zinc-400">Explore all features with full access.</div>
          </div>

          <div className="flex flex-col items-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#181C24] border border-[#E5C287]/20 flex items-center justify-center text-[#E5C38D] mb-1">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white">No credit card</div>
            <div className="text-[11px] text-zinc-400">Get started instantly no commitment.</div>
          </div>

          <div className="flex flex-col items-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#181C24] border border-[#E5C287]/20 flex items-center justify-center text-[#E5C38D] mb-1">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white">Cancel anytime</div>
            <div className="text-[11px] text-zinc-400">Flexible plans that grow with you.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
