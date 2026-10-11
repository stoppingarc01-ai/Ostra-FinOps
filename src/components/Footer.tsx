import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { OstraLogo } from './OstraBrand';

interface FooterProps {
  onNavigate?: (route: any) => void;
}

const XIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#07090C] border-t border-white/[0.08] pt-16 pb-12 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <button 
              onClick={() => onNavigate && onNavigate('home')}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <OstraLogo
                iconClassName="w-8 h-8 group-hover:scale-105 transition-transform duration-300"
                textClassName="text-xl font-bold tracking-tight text-white font-sans"
                variant="gold"
                showTagline={false}
              />
            </button>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              OstraOps gives developers and teams real-time spend visibility, hard budget limits, and complete data privacy across Claude, OpenAI, Gemini, and DeepSeek.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Zero prompt storage • Direct provider communication</span>
            </div>

            {/* Social Connect Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <a
                href="https://x.com/Team_Ostraops"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#E5C38D]/40 text-zinc-300 hover:text-white transition-all duration-200 group/x min-h-[38px]"
                title="Follow @Team_Ostraops on X"
                aria-label="Follow @Team_Ostraops on X (formerly Twitter)"
              >
                <XIcon className="w-3.5 h-3.5 text-zinc-300 group-hover/x:text-[#E5C38D] transition-colors" />
                <span className="font-mono text-[11px] font-medium tracking-tight">@Team_Ostraops</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover/x:text-[#E5C38D] transition-colors" />
              </a>

              <a
                href="https://github.com/stoppingarc01-ai/Ostra-FinOps"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#E5C38D]/40 text-zinc-300 hover:text-white transition-all duration-200 group/gh min-h-[38px]"
                title="Star OstraOps on GitHub"
                aria-label="Star OstraOps open-source repository on GitHub"
              >
                <GithubIcon className="w-3.5 h-3.5 text-zinc-300 group-hover/gh:text-[#E5C38D] transition-colors" />
                <span className="font-mono text-[11px] font-medium tracking-tight">GitHub</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover/gh:text-[#E5C38D] transition-colors" />
              </a>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white font-mono">Product</span>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('home')} 
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Spend Guardrails
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('models')} 
                  className="hover:text-white transition-colors text-left cursor-pointer font-medium text-zinc-300"
                >
                  Model Directory &amp; Pricing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('home');
                      setTimeout(() => document.getElementById('ui-showcase')?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }
                  }} 
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Watch Demo Video
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('home');
                      setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }
                  }} 
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('pricing')} 
                  className="hover:text-white transition-colors text-left cursor-pointer font-semibold text-zinc-200"
                >
                  Plans &amp; Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Developers */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white font-mono">Developers</span>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://x.com/Team_Ostraops" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <XIcon className="w-3 h-3 text-zinc-400 group-hover:text-[#E5C38D] transition-colors" />
                  <span>X (@Team_Ostraops)</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-[#E5C38D] transition-colors" />
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/stoppingarc01-ai/Ostra-FinOps" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <GithubIcon className="w-3 h-3 text-zinc-400 group-hover:text-[#E5C38D] transition-colors" />
                  <span>GitHub Repository</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-[#E5C38D] transition-colors" />
                </a>
              </li>
              <li>
                <button 
                  onClick={() => { 
                    if (onNavigate) { 
                      onNavigate('home'); 
                      setTimeout(() => document.getElementById('developers')?.scrollIntoView({ behavior: 'smooth' }), 100); 
                    } 
                  }} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Quickstart Guide
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { 
                    if (onNavigate) { 
                      onNavigate('home'); 
                      setTimeout(() => document.getElementById('agents')?.scrollIntoView({ behavior: 'smooth' }), 100); 
                    } 
                  }} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Editor &amp; Agent Setup
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Trust */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white font-mono">Company</span>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('about')} 
                  className="hover:text-white transition-colors text-left cursor-pointer font-medium text-zinc-300"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('support')} 
                  className="hover:text-white transition-colors text-left cursor-pointer text-[#E5C38D] font-medium"
                >
                  Support &amp; Helpdesk
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('privacy')} 
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('terms')} 
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('cookies')} 
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Cookie Policy &amp; Preferences
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('refund')} 
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Refund Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} OstraOps Technologies Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-zinc-500">Built with precision for developers managing AI spend.</span>
            <div className="flex items-center gap-2">
              <a
                href="https://x.com/Team_Ostraops"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (formerly Twitter) @Team_Ostraops"
                title="Follow @Team_Ostraops on X"
                className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] hover:border-[#E5C38D]/50 hover:bg-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-[#E5C38D] transition-all"
              >
                <XIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com/stoppingarc01-ai/Ostra-FinOps"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                title="GitHub Repository"
                className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] hover:border-[#E5C38D]/50 hover:bg-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-[#E5C38D] transition-all"
              >
                <GithubIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
