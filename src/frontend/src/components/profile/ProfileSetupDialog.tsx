import { useState } from 'react';
import { useInitializeProfile } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { COPY } from '../../content/copy';

interface ProfileSetupDialogProps {
  open: boolean;
}

export function ProfileSetupDialog({ open }: ProfileSetupDialogProps) {
  const [nickname, setNickname] = useState('');
  const initializeProfile = useInitializeProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      initializeProfile.mutate(nickname.trim());
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} style={{ background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(12px)' }}>
        <DialogHeader>
          <DialogTitle className="text-2xl text-white/95">{COPY.profileSetup.welcomeTitle}</DialogTitle>
          <DialogDescription className="text-white/75">
            {COPY.profileSetup.welcomeDescription}
          </DialogDescription>
          <p className="text-xs text-white/60 pt-2">
            {COPY.profileSetup.identityNote}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-white/95">{COPY.profileSetup.nameLabel}</Label>
              <Input
                id="nickname"
                placeholder={COPY.profileSetup.namePlaceholder}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={30}
                autoFocus
                className="text-white/95"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={!nickname.trim() || initializeProfile.isPending}
              className="w-full"
            >
              {initializeProfile.isPending ? COPY.profileSetup.creatingProfile : COPY.profileSetup.beginButton}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
