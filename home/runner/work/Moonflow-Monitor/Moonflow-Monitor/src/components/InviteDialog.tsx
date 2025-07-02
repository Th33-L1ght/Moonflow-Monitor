
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { generateInvite } from '@/lib/firebase/client-actions';
import { Copy, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface InviteDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  childId: string;
}

export function InviteDialog({ isOpen, setOpen, childId }: InviteDialogProps) {
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
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

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Link</DialogTitle>
            <DialogDescription>
              Share this one-time link with your child to let them create an account and log their own symptoms.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="invite-link">One-Time Invite Link</Label>
            {loading ? (
                <Skeleton className="h-10 w-full" />
            ) : (
                <div className="relative">
                    <Input
                        id="invite-link"
                        value={inviteLink}
                        readOnly
                        className="pr-10"
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                        onClick={handleCopy}
                    >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
