import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { OstraIcon } from './components/OstraBrand';

// Lazy-loaded homepage sections for sub-second mobile FCP & LCP
const FloatingLLMHub = React.lazy(() => import('./components/FloatingLLMHub').then((m) => ({ default: m.FloatingLLMHub })));
const ProductUIShowcase = React.lazy(() => import('./components/ProductUIShowcase').then((m) => ({ default: m.ProductUIShowcase })));
const FeaturesSection = React.lazy(() => import('./components/FeaturesSection').then((m) => ({ default: m.FeaturesSection })));
const InteractiveArchitecture = React.lazy(() => import('./components/InteractiveArchitecture').then((m) => ({ default: m.InteractiveArchitecture })));
const AgentEcosystemSection = React.lazy(() => import('./components/AgentEcosystemSection').then((m) => ({ default: m.AgentEcosystemSection })));
const DeveloperQuickstartSection = React.lazy(() => import('./components/DeveloperQuickstartSection').then((m) => ({ default: m.DeveloperQuickstartSection })));
const FAQSection = React.lazy(() => import('./components/FAQSection').then((m) => ({ default: m.FAQSection })));
const EnterpriseTrustSection = React.lazy(() => import('./components/EnterpriseTrustSection').then((m) => ({ default: m.EnterpriseTrustSection })));
const TeamsDevelopersSection = React.lazy(() => import('./components/TeamsDevelopersSection').then((m) => ({ default: m.TeamsDevelopersSection })));
const CookieBanner = React.lazy(() => import('./components/CookieBanner').then((m) => ({ default: m.CookieBanner })));

// Lazy-loaded pages to optimize bundle splitting and improve initial load performance
const PricingPage = React.lazy(() => import('./pages/PricingPage').then((m) => ({ default: m.PricingPage })));
const ModelsPage = React.lazy(() => import('./pages/ModelsPage').then((m) => ({ default: m.ModelsPage })));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = React.lazy(() => import('./pages/SignupPage').then((m) => ({ default: m.SignupPage })));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const AuthShowcasePage = React.lazy(() => import('./pages/AuthShowcasePage').then((m) => ({ default: m.AuthShowcasePage })));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = React.lazy(() => import('./pages/TermsOfServicePage').then((m) => ({ default: m.TermsOfServicePage })));
const CookiePolicyPage = React.lazy(() => import('./pages/CookiePolicyPage').then((m) => ({ default: m.CookiePolicyPage })));
const RefundPolicyPage = React.lazy(() => import('./pages/RefundPolicyPage').then((m) => ({ default: m.RefundPolicyPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
import { BuildErrorPage } from './pages/BuildErrorPage';
const ServerErrorPage = React.lazy(() => import('./pages/ServerErrorPage').then((m) => ({ default: m.ServerErrorPage })));
const RateLimitPage = React.lazy(() => import('./pages/RateLimitPage').then((m) => ({ default: m.RateLimitPage })));
const AboutUsPage = React.lazy(() => import('./pages/AboutUsPage').then((m) => ({ default: m.AboutUsPage })));
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })));
const SupportPage = React.lazy(() => import('./pages/SupportPage').then((m) => ({ default: m.SupportPage })));
const BillingPage = React.lazy(() => import('./pages/BillingPage').then((m) => ({ default: m.BillingPage })));

const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-[#07090C] text-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <OstraIcon className="w-12 h-12 animate-pulse" variant="gold" />
      <Loader2 className="w-5 h-5 animate-spin text-[#C59E5F]" />
    </div>
  </div>
);

export type AppRoute = 'home' | 'pricing' | 'models' | 'login' | 'signup' | 'onboarding' | 'billing' | 'auth-showcase' | 'forgot-password' | 'dashboard' | 'projects' | 'optimization' | 'usage' | 'reports' | 'integrations' | 'team' | 'settings' | 'privacy' | 'terms' | 'cookies' | 'refund' | 'about' | 'support' | '404' | '500' | 'build-error' | '429';

// Routes that require authentication
const PROTECTED_ROUTES: AppRoute[] = ['dashboard', 'projects', 'optimization', 'usage', 'reports', 'integrations', 'team', 'settings', 'onboarding', 'billing'];
const HOMEPAGE_SECTIONS = ['#features', '#architecture', '#agents', '#developers', '#docs', '#quickstart', '#security', '#faq', '#ui-showcase', '#hero', '#about-sec', '#teams'];

const AppInner: React.FC = () => {
  const { user, profile, loading } = useAuth();

  const getRouteFromLocation = (): AppRoute => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('billing') || hash.includes('billing')) return 'billing';
    if (path.includes('auth-showcase') || hash.includes('auth-showcase') || hash.includes('auth')) return 'auth-showcase';
    if (path.includes('login') || hash.includes('login')) return 'login';
    if (path.includes('signup') || hash.includes('signup')) return 'signup';
    if (path.includes('onboarding') || hash.includes('onboarding')) {
      const isAlreadyOnboarded =
        localStorage.getItem('ostraops_onboarding_completed') === 'true' ||
        Boolean(profile?.onboarding_completed);
      const hasForce = hash.includes('force=true') || path.includes('force=true');
      if (isAlreadyOnboarded && !hasForce) return 'dashboard';
      return 'onboarding';
    }
    if (hash.includes('forgot-password')) return 'forgot-password';
    if (path.includes('settings') || hash.includes('settings')) return 'settings';
    if (path.includes('team') || hash.includes('team')) return 'team';
    if (path.includes('integrations') || hash.includes('integrations')) return 'integrations';
    if (path.includes('reports') || hash.includes('reports')) return 'reports';
    if (path.includes('usage') || hash.includes('usage') || path.includes('costs') || hash.includes('costs')) return 'usage';
    if (path.includes('optimization') || hash.includes('optimization')) return 'optimization';
    if (path.includes('playground') || hash.includes('playground')) return 'dashboard';
    if (path.includes('models') || hash.includes('models')) return 'models';
    if (path.includes('projects') || hash.includes('projects')) return 'projects';
    if (path.includes('dashboard') || hash.includes('dashboard')) return 'dashboard';
    if (path.includes('privacy') || hash.includes('privacy')) return 'privacy';
    if (path.includes('terms') || hash.includes('terms')) return 'terms';
    if (path.includes('cookies') || hash.includes('cookies') || path.includes('cookie') || hash.includes('cookie')) return 'cookies';
    if (path.includes('refund') || hash.includes('refund')) return 'refund';
    if (path.includes('about') || hash.includes('about')) return 'about';
    if (path.includes('support') || hash.includes('support') || path.includes('help') || hash.includes('help')) return 'support';
    if (path.includes('pricing') || hash.includes('pricing')) return 'pricing';
    if (path.includes('429') || hash.includes('429') || path.includes('rate-limit') || hash.includes('rate-limit') || path.includes('quota') || hash.includes('quota')) return '429';
    if (path.includes('build-error') || hash.includes('build-error') || path.includes('build') || hash.includes('build')) return 'build-error';
    if (path.includes('500') || hash.includes('500') || path.includes('server-error') || hash.includes('server-error')) return '500';
    if (path.includes('404') || hash.includes('404') || path.includes('not-found') || hash.includes('not-found')) return '404';
    if (HOMEPAGE_SECTIONS.some(s => hash.startsWith(s))) return 'home';
    if (hash && hash !== '#' && hash !== '#home' && hash !== '') return '404';
    return 'home';
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getRouteFromLocation);
  const [navProgressKey, setNavProgressKey] = useState(0);

  useEffect(() => {
    setNavProgressKey((prev) => prev + 1);
  }, [currentRoute]);

  const getPreferredConsole = (): AppRoute => 'dashboard';

  const navigate = (route: AppRoute | string) => {
    // If navigating to a protected route without auth, redirect to signup (if pending plan) or login
    if (PROTECTED_ROUTES.includes(route as AppRoute) && !user) {
      let authTarget: AppRoute = 'login';
      try {
        if (sessionStorage.getItem('ostraops_pending_plan') || localStorage.getItem('ostraops_pending_plan')) {
          authTarget = 'signup';
        }
      } catch {}
      setCurrentRoute(authTarget);
      window.history.pushState(null, '', `#${authTarget}`);
      return;
    }
    // If logged in and navigating to login/signup, go to their respective console or onboarding
    if (user && (route === 'login' || route === 'signup')) {
      const isAlreadyOnboarded =
        localStorage.getItem('ostraops_onboarding_completed') === 'true' ||
        (user?.id && localStorage.getItem(`ostraops_onboarding_${user.id}`) === 'true') ||
        Boolean(profile?.onboarding_completed);

      const target: AppRoute = (route === 'signup' || !isAlreadyOnboarded) ? 'onboarding' : getPreferredConsole();
      setCurrentRoute(target);
      window.history.pushState(null, '', `#${target}`);
      return;
    }
    // If navigating to onboarding but already completed, prevent showing onboarding repeatedly
    if (route === 'onboarding') {
      const isAlreadyOnboarded =
        localStorage.getItem('ostraops_onboarding_completed') === 'true' ||
        (user?.id && localStorage.getItem(`ostraops_onboarding_${user.id}`) === 'true') ||
        Boolean(profile?.onboarding_completed);

      const hasForce = window.location.hash.includes('force=true') || window.location.search.includes('force=true');
      if (isAlreadyOnboarded && !hasForce) {
        const target = getPreferredConsole();
        setCurrentRoute(target);
        window.history.pushState(null, '', `#${target}`);
        return;
      }
    }
    setCurrentRoute(route as AppRoute);
    const newPath = route === 'home' ? '#' : `#${route}`;
    window.history.pushState(null, '', newPath);
    window.scrollTo(0, 0);
  };

  // Redirect if on a protected route and not authenticated (after loading resolves)
  useEffect(() => {
    if (loading) return;
    if (PROTECTED_ROUTES.includes(currentRoute) && !user) {
      let authTarget: AppRoute = 'login';
      try {
        if (sessionStorage.getItem('ostraops_pending_plan')) {
          authTarget = 'signup';
        }
      } catch {}
      setCurrentRoute(authTarget);
      window.history.replaceState(null, '', `#${authTarget}`);
    }
    // If logged in and on auth pages, go to onboarding for new signups or dashboard for existing users
    if (user && (currentRoute === 'login' || currentRoute === 'signup')) {
      const isAlreadyOnboarded =
        localStorage.getItem('ostraops_onboarding_completed') === 'true' ||
        (user?.id && localStorage.getItem(`ostraops_onboarding_${user.id}`) === 'true') ||
        Boolean(profile?.onboarding_completed);

      const target: AppRoute = (currentRoute === 'signup' || !isAlreadyOnboarded) ? 'onboarding' : getPreferredConsole();
      setCurrentRoute(target);
      window.history.replaceState(null, '', `#${target}`);
    }
    // If logged in and on onboarding route, but already completed onboarding, redirect to dashboard
    if (user && currentRoute === 'onboarding') {
      const isAlreadyOnboarded =
        localStorage.getItem('ostraops_onboarding_completed') === 'true' ||
        (user?.id && localStorage.getItem(`ostraops_onboarding_${user.id}`) === 'true') ||
        Boolean(profile?.onboarding_completed);

      const hasForce = window.location.hash.includes('force=true') || window.location.search.includes('force=true');
      if (isAlreadyOnboarded && !hasForce) {
        setCurrentRoute('dashboard');
        window.history.replaceState(null, '', '#dashboard');
      }
    }
  }, [loading, user, profile, currentRoute]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getRouteFromLocation());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [user, profile]);

  // Smooth scroll to section if hash present on home route
  useEffect(() => {
    if (currentRoute === 'home' && window.location.hash) {
      const rawId = window.location.hash.replace(/^#/, '');
      const id = rawId === 'docs' ? 'developers' : rawId;
      if (id) {
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, [currentRoute]);

  // Loading skeleton — prevents unauthenticated render flash
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090C] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <OstraIcon className="w-12 h-12 animate-pulse" variant="gold" />
          <Loader2 className="w-5 h-5 animate-spin text-[#C59E5F]" />
        </div>
      </div>
    );
  }

  // Dedicated Privacy Policy Page
  if (currentRoute === 'privacy') {
    return (
      <>
        <div key={`progress-${navProgressKey}`} className="route-progress-bar" />
        <div key={currentRoute} className="page-transition-enter">
          <PrivacyPolicyPage onNavigate={navigate} />
        </div>
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }

  // Dedicated Terms of Service Page
  if (currentRoute === 'terms') {
    return (
      <>
        <div key={`progress-${navProgressKey}`} className="route-progress-bar" />
        <div key={currentRoute} className="page-transition-enter">
          <TermsOfServicePage onNavigate={navigate} />
        </div>
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }

  // Dedicated Cookie, Storage & Data Governance Page
  if (currentRoute === 'cookies') {
    return (
      <>
        <div key={`progress-${navProgressKey}`} className="route-progress-bar" />
        <div key={currentRoute} className="page-transition-enter">
          <CookiePolicyPage onNavigate={navigate} />
        </div>
      </>
    );
  }

  // Dedicated Refund & Cancellation Policy Page
  if (currentRoute === 'refund') {
    return (
      <>
        <div key={`progress-${navProgressKey}`} className="route-progress-bar" />
        <div key={currentRoute} className="page-transition-enter">
          <RefundPolicyPage onNavigate={navigate} />
        </div>
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }

  // Auth showcase page (side-by-side or tabbed view)
  if (currentRoute === 'auth-showcase') {
    return (
      <>
        <div key={`progress-${navProgressKey}`} className="route-progress-bar" />
        <div key={currentRoute} className="page-transition-enter">
          <AuthShowcasePage onNavigate={navigate} />
        </div>
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }

  // Auth pages
  if (currentRoute === 'login') {
    return (
      <>
        <div key={`progress-${navProgressKey}`} className="route-progress-bar" />
        <div key={currentRoute} className="page-transition-enter">
          <LoginPage onNavigate={navigate} />
        </div>
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }
  if (currentRoute === 'signup') {
    return (
      <>
        <div key={`progress-${navProgressKey}`} className="route-progress-bar" />
        <div key={currentRoute} className="page-transition-enter">
          <SignupPage onNavigate={navigate} />
        </div>
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }
  if (currentRoute === 'forgot-password') {
    return (
      <>
        <div key={`progress-${navProgressKey}`} className="route-progress-bar" />
        <div key={currentRoute} className="page-transition-enter">
          <ForgotPasswordPage onNavigate={navigate} />
        </div>
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }

  // Onboarding Page
  if (currentRoute === 'onboarding') {
    return (
      <>
        <div key={`progress-${navProgressKey}`} className="route-progress-bar" />
        <div key={currentRoute} className="page-transition-enter">
          <OnboardingPage onNavigate={navigate} />
        </div>
      </>
    );
  }

  // Dashboard page provides its own full app shell with sidebar and top header
  if (PROTECTED_ROUTES.includes(currentRoute)) {
    return (
      <>
        <div key={`progress-${navProgressKey}`} className="route-progress-bar" />
        <div key={currentRoute} className="page-transition-enter">
          <DashboardPage
            onNavigateHome={() => navigate('home')}
            onNavigatePricing={() => navigate('pricing')}
            onNavigateSupport={() => navigate('support')}
            initialTab={currentRoute === 'dashboard' ? 'dashboard' : currentRoute}
          />
        </div>
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }

  // Dedicated Error Pages (Individual standalone components)
  if (currentRoute === '404') {
    return (
      <>
        <div key={`progress-${navProgressKey}`} className="route-progress-bar" />
        <div key={currentRoute} className="page-transition-enter">
          <NotFoundPage
            onNavigateHome={() => navigate('home')}
            onNavigateDashboard={() => navigate('dashboard')}
          />
        </div>
      </>
    );
  }

  if (currentRoute === 'build-error') {
    return (
      <>
        <div key={`progress-${navProgressKey}`} className="route-progress-bar" />
        <div key={currentRoute} className="page-transition-enter">
          <BuildErrorPage
            onNavigateHome={() => navigate('home')}
            onNavigateDashboard={() => navigate('dashboard')}
          />
        </div>
      </>
    );
  }

  if (currentRoute === '500') {
    return (
      <>
        <div key={`progress-${navProgressKey}`} className="route-progress-bar" />
        <div key={currentRoute} className="page-transition-enter">
          <ServerErrorPage
            onNavigateHome={() => navigate('home')}
            onNavigateDashboard={() => navigate('dashboard')}
          />
        </div>
      </>
    );
  }

  if (currentRoute === '429') {
    return (
      <>
        <div key={`progress-${navProgressKey}`} className="route-progress-bar" />
        <div key={currentRoute} className="page-transition-enter">
          <RateLimitPage
            onNavigateHome={() => navigate('home')}
            onNavigateDashboard={() => navigate('dashboard')}
            onNavigatePricing={() => navigate('pricing')}
          />
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090C] text-zinc-100 font-sans antialiased selection:bg-[#C59E5F]/20 selection:text-[#FFF4D6] overflow-x-hidden">
      <div key={`progress-${navProgressKey}`} className="route-progress-bar" />
      {/* Fixed Navigation Header */}
      <Navbar currentRoute={currentRoute} onNavigate={navigate} />

      <main key={`page-${currentRoute}`} className="page-transition-enter">
        {currentRoute === 'home' ? (
          <>
            {/* Hero Section with 3D Interactive Dashboard and Provider Dock */}
            <Hero 
              onNavigateToPricing={() => navigate('pricing')} 
              onNavigateToModels={() => navigate('models')}
            />

            {/* Below-the-fold sections with content-visibility auto for 95+ performance */}
            <div className="content-auto">
              {/* Floating 3D Multi-Model Mesh & Provider Ecosystem */}
              <FloatingLLMHub onNavigateToModels={() => navigate('models')} />
            </div>

            <div className="content-auto">
              {/* Live Operational UI Console Preview (No Simulator, Real Telemetry) */}
              <ProductUIShowcase />
            </div>

            <div className="content-auto">
              {/* Core Capability Pillars (3D Cards) */}
              <FeaturesSection />
            </div>

            <div className="content-auto">
              {/* Deterministic Architecture Specs & Benchmarks (Zero Cross-Vendor Corruption) */}
              <InteractiveArchitecture />
            </div>

            <div className="content-auto">
              {/* Universal Agent Ecosystem (Cursor, Cline, Windsurf, Antigravity, Aider) */}
              <AgentEcosystemSection />
            </div>

            <div className="content-auto">
              {/* Teams & Developers FinOps & Governance Section */}
              <TeamsDevelopersSection 
                onNavigateDashboard={() => navigate('dashboard')} 
                onNavigatePricing={() => navigate('pricing')} 
              />
            </div>

            <div className="content-auto">
              {/* Developer Quickstart & Terminal SDK Preview */}
              <DeveloperQuickstartSection />
            </div>

            <div className="content-auto">
              {/* Frequently Asked Questions (Technical & Architecture) */}
              <FAQSection />
            </div>

            <div className="content-auto">
              {/* Enterprise Security, Zero Retention Guarantee & Final CTA Banner */}
              <EnterpriseTrustSection onNavigateToPricing={() => navigate('pricing')} />
            </div>
          </>
        ) : currentRoute === 'models' ? (
          <ModelsPage
            onNavigateHome={() => navigate('home')}
            onNavigatePricing={() => navigate('pricing')}
            onNavigateDashboard={() => navigate('dashboard')}
          />
        ) : currentRoute === 'about' ? (
          <AboutUsPage
            onNavigateHome={() => navigate('home')}
            onNavigatePricing={() => navigate('pricing')}
            onNavigateModels={() => navigate('models')}
          />
        ) : currentRoute === 'support' ? (
          <SupportPage
            onNavigateHome={() => navigate('home')}
            onNavigatePricing={() => navigate('pricing')}
            onNavigateDashboard={() => navigate('dashboard')}
          />
        ) : currentRoute === 'pricing' ? (
          /* Separate Dedicated Pricing Page */
          <PricingPage
            onNavigateHome={() => navigate('home')}
            onNavigateLogin={() => navigate('login')}
          />
        ) : currentRoute === 'billing' ? (
          <BillingPage
            onNavigateHome={() => navigate('home')}
            onNavigateDashboard={() => navigate('dashboard')}
            onNavigateSettings={() => {
              window.location.hash = '#settings?tab=billing';
              navigate('settings');
            }}
            initialPlanId={new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '').get('plan') || undefined}
          />
        ) : (
          <NotFoundPage
            onNavigateHome={() => navigate('home')}
            onNavigateDashboard={() => navigate('dashboard')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigate} />

      {/* Interactive Cookie Consent Banner */}
      <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
    </div>
  );
};

export const App: React.FC = () => (
  <ErrorBoundary
    onNavigateHome={() => { window.location.hash = ''; window.location.pathname = '/'; }}
    onNavigateDashboard={() => { window.location.hash = '#dashboard'; }}
  >
    <AuthProvider>
      <React.Suspense fallback={<PageLoader />}>
        <AppInner />
      </React.Suspense>
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
