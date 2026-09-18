import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  OsterdOpsLogoAuth,
  GoogleAuthIcon,
  GitHubAuthIcon,
  LoginRobotScene,
  SignupTabletScene,
} from './AuthGraphics';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export interface AuthUser {
  name: string;
  email: string;
  accountType: 'solo' | 'team';
}

interface AuthPageProps {
  onAuthSuccess: (user: AuthUser) => void;
  defaultMode?: 'signup' | 'login';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  defaultMode = 'signup',
}) => {
  const [mode, setMode] = useState<'signup' | 'login'>(defaultMode);

  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupShowPassword, setSignupShowPassword] = useState(false);
  const [signupShowConfirmPassword, setSignupShowConfirmPassword] = useState(false);
  const [signupAccountType, setSignupAccountType] = useState<'solo' | 'team'>('solo');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupErrors, setSignupErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginRememberMe, setLoginRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Forgot Password Modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle Signup Submission
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!signupName.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!signupEmail.trim()) {
      errors.email = 'Work email is required.';
    } else if (!/\S+@\S+\.\S+/.test(signupEmail)) {
      errors.email = 'Please enter a valid work email.';
    }

    if (!signupPassword) {
      errors.password = 'Password is required.';
    } else if (signupPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (signupPassword !== signupConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors);
      return;
    }

    setSignupErrors({});
    setSignupLoading(true);

    setTimeout(() => {
      setSignupLoading(false);
      const user: AuthUser = {
        name: signupName.trim(),
        email: signupEmail.trim(),
        accountType: signupAccountType,
      };
      localStorage.setItem('osterdops_user', JSON.stringify(user));
      showToast(`Account created for ${user.name}! Entering OsterdOps...`);
      onAuthSuccess(user);
    }, 700);
  };

  // Handle Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { email?: string; password?: string } = {};

    if (!loginEmail.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!loginPassword) {
      errors.password = 'Password is required.';
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }

    setLoginErrors({});
    setLoginLoading(true);

    setTimeout(() => {
      setLoginLoading(false);
      const user: AuthUser = {
        name: loginEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Developer',
        email: loginEmail.trim(),
        accountType: 'solo',
      };
      localStorage.setItem('osterdops_user', JSON.stringify(user));
      showToast(`Welcome back, ${user.email}! Loading workspace...`);
      onAuthSuccess(user);
    }, 700);
  };

  // Social Auth
  const handleSocialAuth = (provider: 'Google' | 'GitHub') => {
    showToast(`Connecting to ${provider} OAuth...`);
    setTimeout(() => {
      const user: AuthUser = {
        name: `${provider} Developer`,
        email: `developer@${provider.toLowerCase()}.user`,
        accountType: 'solo',
      };
      localStorage.setItem('osterdops_user', JSON.stringify(user));
      showToast(`Successfully authenticated with ${provider}!`);
      onAuthSuccess(user);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#070B09] flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans selection:bg-emerald-500/30 selection:text-white relative overflow-x-hidden antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0C2419] text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Card Container matching screenshot */}
      <div className="w-full max-w-[1140px] rounded-[28px] overflow-hidden border border-[#23352B]/80 shadow-2xl bg-white grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        {/* ============================================================ */}
        {/* LEFT COLUMN: DARK PANEL WITH GRAPHICS & HEADLINES */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 xl:col-span-5 bg-[#070D0A] p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-white relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#192720]">
          {/* Ambient Lighting */}
          <div className="absolute top-1/4 -left-12 w-64 h-64 bg-[#D4AF77]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Info */}
          <div className="space-y-6 relative z-10">
            <OsterdOpsLogoAuth />

            <div className="text-[9.5px] font-mono uppercase tracking-widest text-[#8E8B7F]">
              AI INFRA &nbsp;/&nbsp; COST CONTROL &nbsp;/&nbsp; OBSERVABILITY
            </div>

            {/* Dynamic Headline Based on Mode */}
            {mode === 'signup' ? (
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                  Build smarter.
                </h2>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-[#E5C287] via-[#D4AF77] to-[#C59E5F] bg-clip-text text-transparent leading-tight">
                  Spend less.
                </h2>
                <p className="text-xs sm:text-sm text-[#9E9A8E] leading-relaxed pt-1 max-w-sm">
                  The AI gateway for solo developers who want control, visibility and maximum performance.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                  Your AI usage.
                </h2>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-[#E5C287] via-[#D4AF77] to-[#C59E5F] bg-clip-text text-transparent leading-tight">
                  Under control.
                </h2>
                <p className="text-xs sm:text-sm text-[#9E9A8E] leading-relaxed pt-1 max-w-sm">
                  Monitor. Govern. Optimize. For the builders of tomorrow.
                </p>
              </div>
            )}
          </div>

          {/* Center Graphic */}
          <div className="my-6 relative z-10">
            {mode === 'signup' ? (
              <SignupTabletScene className="scale-100" />
            ) : (
              <LoginRobotScene className="scale-105" />
            )}
          </div>

          {/* Bottom Stats Row (For Login) or Feature Highlights (For Signup) */}
          <div className="relative z-10 select-none">
            {mode === 'login' ? (
              <div className="pt-4 border-t border-[#18271F] grid grid-cols-3 gap-2">
                <div>
                  <div className="text-lg sm:text-xl font-bold text-white tracking-tight">8</div>
                  <div className="text-[10px] text-[#8E8B7F]">Providers</div>
                </div>
                <div className="border-l border-[#18271F] pl-3">
                  <div className="text-lg sm:text-xl font-bold text-white tracking-tight">40+</div>
                  <div className="text-[10px] text-[#8E8B7F]">Models</div>
                </div>
                <div className="border-l border-[#18271F] pl-3">
                  <div className="text-lg sm:text-xl font-bold text-white tracking-tight">100%</div>
                  <div className="text-[10px] text-[#8E8B7F]">Your Control</div>
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-[#6E7B74] font-mono flex items-center justify-between pt-2">
                <span>Autonomous Sentinel Guard</span>
                <span className="text-emerald-400">● 100% Localhost First</span>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: LIGHT SANDSTONE FORM PANEL */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 xl:col-span-7 bg-[#FAF8F5] p-6 sm:p-8 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Top Switcher: Sign Up vs Login */}
            <div className="flex justify-end text-xs text-charcoal-500 mb-6">
              {mode === 'signup' ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setSignupErrors({});
                    }}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors hover:underline ml-1"
                  >
                    <span>Login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setLoginErrors({});
                    }}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors hover:underline ml-1"
                  >
                    <span>Sign up</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
            </div>

            {/* ======================================================== */}
            {/* SIGNUP FORM */}
            {/* ======================================================== */}
            {mode === 'signup' ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1 mb-5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900">
                    Create your account
                  </h1>
                  <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed">
                    Join OsterdOps and take control of your AI usage, costs and performance.
                  </p>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  {/* Full name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal-700 block">
                      Full name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Your name"
                        value={signupName}
                        onChange={(e) => {
                          setSignupName(e.target.value);
                          if (signupErrors.name) setSignupErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        className={`w-full bg-white border ${
                          signupErrors.name ? 'border-rose-400 ring-1 ring-rose-200' : 'border-[#E8E2D5]'
                        } rounded-xl pl-9 pr-3.5 py-2 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#0C2419] shadow-2xs transition-all`}
                      />
                    </div>
                    {signupErrors.name && (
                      <p className="text-[10.5px] text-rose-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{signupErrors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Work email */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal-700 block">
                      Work email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="you@company.com"
                        value={signupEmail}
                        onChange={(e) => {
                          setSignupEmail(e.target.value);
                          if (signupErrors.email) setSignupErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        className={`w-full bg-white border ${
                          signupErrors.email ? 'border-rose-400 ring-1 ring-rose-200' : 'border-[#E8E2D5]'
                        } rounded-xl pl-9 pr-3.5 py-2 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#0C2419] shadow-2xs transition-all`}
                      />
                    </div>
                    {signupErrors.email && (
                      <p className="text-[10.5px] text-rose-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{signupErrors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal-700 block">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={signupShowPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={signupPassword}
                        onChange={(e) => {
                          setSignupPassword(e.target.value);
                          if (signupErrors.password) setSignupErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        className={`w-full bg-white border ${
                          signupErrors.password ? 'border-rose-400 ring-1 ring-rose-200' : 'border-[#E8E2D5]'
                        } rounded-xl pl-9 pr-10 py-2 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#0C2419] shadow-2xs transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setSignupShowPassword(!signupShowPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
                      >
                        {signupShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signupErrors.password && (
                      <p className="text-[10.5px] text-rose-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{signupErrors.password}</span>
                      </p>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal-700 block">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={signupShowConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        value={signupConfirmPassword}
                        onChange={(e) => {
                          setSignupConfirmPassword(e.target.value);
                          if (signupErrors.confirmPassword)
                            setSignupErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                        }}
                        className={`w-full bg-white border ${
                          signupErrors.confirmPassword ? 'border-rose-400 ring-1 ring-rose-200' : 'border-[#E8E2D5]'
                        } rounded-xl pl-9 pr-10 py-2 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#0C2419] shadow-2xs transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setSignupShowConfirmPassword(!signupShowConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
                      >
                        {signupShowConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signupErrors.confirmPassword && (
                      <p className="text-[10.5px] text-rose-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{signupErrors.confirmPassword}</span>
                      </p>
                    )}
                  </div>

                  {/* Account type radio cards */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-charcoal-700 block">
                      Account type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Option 1: Solo Developer */}
                      <div
                        onClick={() => setSignupAccountType('solo')}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-2.5 ${
                          signupAccountType === 'solo'
                            ? 'border-emerald-500 bg-[#F0FDF4]/70 shadow-xs'
                            : 'border-[#E8E2D5] bg-white hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            signupAccountType === 'solo'
                              ? 'border-emerald-600 bg-white'
                              : 'border-charcoal-300 bg-white'
                          }`}
                        >
                          {signupAccountType === 'solo' && (
                            <div className="w-2 h-2 rounded-full bg-emerald-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-charcoal-900 leading-tight">
                            Solo Developer
                          </div>
                          <div className="text-[9.5px] text-charcoal-500 leading-tight pt-0.5">
                            Perfect for individual builders and indie hackers.
                          </div>
                        </div>
                      </div>

                      {/* Option 2: Team / Organization */}
                      <div
                        onClick={() => setSignupAccountType('team')}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-2.5 ${
                          signupAccountType === 'team'
                            ? 'border-emerald-500 bg-[#F0FDF4]/70 shadow-xs'
                            : 'border-[#E8E2D5] bg-white hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            signupAccountType === 'team'
                              ? 'border-emerald-600 bg-white'
                              : 'border-charcoal-300 bg-white'
                          }`}
                        >
                          {signupAccountType === 'team' && (
                            <div className="w-2 h-2 rounded-full bg-emerald-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-charcoal-900 leading-tight">
                            Team / Organization
                          </div>
                          <div className="text-[9.5px] text-charcoal-500 leading-tight pt-0.5">
                            For teams with multiple developers and projects.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Create account Button */}
                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0C2419] hover:bg-[#143B2A] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer mt-2"
                  >
                    {signupLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Create account</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  {/* Or Divider */}
                  <div className="relative flex items-center justify-center py-1">
                    <div className="border-t border-[#EAE4D8] w-full" />
                    <span className="bg-[#FAF8F5] px-3 text-[11px] text-charcoal-400 absolute">
                      or
                    </span>
                  </div>

                  {/* Social Buttons */}
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => handleSocialAuth('Google')}
                      className="w-full flex items-center justify-center gap-2.5 py-2 px-4 rounded-xl bg-white border border-[#EAE4D8] hover:bg-[#F5F2EB] text-xs font-semibold text-charcoal-800 transition-colors shadow-2xs cursor-pointer"
                    >
                      <GoogleAuthIcon className="w-3.5 h-3.5" />
                      <span>Continue with Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialAuth('GitHub')}
                      className="w-full flex items-center justify-center gap-2.5 py-2 px-4 rounded-xl bg-white border border-[#EAE4D8] hover:bg-[#F5F2EB] text-xs font-semibold text-charcoal-800 transition-colors shadow-2xs cursor-pointer"
                    >
                      <GitHubAuthIcon className="w-3.5 h-3.5" />
                      <span>Continue with GitHub</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* ======================================================== */
              /* LOGIN FORM */
              /* ======================================================== */
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1 mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900">
                    Welcome back
                  </h1>
                  <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed">
                    Sign in to your OsterdOps account to continue managing your AI infrastructure.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email address */}
                  <div className="space-y-1">
                    <div className="relative">
                      <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          if (loginErrors.email) setLoginErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        className={`w-full bg-white border ${
                          loginErrors.email ? 'border-rose-400 ring-1 ring-rose-200' : 'border-[#E8E2D5]'
                        } rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#0C2419] shadow-2xs transition-all`}
                      />
                    </div>
                    {loginErrors.email && (
                      <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 pt-0.5">
                        <AlertCircle className="w-3 h-3" />
                        <span>{loginErrors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <div className="relative">
                      <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={loginShowPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          if (loginErrors.password) setLoginErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        className={`w-full bg-white border ${
                          loginErrors.password ? 'border-rose-400 ring-1 ring-rose-200' : 'border-[#E8E2D5]'
                        } rounded-xl pl-9 pr-10 py-2.5 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#0C2419] shadow-2xs transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setLoginShowPassword(!loginShowPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
                      >
                        {loginShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 pt-0.5">
                        <AlertCircle className="w-3 h-3" />
                        <span>{loginErrors.password}</span>
                      </p>
                    )}
                  </div>

                  {/* Options: Remember me & Forgot password */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={loginRememberMe}
                        onChange={(e) => setLoginRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-[#D0C8B8] text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-charcoal-700 font-medium text-xs">Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer transition-colors hover:underline text-xs"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Sign in Button */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0C2419] hover:bg-[#143B2A] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer mt-2"
                  >
                    {loginLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Sign in</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  {/* Or Divider */}
                  <div className="relative flex items-center justify-center py-2">
                    <div className="border-t border-[#EAE4D8] w-full" />
                    <span className="bg-[#FAF8F5] px-3 text-[11px] text-charcoal-400 absolute">
                      or
                    </span>
                  </div>

                  {/* Social Buttons */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleSocialAuth('Google')}
                      className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white border border-[#EAE4D8] hover:bg-[#F5F2EB] text-xs font-semibold text-charcoal-800 transition-colors shadow-2xs cursor-pointer"
                    >
                      <GoogleAuthIcon className="w-4 h-4" />
                      <span>Continue with Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialAuth('GitHub')}
                      className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white border border-[#EAE4D8] hover:bg-[#F5F2EB] text-xs font-semibold text-charcoal-800 transition-colors shadow-2xs cursor-pointer"
                    >
                      <GitHubAuthIcon className="w-4 h-4" />
                      <span>Continue with GitHub</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Bottom Security / Terms Notice */}
          <div className="pt-6 mt-6 border-t border-[#EAE4D8] flex items-center gap-2 text-charcoal-500 text-[10.5px]">
            <ShieldCheck className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
            {mode === 'signup' ? (
              <span>
                By creating an account, you agree to our{' '}
                <a href="#terms" className="text-emerald-700 hover:underline font-semibold">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" className="text-emerald-700 hover:underline font-semibold">
                  Privacy Policy
                </a>
              </span>
            ) : (
              <span>Enterprise grade security. Your keys, your data.</span>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
};
