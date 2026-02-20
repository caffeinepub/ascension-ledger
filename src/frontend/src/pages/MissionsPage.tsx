import { useState } from 'react';
import { useGetCallerUserProfile, useListMissions, useCompleteMission, useListUserMissions, useCompleteUserMission, useDeleteUserMission } from '../hooks/useQueries';
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
  const { data: missions = [] } = useListMissions();
  const { data: userMissions = [], isLoading: userMissionsLoading } = useListUserMissions();
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
              {completeMission.isPending ? COPY.missions.completing : COPY.missions.completeMission}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  const renderUserMissionCard = (mission: typeof userMissions[0], isCompleted: boolean) => {
    const canComplete = canCompleteUserMission(mission.id);

    return (
      <Card key={mission.id} className="transition-colors hover:border-accent" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-center gap-2 text-white/95 break-words">
                <User className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="break-words">{mission.name || 'Untitled Mission'}</span>
              </CardTitle>
              <CardDescription className="mt-2 text-white/75 break-words whitespace-pre-wrap">
                {mission.description || 'No description provided'}
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-accent text-accent flex-shrink-0">
              {COPY.customMissions.customBadge}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-accent">
                <TrendingUp className="h-4 w-4" />
                <span>{Number(mission.xpReward)} {COPY.customMissions.xpLabel}</span>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <Coins className="h-4 w-4" />
                <span>{Number(mission.coinReward)} {COPY.customMissions.goldLabel}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          {isCompleted ? (
            <Button disabled className="flex-1" variant="outline">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {COPY.customMissions.completed}
            </Button>
          ) : (
            <Button
              onClick={() => completeUserMission.mutate(mission.id)}
              disabled={!canComplete || completeUserMission.isPending}
              className="flex-1"
            >
              {completeUserMission.isPending ? COPY.missions.completing : COPY.customMissions.completeButton}
            </Button>
          )}
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDeleteClick(mission.id)}
            disabled={deleteUserMission.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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

      {/* Custom Mission Creation Form */}
      <div className="space-y-4">
        <Collapsible open={showCreateForm} onOpenChange={setShowCreateForm}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between border-accent/50 hover:border-accent">
              <span className="text-accent">{COPY.customMissions.createNewSection}</span>
              {showCreateForm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <CustomMissionForm />
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Custom Missions */}
      {!userMissionsLoading && incompleteCustomMissions.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-accent">{COPY.customMissions.sectionTitle}</h3>
            <p className="text-sm text-white/75">{COPY.customMissions.sectionDescription}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {incompleteCustomMissions.map((mission) => renderUserMissionCard(mission, false))}
          </div>
        </div>
      )}

      {/* Completed Custom Missions */}
      {!userMissionsLoading && completedCustomMissions.length > 0 && (
        <div className="space-y-4">
          <Collapsible open={showCompletedCustom} onOpenChange={setShowCompletedCustom}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>{COPY.customMissions.completedSection} ({completedCustomMissions.length})</span>
                {showCompletedCustom ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {completedCustomMissions.map((mission) => renderUserMissionCard(mission, true))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Empty state for custom missions */}
      {!userMissionsLoading && incompleteCustomMissions.length === 0 && completedCustomMissions.length === 0 && (
        <Card style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
          <CardContent className="py-12 text-center">
            <p className="text-white/75">{COPY.customMissions.emptyState}</p>
          </CardContent>
        </Card>
      )}

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{COPY.customMissions.deleteDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{COPY.customMissions.deleteDialogMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{COPY.customMissions.cancelButton}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              {COPY.customMissions.deleteButton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
