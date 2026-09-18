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
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <button onClick={() => onNavigate('home')} className="inline-flex items-center justify-center gap-2.5 group cursor-pointer">
            <OstraLogo
              iconClassName="w-9 h-9 group-hover:scale-105 transition-transform duration-200"
              textClassName="text-2xl font-bold tracking-tight text-[#0B0F0F] font-sans"
              variant="charcoal"
              showTagline={true}
              taglineType="control"
            />
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-[#EAE5DC] p-8 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#F4EFE6] border border-[#E5DBCA] flex items-center justify-center">
                <Mail className="w-6 h-6 text-[#C59E5F]" />
              </div>
              <h2 className="text-lg font-bold text-[#18181B]">Check your email</h2>
              <p className="text-sm text-[#71717A]">
                We sent a password reset link to <span className="font-medium text-[#18181B]">{email}</span>
              </p>
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#18181B] hover:text-[#C59E5F] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to sign in</span>
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#18181B]">Reset your password</h2>
                <p className="text-sm text-[#71717A] mt-1">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#18181B]">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DC] bg-[#FAF8F5] text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#C59E5F] focus:ring-1 focus:ring-[#C59E5F]/30 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-[#18181B] text-white text-sm font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send reset link</span>
                      <ArrowRight className="w-4 h-4 text-[#C59E5F]" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        {!sent && (
          <p className="text-center text-xs text-[#A1A1AA]">
            Remember your password?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-semibold text-[#18181B] hover:text-[#C59E5F] transition-colors"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
