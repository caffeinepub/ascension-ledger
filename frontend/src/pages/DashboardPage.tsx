import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Coins, Zap, Award, Shield } from 'lucide-react';
import { COPY } from '../content/copy';
import { RealTimeClock } from '../components/dashboard/RealTimeClock';
import { DateCalendar } from '../components/dashboard/DateCalendar';
import { DailyTasksSection } from '../components/dashboard/DailyTasksSection';
import { StatsRadarChart } from '../components/stats/StatsRadarChart';
import { getRankFromLevel } from '../utils/rankUtils';

const STAT_NAMES = [
  'Academics',
  'Creativity',
  'Fitness',
  'Health',
  'Life Skills',
  'Mental Health',
  'Productivity',
  'Relationship Building',
  'Self Awareness',
  'Self Care',
  'Social Awareness',
  'Wealth',
  'Work',
];

function RankBadge({ level }: { level: bigint }) {
  const { rank, isShadowMonarch } = getRankFromLevel(level);

  if (isShadowMonarch) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(234,179,8,0.25) 100%)',
          border: '1px solid rgba(234,179,8,0.6)',
          color: '#fbbf24',
          textShadow: '0 0 8px rgba(251,191,36,0.8)',
          boxShadow: '0 0 12px rgba(139,92,246,0.4), inset 0 0 8px rgba(234,179,8,0.1)',
        }}
      >
        <Shield className="h-3 w-3" style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.9))' }} />
        {rank}
      </span>
    );
  }

  const rankColors: Record<string, { bg: string; border: string; text: string }> = {
    'SSS Rank Hunter': {
      bg: 'rgba(239,68,68,0.15)',
      border: 'rgba(239,68,68,0.5)',
      text: '#f87171',
    },
    'SS Rank Hunter': {
      bg: 'rgba(249,115,22,0.15)',
      border: 'rgba(249,115,22,0.5)',
      text: '#fb923c',
    },
    'S Rank Hunter': {
      bg: 'rgba(234,179,8,0.15)',
      border: 'rgba(234,179,8,0.5)',
      text: '#facc15',
    },
    'A Rank Hunter': {
      bg: 'rgba(34,197,94,0.15)',
      border: 'rgba(34,197,94,0.5)',
      text: '#4ade80',
    },
    'B Rank Hunter': {
      bg: 'rgba(6,182,212,0.15)',
      border: 'rgba(6,182,212,0.5)',
      text: '#22d3ee',
    },
    'C Rank Hunter': {
      bg: 'rgba(99,102,241,0.15)',
      border: 'rgba(99,102,241,0.5)',
      text: '#818cf8',
    },
    'D Rank Hunter': {
      bg: 'rgba(168,85,247,0.15)',
      border: 'rgba(168,85,247,0.5)',
      text: '#c084fc',
    },
    'E Rank Hunter': {
      bg: 'rgba(148,163,184,0.15)',
      border: 'rgba(148,163,184,0.4)',
      text: '#94a3b8',
    },
  };

  const colors = rankColors[rank] ?? rankColors['E Rank Hunter'];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
      }}
    >
      <Shield className="h-3 w-3" />
      {rank}
    </span>
  );
}

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
  const { rank, isShadowMonarch } = getRankFromLevel(profile.level);

  return (
    <div className="space-y-6">
      {/* Hero Banner with Clock and Calendar */}
      <div className="relative overflow-hidden rounded-lg border border-border/50" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}>
        <div className="absolute inset-0 opacity-10">
          <img
            src="/assets/generated/dashboard-hero.dim_1600x600.png"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative space-y-4 p-8">
          <div>
            <h2 className="mb-1 text-3xl font-semibold text-white/95">{COPY.dashboard.welcomeBack}, {profile.nickname}</h2>
            {/* Rank display in hero */}
            <div className="mb-2 flex items-center gap-2">
              <RankBadge level={profile.level} />
            </div>
            <p className="text-white/75">{COPY.dashboard.continueJourney}</p>
          </div>

          {/* Clock and Calendar */}
          <div className="flex flex-wrap gap-4">
            <RealTimeClock />
            <DateCalendar />
          </div>
        </div>
      </div>

      {/* Daily Tasks Section */}
      <DailyTasksSection />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Level Card with Rank */}
        <Card className="border-primary/40 transition-colors hover:border-primary/60" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/95">{COPY.dashboard.level}</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-primary">{Number(profile.level)}</div>
            <div className="mt-1">
              <RankBadge level={profile.level} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/40 transition-colors hover:border-accent/60" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}>
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

        <Card className="border-primary/40 transition-colors hover:border-primary/60" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/95">{COPY.dashboard.coins}</CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-primary">{Number(profile.coins)}</div>
            <p className="text-xs text-white/75">{COPY.dashboard.currencyBalance}</p>
          </CardContent>
        </Card>

        <Card className="border-accent/40 transition-colors hover:border-accent/60" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}>
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
      <Card style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }} className="border-border/50">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-white/95">{COPY.dashboard.levelProgress}</CardTitle>
            {isShadowMonarch ? (
              <span
                className="text-sm font-bold tracking-widest uppercase"
                style={{
                  background: 'linear-gradient(90deg, #c084fc, #fbbf24, #c084fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.5))',
                }}
              >
                ✦ {rank} ✦
              </span>
            ) : (
              <RankBadge level={profile.level} />
            )}
          </div>
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

      {/* Stats Radar Chart */}
      <Card className="border-primary/20" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}>
        <CardHeader>
          <CardTitle className="text-white/95">Attribute Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <StatsRadarChart stats={profile.stats} statNames={STAT_NAMES} />
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <Card style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }} className="border-border/50">
        <CardHeader>
          <CardTitle className="text-white/95">{COPY.dashboard.progressionSummary}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/75">{COPY.dashboard.missionsCompleted}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/40">{profile.completedMissions.length}</Badge>
                <span className="text-sm text-white/75">total</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/75">{COPY.dashboard.skillsUnlocked}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/40">{profile.unlockedSkills.length}</Badge>
                <span className="text-sm text-white/75">active</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/75">{COPY.dashboard.inventoryItems}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/40">{profile.inventory.length}</Badge>
                <span className="text-sm text-white/75">items</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
