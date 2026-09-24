import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { OstraLogo } from './OstraBrand';

interface FooterProps {
  onNavigate?: (route: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#FAF8F5] border-t border-[#EAE5DC] pt-16 pb-12 text-charcoal-600 text-xs">
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
                textClassName="text-xl font-bold tracking-tight text-charcoal-900 font-sans"
                variant="gold"
                showTagline={false}
              />
            </button>
            <p className="text-xs text-charcoal-500 max-w-sm leading-relaxed">
              OstraOps gives developers and teams real-time spend visibility, hard budget limits, and complete data privacy across Claude, OpenAI, Gemini, and DeepSeek.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Zero prompt storage • Direct provider communication</span>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-900 font-mono">Product</span>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('home')} 
                  className="hover:text-charcoal-900 transition-colors text-left cursor-pointer"
                >
                  Spend Guardrails
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('models')} 
                  className="hover:text-charcoal-900 transition-colors text-left cursor-pointer font-medium text-charcoal-800"
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
                  className="hover:text-charcoal-900 transition-colors text-left cursor-pointer"
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
                  className="hover:text-charcoal-900 transition-colors text-left cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('pricing')} 
                  className="hover:text-charcoal-900 transition-colors text-left cursor-pointer font-semibold text-charcoal-900"
                >
                  Plans &amp; Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Developers */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-900 font-mono">Developers</span>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/stoppingarc01-ai/Ostra-FinOps" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-charcoal-900 transition-colors flex items-center gap-1"
                >
                  <span>GitHub Repository</span>
                  <ArrowUpRight className="w-3 h-3 text-charcoal-400" />
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
                  className="hover:text-charcoal-900 transition-colors cursor-pointer text-left"
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
                  className="hover:text-charcoal-900 transition-colors cursor-pointer text-left"
                >
                  Editor &amp; Agent Setup
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Trust */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-900 font-mono">Company</span>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('about')} 
                  className="hover:text-charcoal-900 transition-colors text-left cursor-pointer font-medium text-charcoal-800"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('privacy')} 
                  className="hover:text-charcoal-900 transition-colors text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('terms')} 
                  className="hover:text-charcoal-900 transition-colors text-left cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('cookies')} 
                  className="hover:text-charcoal-900 transition-colors text-left cursor-pointer"
                >
                  Cookie Policy &amp; Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#EAE5DC] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-charcoal-500">
          <div>
            &copy; {new Date().getFullYear()} OstraOps Technologies Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 text-charcoal-500">
            <span>Built with precision for developers managing AI spend.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
