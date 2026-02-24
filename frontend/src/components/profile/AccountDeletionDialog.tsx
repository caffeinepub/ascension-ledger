import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface AccountDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function AccountDeletionDialog({ open, onOpenChange, onConfirm }: AccountDeletionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-black/90 border-destructive/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account Permanently
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white/75 space-y-3">
            <p className="font-semibold text-white/90">
              This action cannot be undone. This will permanently delete your account and remove all your data.
            </p>
            <p>All of the following will be permanently deleted:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Your profile and username</li>
              <li>All completed missions and progress</li>
              <li>All unlocked skills</li>
              <li>All stats and attribute points</li>
              <li>All custom tasks</li>
              <li>All daily task completions</li>
              <li>Coins, XP, and inventory items</li>
            </ul>
            <p className="font-semibold text-destructive/90 mt-4">
              Are you absolutely sure you want to delete your account?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white/10 hover:bg-white/20 text-white border-white/20">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            Delete Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
