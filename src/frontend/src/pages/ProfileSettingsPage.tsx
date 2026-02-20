import { useGetCallerUserProfile, useUpdateUsername, useDeleteAccount } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, LogOut, Award, Coins, Zap, Edit2, Trash2 } from 'lucide-react';
import { COPY } from '../content/copy';
import { AccountDeletionDialog } from '../components/profile/AccountDeletionDialog';
import { useState } from 'react';

export function ProfileSettingsPage() {
  const { data: profile } = useGetCallerUserProfile();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const updateUsernameMutation = useUpdateUsername();
  const deleteAccountMutation = useDeleteAccount();

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleStartEditUsername = () => {
    setNewUsername(profile?.nickname || '');
    setIsEditingUsername(true);
  };

  const handleCancelEditUsername = () => {
    setIsEditingUsername(false);
    setNewUsername('');
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      return;
    }
    await updateUsernameMutation.mutateAsync(newUsername.trim());
    setIsEditingUsername(false);
    setNewUsername('');
  };

  const handleDeleteAccount = async () => {
    await deleteAccountMutation.mutateAsync();
    setShowDeleteDialog(false);
    // Logout and clear cache after successful deletion
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
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-white/75">
              {COPY.profile.name}:
            </Label>
            {isEditingUsername ? (
              <div className="flex gap-2">
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-black/40 border-white/20 text-white/95"
                  placeholder="Enter new username"
                />
                <Button
                  onClick={handleSaveUsername}
                  disabled={!newUsername.trim() || updateUsernameMutation.isPending}
                  size="sm"
                >
                  {updateUsernameMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={handleCancelEditUsername}
                  variant="outline"
                  size="sm"
                  disabled={updateUsernameMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-white/95">{profile.nickname}</span>
                <Button
                  onClick={handleStartEditUsername}
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            )}
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
        <CardContent className="space-y-3">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {COPY.auth.signOut}
          </Button>
          <Separator />
          <div className="pt-2">
            <p className="text-sm text-white/75 mb-3">
              Danger Zone: This action cannot be undone
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full bg-destructive/80 hover:bg-destructive"
              disabled={deleteAccountMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteAccountMutation.isPending ? 'Deleting Account...' : 'Delete Account Permanently'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AccountDeletionDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
