import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, LogOut, Award, Coins, Zap } from 'lucide-react';
import { COPY } from '../content/copy';

export function ProfileSettingsPage() {
  const { data: profile } = useGetCallerUserProfile();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/75">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-white/95">{COPY.profile.title}</h2>
        <p className="text-white/75">{COPY.profile.description}</p>
      </div>

      {/* Profile Info */}
      <Card style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white/95">
            <User className="h-5 w-5 text-primary" />
            {COPY.profile.profileInformation}
          </CardTitle>
          <CardDescription className="text-white/75">Your operator profile and identity information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/75">{COPY.profile.name}:</span>
            <span className="text-white/95">{profile.nickname}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/75">Principal ID:</span>
            <code className="text-xs text-white/75 bg-black/40 px-2 py-1 rounded">
              {identity?.getPrincipal().toString().slice(0, 20)}...
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <Card style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
        <CardHeader>
          <CardTitle className="text-white/95">Stats Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-white/75">{COPY.dashboard.level}</p>
                <p className="text-xl font-semibold text-white/95">{Number(profile.level)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Coins className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-white/75">{COPY.dashboard.coins}</p>
                <p className="text-xl font-semibold text-white/95">{Number(profile.coins)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-accent" />
              <div>
                <p className="text-sm text-white/75">{COPY.dashboard.unspentPoints}</p>
                <p className="text-xl font-semibold text-white/95">{Number(profile.unspentStatPoints)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <Card style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
        <CardHeader>
          <CardTitle className="text-white/95">{COPY.profile.progressSummary}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/75">{COPY.dashboard.missionsCompleted}:</span>
              <Badge variant="secondary">{profile.completedMissions.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/75">{COPY.dashboard.skillsUnlocked}:</span>
              <Badge variant="secondary">{profile.unlockedSkills.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/75">{COPY.dashboard.inventoryItems}:</span>
              <Badge variant="secondary">{profile.inventory.length}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
        <CardHeader>
          <CardTitle className="text-white/95">{COPY.profile.accountActions}</CardTitle>
          <CardDescription className="text-white/75">Manage your system connection and data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {COPY.auth.signOut}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
