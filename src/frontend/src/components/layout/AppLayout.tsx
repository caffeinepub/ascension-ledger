import { LoginButton } from '../auth/LoginButton';
import type { AppScreen } from '../../App';
import { Swords, TrendingUp, Zap, User, Activity, ListChecks, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export function AppLayout({ children, currentScreen, onNavigate }: AppLayoutProps) {
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const navItems: Array<{ id: AppScreen; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Command Center', icon: <Activity className="h-5 w-5" /> },
    { id: 'missions', label: 'Missions', icon: <Swords className="h-5 w-5" /> },
    { id: 'customTasks', label: 'Custom Tasks', icon: <ListChecks className="h-5 w-5" /> },
    { id: 'stats', label: 'Attributes', icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'skills', label: 'Skill Matrix', icon: <Zap className="h-5 w-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
  ];

  const handleNavigate = (screen: AppScreen) => {
    onNavigate(screen);
    // Close menu on mobile after navigation
    if (window.innerWidth < 768) {
      setIsNavExpanded(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-transparent dark">
      {/* Header */}
      <header className="border-b border-border/50 shrink-0" style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/IMG_20260218_211452.png" 
              alt="CRYONEX" 
              className="h-10 w-auto object-contain" 
            />
            <span className="text-xl sm:text-2xl font-bold tracking-wider text-white" style={{ 
              textShadow: '0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)',
              letterSpacing: '0.15em'
            }}>
              CRYONEX
            </span>
          </div>
          <LoginButton />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsNavExpanded(!isNavExpanded)}
          className="fixed left-4 top-20 z-50 flex flex-col items-center justify-center w-12 h-12 rounded-md transition-all duration-300 hover:bg-primary/20"
          style={{ 
            background: 'rgba(0, 0, 0, 0.85)', 
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(6, 182, 212, 0.3)'
          }}
          aria-label={isNavExpanded ? 'Close menu' : 'Open menu'}
        >
          {isNavExpanded ? (
            <X className="h-6 w-6 text-primary" />
          ) : (
            <Menu className="h-6 w-6 text-primary" />
          )}
        </button>

        {/* Overlay for mobile */}
        {isNavExpanded && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsNavExpanded(false)}
          />
        )}

        {/* Sidebar Navigation - Collapsible */}
        <nav 
          className={`fixed md:relative left-0 top-16 bottom-0 z-40 border-r border-border/50 p-4 overflow-y-auto transition-transform duration-300 ease-in-out ${
            isNavExpanded ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
          style={{ 
            background: 'rgba(0, 0, 0, 0.85)', 
            backdropFilter: 'blur(12px)',
            width: isNavExpanded ? '16rem' : '0',
            minWidth: isNavExpanded ? '16rem' : '0',
          }}
        >
          <div className={`space-y-1 transition-opacity duration-300 ${isNavExpanded ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-base transition-colors ${
                  currentScreen === item.id
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-white/90 hover:bg-white/10 hover:text-white/95'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-3 sm:py-4 shrink-0" style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="container mx-auto px-4 text-center text-xs sm:text-sm text-white/75">
          © {new Date().getFullYear()} · Built with love using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
