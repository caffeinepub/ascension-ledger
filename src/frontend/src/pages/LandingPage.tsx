import { LoginButton } from '../components/auth/LoginButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, TrendingUp, Zap, Shield } from 'lucide-react';
import { COPY } from '../content/copy';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent dark">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="/assets/generated/hero-scifi.dim_1200x600.png"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4 py-24 text-center" style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)' }}>
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-5xl font-bold tracking-tight text-white/95 sm:text-6xl">
              {COPY.landing.hero}
            </h1>
            <p className="text-xl text-white/75">
              {COPY.landing.description}
            </p>
            <div className="flex justify-center pt-4">
              <LoginButton />
            </div>
            <p className="text-sm text-white/60">
              {COPY.landing.authNote}
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/40 transition-colors hover:border-primary" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
            <CardHeader>
              <Swords className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-white/95">{COPY.landing.feature1Title}</CardTitle>
              <CardDescription className="text-white/75">
                {COPY.landing.feature1Description}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-accent/40 transition-colors hover:border-accent" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-accent mb-2" />
              <CardTitle className="text-white/95">{COPY.landing.feature2Title}</CardTitle>
              <CardDescription className="text-white/75">
                {COPY.landing.feature2Description}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/40 transition-colors hover:border-primary" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-white/95">{COPY.landing.feature3Title}</CardTitle>
              <CardDescription className="text-white/75">
                {COPY.landing.feature3Description}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-accent/40 transition-colors hover:border-accent" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
            <CardHeader>
              <Shield className="h-10 w-10 text-accent mb-2" />
              <CardTitle className="text-white/95">Blockchain Security</CardTitle>
              <CardDescription className="text-white/75">
                Your progress is secured on the Internet Computer blockchain with cryptographic verification.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)' }}>
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
