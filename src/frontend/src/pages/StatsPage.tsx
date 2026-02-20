import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useGetStatNames, useAllocateStats } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, RotateCcw, Zap } from 'lucide-react';
import { COPY } from '../content/copy';

export function StatsPage() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: statNames = [] } = useGetStatNames();
  const allocateStats = useAllocateStats();

  const [allocations, setAllocations] = useState<Record<number, number>>({});

  useEffect(() => {
    setAllocations({});
  }, [profile]);

  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0);
  const remainingPoints = profile ? Number(profile.unspentStatPoints) - totalAllocated : 0;

  const handleIncrement = (index: number) => {
    if (remainingPoints > 0) {
      setAllocations((prev) => ({
        ...prev,
        [index]: (prev[index] || 0) + 1,
      }));
    }
  };

  const handleDecrement = (index: number) => {
    if (allocations[index] && allocations[index] > 0) {
      setAllocations((prev) => ({
        ...prev,
        [index]: prev[index] - 1,
      }));
    }
  };

  const handleReset = () => {
    setAllocations({});
  };

  const handleSubmit = () => {
    const statAllocations: Array<[bigint, bigint]> = Object.entries(allocations)
      .filter(([, value]) => value > 0)
      .map(([index, value]) => [BigInt(index), BigInt(value)]);

    if (statAllocations.length > 0) {
      allocateStats.mutate(statAllocations);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/75">Loading attributes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-white/95">{COPY.stats.title}</h2>
        <p className="text-white/75">{COPY.stats.description}</p>
      </div>

      {/* Points Summary */}
      <Card className="border-accent/40" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white/95">
            <Zap className="h-5 w-5 text-accent" />
            {COPY.stats.availablePoints}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-semibold text-accent">{remainingPoints}</div>
            <div className="text-sm text-white/75">
              {totalAllocated > 0 && (
                <span>({totalAllocated} {COPY.stats.pendingAllocation})</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {statNames.map((name, index) => {
          const currentValue = Number(profile.stats[index] || 0);
          const pendingValue = allocations[index] || 0;
          const newValue = currentValue + pendingValue;

          return (
            <Card key={index} className="transition-colors hover:border-primary" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
              <CardHeader>
                <CardTitle className="text-lg text-white/95">{name}</CardTitle>
                <CardDescription className="text-white/75">
                  {COPY.stats.current}: {currentValue}
                  {pendingValue > 0 && (
                    <span className="ml-2 text-accent font-medium">
                      → {newValue}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleDecrement(index)}
                    disabled={!allocations[index] || allocations[index] === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <Badge variant={pendingValue > 0 ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                      +{pendingValue}
                    </Badge>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleIncrement(index)}
                    disabled={remainingPoints === 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      {totalAllocated > 0 && (
        <Card style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {COPY.stats.reset}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={totalAllocated === 0 || allocateStats.isPending}
                className="flex-1"
              >
                {allocateStats.isPending ? COPY.stats.allocating : `${COPY.stats.allocate} ${totalAllocated} ${COPY.stats.points}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
