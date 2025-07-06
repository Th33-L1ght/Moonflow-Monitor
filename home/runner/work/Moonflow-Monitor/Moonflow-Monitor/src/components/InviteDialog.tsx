
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { generateInvite } from '@/lib/firebase/client-actions';
import { Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface InviteDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  childId: string;
}

export function InviteDialog({ isOpen, setOpen, childId }: InviteDialogProps) {
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user) {
      const createLink = async () => {
        setLoading(true);
        const inviteId = await generateInvite(user.uid, childId);
        if (inviteId) {
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          setInviteLink(`${origin}/invite/${inviteId}`);
        } else {
          toast({
            title: 'Error',
            description: 'Could not create an invite link. Please try again later.',
            variant: 'destructive',
          });
          setOpen(false);
        }
        setLoading(false);
      };
      createLink();
    }
  }, [isOpen, user, childId, setOpen, toast]);

  const handleShare = async () => {
    const shareData = {
        title: 'Invitation to Light Flo',
        text: "You've been invited to join a profile on Light Flo. Click this link to get started.",
        url: inviteLink,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to copy if user cancels the share dialog
        navigator.clipboard.writeText(inviteLink);
        toast({
          title: "Link Copied",
          description: "Sharing was cancelled. The invite link has been copied to your clipboard.",
        });
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Link Copied",
        description: "Your browser doesn't support direct sharing. The invite link has been copied to your clipboard.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Invite</DialogTitle>
            <DialogDescription>
              Send this one-time invite to your child. They can use it to create an account and link it to this profile.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loading ? (
                <Skeleton className="h-12 w-full" />
            ) : (
                <Button onClick={handleShare} className="w-full h-12 text-lg">
                    <Share2 className="mr-2 h-5 w-5" />
                    Share Invite Link
                </Button>
            )}
          </div>
          <DialogFooter className="sm:justify-center">
            <DialogDescription>
                You can send the link via WhatsApp, email, or any other app.
            </DialogDescription>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
