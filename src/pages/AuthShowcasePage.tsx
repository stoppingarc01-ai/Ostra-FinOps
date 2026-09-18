import React, { useState } from 'react';
import { LoginPage } from './LoginPage';
import { SignupPage } from './SignupPage';
import { ArrowLeft } from 'lucide-react';

interface AuthShowcasePageProps {
  onNavigate: (route: string) => void;
  defaultMode?: 'side-by-side' | 'login' | 'signup';
}

export const AuthShowcasePage: React.FC<AuthShowcasePageProps> = ({
  onNavigate,
  defaultMode = 'side-by-side',
}) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'login' | 'signup'>(defaultMode);

  if (viewMode === 'login') {
    return <LoginPage onNavigate={onNavigate} />;
  }

  if (viewMode === 'signup') {
    return <SignupPage onNavigate={onNavigate} />;
  }

  return (
    <div className="min-h-screen bg-[#05070A] text-white p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#E5C287]/20 selection:text-[#FFF4D6]">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4 mb-6 px-2">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 text-xs text-[#8F9CA7] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to product</span>
        </button>

        <div className="flex items-center gap-1 bg-[#10151B] p-1 rounded-xl border border-white/10 text-xs shadow-xs">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === 'side-by-side'
                ? 'bg-[#E2BA7D] text-[#0C1116] shadow-xs'
                : 'text-[#8F9CA7] hover:text-white'
            }`}
          >
            Both (Side-by-Side)
          </button>
          <button
            onClick={() => setViewMode('signup')}
            className="px-3 py-1.5 rounded-lg font-semibold text-[#8F9CA7] hover:text-white transition-all cursor-pointer"
          >
            Sign Up Only
          </button>
          <button
            onClick={() => setViewMode('login')}
            className="px-3 py-1.5 rounded-lg font-semibold text-[#8F9CA7] hover:text-white transition-all cursor-pointer"
          >
            Log In Only
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#8F9CA7]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Ostra 2.0 Auth Ready</span>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <div className="space-y-3">
          <div className="text-xs font-mono text-[#8F9CA7] px-1 flex items-center justify-between">
            <span>SCREEN 1: CREATE ACCOUNT (SIGN UP)</span>
            <span className="text-[#E2BA7D]">#signup</span>
          </div>
          <div className="rounded-[30px] border border-white/15 overflow-hidden shadow-2xl">
            <SignupPage onNavigate={onNavigate} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-mono text-[#8F9CA7] px-1 flex items-center justify-between">
            <span>SCREEN 2: WELCOME BACK (LOG IN)</span>
            <span className="text-[#E2BA7D]">#login</span>
          </div>
          <div className="rounded-[30px] border border-white/15 overflow-hidden shadow-2xl">
            <LoginPage onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthShowcasePage;
