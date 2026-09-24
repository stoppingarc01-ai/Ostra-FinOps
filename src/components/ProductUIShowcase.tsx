import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ShieldCheck, 
  CheckCircle2, 
  DollarSign
} from 'lucide-react';

export const ProductUIShowcase: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [hasVideoError, setHasVideoError] = useState<boolean>(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // If video file is not yet available, toggle interactive simulated playback
          setIsPlaying(!isPlaying);
        });
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        videoRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  return (
    <section id="ui-showcase" className="relative py-24 bg-[#FAF8F5] border-t border-[#EAE5DB] overflow-hidden">
      {/* Warm Ambient Radial Aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-ostraGold-500/10 via-sandstone-300/20 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-xs font-semibold text-ostraGold-700 uppercase tracking-wider mb-2 font-mono">
            Product Walkthrough
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-charcoal-900 tracking-[-0.02em] font-display">
            See OstraOps In Action.{' '}
            <span className="gold-gradient-text block">Simple Setup. Real-Time Protection.</span>
          </h2>
          <p className="mt-4 text-base text-charcoal-600 leading-relaxed max-w-2xl mx-auto">
            Watch a 2-minute walkthrough of how OstraOps tracks token costs live, sets hard spend caps, and keeps your AI infrastructure running predictably.
          </p>
        </div>

        {/* Demo Video Frame */}
        <div className="relative rounded-3xl bg-charcoal-950 border border-charcoal-800 shadow-dashboard-3d overflow-hidden max-w-5xl mx-auto group">
          {/* Top Video Header Bar */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-charcoal-800/80 bg-charcoal-900/90 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="font-mono text-zinc-400 font-semibold text-[11px] ml-2">
                OstraOps Demo Video • Full Walkthrough
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-ostraGold-400 bg-charcoal-800 px-2.5 py-1 rounded-md border border-charcoal-700">
                1080p HD
              </span>
            </div>
          </div>

          {/* Video Container Aspect Ratio 16:9 */}
          <div className="relative aspect-video w-full bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-black flex items-center justify-center overflow-hidden">
            {/* HTML5 Video element */}
            <video
              ref={videoRef}
              src="/demo.mp4"
              poster="/demo_poster.jpg"
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              onError={() => setHasVideoError(true)}
              className="w-full h-full object-cover"
              playsInline
            />

            {/* Cinematic Poster Overlay when paused or video file not loaded */}
            {(!isPlaying || hasVideoError) && (
              <div className="absolute inset-0 bg-charcoal-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10 transition-opacity duration-300">
                {/* Decorative Subtle Radial Glow */}
                <div className="absolute w-[450px] h-[300px] bg-ostraGold-500/15 rounded-full blur-[100px] pointer-events-none" />

                {/* Big Play Button */}
                <button
                  onClick={togglePlay}
                  className="relative group/btn w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-ostraGold-500 to-amber-300 text-charcoal-950 flex items-center justify-center shadow-[0_0_50px_rgba(212,175,124,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer mb-6"
                  title="Play Demo Walkthrough"
                >
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current translate-x-1" />
                </button>

                <h3 className="text-xl sm:text-2xl font-bold text-white font-display mb-2">
                  OstraOps Product Walkthrough
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                  Real-time token counting, spend limit verification, and zero prompt storage in action.
                </p>

                <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal-900/90 border border-charcoal-700 text-[11px] text-zinc-400 font-mono">
                  <span>Demo Video File: /public/demo.mp4</span>
                </div>
              </div>
            )}

            {/* Custom Interactive Player Controls at the Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-charcoal-950 via-charcoal-950/80 to-transparent flex flex-col gap-2 z-20">
              {/* Progress Bar */}
              <div 
                className="w-full h-1.5 bg-charcoal-800 rounded-full overflow-hidden cursor-pointer hover:h-2 transition-all"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickPos = (e.clientX - rect.left) / rect.width;
                  if (videoRef.current && videoRef.current.duration) {
                    videoRef.current.currentTime = clickPos * videoRef.current.duration;
                  }
                  setProgress(clickPos * 100);
                }}
              >
                <div 
                  className="h-full bg-gradient-to-r from-ostraGold-500 to-amber-400 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Control Buttons Strip */}
              <div className="flex items-center justify-between text-zinc-300 pt-1">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-lg hover:text-white hover:bg-charcoal-800 transition-colors cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg hover:text-white hover:bg-charcoal-800 transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  <span className="text-[11px] font-mono text-zinc-400">
                    {progress > 0 ? `0${Math.floor((progress * 1.35) / 60)}:${String(Math.floor((progress * 1.35) % 60)).padStart(2, '0')}` : '00:00'} / 02:15
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-lg hover:text-white hover:bg-charcoal-800 transition-colors cursor-pointer"
                    title="Fullscreen"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Real, Honest Product Capabilities (Insaani Bhasha) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl bg-white border border-[#EAE5DB] shadow-subtle space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
              <DollarSign className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-charcoal-900 font-sans">
              Accurate Spend Calculations
            </h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Every token is tallied against current provider rate cards. You see the true cost for each request as it happens, not at the end of the month.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EAE5DB] shadow-subtle space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-charcoal-900 font-sans">
              Hard Budget Limits
            </h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Set a firm maximum spend (daily or monthly). If an autonomous loop or test script loops infinitely, requests pause safely so your card isn't drained.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EAE5DB] shadow-subtle space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-sandstone-200/90 border border-sandstone-300 flex items-center justify-center text-charcoal-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-charcoal-900 font-sans">
              Zero Prompt Retention
            </h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              We never save, view, or train on your prompts or code. Your API calls go straight to your selected model provider with complete privacy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
