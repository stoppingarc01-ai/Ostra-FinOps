import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  Copy, 
  Check, 
  Layers, 
  DollarSign, 
  Lock 
} from 'lucide-react';

interface AboutUsPageProps {
  onNavigateHome?: () => void;
  onNavigatePricing?: () => void;
  onNavigateModels?: () => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({
  onNavigateHome,
  onNavigatePricing,
  onNavigateModels,
}) => {
  const [copiedCmd, setCopiedCmd] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('npx ostraops');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const coreValues = [
    {
      title: 'Complete Cost Transparency',
      tagline: 'Count tokens down to the cent as they happen.',
      desc: 'Most cloud dashboards only show usage hours or days after requests finish. OstraOps measures input and output tokens against official provider rate cards in real time, so you always know your exact financial burn rate.',
      icon: DollarSign,
      points: [
        'Real-time token counting per API call',
        'Official pricing tables for OpenAI, Claude, Gemini, and DeepSeek',
        'No hidden markups or mysterious overhead fees'
      ]
    },
    {
      title: 'Firm Budget Hard Limits',
      tagline: 'Stop runaway loops before they drain your card.',
      desc: 'A single coding agent trapped in an infinite reasoning loop or an unoptimized batch job can rack up thousands of dollars overnight. OstraOps lets you set firm daily or monthly budget limits that safely pause requests before overspending occurs.',
      icon: Zap,
      points: [
        'Custom daily, weekly, and monthly spend caps',
        'Graceful pause mechanism instead of silent overcharging',
        'Instant alerts as you approach your chosen threshold'
      ]
    },
    {
      title: '100% Data Privacy & Zero Retention',
      tagline: 'Your code and prompts stay strictly private.',
      desc: 'We never store, log, or inspect your private prompts, user messages, or application source code. Your API calls travel directly between your environment and your chosen model provider with complete confidentiality.',
      icon: Lock,
      points: [
        'Zero prompt storage or remote logging',
        'No training or fine-tuning on your intellectual property',
        'Keep and use your own official provider API keys'
      ]
    },
    {
      title: 'Freedom from Vendor Lock-In',
      tagline: 'Pick the right model for the job without rewrites.',
      desc: 'AI evolves fast. Locking your codebase into a single model provider makes your stack fragile and expensive. OstraOps supports 40+ models across 9 providers, letting you compare costs and switch models seamlessly.',
      icon: Layers,
      points: [
        'Support for 40+ models from Claude 3.7 to DeepSeek R1',
        'Side-by-side token cost and context comparisons',
        'Smooth fallback paths if a model experiences downtime'
      ]
    }
  ];

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-10 max-w-[1540px] mx-auto relative overflow-hidden select-none">
      {/* Warm Ambient Radial Glow Background */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-ostraGold-400/15 via-sandstone-300/20 to-transparent blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-96 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-amber-200/10 via-ostraGold-300/5 to-transparent blur-[130px] pointer-events-none -z-10" />

      {/* Top Navigation Bar */}
      <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-sandstone-100 text-charcoal-700 hover:text-charcoal-900 border border-[#EAE5DB] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {onNavigateModels && (
            <button
              onClick={onNavigateModels}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-sandstone-100 text-charcoal-700 border border-[#EAE5DB] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-ostraGold-600" />
              <span>Models Directory</span>
            </button>
          )}
          {onNavigatePricing && (
            <button
              onClick={onNavigatePricing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold font-sans transition-colors shadow-xs cursor-pointer"
            >
              <span>View Pricing</span>
              <ArrowRight className="w-3.5 h-3.5 text-ostraGold-400" />
            </button>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6 mb-20">
        <p className="text-xs font-semibold text-ostraGold-700 uppercase tracking-wider font-mono">
          Our Story &amp; Mission
        </p>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-charcoal-900 font-display leading-[1.12]">
          Built For Developers.{' '}
          <span className="gold-gradient-text">Designed For Cost Peace of Mind.</span>
        </h1>

        <p className="text-base sm:text-lg text-charcoal-600 leading-relaxed max-w-3xl mx-auto font-normal">
          We built <strong className="text-charcoal-900 font-semibold">OstraOps</strong> because we love developing with modern AI models, but grew tired of surprise invoices and opaque billing dashboards. Whether you're a solo builder experimenting with agents or a high-velocity engineering team, you deserve to know your exact spend and have full control over your budget.
        </p>

        {/* Quick Command Box */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[#EAE5DB] shadow-2xs font-mono text-xs text-charcoal-800">
            <span className="text-charcoal-400">$</span>
            <span className="font-semibold text-charcoal-900">npx ostraops</span>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-sandstone-100 rounded-md transition-colors text-charcoal-500 hover:text-charcoal-900 cursor-pointer"
              title="Copy to clipboard"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <span className="text-xs text-charcoal-500 font-sans">Zero complicated setup • Ready in seconds</span>
        </div>
      </div>

      {/* The Problem We Solve (Insaani Bhasha) */}
      <div className="mb-20 p-8 sm:p-12 rounded-3xl bg-white border border-[#EAE5DB] shadow-subtle max-w-5xl mx-auto space-y-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-ostraGold-700 uppercase tracking-wider mb-2 font-mono">
            The Reality of AI Development
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-sans">
            Why AI Billing Creates Constant Anxiety
          </h2>
          <p className="mt-3 text-sm sm:text-base text-charcoal-600 leading-relaxed">
            AI APIs charge per token. A developer testing an autonomous coding agent, running recursive test generation, or building a multi-agent workflow can easily trigger hundreds of thousands of tokens within an hour.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#EAE5DB]">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 text-sm font-bold font-mono">
              01
            </div>
            <h4 className="text-sm font-bold text-charcoal-900">Delayed Billing Dashboards</h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Provider dashboards often take hours to update. By the time you notice an unexpected spike, your credit card has already been charged.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 text-sm font-bold font-mono">
              02
            </div>
            <h4 className="text-sm font-bold text-charcoal-900">Runaway Infinite Loops</h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Autonomous agents can easily hallucinate and loop recursively through files, consuming thousands of tokens every minute without stopping.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 text-sm font-bold font-mono">
              03
            </div>
            <h4 className="text-sm font-bold text-charcoal-900">OstraOps Solution</h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              We intercept requests in real time, compare them against your budget limit, and pause gracefully before you get overcharged.
            </p>
          </div>
        </div>
      </div>

      {/* Core Principles (What We Stand For) */}
      <div className="mb-20 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <p className="text-xs font-semibold text-ostraGold-700 uppercase tracking-wider font-mono">
            Our Principles
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900 font-display">
            What We Stand For
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500">
            Honest engineering, transparent data, and developer-first design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreValues.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-white border border-[#EAE5DB] shadow-subtle hover:shadow-card-3d transition-all duration-200 space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-sandstone-200/90 border border-sandstone-300 flex items-center justify-center text-charcoal-900">
                  <Icon className="w-6 h-6 text-ostraGold-700" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-charcoal-900 font-sans">
                    {val.title}
                  </h3>
                  <p className="text-xs font-medium text-ostraGold-700">
                    {val.tagline}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  {val.desc}
                </p>

                <div className="pt-3 border-t border-[#EAE5DB] space-y-2">
                  {val.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-xs text-charcoal-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Call to Action */}
      <div className="p-8 sm:p-12 rounded-3xl bg-charcoal-950 text-white border border-charcoal-800 shadow-dashboard-3d text-center max-w-4xl mx-auto space-y-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
          Ready to Take Control of Your AI Spend?
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
          Join hundreds of developers and engineering teams who build with AI with complete financial clarity.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {onNavigatePricing && (
            <button
              onClick={onNavigatePricing}
              className="px-6 py-3 rounded-full bg-ostraGold-500 hover:bg-ostraGold-400 text-charcoal-950 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md"
            >
              View Plans &amp; Pricing
            </button>
          )}

          {onNavigateModels && (
            <button
              onClick={onNavigateModels}
              className="px-6 py-3 rounded-full bg-charcoal-900 hover:bg-charcoal-800 border border-charcoal-700 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Browse Model Directory
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
