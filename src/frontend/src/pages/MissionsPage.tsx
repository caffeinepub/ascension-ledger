import { useGetCallerUserProfile, useListMissions, useCompleteMission } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Swords, Clock, Coins, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Variant_repeatable_daily } from '../backend';
import { COPY } from '../content/copy';

export function MissionsPage() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: missions = [] } = useListMissions();
  const completeMission = useCompleteMission();

  const dailyMissions = missions.filter((m) => m.missionType === Variant_repeatable_daily.daily);
  const repeatableMissions = missions.filter((m) => m.missionType === Variant_repeatable_daily.repeatable);

  const canCompleteMission = (missionId: string, minLevel: bigint): boolean => {
    if (!profile) return false;
    if (profile.level < minLevel) return false;

    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return false;

    if (mission.missionType === Variant_repeatable_daily.daily) {
      const lastCompletion = profile.lastMissionCompletionTime.find(([id]) => id === missionId);
      if (lastCompletion) {
        const [, lastTime] = lastCompletion;
        const now = BigInt(Date.now()) * BigInt(1_000_000);
        const dayInNanos = BigInt(86_400_000_000_000);
        if (now - lastTime < dayInNanos) {
          return false;
        }
      }
    }

    return true;
  };

  const getMissionStatus = (missionId: string, minLevel: bigint): 'available' | 'completed-today' | 'locked' => {
    if (!profile) return 'locked';
    if (profile.level < minLevel) return 'locked';

    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return 'locked';

    if (mission.missionType === Variant_repeatable_daily.daily) {
      const lastCompletion = profile.lastMissionCompletionTime.find(([id]) => id === missionId);
      if (lastCompletion) {
        const [, lastTime] = lastCompletion;
        const now = BigInt(Date.now()) * BigInt(1_000_000);
        const dayInNanos = BigInt(86_400_000_000_000);
        if (now - lastTime < dayInNanos) {
          return 'completed-today';
        }
      }
    }

    return 'available';
  };

  const renderMissionCard = (mission: typeof missions[0]) => {
    const status = getMissionStatus(mission.id, mission.requirements.minLevel);
    const canComplete = canCompleteMission(mission.id, mission.requirements.minLevel);

    return (
      <Card key={mission.id} className="transition-colors hover:border-primary" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-white/95">
                <Swords className="h-5 w-5 text-primary" />
                {mission.name}
              </CardTitle>
              <CardDescription className="mt-2 text-white/75">{mission.description}</CardDescription>
            </div>
            <Badge variant={mission.missionType === Variant_repeatable_daily.daily ? 'default' : 'secondary'}>
              {mission.missionType === Variant_repeatable_daily.daily ? (
                <><Clock className="mr-1 h-3 w-3" /> {COPY.missions.daily}</>
              ) : (
                COPY.missions.repeatable
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-accent">
                <TrendingUp className="h-4 w-4" />
                <span>{Number(mission.xpReward)} XP</span>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <Coins className="h-4 w-4" />
                <span>{Number(mission.coinReward)} Credits</span>
              </div>
            </div>
            <Separator />
            <div className="text-sm text-white/75">
              {COPY.missions.requiredLevel}: {Number(mission.requirements.minLevel)}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {status === 'completed-today' ? (
            <Button disabled className="w-full" variant="outline">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {COPY.missions.completedToday}
            </Button>
          ) : status === 'locked' ? (
            <Button disabled className="w-full" variant="outline">
              {COPY.missions.locked} ({COPY.dashboard.level} {Number(mission.requirements.minLevel)} Required)
            </Button>
          ) : (
            <Button
              onClick={() => completeMission.mutate(mission.id)}
              disabled={!canComplete || completeMission.isPending}
              className="w-full"
            >
              {completeMission.isPending ? COPY.missions.completing : COPY.missions.completeMission}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-white/95">{COPY.missions.title}</h2>
        <p className="text-white/75">{COPY.missions.description}</p>
      </div>

      {/* Daily Missions */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-white/95">{COPY.missions.dailyMissions}</h3>
          <p className="text-sm text-white/75">{COPY.missions.dailyDescription}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {dailyMissions.map(renderMissionCard)}
        </div>
      </div>

      {/* Repeatable Missions */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-white/95">{COPY.missions.repeatableMissions}</h3>
          <p className="text-sm text-white/75">{COPY.missions.repeatableDescription}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {repeatableMissions.map(renderMissionCard)}
        </div>
      </div>

      {missions.length === 0 && (
        <Card style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
          <CardContent className="py-12 text-center">
            <p className="text-white/75">{COPY.missions.noMissions}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
