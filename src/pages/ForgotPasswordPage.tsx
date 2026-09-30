import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, ArrowRight, AlertCircle, Loader2, Mail } from 'lucide-react';
import { OstraLogo } from '../components/OstraBrand';

interface ForgotPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await resetPassword(email);
    if (err) {
      setError(err.message);
      setSubmitting(false);
    } else {
      setSent(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090C] text-white flex items-center justify-center px-4 font-sans selection:bg-[#C59E5F]/20 selection:text-[#FFF4D6]">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <button onClick={() => onNavigate('home')} className="inline-flex items-center justify-center gap-2.5 group cursor-pointer">
            <OstraLogo
              iconClassName="w-9 h-9 group-hover:scale-105 transition-transform duration-200"
              textClassName="text-2xl font-bold tracking-tight text-white font-sans"
              variant="gold"
              showTagline={true}
              taglineType="control"
            />
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-[#0B0E14] rounded-3xl border border-white/[0.08] p-8 shadow-2xl">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center">
                <Mail className="w-6 h-6 text-[#E5C38D]" />
              </div>
              <h2 className="text-lg font-bold text-white">Check your email</h2>
              <p className="text-sm text-zinc-400">
                We sent a password reset link to <span className="font-medium text-white">{email}</span>
              </p>
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#E5C38D] hover:underline transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to sign in</span>
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white">Reset your password</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-[#07090C] text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#C59E5F] focus:ring-1 focus:ring-[#C59E5F]/30 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] hover:opacity-95 text-[#07090C] text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#07090C]" />
                  ) : (
                    <>
                      <span>Send reset link</span>
                      <ArrowRight className="w-4 h-4 text-[#07090C]" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        {!sent && (
          <p className="text-center text-xs text-zinc-400">
            Remember your password?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-semibold text-[#E5C38D] hover:underline transition-colors cursor-pointer"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
