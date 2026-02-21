import { useState } from 'react';
import { useGetCallerUserProfile, useAllocateStats } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { COPY } from '../content/copy';
import { StatsRadarChart } from '../components/stats/StatsRadarChart';

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

export function StatsPage() {
  const { data: profile } = useGetCallerUserProfile();
  const allocateStats = useAllocateStats();
  const [pendingAllocations, setPendingAllocations] = useState<Record<number, number>>({});

  const getTotalPendingPoints = (): number => {
    return Object.values(pendingAllocations).reduce((sum, val) => sum + val, 0);
  };

  const getAvailablePoints = (): number => {
    if (!profile) return 0;
    return Number(profile.unspentStatPoints) - getTotalPendingPoints();
  };

  const incrementStat = (index: number) => {
    if (getAvailablePoints() > 0) {
      setPendingAllocations((prev) => ({
        ...prev,
        [index]: (prev[index] || 0) + 1,
      }));
    }
  };

  const decrementStat = (index: number) => {
    if ((pendingAllocations[index] || 0) > 0) {
      setPendingAllocations((prev) => {
        const newAllocations = { ...prev };
        newAllocations[index] = (newAllocations[index] || 0) - 1;
        if (newAllocations[index] === 0) {
          delete newAllocations[index];
        }
        return newAllocations;
      });
    }
  };

  const handleAllocate = async () => {
    const allocations: [bigint, bigint][] = Object.entries(pendingAllocations).map(([index, points]) => [
      BigInt(index),
      BigInt(points),
    ]);

    await allocateStats.mutateAsync(allocations);
    setPendingAllocations({});
  };

  const handleReset = () => {
    setPendingAllocations({});
  };

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-white/60">{COPY.stats.loading}</p>
      </div>
    );
  }

  // Calculate stats with pending allocations for the radar chart
  const statsWithPending = profile.stats.map((stat, index) => {
    const currentValue = Number(stat);
    const pendingValue = pendingAllocations[index] || 0;
    return BigInt(currentValue + pendingValue);
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-3xl font-bold text-white/95">{COPY.stats.title}</h1>
        <p className="mt-2 text-white/70">{COPY.stats.subtitle}</p>
      </div>

      <Card className="border-primary/20" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}>
        <CardHeader>
          <CardTitle className="text-white/95">{COPY.stats.availablePoints}</CardTitle>
          <CardDescription className="text-white/75">
            {COPY.stats.pointsRemaining}: <span className="text-2xl font-bold text-primary">{getAvailablePoints()}</span>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Radar Chart */}
      <Card className="border-primary/20" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}>
        <CardHeader>
          <CardTitle className="text-white/95">Attribute Overview</CardTitle>
          <CardDescription className="text-white/75">
            Visual representation of your current attributes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatsRadarChart stats={statsWithPending} statNames={STAT_NAMES} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_NAMES.map((statName, index) => {
          const currentValue = Number(profile.stats[index] || 0n);
          const pendingValue = pendingAllocations[index] || 0;
          const newValue = currentValue + pendingValue;

          return (
            <Card key={index} className="border-border/30" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
              <CardHeader>
                <CardTitle className="text-lg text-white/95">{statName}</CardTitle>
                <CardDescription className="text-white/75">
                  {COPY.stats.current}: {currentValue}
                  {pendingValue > 0 && (
                    <span className="ml-2 text-primary">
                      → {newValue} (+{pendingValue})
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => decrementStat(index)}
                    disabled={pendingValue === 0}
                    className="h-10 w-10 border-border/50 bg-black/40 text-white/90 hover:bg-white/10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <div className="text-2xl font-bold text-white/95">{newValue}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => incrementStat(index)}
                    disabled={getAvailablePoints() === 0}
                    className="h-10 w-10 border-border/50 bg-black/40 text-white/90 hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {getTotalPendingPoints() > 0 && (
        <Card className="border-primary/50" style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)' }}>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleAllocate} disabled={allocateStats.isPending} className="flex-1">
                {allocateStats.isPending ? COPY.stats.allocating : COPY.stats.confirmAllocation}
              </Button>
              <Button onClick={handleReset} variant="outline" disabled={allocateStats.isPending} className="flex-1">
                {COPY.stats.reset}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
