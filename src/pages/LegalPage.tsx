import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Cookie, 
  ArrowLeft, 
  CheckCircle2, 
  Scale,
  Check,
  Database,
  Lock,
  Sliders
} from 'lucide-react';
import { OstraLogo } from '../components/OstraBrand';

interface LegalPageProps {
  initialTab?: 'privacy' | 'terms' | 'cookies';
  onNavigateHome: () => void;
  onNavigatePricing: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({
  initialTab = 'privacy',
  onNavigateHome,
  onNavigatePricing,
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'cookies'>(initialTab);
  
  // Interactive Cookie Preferences State
  const [prefFunctional, setPrefFunctional] = useState(true);
  const [prefTelemetry, setPrefTelemetry] = useState(true);
  const [cookieSavedToast, setCookieSavedToast] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleSwitchTab = (tab: 'privacy' | 'terms' | 'cookies') => {
    setActiveTab(tab);
    window.history.pushState(null, '', `#${tab}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCookiePreferences = () => {
    localStorage.setItem('osterdops_cookie_preferences', JSON.stringify({
      essential: true,
      functional: prefFunctional,
      telemetry: prefTelemetry,
      updated_at: new Date().toISOString(),
    }));
    localStorage.setItem('osterdops_cookie_consent', 'custom');
    setCookieSavedToast(true);
    setTimeout(() => setCookieSavedToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-charcoal-900 font-sans antialiased selection:bg-osterdGold-500/20 selection:text-charcoal-900 pb-24">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE5DC] px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <OstraLogo
              iconClassName="w-8 h-8 group-hover:scale-105 transition-transform duration-200"
              textClassName="text-xl font-bold tracking-tight text-[#0B0F0F] font-sans"
              variant="charcoal"
              showTagline={true}
              taglineType="control"
            />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigatePricing}
            className="text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 transition-colors"
          >
            Pricing &amp; Plans
          </button>
          <button
            onClick={onNavigateHome}
            className="px-3.5 py-1.5 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Site</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 sm:px-8 pt-10">
        
        {/* Title & Metadata */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sandstone-200 text-charcoal-800 text-xs font-mono font-bold">
            <Scale className="w-3.5 h-3.5 text-charcoal-700" />
            <span>TRUST, PRIVACY &amp; COMPLIANCE CENTER</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal-900 tracking-tight">
            Legal &amp; Data Governance
          </h1>

          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-xl mx-auto">
            Clear, transparent, and developer-centric. Learn how OsterdOps protects your source code, governs AI spending, and handles data.
          </p>

          <div className="text-[11px] font-mono text-charcoal-400 pt-1">
            Last Updated: September 18, 2026 • Version 2.4.0
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center justify-center mb-10">
          <div className="p-1 rounded-2xl bg-[#EFEAE0] border border-[#E4DDD0] inline-flex items-center gap-1 shadow-inner max-w-full overflow-x-auto">
            <button
              onClick={() => handleSwitchTab('privacy')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privacy Policy</span>
            </button>

            <button
              onClick={() => handleSwitchTab('terms')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Terms &amp; Conditions</span>
            </button>

            <button
              onClick={() => handleSwitchTab('cookies')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'cookies'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Cookie className="w-4 h-4 text-amber-700" />
              <span>Cookie Policy &amp; Controls</span>
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {cookieSavedToast && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-charcoal-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-charcoal-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cookie preferences updated successfully!</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 1: PRIVACY POLICY                                        */}
        {/* ============================================================ */}
        {activeTab === 'privacy' && (
          <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-subtle p-7 sm:p-12 space-y-10">
            
            {/* Callout: Local Loopback Guarantee */}
            <div className="p-5 rounded-2xl bg-[#FCFAF7] border border-[#EAE4D8] flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-charcoal-900">
                  Zero Prompt &amp; Code Retention Commitment
                </h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  When you run <code>osterdops-guard</code> locally, it binds strictly to <code>127.0.0.1:8080</code>. Your prompts, source code files, and model completions never transit through OsterdOps servers. Logs persist exclusively to your local disk (<code>~/.osterdops/telemetry.db</code>).
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-charcoal-900 flex items-center gap-2">
                <span className="text-osterdGold-600 font-mono text-sm">01.</span>
                <span>Introduction &amp; Scope</span>
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
                This Privacy Policy outlines how OsterdOps Technologies Inc. (&quot;OsterdOps&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses, and safeguards information when you use our local telemetry proxy daemon (<code>osterdops-guard</code>), cloud-hosted API gateway (<code>gateway.osterdops.com</code>), and management console.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-charcoal-900 flex items-center gap-2">
                <span className="text-osterdGold-600 font-mono text-sm">02.</span>
                <span>Information We Collect</span>
              </h2>
              <div className="text-xs sm:text-sm text-charcoal-700 leading-relaxed space-y-3">
                <p>We believe in radical data minimization. We only collect the following operational data:</p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li><strong>Account Credentials:</strong> Email address, user identifier, and profile name managed securely via Firebase Authentication.</li>
                  <li><strong>Subscription &amp; Billing Records:</strong> Chosen tier (Solo Pro, Team Gateway), billing cycle, country of payment, and transaction status. Raw card numbers are processed directly by Stripe or Razorpay and are never stored on OsterdOps servers.</li>
                  <li><strong>Aggregated Gateway Telemetry:</strong> For Hosted Gateway users, we log metadata including request timestamp, model identifier (e.g. <code>claude-3-5-sonnet</code>), token consumption volume, HTTP status code, and latency for spend enforcement.</li>
                  <li><strong>Voluntary Support Communications:</strong> Bug reports, feature suggestions, or direct inquiries sent to our engineering team.</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-charcoal-900 flex items-center gap-2">
                <span className="text-osterdGold-600 font-mono text-sm">03.</span>
                <span>How We Protect Your API Keys</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#EAE5DC] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-charcoal-900">
                    <Database className="w-4 h-4 text-charcoal-700" />
                    <span>Solo Developer Mode (Local Proxy)</span>
                  </div>
                  <p className="text-xs text-charcoal-600 leading-relaxed">
                    Master API keys (OpenAI, Anthropic, Google) live in your own local environment variables. The proxy decrypts them in local RAM on your machine only.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#EAE5DC] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-charcoal-900">
                    <Lock className="w-4 h-4 text-charcoal-700" />
                    <span>Team Hosted Gateway (Cloud Edge)</span>
                  </div>
                  <p className="text-xs text-charcoal-600 leading-relaxed">
                    Keys are stored in an AES-256 encrypted hardware security vault. Engineers are granted scoped virtual tokens (<code>ost_live_...</code>) so master production keys are never exposed.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-charcoal-900 flex items-center gap-2">
                <span className="text-osterdGold-600 font-mono text-sm">04.</span>
                <span>Global Compliance &amp; Regional Rights</span>
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
                OsterdOps complies with international privacy frameworks:
              </p>
              <div className="space-y-2 text-xs text-charcoal-700 pl-2">
                <div>• <strong>European Union (GDPR):</strong> You have the right to access, rectify, or request erasure of your account records under Articles 15-20.</div>
                <div>• <strong>India (DPDP Act 2023):</strong> Local currency billing compliance with transparent domestic invoice retention.</div>
                <div>• <strong>California (CCPA/CPRA):</strong> We do not sell or share personal information with data brokers or advertising networks.</div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="space-y-3 border-t border-[#EAE5DC] pt-6">
              <h2 className="text-sm font-bold text-charcoal-900">Contact the Privacy Officer</h2>
              <p className="text-xs text-charcoal-600">
                For questions, data export, or deletion requests, contact our legal team at <a href="mailto:privacy@osterdops.com" className="font-bold underline text-charcoal-900">privacy@osterdops.com</a>.
              </p>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: TERMS & CONDITIONS                                    */}
        {/* ============================================================ */}
        {activeTab === 'terms' && (
          <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-subtle p-7 sm:p-12 space-y-10">
            
            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-charcoal-900 flex items-center gap-2">
                <span className="text-osterdGold-600 font-mono text-sm">01.</span>
                <span>Acceptance of Agreement</span>
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
                By installing, downloading, or accessing OsterdOps software, including the CLI package (<code>npm i -g osterdops-guard</code>), the hosted API gateway, or cloud console, you agree to be bound by these Terms of Service. If you are accepting on behalf of an enterprise or entity, you represent and warrant that you have the authority to bind such entity.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-charcoal-900 flex items-center gap-2">
                <span className="text-osterdGold-600 font-mono text-sm">02.</span>
                <span>Service Provision &amp; Permitted Use</span>
              </h2>
              <div className="text-xs sm:text-sm text-charcoal-700 leading-relaxed space-y-2">
                <p>OsterdOps grants you a non-exclusive, revocable, non-transferable license to deploy our telemetry proxies for AI cost control and rate limiting.</p>
                <p><strong>Restrictions:</strong> You agree not to:</p>
                <ul className="list-disc list-inside space-y-1 pl-2 text-charcoal-600">
                  <li>Use the gateway to intentionally bypass third-party AI provider terms of service or safety policies.</li>
                  <li>Reverse engineer, disassemble, or decompile the cloud edge routing binaries beyond lawful open-source components.</li>
                  <li>Transmit malicious code, viruses, or prompt injection exploits intended to disrupt edge infrastructure.</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-charcoal-900 flex items-center gap-2">
                <span className="text-osterdGold-600 font-mono text-sm">03.</span>
                <span>Subscriptions, Billing &amp; Currencies</span>
              </h2>
              <div className="text-xs sm:text-sm text-charcoal-700 leading-relaxed space-y-2">
                <p>
                  <strong>Solo Pro ($12 USD / ₹399 INR / €11 EUR / £10 GBP per month):</strong> Billed automatically on a monthly or discounted annual cadence. You may cancel at any time via your account settings.
                </p>
                <p>
                  <strong>Team Gateway ($49 USD / ₹3,999 INR / €45 EUR / £39 GBP per month):</strong> Includes 5 developer seats, with additional seats billed at $10 USD / ₹799 INR per month. A 14-day free trial is available without upfront charge.
                </p>
                <p>
                  <strong>Localized Invoicing:</strong> Invoices are generated in the currency selected or detected for your region with applicable regional taxes (e.g. GST in India, VAT in Europe).
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-charcoal-900 flex items-center gap-2">
                <span className="text-osterdGold-600 font-mono text-sm">04.</span>
                <span>Financial Firewall &amp; Circuit Breaker Disclaimers</span>
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
                While OsterdOps employs strict deterministic kill-switches and rate limits to halt runaway loops, network conditions or upstream provider delays may introduce brief accounting latency. OsterdOps shall not be liable for third-party upstream API provider invoices incurred through compromised personal keys outside our managed gateway boundaries.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-charcoal-900 flex items-center gap-2">
                <span className="text-osterdGold-600 font-mono text-sm">05.</span>
                <span>Service Level Objective (SLA)</span>
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
                Hosted Edge Gateways aim for a 99.9% uptime target. Scheduled maintenance windows are announced at least 48 hours in advance via our system status feed.
              </p>
            </div>

            <div className="space-y-3 border-t border-[#EAE5DC] pt-6">
              <h2 className="text-sm font-bold text-charcoal-900">Questions Concerning These Terms</h2>
              <p className="text-xs text-charcoal-600">
                Contact legal counsel and enterprise licensing at <a href="mailto:legal@osterdops.com" className="font-bold underline text-charcoal-900">legal@osterdops.com</a>.
              </p>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: COOKIE POLICY & PREFERENCE MANAGER                     */}
        {/* ============================================================ */}
        {activeTab === 'cookies' && (
          <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-subtle p-7 sm:p-12 space-y-10">
            
            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-charcoal-900 flex items-center gap-2">
                <Cookie className="w-5 h-5 text-amber-700" />
                <span>Cookie Policy &amp; Storage Transparency</span>
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
                Cookies and local browser storage (<code>localStorage</code>) are small data fragments saved on your device to make the OsterdOps console fast, secure, and personalized. We maintain a strict policy against cross-site advertising cookies.
              </p>
            </div>

            {/* Interactive Cookie Preference Center */}
            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-5">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-charcoal-700" />
                  <span>Your Cookie Preferences</span>
                </h3>
                <p className="text-xs text-charcoal-600">
                  Control which optional storage elements are active during your visit.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-[#EAE4D8]">
                
                {/* Category 1: Strictly Necessary (Locked) */}
                <div className="pt-3 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-charcoal-900">Strictly Necessary Cookies</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-charcoal-200 text-charcoal-800 font-bold">
                        Always Active
                      </span>
                    </div>
                    <p className="text-[11.5px] text-charcoal-600 leading-snug">
                      Required for session authentication, token security, and multi-tenant project isolation. Cannot be switched off.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="accent-charcoal-900 cursor-not-allowed w-4 h-4 mt-1"
                  />
                </div>

                {/* Category 2: Functional / Currency Detection */}
                <div className="pt-4 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-charcoal-900">Functional &amp; Currency Preferences</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sandstone-300 text-charcoal-800 font-bold">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11.5px] text-charcoal-600 leading-snug">
                      Remembers your preferred currency (e.g. INR ₹ vs USD $) and user interface view modes so you don&apos;t have to re-select on each visit.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefFunctional}
                    onChange={(e) => setPrefFunctional(e.target.checked)}
                    className="accent-charcoal-900 cursor-pointer w-4 h-4 mt-1"
                  />
                </div>

                {/* Category 3: Performance & Error Telemetry */}
                <div className="pt-4 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-charcoal-900">Internal Performance Telemetry</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sandstone-300 text-charcoal-800 font-bold">
                        Optional
                      </span>
                    </div>
                    <p className="text-[11.5px] text-charcoal-600 leading-snug">
                      Helps us analyze client-side crash telemetry and proxy latency bottlenecks. No prompt contents or proprietary code are ever included.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefTelemetry}
                    onChange={(e) => setPrefTelemetry(e.target.checked)}
                    className="accent-charcoal-900 cursor-pointer w-4 h-4 mt-1"
                  />
                </div>

              </div>

              {/* Save Preferences Button */}
              <div className="pt-3 flex justify-end">
                <button
                  onClick={handleSaveCookiePreferences}
                  className="px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </div>

            {/* Cookies Inventory Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-charcoal-900">
                Detailed Storage Inventory
              </h3>

              <div className="overflow-x-auto border border-[#EAE5DC] rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#EAE5DC] font-bold text-charcoal-700">
                      <th className="py-3 px-4">Key Name</th>
                      <th className="py-3 px-4">Storage Type</th>
                      <th className="py-3 px-4">Purpose</th>
                      <th className="py-3 px-4">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE5DC] text-charcoal-600">
                    <tr>
                      <td className="py-2.5 px-4 font-mono font-bold text-charcoal-800">firebase:authUser:...</td>
                      <td className="py-2.5 px-4">IndexedDB / Session</td>
                      <td className="py-2.5 px-4">Stores JWT token for authenticated developer session.</td>
                      <td className="py-2.5 px-4">Session / 30 Days</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono font-bold text-charcoal-800">osterdops_user_currency</td>
                      <td className="py-2.5 px-4">localStorage</td>
                      <td className="py-2.5 px-4">Persists selected display currency (INR, USD, EUR, GBP).</td>
                      <td className="py-2.5 px-4">1 Year</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono font-bold text-charcoal-800">osterdops_cookie_consent</td>
                      <td className="py-2.5 px-4">localStorage</td>
                      <td className="py-2.5 px-4">Stores your cookie consent choice.</td>
                      <td className="py-2.5 px-4">1 Year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
};
