import { useState } from 'react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Coins, Zap, Award, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COPY } from '../content/copy';
import { RealTimeClock } from '../components/dashboard/RealTimeClock';
import { DateCalendar } from '../components/dashboard/DateCalendar';
import { StatsRadarChart } from '../components/stats/StatsRadarChart';
import { getRankFromLevel } from '../utils/rankUtils';
import { CustomTaskForm } from '../components/tasks/CustomTaskForm';
import { RankInfoDialog } from '../components/dashboard/RankInfoDialog';

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

// Map rank names to their avatar image paths
const RANK_AVATAR_MAP: Record<string, string> = {
  'E Rank Hunter': '/assets/generated/rank-avatar-e.dim_128x128.png',
  'D Rank Hunter': '/assets/generated/rank-avatar-d.dim_128x128.png',
  'C Rank Hunter': '/assets/generated/rank-avatar-c.dim_128x128.png',
  'B Rank Hunter': '/assets/generated/rank-avatar-b.dim_128x128.png',
  'A Rank Hunter': '/assets/generated/rank-avatar-a.dim_128x128.png',
  'S Rank Hunter': '/assets/generated/rank-avatar-s.dim_128x128.png',
  'SS Rank Hunter': '/assets/generated/rank-avatar-national.dim_128x128.png',
  'SSS Rank Hunter': '/assets/generated/rank-avatar-national.dim_128x128.png',
  'Shadow Monarch': '/assets/generated/rank-avatar-shadow-monarch.dim_128x128.png',
};

function getRankAvatar(rank: string): string {
  return RANK_AVATAR_MAP[rank] ?? RANK_AVATAR_MAP['E Rank Hunter'];
}

function RankBadge({ level, onClick }: { level: bigint; onClick?: () => void }) {
  const { rank, isShadowMonarch } = getRankFromLevel(level);

  if (isShadowMonarch) {
    return (
      <span
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase ${onClick ? 'cursor-pointer' : ''}`}
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
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
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

const rankColorMap: Record<string, { text: string; glow: string; border: string }> = {
  'Shadow Monarch': { text: '#fbbf24', glow: 'rgba(251,191,36,0.5)', border: 'rgba(234,179,8,0.5)' },
  'SSS Rank Hunter': { text: '#f87171', glow: 'rgba(239,68,68,0.4)', border: 'rgba(239,68,68,0.4)' },
  'SS Rank Hunter': { text: '#fb923c', glow: 'rgba(249,115,22,0.4)', border: 'rgba(249,115,22,0.4)' },
  'S Rank Hunter': { text: '#facc15', glow: 'rgba(234,179,8,0.4)', border: 'rgba(234,179,8,0.4)' },
  'A Rank Hunter': { text: '#4ade80', glow: 'rgba(34,197,94,0.3)', border: 'rgba(34,197,94,0.4)' },
  'B Rank Hunter': { text: '#22d3ee', glow: 'rgba(6,182,212,0.3)', border: 'rgba(6,182,212,0.4)' },
  'C Rank Hunter': { text: '#818cf8', glow: 'rgba(99,102,241,0.3)', border: 'rgba(99,102,241,0.4)' },
  'D Rank Hunter': { text: '#c084fc', glow: 'rgba(168,85,247,0.3)', border: 'rgba(168,85,247,0.4)' },
  'E Rank Hunter': { text: '#94a3b8', glow: 'rgba(148,163,184,0.2)', border: 'rgba(148,163,184,0.3)' },
};

export function DashboardPage() {
  const { data: profile } = useGetCallerUserProfile();
  const [rankDialogOpen, setRankDialogOpen] = useState(false);

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/75">Loading command center...</p>
      </div>
    );
  }

  const xpProgress = Number(profile.xp) / Number(profile.xpToNextLevel) * 100;
  const { rank, isShadowMonarch } = getRankFromLevel(profile.level);
  const rankStyle = rankColorMap[rank] ?? rankColorMap['E Rank Hunter'];
  const rankAvatarSrc = getRankAvatar(rank);

  return (
    <div className="space-y-6">
      {/* Rank Info Dialog */}
      <RankInfoDialog
        userLevel={profile.level}
        open={rankDialogOpen}
        onOpenChange={setRankDialogOpen}
      />

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
            {/* Rank display in hero — clickable to open rank dialog */}
            <div className="mb-2 flex items-center gap-2">
              <RankBadge level={profile.level} onClick={() => setRankDialogOpen(true)} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRankDialogOpen(true)}
                className="h-6 gap-1 px-2 text-white/50 hover:text-white/80 hover:bg-white/10"
                title="View rank progression"
              >
                <Info className="h-3 w-3" />
                <span className="text-[11px]">Rank Info</span>
              </Button>
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

      {/* Custom Task Creator (replaces AI Daily Tasks) */}
      <Card
        className="border-primary/30"
        style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white/95">
            <Zap className="h-5 w-5 text-primary" />
            {COPY.customTasks.createTaskTitle}
          </CardTitle>
          <p className="text-sm text-white/60">{COPY.customTasks.createTaskDescription}</p>
        </CardHeader>
        <CardContent>
          <CustomTaskForm />
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Level Card — clickable to open rank dialog */}
        <Card
          className="border-primary/40 transition-colors hover:border-primary/60 cursor-pointer"
          style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}
          onClick={() => setRankDialogOpen(true)}
          title="View rank progression"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/95">{COPY.dashboard.level}</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-primary">{Number(profile.level)}</div>
            <div className="mt-1 flex items-center gap-1.5">
              <Info className="h-3 w-3 text-white/30" />
              <span className="text-xs text-white/40">tap for ranks</span>
            </div>
          </CardContent>
        </Card>

        {/* Current Rank Card — clickable to open rank dialog, with rank avatar */}
        <Card
          className="transition-colors cursor-pointer overflow-hidden"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)',
            borderColor: rankStyle.border,
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
          onClick={() => setRankDialogOpen(true)}
          title="View rank progression"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/95">Current Rank</CardTitle>
            <Shield className="h-4 w-4" style={{ color: rankStyle.text }} />
          </CardHeader>
          <CardContent className="pt-0">
            {/* Rank Avatar — enlarged to h-24 w-24 */}
            <div className="mb-2 flex justify-center">
              <div
                className="relative h-24 w-24 overflow-hidden rounded-full"
                style={{
                  boxShadow: `0 0 20px ${rankStyle.glow}, 0 0 6px ${rankStyle.border}`,
                  border: `2px solid ${rankStyle.border}`,
                  background: isShadowMonarch
                    ? 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(234,179,8,0.2) 100%)'
                    : `rgba(0,0,0,0.4)`,
                }}
              >
                <img
                  src={rankAvatarSrc}
                  alt={`${rank} avatar`}
                  className="h-full w-full object-cover"
                  style={{
                    filter: isShadowMonarch
                      ? `drop-shadow(0 0 8px rgba(251,191,36,0.7))`
                      : `drop-shadow(0 0 5px ${rankStyle.glow})`,
                  }}
                />
              </div>
            </div>

            {/* Rank Name */}
            {isShadowMonarch ? (
              <div
                className="text-center text-sm font-bold tracking-wide leading-tight"
                style={{
                  background: 'linear-gradient(90deg, #c084fc, #fbbf24, #c084fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: `drop-shadow(0 0 6px ${rankStyle.glow})`,
                }}
              >
                {rank}
              </div>
            ) : (
              <div
                className="text-center text-sm font-bold tracking-wide leading-tight"
                style={{
                  color: rankStyle.text,
                  textShadow: `0 0 8px ${rankStyle.glow}`,
                }}
              >
                {rank}
              </div>
            )}
            <div className="mt-1 flex items-center justify-center gap-1.5">
              <Info className="h-3 w-3 text-white/30" />
              <span className="text-xs text-white/40">tap for details</span>
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
            <div className="flex items-center gap-2">
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
                <RankBadge level={profile.level} onClick={() => setRankDialogOpen(true)} />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRankDialogOpen(true)}
                className="h-7 w-7 p-0 text-white/40 hover:text-white/80 hover:bg-white/10"
                title="View rank progression"
              >
                <Info className="h-3.5 w-3.5" />
              </Button>
            </div>
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
                <span className="text-sm text-white/75">unlocked</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/75">{COPY.dashboard.coins}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/40">{Number(profile.coins)}</Badge>
                <span className="text-sm text-white/75">coins</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
