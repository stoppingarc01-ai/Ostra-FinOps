import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FloatingLLMHub } from './components/FloatingLLMHub';
import { ProductUIShowcase } from './components/ProductUIShowcase';
import { FeaturesSection } from './components/FeaturesSection';
import { InteractiveArchitecture } from './components/InteractiveArchitecture';
import { AgentEcosystemSection } from './components/AgentEcosystemSection';
import { DeveloperQuickstartSection } from './components/DeveloperQuickstartSection';
import { FAQSection } from './components/FAQSection';
import { EnterpriseTrustSection } from './components/EnterpriseTrustSection';
import { PricingPage } from './pages/PricingPage';
import { ModelsPage } from './pages/ModelsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AuthShowcasePage } from './pages/AuthShowcasePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SoloGuardPage } from './pages/SoloGuardPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { BuildErrorPage } from './pages/BuildErrorPage';
import { ServerErrorPage } from './pages/ServerErrorPage';
import { RateLimitPage } from './pages/RateLimitPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CookieBanner } from './components/CookieBanner';
import { Footer } from './components/Footer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export type AppRoute = 'home' | 'pricing' | 'models' | 'login' | 'signup' | 'onboarding' | 'auth-showcase' | 'forgot-password' | 'solo-guard' | 'dashboard' | 'projects' | 'optimization' | 'usage' | 'reports' | 'integrations' | 'team' | 'settings' | 'privacy' | 'terms' | 'cookies' | 'about' | '404' | '500' | 'build-error' | '429';

// Routes that require authentication
const PROTECTED_ROUTES: AppRoute[] = ['solo-guard', 'dashboard', 'projects', 'optimization', 'usage', 'reports', 'integrations', 'team', 'settings'];

const AppInner: React.FC = () => {
  const { user, loading, subscription } = useAuth();
  const isSoloUser =
    subscription?.plan_id === 'solo_pro' ||
    localStorage.getItem('ostraops_active_plan') === 'solo_pro' ||
    localStorage.getItem('ostraops_user_tier') === 'solo';

  const getInitialRoute = (): AppRoute => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('onboarding') || hash.includes('onboarding')) return 'onboarding';
    if (path.includes('auth-showcase') || hash.includes('auth-showcase') || hash.includes('auth')) return 'auth-showcase';
    if (path.includes('login') || hash.includes('login')) return 'login';
    if (path.includes('signup') || hash.includes('signup')) return 'signup';
    if (hash.includes('forgot-password')) return 'forgot-password';
    if (path.includes('settings') || hash.includes('settings')) return 'settings';
    if (path.includes('team') || hash.includes('team')) return 'team';
    if (path.includes('integrations') || hash.includes('integrations')) return 'integrations';
    if (path.includes('reports') || hash.includes('reports')) return 'reports';
    if (path.includes('usage') || hash.includes('usage') || path.includes('costs') || hash.includes('costs')) return 'usage';
    if (path.includes('optimization') || hash.includes('optimization')) return 'optimization';
    if (path.includes('models') || hash.includes('models')) return 'models';
    if (path.includes('projects') || hash.includes('projects')) return 'projects';
    if (path.includes('solo-guard') || hash.includes('solo-guard')) return 'solo-guard';
    if (path.includes('dashboard') || hash.includes('dashboard')) return 'dashboard';
    if (path.includes('privacy') || hash.includes('privacy')) return 'privacy';
    if (path.includes('terms') || hash.includes('terms')) return 'terms';
    if (path.includes('cookies') || hash.includes('cookies') || path.includes('cookie') || hash.includes('cookie')) return 'cookies';
    if (path.includes('about') || hash.includes('about')) return 'about';
    if (path.includes('pricing') || hash.includes('pricing')) return 'pricing';
    if (path.includes('429') || hash.includes('429') || path.includes('rate-limit') || hash.includes('rate-limit') || path.includes('quota') || hash.includes('quota')) return '429';
    if (path.includes('build-error') || hash.includes('build-error') || path.includes('build') || hash.includes('build')) return 'build-error';
    if (path.includes('500') || hash.includes('500') || path.includes('server-error') || hash.includes('server-error')) return '500';
    if (path.includes('404') || hash.includes('404') || path.includes('not-found') || hash.includes('not-found')) return '404';
    if (hash && hash !== '#' && hash !== '#home' && hash !== '') return '404';
    return 'home';
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);

  const getPreferredConsole = (): AppRoute => {
    try {
      const active = localStorage.getItem('ostraops_active_plan');
      if (active === 'solo_pro') return 'solo-guard';
      if (active === 'team_scale') return 'dashboard';

      const raw = sessionStorage.getItem('ostraops_pending_plan') || localStorage.getItem('ostraops_pending_plan');
      if (raw) {
        const p = JSON.parse(raw);
        if (p.planId === 'solo_pro' || p.type === 'solo') return 'solo-guard';
        if (p.planId === 'team_scale' || p.type === 'hosted') return 'dashboard';
      }
    } catch {}
    return isSoloUser ? 'solo-guard' : 'dashboard';
  };

  const navigate = (route: AppRoute | string) => {
    if (route === 'solo-guard') {
      try {
        localStorage.setItem('ostraops_active_plan', 'solo_pro');
        localStorage.setItem('ostraops_user_tier', 'solo');
      } catch {}
    } else if (route === 'dashboard') {
      try {
        localStorage.setItem('ostraops_active_plan', 'team_scale');
        localStorage.setItem('ostraops_user_tier', 'team');
      } catch {}
    }

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
    // If logged in and navigating to login/signup, go to their respective console
    if (user && (route === 'login' || route === 'signup')) {
      const target = getPreferredConsole();
      setCurrentRoute(target);
      window.history.pushState(null, '', `#${target}`);
      return;
    }
    setCurrentRoute(route as AppRoute);
    const newPath = route === 'home' ? '#' : `#${route}`;
    window.history.pushState(null, '', newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    // If logged in and on auth pages, go to their console
    if (user && (currentRoute === 'login' || currentRoute === 'signup')) {
      const target = getPreferredConsole();
      setCurrentRoute(target);
      window.history.replaceState(null, '', `#${target}`);
    }
  }, [loading, user, currentRoute, isSoloUser]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      let route: AppRoute = 'home';
      if (hash.includes('onboarding') || path.includes('onboarding')) route = 'onboarding';
      else if (hash.includes('auth-showcase') || hash.includes('auth')) route = 'auth-showcase';
      else if (hash.includes('login')) route = 'login';
      else if (hash.includes('signup')) route = 'signup';
      else if (hash.includes('forgot-password')) route = 'forgot-password';
      else if (path.includes('settings') || hash.includes('settings')) route = 'settings';
      else if (path.includes('team') || hash.includes('team')) route = 'team';
      else if (path.includes('integrations') || hash.includes('integrations')) route = 'integrations';
      else if (path.includes('reports') || hash.includes('reports')) route = 'reports';
      else if (path.includes('usage') || hash.includes('usage') || path.includes('costs') || hash.includes('costs')) route = 'usage';
      else if (path.includes('optimization') || hash.includes('optimization')) route = 'optimization';
      else if (path.includes('models') || hash.includes('models')) route = 'models';
      else if (path.includes('projects') || hash.includes('projects')) route = 'projects';
      else if (path.includes('solo-guard') || hash.includes('solo-guard')) route = 'solo-guard';
      else if (path.includes('dashboard') || hash.includes('dashboard')) route = 'dashboard';
      else if (path.includes('privacy') || hash.includes('privacy')) route = 'privacy';
      else if (path.includes('terms') || hash.includes('terms')) route = 'terms';
      else if (path.includes('cookies') || hash.includes('cookies') || path.includes('cookie') || hash.includes('cookie')) route = 'cookies';
      else if (path.includes('about') || hash.includes('about')) route = 'about';
      else if (path.includes('pricing') || hash.includes('pricing')) route = 'pricing';
      else if (path.includes('429') || hash.includes('429') || path.includes('rate-limit') || hash.includes('rate-limit') || path.includes('quota') || hash.includes('quota')) route = '429';
      else if (path.includes('build-error') || hash.includes('build-error') || path.includes('build') || hash.includes('build')) route = 'build-error';
      else if (path.includes('500') || hash.includes('500') || path.includes('server-error') || hash.includes('server-error')) route = '500';
      else if (path.includes('404') || hash.includes('404') || path.includes('not-found') || hash.includes('not-found')) route = '404';
      else if (hash && hash !== '#' && hash !== '#home' && hash !== '') route = '404';
      setCurrentRoute(route);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Loading skeleton — prevents unauthenticated render flash
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg viewBox="0 0 36 36" fill="none" className="w-10 h-10 animate-pulse">
            <ellipse cx="18" cy="18" rx="14" ry="14" stroke="#C59E5F" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="60 30" />
            <path d="M12 7 C 22 12, 22 24, 12 29" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="18" cy="18" r="2.5" fill="#C59E5F" />
          </svg>
          <Loader2 className="w-5 h-5 animate-spin text-[#C59E5F]" />
        </div>
      </div>
    );
  }

  // Legal Hub (Privacy Policy, Terms of Service, Cookie Policy & Interactive Controls)
  if (currentRoute === 'privacy' || currentRoute === 'terms' || currentRoute === 'cookies') {
    return (
      <>
        <LegalPage
          initialTab={currentRoute}
          onNavigateHome={() => navigate('home')}
          onNavigatePricing={() => navigate('pricing')}
        />
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }

  // Onboarding 5-step interactive flow
  if (currentRoute === 'onboarding') {
    return (
      <>
        <OnboardingPage onNavigate={navigate} />
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }

  // Auth showcase page (side-by-side or tabbed view)
  if (currentRoute === 'auth-showcase') {
    return (
      <>
        <AuthShowcasePage onNavigate={navigate} />
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }

  // Auth pages
  if (currentRoute === 'login') {
    return (
      <>
        <LoginPage onNavigate={navigate} />
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }
  if (currentRoute === 'signup') {
    return (
      <>
        <SignupPage onNavigate={navigate} />
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }
  if (currentRoute === 'forgot-password') {
    return (
      <>
        <ForgotPasswordPage onNavigate={navigate} />
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }

  // Solo Developer Local-First Console
  if (currentRoute === 'solo-guard') {
    return (
      <>
        <SoloGuardPage
          onNavigateHome={() => navigate('home')}
          onNavigateDashboard={() => navigate('dashboard')}
          onNavigatePricing={() => navigate('pricing')}
        />
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }

  // Dashboard page provides its own full app shell with sidebar and top header
  if (PROTECTED_ROUTES.includes(currentRoute)) {
    return (
      <>
        <DashboardPage
          onNavigateHome={() => navigate('home')}
          onNavigatePricing={() => navigate('pricing')}
          onNavigateSoloGuard={() => navigate('solo-guard')}
          initialTab={currentRoute === 'dashboard' ? 'dashboard' : currentRoute}
        />
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }

  // Dedicated Error Pages (Individual standalone components)
  if (currentRoute === '404') {
    return (
      <NotFoundPage
        onNavigateHome={() => navigate('home')}
        onNavigateDashboard={() => navigate('dashboard')}
      />
    );
  }

  if (currentRoute === 'build-error') {
    return (
      <BuildErrorPage
        onNavigateHome={() => navigate('home')}
        onNavigateDashboard={() => navigate('dashboard')}
      />
    );
  }

  if (currentRoute === '500') {
    return (
      <ServerErrorPage
        onNavigateHome={() => navigate('home')}
        onNavigateDashboard={() => navigate('dashboard')}
      />
    );
  }

  if (currentRoute === '429') {
    return (
      <RateLimitPage
        onNavigateHome={() => navigate('home')}
        onNavigateDashboard={() => navigate('dashboard')}
        onNavigatePricing={() => navigate('pricing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-charcoal-900 font-sans antialiased selection:bg-ostraGold-500/20 selection:text-charcoal-900 overflow-x-hidden">
      {/* Fixed Navigation Header */}
      <Navbar currentRoute={currentRoute} onNavigate={navigate} />

      <main>
        {currentRoute === 'home' ? (
          <>
            {/* Hero Section with 3D Interactive Dashboard and Floating Satellites */}
            <Hero onNavigateToPricing={() => navigate('pricing')} />

            {/* Floating 3D Multi-Model Mesh & Provider Ecosystem */}
            <FloatingLLMHub onNavigateToModels={() => navigate('models')} />

            {/* Live Operational UI Console Preview (No Simulator, Real Telemetry) */}
            <ProductUIShowcase />

            {/* Core Capability Pillars (3D Cards) */}
            <FeaturesSection />

            {/* Deterministic Architecture Specs & Benchmarks (Zero Cross-Vendor Corruption) */}
            <InteractiveArchitecture />

            {/* Universal Agent Ecosystem (Cursor, Cline, Windsurf, Antigravity, Aider) */}
            <AgentEcosystemSection />

            {/* Developer Quickstart & Terminal SDK Preview */}
            <DeveloperQuickstartSection />

            {/* Frequently Asked Questions (Technical & Architecture) */}
            <FAQSection />

            {/* Enterprise Security, Zero Retention Guarantee & Final CTA Banner */}
            <EnterpriseTrustSection onNavigateToPricing={() => navigate('pricing')} />
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
            onNavigateSoloGuard={() => navigate('solo-guard')}
          />
        ) : currentRoute === 'pricing' ? (
          /* Separate Dedicated Pricing Page */
          <PricingPage
            onNavigateHome={() => navigate('home')}
            onNavigateLogin={() => navigate('login')}
            onNavigateOnboarding={() => navigate('onboarding')}
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
      <AppInner />
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
