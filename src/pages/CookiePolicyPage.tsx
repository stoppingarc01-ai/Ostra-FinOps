import React, { useState, useEffect } from 'react';
import {
  Cookie,
  Sliders,
  CheckCircle2,
  Lock,
  HardDrive,
  Cpu,
  Layers,
  Check,
  Copy,
  Printer,
  ChevronRight
} from 'lucide-react';
import { LegalNavHeader } from '../components/LegalNavHeader';

interface CookiePolicyPageProps {
  onNavigate: (route: string) => void;
}

export const CookiePolicyPage: React.FC<CookiePolicyPageProps> = ({ onNavigate }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [prefFunctional, setPrefFunctional] = useState(true);
  const [prefTelemetry, setPrefTelemetry] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ostraops_cookie_preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.functional === 'boolean') setPrefFunctional(parsed.functional);
        if (typeof parsed.telemetry === 'boolean') setPrefTelemetry(parsed.telemetry);
      }
    } catch {}
  }, []);

  const handleSavePreferences = () => {
    try {
      localStorage.setItem(
        'ostraops_cookie_preferences',
        JSON.stringify({
          essential: true,
          functional: prefFunctional,
          telemetry: prefTelemetry,
          updated_at: new Date().toISOString(),
        })
      );
      localStorage.setItem('ostraops_cookie_consent', 'custom');
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } catch {}
  };

  const handleCopyLink = (sectionId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
    navigator.clipboard.writeText(url);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const sections = [
    { id: 'interactive-manager', title: '1. Interactive Cookie Preferences' },
    { id: 'technologies-overview', title: '2. Overview of Web Storage Tech' },
    { id: 'storage-inventory', title: '3. Complete Key Inventory & Purpose' },
    { id: 'local-spool-storage', title: '4. Gateway Disk Spool & Edge Storage' },
    { id: 'third-party-cookies', title: '5. Third-Party Integrations' },
    { id: 'browser-controls', title: '6. Managing & Clearing Storage' },
    { id: 'governance-contact', title: '7. Policy Updates & Inquiries' },
  ];

  return (
    <div className="min-h-screen bg-[#07090C] text-zinc-100 font-sans selection:bg-[#C59E5F]/20 selection:text-[#FFF4D6] pb-24">
      {/* Top Header Navigation */}
      <LegalNavHeader currentPage="cookies" onNavigate={onNavigate} />

      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161C22] text-[#FFF4D6] px-4 py-3 rounded-2xl shadow-2xl border border-[#C59E5F]/40 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#E5C38D]" />
          <span>Cookie &amp; storage preferences updated successfully!</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <section className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-[#0D1117] via-[#090C10] to-[#07090C] pt-14 pb-12 sm:pt-20 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-[#C59E5F]/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C59E5F]/10 border border-[#C59E5F]/30 text-[#E5C38D] text-xs font-mono font-semibold tracking-wide">
            <Cookie className="w-3.5 h-3.5" />
            <span>COOKIE, LOCAL STORAGE &amp; DATA GOVERNANCE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-sans">
            Cookie &amp; Storage Policy
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Transparent disclosure of how OstraOps utilizes HTTP cookies, browser LocalStorage, and local gateway disk buffers.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Effective: January 1, 2026
            </span>
            <span className="text-zinc-600">•</span>
            <span>Last Revised: March 26, 2026</span>
            <span className="text-zinc-600">•</span>
            <span className="text-[#E5C38D] font-semibold">Version: 2.0-Audit</span>
          </div>

          {/* Action Toolbar */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Policy</span>
            </button>
            <button
              onClick={() => handleCopyLink('interactive-manager')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              {copiedSection === 'interactive-manager' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Manager Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Preferences Manager Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Sticky Table of Contents */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C38D]">
                    Storage Policy Menu
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">7 Sections</span>
                </div>

                <nav className="space-y-1">
                  {sections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all truncate"
                    >
                      {sec.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Related Policies Box */}
              <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Related Documents
                </span>
                <div className="space-y-2">
                  <button
                    onClick={() => onNavigate('privacy')}
                    className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-xs font-semibold text-zinc-300 hover:text-[#E5C38D] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Privacy Policy &amp; Zero-Storage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigate('terms')}
                    className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-xs font-semibold text-zinc-300 hover:text-[#E5C38D] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Terms of Service</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Content & Interactive Controls */}
          <div className="lg:col-span-8 space-y-12 leading-relaxed text-zinc-300">
            {/* 1. Interactive Manager */}
            <section id="interactive-manager" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#C59E5F]" />
                  <span>1. Interactive Cookie Preferences Manager</span>
                </h2>
                <button onClick={() => handleCopyLink('interactive-manager')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm">
                Control your web storage permissions in real time. Changes take effect immediately in your current browser session and persist across visits:
              </p>

              {/* Preference Controls Card */}
              <div className="p-6 rounded-2xl bg-[#0B0E14] border border-[#C59E5F]/30 shadow-2xl space-y-5">
                {/* 1. Essential */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.06]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold text-white">Strictly Necessary Storage</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-zinc-400">
                        ALWAYS ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Required for Firebase authentication session integrity, CSRF tokens, and security routing. Without these, you cannot log in or manage your virtual keys.
                    </p>
                  </div>
                  <div className="shrink-0 pt-1">
                    <div className="w-10 h-5 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center px-1 cursor-not-allowed">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 translate-x-4 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* 2. Functional */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.06]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#C59E5F]" />
                      <span className="text-sm font-bold text-white">Functional &amp; Console Preferences</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Remembers your active workspace organization, model filter preferences, table sorting states, and localized currency selection (USD, EUR, INR).
                    </p>
                  </div>
                  <div className="shrink-0 pt-1">
                    <button
                      onClick={() => setPrefFunctional(!prefFunctional)}
                      className={`w-10 h-5 rounded-full transition-colors flex items-center px-1 cursor-pointer ${
                        prefFunctional ? 'bg-[#C59E5F]' : 'bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                          prefFunctional ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 3. Telemetry */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-bold text-white">Edge Telemetry Diagnostics</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Measures client-side gateway latency milliseconds and network retry rates. Never collects or logs prompt payloads or code snippets.
                    </p>
                  </div>
                  <div className="shrink-0 pt-1">
                    <button
                      onClick={() => setPrefTelemetry(!prefTelemetry)}
                      className={`w-10 h-5 rounded-full transition-colors flex items-center px-1 cursor-pointer ${
                        prefTelemetry ? 'bg-purple-600' : 'bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                          prefTelemetry ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-3 flex items-center justify-between border-t border-white/[0.06]">
                  <span className="text-xs text-zinc-400">
                    Preferences are stored locally in your browser.
                  </span>
                  <button
                    onClick={handleSavePreferences}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] hover:opacity-95 text-[#080A0E] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 2. Overview */}
            <section id="technologies-overview" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  2. Overview of Web Storage Tech
                </h2>
                <button onClick={() => handleCopyLink('technologies-overview')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm">
                OstraOps uses modern, transparent web technologies rather than legacy tracking cookies:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1">
                  <strong className="text-white block">HTTP Only Cookies</strong>
                  <span className="text-zinc-400">Encrypted server tokens inaccessible to client scripts, protecting against Cross-Site Scripting (XSS).</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1">
                  <strong className="text-white block">HTML5 LocalStorage</strong>
                  <span className="text-zinc-400">Key-value browser storage storing UI layout choices and local cache states without transmitting to web servers on each HTTP hit.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1">
                  <strong className="text-white block">SessionStorage</strong>
                  <span className="text-zinc-400">Temporary tab-scoped state cleared immediately when your browser tab closes, such as selected pricing checkout plans.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1">
                  <strong className="text-white block">No 3rd-Party Ad Pixels</strong>
                  <span className="text-zinc-400">We do NOT install Meta Pixels, Google AdSense, retargeting beacons, or behavioral fingerprinting trackers.</span>
                </div>
              </div>
            </section>

            {/* 3. Storage Key Inventory */}
            <section id="storage-inventory" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  3. Complete Key Inventory &amp; Purpose
                </h2>
                <button onClick={() => handleCopyLink('storage-inventory')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm">
                Every storage key utilized across the OstraOps web console is enumerated below:
              </p>

              <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0B0E14] text-zinc-400 border-b border-white/[0.08] font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Storage Key</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Purpose</th>
                      <th className="py-2.5 px-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-zinc-300 font-mono text-[11.5px]">
                    <tr>
                      <td className="py-2.5 px-3 text-[#E5C38D]">firebase:authUser:...</td>
                      <td className="py-2.5 px-3 text-zinc-400">LocalStorage</td>
                      <td className="py-2.5 px-3">Active authenticated user session credentials</td>
                      <td className="py-2.5 px-3 text-zinc-400">Persistent / Signout</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-[#E5C38D]">ostraops_cookie_consent</td>
                      <td className="py-2.5 px-3 text-zinc-400">LocalStorage</td>
                      <td className="py-2.5 px-3">Stores banner dismissal or consent state</td>
                      <td className="py-2.5 px-3 text-zinc-400">12 Months</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-[#E5C38D]">ostraops_cookie_preferences</td>
                      <td className="py-2.5 px-3 text-zinc-400">LocalStorage</td>
                      <td className="py-2.5 px-3">Custom JSON granular toggles for functional/telemetry</td>
                      <td className="py-2.5 px-3 text-zinc-400">12 Months</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-[#E5C38D]">ostraops_onboarding_completed</td>
                      <td className="py-2.5 px-3 text-zinc-400">LocalStorage</td>
                      <td className="py-2.5 px-3">Flags whether user finished the 5-step setup flow</td>
                      <td className="py-2.5 px-3 text-zinc-400">Persistent</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-[#E5C38D]">ostraops_active_plan</td>
                      <td className="py-2.5 px-3 text-zinc-400">LocalStorage</td>
                      <td className="py-2.5 px-3">Current workspace plan tier for tier-gated UI elements</td>
                      <td className="py-2.5 px-3 text-zinc-400">Persistent</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-[#E5C38D]">ostraops_pending_plan</td>
                      <td className="py-2.5 px-3 text-zinc-400">SessionStorage</td>
                      <td className="py-2.5 px-3">Preserves checkout plan selection from pricing page</td>
                      <td className="py-2.5 px-3 text-zinc-400">Session only</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-[#E5C38D]">ostraops_currency</td>
                      <td className="py-2.5 px-3 text-zinc-400">LocalStorage</td>
                      <td className="py-2.5 px-3">Preferred display currency (USD, EUR, GBP, INR)</td>
                      <td className="py-2.5 px-3 text-zinc-400">12 Months</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4. Local Spool Storage */}
            <section id="local-spool-storage" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  4. Gateway Disk Spool &amp; Edge Storage
                </h2>
                <button onClick={() => handleCopyLink('local-spool-storage')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-2 text-xs">
                <div className="text-amber-400 font-semibold flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4" />
                  <span>The Local Dead-Letter Spool (<code className="text-white font-mono">ostraops_spool.db</code>)</span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  When developers run the OstraOps gateway proxy on local machines or inside Docker containers (<code className="text-[#E5C38D] font-mono">npm run gateway</code> or <code className="text-[#E5C38D] font-mono">vss server</code>), network telemetry events are queued into an asynchronous ring buffer. 
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  If the central telemetry sink is momentarily unavailable, events are written to a localized SQLite file (<code className="text-white font-mono">ostraops_spool.db</code>). This file holds exclusively numerical counts (prompt tokens, completion tokens, latency, status code), NEVER prompt text or model completions. It automatically flushes and truncates upon reconnecting.
                </p>
              </div>
            </section>

            {/* 5. Third Party */}
            <section id="third-party-cookies" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  5. Third-Party Integrations
                </h2>
                <button onClick={() => handleCopyLink('third-party-cookies')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm">
                We integrate solely with verified enterprise providers:
              </p>
              <ul className="text-xs sm:text-sm list-disc list-inside space-y-1 text-zinc-400 pl-2">
                <li><strong className="text-white">Stripe Inc.:</strong> Provides PCI-DSS compliant payment authentication cookies (<code className="text-zinc-300 font-mono">__stripe_mid</code>, <code className="text-zinc-300 font-mono">__stripe_sid</code>) for fraud prevention on billing checkout pages.</li>
                <li><strong className="text-white">Supabase / PostgreSQL:</strong> Transmits encrypted JWT authorization bearer tokens in authorization headers during telemetry sync.</li>
                <li><strong className="text-white">Firebase Auth:</strong> Google Identity OAuth tokens for secure single sign-on.</li>
              </ul>
            </section>

            {/* 6. Browser Controls */}
            <section id="browser-controls" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  6. Managing &amp; Clearing Storage
                </h2>
                <button onClick={() => handleCopyLink('browser-controls')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm">
                You can inspect or delete all browser cookies and LocalStorage records at any time using your browser&apos;s developer tools or settings:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1">
                  <span className="text-white font-semibold block">Google Chrome / Chromium</span>
                  <span className="text-zinc-400">Settings &gt; Privacy and security &gt; Third-party cookies &gt; See all site data and permissions.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1">
                  <span className="text-white font-semibold block">Mozilla Firefox</span>
                  <span className="text-zinc-400">Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data &gt; Clear Data.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1">
                  <span className="text-white font-semibold block">Apple Safari</span>
                  <span className="text-zinc-400">Preferences &gt; Privacy &gt; Manage Website Data &gt; Remove All.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] space-y-1">
                  <span className="text-white font-semibold block">Global Privacy Control (GPC)</span>
                  <span className="text-zinc-400">We respect the GPC browser signal and automatically disable non-essential tracking when detected.</span>
                </div>
              </div>
            </section>

            {/* 7. Contact */}
            <section id="governance-contact" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  7. Policy Updates &amp; Inquiries
                </h2>
                <button onClick={() => handleCopyLink('governance-contact')} className="text-zinc-500 hover:text-[#E5C38D] p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-2">
                <p className="text-sm text-zinc-300">
                  For questions regarding our web storage architecture or data governance policies, reach out to our privacy engineering team:
                </p>
                <div className="text-xs font-mono text-zinc-400 space-y-1">
                  <div><strong className="text-white">Email:</strong> privacy@ostraops.com</div>
                  <div><strong className="text-white">Organization:</strong> OstraOps Technologies Inc. (Attn: Data Governance)</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
