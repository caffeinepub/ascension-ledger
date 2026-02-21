import { useState } from 'react';
import { useGetCallerUserProfile, useGetMissions, useCompleteMission, useGetUserMissions, useCompleteUserMission, useDeleteUserMission } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Swords, Clock, Coins, TrendingUp, CheckCircle2, ChevronDown, ChevronUp, User, Trash2 } from 'lucide-react';
import { Variant_repeatable_daily } from '../backend';
import { COPY } from '../content/copy';
import { CustomMissionForm } from '../components/missions/CustomMissionForm';

export function MissionsPage() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: missions = [] } = useGetMissions();
  const { data: userMissions = [], isLoading: userMissionsLoading } = useGetUserMissions();
  const completeMission = useCompleteMission();
  const completeUserMission = useCompleteUserMission();
  const deleteUserMission = useDeleteUserMission();

  const [showCompletedCustom, setShowCompletedCustom] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState<string | null>(null);

  const dailyMissions = missions.filter((m) => m.missionType === Variant_repeatable_daily.daily);
  const repeatableMissions = missions.filter((m) => m.missionType === Variant_repeatable_daily.repeatable);

  const completedCustomMissions = userMissions.filter((m) => {
    if (!profile) return false;
    return profile.completedMissions.includes(m.id);
  });

  const incompleteCustomMissions = userMissions.filter((m) => {
    if (!profile) return true;
    return !profile.completedMissions.includes(m.id);
  });

  const canCompleteMission = (missionId: string): boolean => {
    if (!profile) return false;

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

  const canCompleteUserMission = (missionId: string): boolean => {
    if (!profile) return false;
    return !profile.completedMissions.includes(missionId);
  };

  const getMissionStatus = (missionId: string): 'available' | 'completed-today' => {
    if (!profile) return 'available';

    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return 'available';

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

  const handleDeleteClick = (missionId: string) => {
    setMissionToDelete(missionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (missionToDelete) {
      await deleteUserMission.mutateAsync(missionToDelete);
      setDeleteDialogOpen(false);
      setMissionToDelete(null);
    }
  };

  const renderMissionCard = (mission: typeof missions[0]) => {
    const status = getMissionStatus(mission.id);
    const canComplete = canCompleteMission(mission.id);

    return (
      <Card key={mission.id} className="transition-colors hover:border-primary" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-white/95 break-words whitespace-pre-wrap">
                <Swords className="h-5 w-5 text-primary flex-shrink-0" />
                {mission.name}
              </CardTitle>
              <CardDescription className="mt-2 text-white/75 break-words whitespace-pre-wrap">{mission.description}</CardDescription>
            </div>
            <Badge variant={mission.missionType === Variant_repeatable_daily.daily ? 'default' : 'secondary'} className="flex-shrink-0">
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
            <div className="flex items-center gap-2 text-sm text-white/80">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>{Number(mission.xpReward)} {COPY.missions.xp}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Coins className="h-4 w-4 text-accent" />
              <span>{Number(mission.coinReward)} {COPY.missions.coins}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {status === 'completed-today' ? (
            <Button disabled className="w-full" variant="outline">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {COPY.missions.completedToday}
            </Button>
          ) : (
            <Button
              onClick={() => completeMission.mutate(mission.id)}
              disabled={!canComplete || completeMission.isPending}
              className="w-full"
            >
              {completeMission.isPending ? COPY.missions.completing : COPY.missions.complete}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  const renderUserMissionCard = (mission: typeof userMissions[0]) => {
    const canComplete = canCompleteUserMission(mission.id);
    const isCompleted = !canComplete;

    return (
      <Card key={mission.id} className="transition-colors hover:border-primary" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-white/95 break-words whitespace-pre-wrap">
                <User className="h-5 w-5 text-accent flex-shrink-0" />
                {mission.name}
              </CardTitle>
              <CardDescription className="mt-2 text-white/75 break-words whitespace-pre-wrap">{mission.description}</CardDescription>
            </div>
            <Badge variant="secondary" className="flex-shrink-0">{COPY.customMissions.custom}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>{Number(mission.xpReward)} {COPY.missions.xp}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Coins className="h-4 w-4 text-accent" />
              <span>{Number(mission.coinReward)} {COPY.missions.coins}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          {isCompleted ? (
            <>
              <Button disabled className="flex-1" variant="outline">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {COPY.missions.completed}
              </Button>
              <Button
                onClick={() => handleDeleteClick(mission.id)}
                disabled={deleteUserMission.isPending}
                variant="destructive"
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => completeUserMission.mutate(mission.id)}
                disabled={completeUserMission.isPending}
                className="flex-1"
              >
                {completeUserMission.isPending ? COPY.missions.completing : COPY.missions.complete}
              </Button>
              <Button
                onClick={() => handleDeleteClick(mission.id)}
                disabled={deleteUserMission.isPending}
                variant="destructive"
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-3xl font-bold text-white/95">{COPY.missions.title}</h1>
        <p className="mt-2 text-white/70">{COPY.missions.subtitle}</p>
      </div>

      {/* Daily Missions */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold text-primary">{COPY.missions.dailyMissions}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dailyMissions.map(renderMissionCard)}
        </div>
      </section>

      <Separator className="bg-border/50" />

      {/* Repeatable Missions */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold text-primary">{COPY.missions.repeatableMissions}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {repeatableMissions.map(renderMissionCard)}
        </div>
      </section>

      <Separator className="bg-border/50" />

      {/* Custom Missions */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-accent">{COPY.customMissions.title}</h2>
        </div>

        {/* Create Mission Form - Collapsible */}
        <Collapsible open={showCreateForm} onOpenChange={setShowCreateForm} className="mb-6">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>{showCreateForm ? COPY.customMissions.hideForm : COPY.customMissions.showForm}</span>
              {showCreateForm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <CustomMissionForm />
          </CollapsibleContent>
        </Collapsible>

        {/* Active Custom Missions */}
        {incompleteCustomMissions.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-medium text-white/90">{COPY.customMissions.activeMissions}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {incompleteCustomMissions.map(renderUserMissionCard)}
            </div>
          </div>
        )}

        {/* Completed Custom Missions - Collapsible */}
        {completedCustomMissions.length > 0 && (
          <Collapsible open={showCompletedCustom} onOpenChange={setShowCompletedCustom}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-white/70 hover:text-white/90">
                <span>{COPY.customMissions.completedMissions} ({completedCustomMissions.length})</span>
                {showCompletedCustom ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {completedCustomMissions.map(renderUserMissionCard)}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {userMissions.length === 0 && !userMissionsLoading && (
          <p className="text-center text-white/60">{COPY.customMissions.noMissions}</p>
        )}
      </section>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{COPY.customMissions.deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{COPY.customMissions.deleteConfirmMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{COPY.customMissions.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              {COPY.customMissions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
