import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { OstraLogo } from './OstraBrand';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const { user, profile, signOut, subscription } = useAuth();
  const isSoloUser =
    subscription?.plan_id === 'solo_pro' ||
    localStorage.getItem('ostraops_active_plan') === 'solo_pro' ||
    localStorage.getItem('ostraops_user_tier') === 'solo';
  const consoleRoute = isSoloUser ? 'solo-guard' : 'dashboard';
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className="hidden md:flex items-center gap-5">
          {user ? (
            <>
              <button
                onClick={() => onNavigate(consoleRoute)}
                className="text-[14px] font-medium text-charcoal-600 hover:text-charcoal-900 transition-colors cursor-pointer"
              >
                {isSoloUser ? 'Solo Guard' : 'API Gateway'}
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
