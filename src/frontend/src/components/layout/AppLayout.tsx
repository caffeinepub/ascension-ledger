import { LoginButton } from '../auth/LoginButton';
import type { AppScreen } from '../../App';
import { Swords, TrendingUp, Zap, User, Activity, ListChecks } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export function AppLayout({ children, currentScreen, onNavigate }: AppLayoutProps) {
  const navItems: Array<{ id: AppScreen; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Command Center', icon: <Activity className="h-5 w-5" /> },
    { id: 'missions', label: 'Mission Log', icon: <Swords className="h-5 w-5" /> },
    { id: 'customTasks', label: 'Custom Tasks', icon: <ListChecks className="h-5 w-5" /> },
    { id: 'stats', label: 'Attributes', icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'skills', label: 'Skill Matrix', icon: <Zap className="h-5 w-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
  ];

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
          </div>
          <LoginButton />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r border-border/50 p-4 shrink-0 overflow-y-auto" style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)' }}>
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-left transition-colors ${
                  currentScreen === item.id
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-white/90 hover:bg-white/10 hover:text-white/95'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="container mx-auto p-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-4 shrink-0" style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="container mx-auto px-4 text-center text-sm text-white/75">
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
