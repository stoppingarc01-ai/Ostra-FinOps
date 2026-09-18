import React from 'react';
import {
  Radio,
  ShieldCheck,
  RefreshCw,
  BarChart2,
  TrendingUp,
  ArrowDown,
} from 'lucide-react';
import { RobotMascot } from './RobotMascot';

export const HowDaemonWorks: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Intercepts your requests',
      desc: 'Works with any AI tool or SDK on loopback 4040.',
      icon: Radio,
    },
    {
      num: '2',
      title: 'Checks your limits',
      desc: 'Blocks overspend, prevents abuse before dispatch.',
      icon: ShieldCheck,
    },
    {
      num: '3',
      title: 'Routes to the best model',
      desc: 'With smart failover and latency optimization.',
      icon: RefreshCw,
    },
    {
      num: '4',
      title: 'Tracks usage & cost',
      desc: 'Real-time WAL monitoring and instant alerts.',
      icon: BarChart2,
    },
    {
      num: '5',
      title: 'Gives you insights',
      desc: 'Make better decisions, save spend automatically.',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#EAE4D8] p-5 shadow-subtle flex flex-col justify-between h-[520px] font-sans">
      {/* Card Header matching inspiration */}
      <div>
        <div className="pb-3 border-b border-[#F5F2EB] mb-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-charcoal-900 tracking-tight">
              How the Daemon Works
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EAE3D2] text-charcoal-800 font-mono">
              Always On
            </span>
          </div>
          <p className="text-[11px] text-charcoal-500 mt-0.5">
            Automatic. Silent. Powerful.
          </p>
        </div>

        {/* 5-Step Process Timeline */}
        <div className="space-y-1.5">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#FAF8F5] transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-[#0C2419] text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-charcoal-900 leading-tight">
                      {s.title}
                    </h4>
                    <p className="text-[10.5px] text-charcoal-500 leading-tight truncate">
                      {s.desc}
                    </p>
                  </div>
                </div>

                {idx < steps.length - 1 && (
                  <div className="flex justify-center my-0.2">
                    <ArrowDown className="w-2.5 h-2.5 text-charcoal-300" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mascot On Pedestal with Speech Bubble (matching inspiration layout) */}
      <div className="pt-2 border-t border-[#F5F2EB] flex items-center justify-center gap-3.5 relative overflow-visible">
        {/* Robot on Pedestal (LEFT) */}
        <div className="shrink-0 relative z-10 flex flex-col items-center">
          <RobotMascot size={76} withPedestal={true} />
        </div>

        {/* Speech Bubble (RIGHT of Robot) */}
        <div className="relative z-10 bg-white border border-[#DDD6C7] rounded-2xl px-3.5 py-2.5 shadow-subtle max-w-[190px] mb-2">
          {/* Left Arrow Tail pointing directly to the Robot */}
          <div
            className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-0 h-0"
            style={{
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderRight: '7px solid #DDD6C7',
            }}
          />
          <div
            className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-0 h-0"
            style={{
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderRight: '6px solid #FFFFFF',
            }}
          />

          <p className="text-xs font-bold text-charcoal-900 leading-tight">
            I've got your back!
          </p>
          <p className="text-[10.5px] text-charcoal-500 mt-0.5 leading-snug">
            Keep building. I'll handle the rest.
          </p>
        </div>

        {/* Subtle Ambient Radial Glow */}
        <div className="absolute left-8 bottom-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
      </div>
    </div>
  );
};
