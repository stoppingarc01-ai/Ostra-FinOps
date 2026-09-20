import React from 'react';
import { Lock, Server, Key, FileCheck, ArrowRight } from 'lucide-react';

interface EnterpriseTrustProps {
  onNavigateToPricing?: () => void;
}

export const EnterpriseTrustSection: React.FC<EnterpriseTrustProps> = ({ onNavigateToPricing }) => {
  return (
    <section id="security" className="relative py-24 bg-[#FAF8F5] border-t border-[#EAE5DB] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sandstone-200 border border-sandstone-300/80 text-[11px] font-bold tracking-[0.16em] text-charcoal-700 uppercase font-mono mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>ENTERPRISE SECURITY & COMPLIANCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-charcoal-900 tracking-[-0.02em] font-display">
            Built On Zero Data Retention.{' '}
            <span className="gold-gradient-text block">By Design, Not By Promise.</span>
          </h2>
          <p className="mt-4 text-base text-charcoal-600 leading-relaxed max-w-2xl mx-auto">
            Your proprietary codebase, prompt trajectories, and system instructions never leave your machine.
          </p>
        </div>

        {/* Security Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              title: 'Zero Cloud Storage',
              desc: 'No remote databases, logs, or analytics servers. All traces reside strictly in local SQLite.',
              icon: Server,
              badge: '0 Byte Egress',
            },
            {
              title: 'AES-256 Local Encryption',
              desc: 'Trace buffer and credentials encrypted at rest using machine-derived cryptographic keys.',
              icon: Key,
              badge: 'Hardware Keyed',
            },
            {
              title: 'Air-Gapped & Offline',
              desc: 'Runs seamlessly in disconnected environments, VPC private subnets, and local vLLM nodes.',
              icon: Lock,
              badge: 'Offline Mode',
            },
            {
              title: 'SOC2 & HIPAA Compliant',
              desc: 'Architectural compliance readiness: zero third-party data processing agreements required.',
              icon: FileCheck,
              badge: 'Compliance Ready',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-3xl bg-white border border-[#EAE5DB] shadow-subtle hover:shadow-card-3d transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-sandstone-200/80 border border-sandstone-300/80 flex items-center justify-center text-charcoal-800">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-charcoal-900 font-display">
                      {item.title}
                    </h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed mt-1">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-[#EFEBE3]">
                  <span className="text-[10px] font-mono font-bold text-charcoal-700 bg-sandstone-200/80 px-2.5 py-0.5 rounded-full border border-sandstone-300">
                    {item.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Call to Action Card with 3D Depth */}
        <div className="relative rounded-3xl bg-charcoal-950 text-white border border-charcoal-800 shadow-dashboard-3d p-8 sm:p-12 overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-gradient-to-bl from-ostraGold-500/20 via-amber-500/10 to-transparent blur-[90px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ostraGold-400">
                READY TO PROTECT YOUR AGENT WORKFLOWS?
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display leading-tight">
                Start In 10 Seconds. <br className="hidden sm:inline" />
                <span className="text-zinc-300">Run Autonomous Coding Agents with Zero Budget Anxiety.</span>
              </h3>
              <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
                Free and open-core for individual developers. No credit card required. Point your IDE Base URL and go.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <button
                onClick={onNavigateToPricing}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-ostraGold-500 hover:bg-ostraGold-400 text-charcoal-950 font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="px-4 py-2.5 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center font-mono text-xs text-zinc-300">
                <span className="text-zinc-500">$</span> npx ostraops-guard
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
