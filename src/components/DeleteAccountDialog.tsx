
'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

export function DeleteAccountDialog({ isOpen, setOpen }: DeleteAccountDialogProps) {
  const { deleteAccount } = useAuth();
  const { toast } = useToast();
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
        await deleteAccount();
        toast({
            title: "Account Deleted",
            description: "Your account and all associated data have been permanently removed.",
        });
        // The AuthContext will handle redirecting the user out.
        setOpen(false);
    } catch (error: any) {
        toast({
            title: "Error",
            description: error.message || "Failed to delete account.",
            variant: "destructive",
        });
        setLoading(false);
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmationText('');
      setLoading(false);
    }
    setOpen(open);
  }
  
  const isConfirmationMatch = confirmationText === 'DELETE';

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
          <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account,
              all child profiles, and all associated cycle data.
          </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 space-y-2">
            <Label htmlFor="delete-confirm">To confirm, type <strong>DELETE</strong> in the box below.</Label>
            <Input 
              id="delete-confirm"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmationMatch || loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? 'Deleting...' : 'Delete My Account'}
          </AlertDialogAction>
          </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
