import { useLeaderboard } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { getRankFromLevel } from '../utils/rankUtils';
import { Trophy, Medal, Shield, Crown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { LeaderboardEntry } from '../backend';

// Map rank names to their avatar image paths (same as DashboardPage)
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

// Rank color map for styling
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

// Top 3 medal styles
const podiumStyles = [
  {
    // 1st place - Gold
    bg: 'rgba(234,179,8,0.12)',
    border: 'rgba(234,179,8,0.5)',
    rankBg: 'rgba(234,179,8,0.2)',
    rankText: '#fbbf24',
    rankBorder: 'rgba(234,179,8,0.6)',
    glow: '0 0 20px rgba(234,179,8,0.25)',
    icon: <Crown className="h-3 w-3" style={{ color: '#fbbf24' }} />,
    label: 'GOLD',
  },
  {
    // 2nd place - Silver
    bg: 'rgba(148,163,184,0.10)',
    border: 'rgba(148,163,184,0.45)',
    rankBg: 'rgba(148,163,184,0.15)',
    rankText: '#cbd5e1',
    rankBorder: 'rgba(148,163,184,0.5)',
    glow: '0 0 16px rgba(148,163,184,0.2)',
    icon: <Medal className="h-3 w-3" style={{ color: '#cbd5e1' }} />,
    label: 'SILVER',
  },
  {
    // 3rd place - Bronze
    bg: 'rgba(180,83,9,0.10)',
    border: 'rgba(180,83,9,0.45)',
    rankBg: 'rgba(180,83,9,0.15)',
    rankText: '#fb923c',
    rankBorder: 'rgba(180,83,9,0.5)',
    glow: '0 0 14px rgba(180,83,9,0.2)',
    icon: <Medal className="h-3 w-3" style={{ color: '#fb923c' }} />,
    label: 'BRONZE',
  },
];

function LeaderboardRow({
  entry,
  rank,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
}) {
  const { rank: rankTitle, isShadowMonarch } = getRankFromLevel(entry.level);
  const rankStyle = rankColorMap[rankTitle] ?? rankColorMap['E Rank Hunter'];
  const avatarSrc = getRankAvatar(rankTitle);
  const isTop3 = rank <= 3;
  const podium = isTop3 ? podiumStyles[rank - 1] : null;

  return (
    <div
      className="flex items-center gap-3 sm:gap-4 rounded-lg px-3 sm:px-4 py-3 transition-all duration-200"
      style={{
        background: isCurrentUser
          ? 'rgba(6,182,212,0.12)'
          : isTop3
          ? podium!.bg
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${
          isCurrentUser
            ? 'rgba(6,182,212,0.4)'
            : isTop3
            ? podium!.border
            : 'rgba(255,255,255,0.07)'
        }`,
        boxShadow: isTop3 ? podium!.glow : isCurrentUser ? '0 0 12px rgba(6,182,212,0.15)' : 'none',
      }}
    >
      {/* Avatar */}
      <div
        className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full"
        style={{
          border: `2px solid ${rankStyle.border}`,
          boxShadow: `0 0 10px ${rankStyle.glow}`,
          background: isShadowMonarch
            ? 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(234,179,8,0.2) 100%)'
            : 'rgba(0,0,0,0.4)',
        }}
      >
        <img
          src={avatarSrc}
          alt={`${rankTitle} avatar`}
          className="h-full w-full object-cover"
          style={{
            filter: isShadowMonarch
              ? 'drop-shadow(0 0 6px rgba(251,191,36,0.7))'
              : `drop-shadow(0 0 4px ${rankStyle.glow})`,
          }}
        />
      </div>

      {/* Name & Rank */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="truncate text-sm font-semibold"
            style={{ color: isCurrentUser ? '#22d3ee' : 'rgba(255,255,255,0.92)' }}
          >
            {entry.nickname}
          </span>
          {isCurrentUser && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
              style={{
                background: 'rgba(6,182,212,0.2)',
                border: '1px solid rgba(6,182,212,0.5)',
                color: '#22d3ee',
              }}
            >
              YOU
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Shield className="h-3 w-3 shrink-0" style={{ color: rankStyle.text }} />
          <span
            className="text-xs font-medium truncate"
            style={{
              color: rankStyle.text,
              textShadow: `0 0 6px ${rankStyle.glow}`,
            }}
          >
            {rankTitle}
          </span>
        </div>
      </div>

      {/* Level */}
      <div className="shrink-0 text-right">
        <div
          className="text-lg font-bold tabular-nums"
          style={{
            color: isTop3 ? podium!.rankText : 'rgba(255,255,255,0.85)',
            textShadow: isTop3 ? `0 0 8px ${podium!.rankText}` : 'none',
          }}
        >
          {Number(entry.level)}
        </div>
        <div className="text-[10px] text-white/40 uppercase tracking-wider">LVL</div>
      </div>

      {/* Rank Number (right side) — shown for ALL users, 1 to ∞ */}
      <div
        className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-md"
        style={{
          background: isTop3 ? podium!.rankBg : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isTop3 ? podium!.rankBorder : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        {isTop3 && (
          <span className="leading-none mb-0.5">{podium!.icon}</span>
        )}
        <span
          className="font-bold leading-none tabular-nums"
          style={{
            fontSize: rank >= 100 ? '9px' : rank >= 10 ? '11px' : '13px',
            color: isTop3 ? podium!.rankText : 'rgba(255,255,255,0.5)',
            textShadow: isTop3 ? `0 0 6px ${podium!.rankText}` : 'none',
          }}
        >
          #{rank}
        </span>
      </div>
    </div>
  );
}

export function LeaderboardPage() {
  const { data: entries, isLoading, error } = useLeaderboard();
  const { identity } = useInternetIdentity();
  const currentPrincipal = identity?.getPrincipal().toString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="relative overflow-hidden rounded-lg border border-border/50 p-6 sm:p-8"
        style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{
              background: 'rgba(234,179,8,0.15)',
              border: '1px solid rgba(234,179,8,0.4)',
              boxShadow: '0 0 16px rgba(234,179,8,0.2)',
            }}
          >
            <Trophy className="h-6 w-6" style={{ color: '#fbbf24' }} />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-wider uppercase"
              style={{
                color: '#fbbf24',
                textShadow: '0 0 12px rgba(234,179,8,0.5)',
                letterSpacing: '0.12em',
              }}
            >
              Leaderboard
            </h1>
            <p className="text-sm text-white/50 mt-0.5">
              Global hunter rankings by level
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div
        className="rounded-lg border border-border/50 overflow-hidden"
        style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}
      >
        {/* Column Headers */}
        <div className="flex items-center gap-3 sm:gap-4 border-b border-white/10 px-3 sm:px-4 py-2">
          <div className="w-10 shrink-0" />
          <div className="flex-1 text-[10px] font-bold uppercase tracking-widest text-white/30">
            Hunter
          </div>
          <div className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-white/30">
            Level
          </div>
          <div className="w-9 shrink-0 text-center text-[10px] font-bold uppercase tracking-widest text-white/30">
            Rank
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg p-3">
                <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32 bg-white/10" />
                  <Skeleton className="h-3 w-20 bg-white/10" />
                </div>
                <Skeleton className="h-6 w-8 bg-white/10" />
                <Skeleton className="h-9 w-9 rounded-md bg-white/10" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <Trophy className="h-12 w-12 text-white/20 mb-3" />
            <p className="text-white/50 text-sm">Failed to load leaderboard.</p>
            <p className="text-white/30 text-xs mt-1">Please try again later.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && entries && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <Trophy className="h-12 w-12 text-white/20 mb-3" />
            <p className="text-white/50 text-sm">No hunters registered yet.</p>
            <p className="text-white/30 text-xs mt-1">Be the first to claim the top spot!</p>
          </div>
        )}

        {/* Entries */}
        {!isLoading && !error && entries && entries.length > 0 && (
          <div className="space-y-1.5 p-3">
            {entries.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser =
                currentPrincipal !== undefined &&
                entry.principal.toString() === currentPrincipal;
              return (
                <LeaderboardRow
                  key={entry.principal.toString()}
                  entry={entry}
                  rank={rank}
                  isCurrentUser={isCurrentUser}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Current user position callout (if not in top 10) */}
      {!isLoading && !error && entries && entries.length > 10 && currentPrincipal && (() => {
        const userIndex = entries.findIndex(
          (e) => e.principal.toString() === currentPrincipal
        );
        if (userIndex >= 10) {
          const userEntry = entries[userIndex];
          return (
            <div
              className="rounded-lg border px-4 py-3 flex items-center gap-3"
              style={{
                background: 'rgba(6,182,212,0.08)',
                border: '1px solid rgba(6,182,212,0.3)',
              }}
            >
              <Trophy className="h-4 w-4 shrink-0" style={{ color: '#22d3ee' }} />
              <span className="text-sm text-white/70">
                Your current rank:{' '}
                <span className="font-bold" style={{ color: '#22d3ee' }}>
                  #{userIndex + 1}
                </span>{' '}
                — Level{' '}
                <span className="font-bold text-white/90">{Number(userEntry.level)}</span>
              </span>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}
