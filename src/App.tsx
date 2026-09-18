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
import { CookieBanner } from './components/CookieBanner';
import { Footer } from './components/Footer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export type AppRoute = 'home' | 'pricing' | 'models' | 'login' | 'signup' | 'onboarding' | 'auth-showcase' | 'forgot-password' | 'solo-guard' | 'dashboard' | 'projects' | 'optimization' | 'usage' | 'reports' | 'integrations' | 'team' | 'settings' | 'privacy' | 'terms' | 'cookies';

// Routes that require authentication
const PROTECTED_ROUTES: AppRoute[] = ['solo-guard', 'dashboard', 'projects', 'optimization', 'usage', 'reports', 'integrations', 'team', 'settings'];

const AppInner: React.FC = () => {
  const { user, loading, subscription } = useAuth();
  const isSoloUser = subscription?.plan_id === 'solo_pro';
  const defaultConsole = isSoloUser ? 'solo-guard' : 'dashboard';

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
    if (path.includes('pricing') || hash.includes('pricing')) return 'pricing';
    return 'home';
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);

  const navigate = (route: AppRoute | string) => {
    // If navigating to a protected route without auth, redirect to signup (if pending plan) or login
    if (PROTECTED_ROUTES.includes(route as AppRoute) && !user) {
      let authTarget: AppRoute = 'login';
      try {
        if (sessionStorage.getItem('osterdops_pending_plan')) {
          authTarget = 'signup';
        }
      } catch {}
      setCurrentRoute(authTarget);
      window.history.pushState(null, '', `#${authTarget}`);
      return;
    }
    // If logged in and navigating to login/signup, go to their respective console
    if (user && (route === 'login' || route === 'signup')) {
      setCurrentRoute(defaultConsole);
      window.history.pushState(null, '', `#${defaultConsole}`);
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
        if (sessionStorage.getItem('osterdops_pending_plan')) {
          authTarget = 'signup';
        }
      } catch {}
      setCurrentRoute(authTarget);
      window.history.replaceState(null, '', `#${authTarget}`);
    }
    // If logged in and on auth pages, go to their console
    if (user && (currentRoute === 'login' || currentRoute === 'signup')) {
      setCurrentRoute(defaultConsole);
      window.history.replaceState(null, '', `#${defaultConsole}`);
    }
    // Solo Pro subscribers only get the Solo Guard page (no hosted gateway)
    if (user && isSoloUser && currentRoute !== 'solo-guard' && PROTECTED_ROUTES.includes(currentRoute)) {
      setCurrentRoute('solo-guard');
      window.history.replaceState(null, '', '#solo-guard');
    }
  }, [loading, user, currentRoute, isSoloUser, defaultConsole]);

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
      else if (path.includes('pricing') || hash.includes('pricing')) route = 'pricing';
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
          initialTab={currentRoute === 'dashboard' ? 'dashboard' : currentRoute}
        />
        <CookieBanner onNavigateToCookies={() => navigate('cookies')} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-charcoal-900 font-sans antialiased selection:bg-osterdGold-500/20 selection:text-charcoal-900 overflow-x-hidden">
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
        ) : (
          /* Separate Dedicated Pricing Page */
          <PricingPage
            onNavigateHome={() => navigate('home')}
            onNavigateLogin={() => navigate('login')}
            onNavigateSignup={() => navigate('signup')}
            onNavigateDashboard={() => navigate('dashboard')}
            onNavigateSoloGuard={() => navigate('solo-guard')}
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
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);

export default App;
