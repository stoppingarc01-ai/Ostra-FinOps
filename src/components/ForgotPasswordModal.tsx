import React, { useState } from 'react';
import { X, Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid work email.');
      return;
    }
    setError('');
    setLoading(true);

    const { error: resetErr } = await resetPassword(email);
    setLoading(false);

    if (resetErr) {
      setError(resetErr.message);
    } else {
      setSubmitted(true);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="bg-white border border-[#EAE4D8] rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-lg flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 hover:bg-[#F5F2EB] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#E5F2EB] text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-charcoal-900">
              Check your inbox
            </h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              We've sent a password reset link to <strong className="text-charcoal-800">{email}</strong>. Please check your email to continue.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0C2419] hover:bg-[#143B2A] text-white text-xs font-bold transition-all shadow-xs cursor-pointer mt-2"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-charcoal-900">
                Reset your password
              </h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Enter your work email address and we'll send you instructions to reset your password.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-charcoal-700">
                Work email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#0C2419] focus:bg-white transition-all font-sans"
                />
              </div>
              {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0C2419] hover:bg-[#143B2A] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
