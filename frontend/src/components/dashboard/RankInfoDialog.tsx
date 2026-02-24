import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Info } from 'lucide-react';
import { getRankFromLevel } from '../../utils/rankUtils';

interface RankTier {
  rank: string;
  minLevel: number;
  maxLevel: number | null;
  isShadowMonarch: boolean;
  bg: string;
  border: string;
  text: string;
}

const RANK_TIERS: RankTier[] = [
  {
    rank: 'Shadow Monarch',
    minLevel: 60,
    maxLevel: null,
    isShadowMonarch: true,
    bg: 'rgba(139,92,246,0.15)',
    border: 'rgba(234,179,8,0.6)',
    text: '#fbbf24',
  },
  {
    rank: 'SSS Rank Hunter',
    minLevel: 50,
    maxLevel: 59,
    isShadowMonarch: false,
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.5)',
    text: '#f87171',
  },
  {
    rank: 'SS Rank Hunter',
    minLevel: 40,
    maxLevel: 49,
    isShadowMonarch: false,
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.5)',
    text: '#fb923c',
  },
  {
    rank: 'S Rank Hunter',
    minLevel: 30,
    maxLevel: 39,
    isShadowMonarch: false,
    bg: 'rgba(234,179,8,0.12)',
    border: 'rgba(234,179,8,0.5)',
    text: '#facc15',
  },
  {
    rank: 'A Rank Hunter',
    minLevel: 20,
    maxLevel: 29,
    isShadowMonarch: false,
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.5)',
    text: '#4ade80',
  },
  {
    rank: 'B Rank Hunter',
    minLevel: 15,
    maxLevel: 19,
    isShadowMonarch: false,
    bg: 'rgba(6,182,212,0.12)',
    border: 'rgba(6,182,212,0.5)',
    text: '#22d3ee',
  },
  {
    rank: 'C Rank Hunter',
    minLevel: 10,
    maxLevel: 14,
    isShadowMonarch: false,
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.5)',
    text: '#818cf8',
  },
  {
    rank: 'D Rank Hunter',
    minLevel: 5,
    maxLevel: 9,
    isShadowMonarch: false,
    bg: 'rgba(168,85,247,0.12)',
    border: 'rgba(168,85,247,0.5)',
    text: '#c084fc',
  },
  {
    rank: 'E Rank Hunter',
    minLevel: 1,
    maxLevel: 4,
    isShadowMonarch: false,
    bg: 'rgba(148,163,184,0.10)',
    border: 'rgba(148,163,184,0.4)',
    text: '#94a3b8',
  },
];

interface RankInfoDialogProps {
  userLevel: bigint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RankInfoDialog({ userLevel, open, onOpenChange }: RankInfoDialogProps) {
  const currentRankInfo = getRankFromLevel(userLevel);
  const currentLevel = Number(userLevel);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md border-border/60"
        style={{ background: 'rgba(8, 8, 12, 0.97)', backdropFilter: 'blur(16px)' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white/95">
            <Shield className="h-5 w-5 text-primary" />
            Rank Progression
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Your current rank and the full progression table
          </DialogDescription>
        </DialogHeader>

        {/* Current Rank Highlight */}
        <div
          className="rounded-lg border p-4 mb-2"
          style={{
            background: currentRankInfo.isShadowMonarch
              ? 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(234,179,8,0.2) 100%)'
              : 'rgba(255,255,255,0.04)',
            borderColor: currentRankInfo.isShadowMonarch ? 'rgba(234,179,8,0.6)' : 'rgba(255,255,255,0.12)',
          }}
        >
          <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Current Rank</p>
          <div className="flex items-center justify-between">
            <span
              className="text-lg font-bold tracking-wide"
              style={{
                color: currentRankInfo.isShadowMonarch ? '#fbbf24' : undefined,
                background: currentRankInfo.isShadowMonarch
                  ? 'linear-gradient(90deg, #c084fc, #fbbf24)'
                  : undefined,
                WebkitBackgroundClip: currentRankInfo.isShadowMonarch ? 'text' : undefined,
                WebkitTextFillColor: currentRankInfo.isShadowMonarch ? 'transparent' : undefined,
                backgroundClip: currentRankInfo.isShadowMonarch ? 'text' : undefined,
              }}
            >
              {currentRankInfo.rank}
            </span>
            <span className="text-sm text-white/60 font-mono">LVL {currentLevel}</span>
          </div>
        </div>

        {/* Rank Progression Table */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {RANK_TIERS.map((tier) => {
            const isCurrent = currentRankInfo.rank === tier.rank;
            const levelRange = tier.maxLevel
              ? `Lv. ${tier.minLevel} – ${tier.maxLevel}`
              : `Lv. ${tier.minLevel}+`;

            return (
              <div
                key={tier.rank}
                className="flex items-center justify-between rounded-md px-3 py-2 transition-all"
                style={{
                  background: isCurrent ? tier.bg : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isCurrent ? tier.border : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: isCurrent && tier.isShadowMonarch
                    ? '0 0 12px rgba(139,92,246,0.3), inset 0 0 8px rgba(234,179,8,0.08)'
                    : isCurrent
                    ? `0 0 8px ${tier.border}40`
                    : 'none',
                }}
              >
                <div className="flex items-center gap-2">
                  <Shield
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: isCurrent ? tier.text : 'rgba(255,255,255,0.25)' }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: isCurrent ? tier.text : 'rgba(255,255,255,0.55)' }}
                  >
                    {tier.rank}
                  </span>
                  {isCurrent && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                      style={{
                        background: tier.bg,
                        border: `1px solid ${tier.border}`,
                        color: tier.text,
                      }}
                    >
                      You
                    </span>
                  )}
                </div>
                <span
                  className="text-xs font-mono"
                  style={{ color: isCurrent ? tier.text : 'rgba(255,255,255,0.35)' }}
                >
                  {levelRange}
                </span>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface RankInfoTriggerProps {
  userLevel: bigint;
}

export function RankInfoTrigger({ userLevel }: RankInfoTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-7 gap-1.5 px-2 text-white/60 hover:text-white/90 hover:bg-white/10"
        title="View rank progression"
      >
        <Info className="h-3.5 w-3.5" />
        <span className="text-xs">Rank Info</span>
      </Button>
      <RankInfoDialog userLevel={userLevel} open={open} onOpenChange={setOpen} />
    </>
  );
}
