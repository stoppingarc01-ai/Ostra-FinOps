import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { OstraLogo } from './OstraBrand';

interface FooterProps {
  onNavigate?: (route: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#FAF8F5] border-t border-borderLight py-16 text-charcoal-600 text-xs">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
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
              Deterministic financial gateway and observability engine for autonomous AI coding agents (Cursor, Cline, Antigravity, Aider).
            </p>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-800 font-mono">Product</span>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate && onNavigate('home')} className="hover:text-charcoal-900 transition-colors text-left cursor-pointer">Cost Guardrails</button></li>
              <li><button onClick={() => onNavigate && onNavigate('home')} className="hover:text-charcoal-900 transition-colors text-left cursor-pointer">Agent Tracing</button></li>
              <li><button onClick={() => onNavigate && onNavigate('home')} className="hover:text-charcoal-900 transition-colors text-left cursor-pointer">Intra-Family Failover</button></li>
              <li><button onClick={() => onNavigate && onNavigate('home')} className="hover:text-charcoal-900 transition-colors text-left cursor-pointer">Local Loopback Proxy</button></li>
              <li><button onClick={() => onNavigate && onNavigate('models')} className="hover:text-charcoal-900 transition-colors text-left cursor-pointer font-semibold text-charcoal-800">AI Models &amp; Specs Catalog</button></li>
              <li><button onClick={() => { onNavigate && onNavigate('home'); setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-charcoal-900 transition-colors text-left cursor-pointer">Architecture FAQ</button></li>
              <li><button onClick={() => onNavigate && onNavigate('pricing')} className="hover:text-charcoal-900 transition-colors text-left cursor-pointer">Team Gateway &amp; Pricing</button></li>
            </ul>
          </div>

          {/* Column 2: Developers */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-800 font-mono">Developers</span>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/stoppingarc01-ai/Ostra-FinOps" target="_blank" rel="noreferrer" className="hover:text-charcoal-900 transition-colors flex items-center gap-1">
                  <span>GitHub</span>
                  <ArrowUpRight className="w-3 h-3 text-charcoal-400" />
                </a>
              </li>
              <li><a href="#docs" className="hover:text-charcoal-900 transition-colors">Documentation</a></li>
              <li><a href="#cursor" className="hover:text-charcoal-900 transition-colors">Cursor Integration</a></li>
              <li><a href="#cline" className="hover:text-charcoal-900 transition-colors">Cline / Roo Integration</a></li>
              <li><a href="#npm" className="hover:text-charcoal-900 transition-colors">npm ostraops-guard</a></li>
            </ul>
          </div>

          {/* Column 3: Trust & Company */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-800 font-mono">Trust &amp; Company</span>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate && onNavigate('about')} className="hover:text-charcoal-900 transition-colors text-left cursor-pointer">About Us</button></li>
              <li><button onClick={() => onNavigate && onNavigate('privacy')} className="hover:text-charcoal-900 transition-colors text-left cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate && onNavigate('terms')} className="hover:text-charcoal-900 transition-colors text-left cursor-pointer">Terms &amp; Conditions</button></li>
              <li><button onClick={() => onNavigate && onNavigate('cookies')} className="hover:text-charcoal-900 transition-colors text-left cursor-pointer">Cookie Policy &amp; Controls</button></li>
              <li><button onClick={() => onNavigate && onNavigate('home')} className="hover:text-charcoal-900 transition-colors text-left cursor-pointer">Security Architecture</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-borderLight flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-charcoal-400">
          <div>
            © {new Date().getFullYear()} OstraOps Technologies Inc. All rights reserved. Zero external code retention guaranteed.
          </div>
          <div className="font-mono text-charcoal-500">
            Aesthetic: Warm Sandstone &amp; Deep Charcoal (#FAF8F5 / #18181B)
          </div>
        </div>
      </div>
    </footer>
  );
};
