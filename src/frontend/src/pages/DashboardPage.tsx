import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Coins, Zap, Award } from 'lucide-react';
import { COPY } from '../content/copy';

export function DashboardPage() {
  const { data: profile } = useGetCallerUserProfile();

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/75">Loading command center...</p>
      </div>
    );
  }

  const xpProgress = Number(profile.xp) / Number(profile.xpToNextLevel) * 100;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-lg border border-border" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
        <div className="absolute inset-0 opacity-20">
          <img
            src="/assets/generated/dashboard-hero.dim_1600x600.png"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative p-8">
          <h2 className="mb-2 text-3xl font-semibold text-white/95">{COPY.dashboard.welcomeBack}, {profile.nickname}</h2>
          <p className="text-white/75">{COPY.dashboard.continueJourney}</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/40 transition-colors hover:border-primary" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/95">{COPY.dashboard.level}</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-primary">{Number(profile.level)}</div>
            <p className="text-xs text-white/75">{COPY.dashboard.currentRank}</p>
          </CardContent>
        </Card>

        <Card className="border-accent/40 transition-colors hover:border-accent" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/95">{COPY.dashboard.experience}</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-accent">{Number(profile.xp)}</div>
            <p className="text-xs text-white/75">
              {Number(profile.xpToNextLevel - profile.xp)} {COPY.dashboard.toNextLevel}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/40 transition-colors hover:border-primary" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/95">{COPY.dashboard.coins}</CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-primary">{Number(profile.coins)}</div>
            <p className="text-xs text-white/75">{COPY.dashboard.currencyBalance}</p>
          </CardContent>
        </Card>

        <Card className="border-accent/40 transition-colors hover:border-accent" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/95">{COPY.dashboard.unspentPoints}</CardTitle>
            <Zap className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-accent">{Number(profile.unspentStatPoints)}</div>
            <p className="text-xs text-white/75">{COPY.dashboard.availableToAllocate}</p>
          </CardContent>
        </Card>
      </div>

      {/* XP Progress */}
      <Card style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
        <CardHeader>
          <CardTitle className="text-white/95">{COPY.dashboard.levelProgress}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/75">{COPY.dashboard.level} {Number(profile.level)}</span>
            <span className="font-medium text-white/95">
              {Number(profile.xp)} / {Number(profile.xpToNextLevel)} XP
            </span>
          </div>
          <Progress value={xpProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <Card style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
        <CardHeader>
          <CardTitle className="text-white/95">{COPY.dashboard.progressionSummary}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/75">{COPY.dashboard.missionsCompleted}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{profile.completedMissions.length}</Badge>
                <span className="text-sm text-white/75">total</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/75">{COPY.dashboard.skillsUnlocked}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{profile.unlockedSkills.length}</Badge>
                <span className="text-sm text-white/75">active</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/75">{COPY.dashboard.inventoryItems}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{profile.inventory.length}</Badge>
                <span className="text-sm text-white/75">collected</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
