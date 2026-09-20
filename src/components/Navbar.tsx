import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { OstraLogo } from './OstraBrand';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const { user, profile, signOut } = useAuth();
  const consoleRoute = 'dashboard';
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [starCount, setStarCount] = useState<string>(() => {
    try {
      return localStorage.getItem('ostraops_gh_stars') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    let isMounted = true;
    const fetchStars = async () => {
      try {
        const cachedTime = localStorage.getItem('ostraops_gh_stars_time');
        const cachedCount = localStorage.getItem('ostraops_gh_stars');
        if (cachedCount && cachedTime && Date.now() - parseInt(cachedTime, 10) < 5 * 60 * 1000) {
          if (isMounted) setStarCount(cachedCount);
          return;
        }

        const res = await fetch('https://api.github.com/repos/stoppingarc01-ai/Ostra-FinOps');
        if (!res.ok) throw new Error('GitHub API response not ok');
        const data = await res.json();
        const stars: number = typeof data.stargazers_count === 'number' ? data.stargazers_count : 0;
        const formatted = stars >= 1000 
          ? `${(stars / 1000).toFixed(1).replace(/\.0$/, '')}K` 
          : stars.toString();
        
        if (isMounted) {
          setStarCount(formatted);
          localStorage.setItem('ostraops_gh_stars', formatted);
          localStorage.setItem('ostraops_gh_stars_time', Date.now().toString());
        }
      } catch {
        if (isMounted) {
          const fallback = localStorage.getItem('ostraops_gh_stars') || '0';
          setStarCount(fallback);
        }
      }
    };

    fetchStars();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  // User initials for avatar
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE6DD] py-3.5 shadow-sm'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-3 group text-left cursor-pointer"
        >
          <OstraLogo
            iconClassName="w-8 h-8 group-hover:scale-105 transition-transform duration-300"
            textClassName="text-xl sm:text-2xl font-bold tracking-tight text-[#0B0F0F] font-sans"
            variant="charcoal"
            showTagline={false}
          />
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-charcoal-600">
          <button
            onClick={() => onNavigate('home')}
            className={`nav-link-animated transition-colors cursor-pointer ${currentRoute === 'home' ? 'text-charcoal-900 font-medium' : 'hover:text-charcoal-900'}`}
          >
            Product
          </button>
          
          <button
            onClick={() => onNavigate('home')}
            className="nav-link-animated hover:text-charcoal-900 transition-colors cursor-pointer"
          >
            Solutions
          </button>

          {/* Models page link with active indicator */}
          <button
            onClick={() => onNavigate('models')}
            className={`relative py-1 transition-all cursor-pointer ${
              currentRoute === 'models'
                ? 'text-charcoal-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#B58E50] after:rounded-full'
                : 'hover:text-charcoal-900'
            }`}
          >
            Models
          </button>

          {/* Pricing link with active indicator */}
          <button
            onClick={() => onNavigate('pricing')}
            className={`relative py-1 transition-all ${
              currentRoute === 'pricing'
                ? 'text-charcoal-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#B58E50] after:rounded-full'
                : 'hover:text-charcoal-900'
            }`}
          >
            Pricing
          </button>

          {/* Console Links */}
          {user ? (
            <>
              <button
                onClick={() => onNavigate('solo-guard')}
                className={`relative py-1 transition-all ${
                  currentRoute === 'solo-guard'
                    ? 'text-charcoal-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#B58E50] after:rounded-full'
                    : 'hover:text-charcoal-900'
                }`}
              >
                Solo Guard
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`relative py-1 transition-all ${
                  currentRoute === 'dashboard'
                    ? 'text-charcoal-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#B58E50] after:rounded-full'
                    : 'hover:text-charcoal-900'
                }`}
              >
                API Gateway
              </button>
            </>
          ) : (
            <button
              onClick={() => onNavigate('solo-guard')}
              className={`relative py-1 transition-all ${
                currentRoute === 'solo-guard'
                  ? 'text-charcoal-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#B58E50] after:rounded-full'
                  : 'hover:text-charcoal-900'
              }`}
            >
              Solo Guard
            </button>
          )}

          <a href="#docs" className="nav-link-animated hover:text-charcoal-900 transition-colors flex items-center gap-1.5">
            Docs
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sandstone-300/80 text-charcoal-600 font-mono">v1.0</span>
          </a>

          <button
            onClick={() => {
              if (currentRoute !== 'home') {
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              } else {
                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="nav-link-animated hover:text-charcoal-900 transition-colors cursor-pointer"
          >
            FAQ
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`relative py-1 transition-all cursor-pointer ${
              currentRoute === 'about'
                ? 'text-charcoal-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#B58E50] after:rounded-full'
                : 'hover:text-charcoal-900'
            }`}
          >
            About Us
          </button>
        </nav>

        {/* Right CTA — changes based on auth state */}
        <div className="hidden md:flex items-center gap-3.5">
          {/* GitHub Star Badge: Realtime Stars/Likes */}
          <a
            href="https://github.com/stoppingarc01-ai/Ostra-FinOps"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-sandstone-100 border border-[#EAE5DB] text-charcoal-900 hover:text-black shadow-2xs transition-all hover:scale-105 group cursor-pointer"
            title={`Star OstraOps on GitHub (${starCount || '0'} stars)`}
            aria-label={`GitHub repository: ${starCount || '0'} stars`}
          >
            <GithubIcon className="w-4 h-4 text-charcoal-900 group-hover:scale-110 transition-transform" />
            <span className="text-[13px] font-semibold text-charcoal-900 font-sans tracking-tight leading-none">
              {starCount || '0'}
            </span>
          </a>

          {user ? (
            <>
              <button
                onClick={() => onNavigate(consoleRoute)}
                className="text-[14px] font-medium text-charcoal-600 hover:text-charcoal-900 transition-colors cursor-pointer"
              >
                Dashboard
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#18181B] text-white text-xs font-bold flex items-center justify-center font-mono">
                  {initials}
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl text-charcoal-500 hover:text-charcoal-900 hover:bg-sandstone-200 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('login')}
                className="text-[14px] font-medium text-charcoal-600 hover:text-charcoal-900 transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="btn-primary-glow group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-charcoal-800 text-white text-[13.5px] font-medium shadow-sm cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 text-ostraGold-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-charcoal-700 hover:text-charcoal-900"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-[#EAE6DD] px-6 py-5 shadow-lg">
          <div className="flex flex-col gap-4 text-[15px] font-medium text-charcoal-700">
            <button
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className="text-left py-1"
            >
              Product
            </button>
            <button
              onClick={() => { onNavigate('models'); setMobileMenuOpen(false); }}
              className={`text-left py-1 ${currentRoute === 'models' ? 'text-charcoal-900 font-bold' : ''}`}
            >
              Models
            </button>
            <button
              onClick={() => { onNavigate('pricing'); setMobileMenuOpen(false); }}
              className={`text-left py-1 ${currentRoute === 'pricing' ? 'text-charcoal-900 font-bold' : ''}`}
            >
              Pricing
            </button>
            <button
              onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}
              className={`text-left py-1 ${currentRoute === 'about' ? 'text-charcoal-900 font-bold' : ''}`}
            >
              About Us
            </button>
            {user ? (
              <>
                <button
                  onClick={() => { onNavigate('solo-guard'); setMobileMenuOpen(false); }}
                  className={`text-left py-1 ${currentRoute === 'solo-guard' ? 'text-charcoal-900 font-bold' : ''}`}
                >
                  Solo Guard (Local)
                </button>
                <button
                  onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                  className={`text-left py-1 ${currentRoute === 'dashboard' ? 'text-charcoal-900 font-bold' : ''}`}
                >
                  API Gateway (Cloud)
                </button>
              </>
            ) : (
              <button
                onClick={() => { onNavigate('solo-guard'); setMobileMenuOpen(false); }}
                className={`text-left py-1 ${currentRoute === 'solo-guard' ? 'text-charcoal-900 font-bold' : ''}`}
              >
                Solo Guard
              </button>
            )}
            <a href="#docs" onClick={() => setMobileMenuOpen(false)} className="py-1">Docs</a>
            <a href="#blog" onClick={() => setMobileMenuOpen(false)} className="py-1">Blog</a>
            <a
              href="https://github.com/stoppingarc01-ai/Ostra-FinOps"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-1.5 text-charcoal-800 font-semibold"
            >
              <div className="flex items-center gap-2">
                <GithubIcon className="w-4 h-4 text-charcoal-900" />
                <span>GitHub</span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sandstone-200 text-charcoal-900 font-bold">
                {starCount || '0'}
              </span>
            </a>
            <hr className="border-borderLight my-1" />
            <div className="flex items-center justify-between pt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-charcoal-800 truncate max-w-[140px]">{profile?.full_name || user?.email}</span>
                  </div>
                  <button
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-charcoal-800 text-white text-sm font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                    className="text-charcoal-700 font-medium"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => { onNavigate('signup'); setMobileMenuOpen(false); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal-800 text-white text-sm font-medium"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5 text-ostraGold-400" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
