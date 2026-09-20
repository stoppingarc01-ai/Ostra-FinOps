import React, { useState } from 'react';
import {
  Key,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OstraLogoAuth, GoogleAuthIcon, GitHubAuthIcon } from '../components/AuthGraphics';
import { useAuth } from '../contexts/AuthContext';
import { pairWithDaemonToken } from '../lib/daemonClient';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { signIn, signInWithGoogle, signInWithGithub } = useAuth();

  const [authMode, setAuthMode] = useState<'client-id' | 'email'>('client-id');
  const [clientId, setClientId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1-click test token filler
  const handleUseDevToken = () => {
    setClientId('ost_7f3a9c2d89e4');
    setErrorMessage(null);
  };

  const handleClientIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetId = clientId.trim() || 'ost_7f3a9c2d89e4';
    if (!targetId) {
      setErrorMessage('Please enter your Client ID.');
      return;
    }

    setLoading(true);
    const result = await pairWithDaemonToken(targetId);
    setLoading(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    try {
      localStorage.setItem('ostra_client_id', targetId);
      localStorage.setItem('ostra_authenticated', 'true');
      localStorage.setItem('ostraops_active_plan', 'solo_guard');
      localStorage.setItem('ostraops_user_tier', 'solo');
    } catch {}

    showToast('Client ID accepted! Unlocking Daemon mesh...');
    setTimeout(() => {
      onNavigate('dashboard');
    }, 450);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Authentication failed.');
      showToast(error.message || 'Failed to sign in.');
    } else {
      showToast('Welcome back! Loading your dashboard...');
      setTimeout(() => onNavigate('dashboard'), 450);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    const { error } = provider === 'google' ? await signInWithGoogle() : await signInWithGithub();
    setLoading(false);
    if (error) {
      setErrorMessage(error.message);
    } else {
      showToast('Signed in successfully! Loading your dashboard...');
      setTimeout(() => onNavigate('dashboard'), 450);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090C] text-[#E6EDF3] flex flex-col justify-between font-sans selection:bg-[#D4A359]/30 selection:text-[#F7E7CC] relative overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-8 z-50 bg-[#161D24] text-[#F3E2C4] px-4 py-3 rounded-xl border border-[#D4A359]/40 shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-[#D4A359]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <header className="w-full px-6 sm:px-12 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <OstraLogoAuth
              className="w-8 h-8 group-hover:scale-105 transition-transform"
              textClassName="text-xl font-bold tracking-tight text-white font-sans"
            />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3 text-xs font-medium text-[#7D8B99] tracking-wide">
          <span className="hover:text-white transition-colors cursor-default">LLM Governance</span>
          <span className="text-[#3A4552]">/</span>
          <span className="hover:text-white transition-colors cursor-default">Agentic Observability</span>
          <span className="text-[#3A4552]">/</span>
          <span className="hover:text-white transition-colors cursor-default">Cost Control</span>
        </div>
      </header>

      {/* Center Main Stage */}
      <main className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-4 flex-1 flex items-center justify-center z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 relative">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#8898A8]">
                  SECURE ACCESS
                </span>
                <span className="w-12 h-[1px] bg-[#2E3B49]" />
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[1.12]">
                Your Client ID <br />
                unlocks <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C988] via-[#E4B165] to-[#D4A359]">the mesh.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#8C9BAA] max-w-md leading-relaxed">
                Access your daemon. Monitor. Govern. <br className="hidden sm:inline" />
                Keep your AI costs under control.
              </p>
            </div>

            {/* Daemon Server Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#131920]/90 border border-[#2B3746] text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-[#D4A359] fill-[#D4A359]" />
              <span className="text-[#D4A359] font-bold">DAEMON SERVER</span>
              <span className="w-1 h-1 rounded-full bg-[#526375]" />
              <span className="text-[#4ADE80] flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                Online • Ready
              </span>
            </div>

            {/* Cat Hacker Illustration with Laptop and floating question marks */}
            <div className="relative w-full max-w-lg aspect-square sm:aspect-video rounded-3xl overflow-hidden border border-[#202934] bg-[#0A0E13] shadow-2xl">
              <img
                src="/login_ref.png"
                alt="Cat coder with glowing laptop"
                className="w-full h-full object-cover object-left-center filter contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090C] via-transparent to-transparent opacity-80" />
            </div>
          </div>

          {/* Right Column: Glassmorphic Login Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md bg-[#0F141A]/95 border border-[#26313D] rounded-[24px] p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 relative"
            >
              {/* Subtle gold top border highlight */}
              <div className="absolute -top-[1px] left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#D4A359] to-transparent" />

              {/* Card Header & Brand */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#201910] border border-[#D4A359]/40 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-[#D4A359]" />
                    </div>
                    <span className="font-bold text-base text-white tracking-tight">Ostra <span className="text-[10px] px-1 py-0.5 rounded bg-[#2E2416] text-[#D4A359] border border-[#D4A359]/30 font-mono">OPS</span></span>
                  </div>

                  {/* Mode switcher tab */}
                  <div className="flex rounded-lg bg-[#161C24] p-0.5 border border-[#2B3542] text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('client-id'); setErrorMessage(null); }}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        authMode === 'client-id'
                          ? 'bg-[#D4A359] text-[#0A0E12] font-bold shadow-xs'
                          : 'text-[#8E9CA9] hover:text-white'
                      }`}
                    >
                      Client ID
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('email'); setErrorMessage(null); }}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        authMode === 'email'
                          ? 'bg-[#D4A359] text-[#0A0E12] font-bold shadow-xs'
                          : 'text-[#8E9CA9] hover:text-white'
                      }`}
                    >
                      Email
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Welcome Back
                  </h2>
                  <p className="text-xs text-[#8997A6]">
                    {authMode === 'client-id'
                      ? 'Enter your Client ID to access your Daemon.'
                      : 'Sign in with your work email credentials.'}
                  </p>
                </div>
              </div>

              {/* Error Box */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-[#291316] border border-[#7F1D1D]/60 text-[#FCA5A5] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form: Client ID Mode */}
              {authMode === 'client-id' ? (
                <form onSubmit={handleClientIdSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#8B9AA8] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-[#D4A359]" />
                        <span>Client ID</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleUseDevToken}
                        className="text-[11px] text-[#D4A359] hover:text-[#E8BC75] transition-colors cursor-pointer"
                      >
                        Auto-fill Dev Token
                      </button>
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="e.g. ost_7f3a9c2d..."
                        className="w-full px-4 py-3 rounded-xl bg-[#13181F] border border-[#2B3644] focus:border-[#D4A359] focus:ring-1 focus:ring-[#D4A359] text-white placeholder-[#505D6D] text-sm font-mono transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Primary Continue Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D9A354] via-[#C99142] to-[#B88034] hover:from-[#E2AD5D] hover:to-[#C68D3F] text-[#0A0E12] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D4A359]/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#0A0E12]" />
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        <span>Continue</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Form: Email & Password Mode */
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8B9AA8] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#D4A359]" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#13181F] border border-[#2B3644] focus:border-[#D4A359] text-white placeholder-[#505D6D] text-sm outline-none font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8B9AA8] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#D4A359]" />
                        <span>Password</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onNavigate('forgot-password')}
                        className="text-[11px] text-[#D4A359] hover:underline"
                      >
                        Forgot?
                      </button>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#13181F] border border-[#2B3644] focus:border-[#D4A359] text-white placeholder-[#505D6D] text-sm outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#788796] hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D9A354] via-[#C99142] to-[#B88034] text-[#0A0E12] font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#0A0E12]" /> : <span>Sign In</span>}
                  </button>
                </form>
              )}

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#232D3A]" />
                <span className="absolute bg-[#0F141A] px-3 text-[11px] text-[#697887] uppercase font-mono">
                  or
                </span>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialAuth('google')}
                  className="py-2.5 px-3 rounded-xl bg-[#141A22] hover:bg-[#1B232D] border border-[#283341] text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <GoogleAuthIcon className="w-3.5 h-3.5" />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialAuth('github')}
                  className="py-2.5 px-3 rounded-xl bg-[#141A22] hover:bg-[#1B232D] border border-[#283341] text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <GitHubAuthIcon className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </button>
              </div>

              {/* Card Footer: Secure • Encrypted • Trusted */}
              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#6E7D8E] font-medium">
                <Shield className="w-3.5 h-3.5 text-[#D4A359]" />
                <span>Secure</span>
                <span>•</span>
                <span>Encrypted</span>
                <span>•</span>
                <span>Trusted</span>
              </div>
            </motion.div>
          </div>

        </div>
      </main>

      {/* Global Bottom Footer */}
      <footer className="w-full px-6 sm:px-12 py-5 border-t border-[#1C242E] flex items-center justify-between text-xs text-[#6B7988] z-20">
        <div>
          <span>Ostra OPS v1.0.0</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Built for builders. Powered by intelligence.</span>
          <Crown className="w-3.5 h-3.5 text-[#D4A359]" />
        </div>
      </footer>
    </div>
  );
};
