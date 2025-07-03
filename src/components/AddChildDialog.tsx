'use client';

import { useState } from 'react';
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
import { addChildForUser } from '@/lib/firebase/client-actions';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { PadsButterflyIcon as ButterflyIcon } from './PadsButterflyIcon';

interface AddChildDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  onChildAdded: () => void;
}

interface AvatarOption {
  url: string;
  hint: string;
}

const avatars: AvatarOption[] = [
  { url: 'https://placehold.co/100x100/fecdd3/9f1239.png', hint: 'butterfly pink' },
  { url: 'https://placehold.co/100x100/d9f99d/365314.png', hint: 'butterfly green' },
  { url: 'https://placehold.co/100x100/cffafe/155e75.png', hint: 'butterfly cyan' },
  { url: 'https://placehold.co/100x100/e9d5ff/581c87.png', hint: 'butterfly purple' },
  { url: 'https://placehold.co/100x100/fed7aa/9a3412.png', hint: 'butterfly orange' },
  { url: 'https://placehold.co/100x100/bfdbfe/1e3a8a.png', hint: 'butterfly blue' },
];

export function AddChildDialog({ isOpen, setOpen, onChildAdded }: AddChildDialogProps) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Error: Not Logged In',
        description: 'You must be logged in to add a profile.',
        variant: 'destructive',
      });
      return;
    }
    if (!name.trim() || !selectedAvatar) {
       toast({
        title: 'Missing Information',
        description: 'Please provide a name and select an avatar.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await addChildForUser(user.uid, name.trim(), selectedAvatar);
      if (result.success) {
        toast({
          title: "Profile Added",
          description: (
              <div className="flex items-center gap-2">
                  <ButterflyIcon className="h-5 w-5 text-primary" />
                  <span>{name.trim()} has been added successfully.</span>
              </div>
          ),
        });
        setOpen(false);
        onChildAdded();
      } else {
        toast({
            title: 'Failed to Add Profile',
            description: result.error || 'An unknown error occurred.',
            variant: 'destructive',
        });
      }
    } catch (err: any) {
        toast({
            title: 'Critical Error',
            description: err.message || 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setName('');
        setSelectedAvatar(null);
        setLoading(false);
      }
      setOpen(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Profile</DialogTitle>
            <DialogDescription>
              Enter a name and choose an avatar to start tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Olivia"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                    Avatar
                </Label>
                <div className="col-span-3">
                  <div className="flex flex-wrap gap-3">
                      {avatars.map(avatar => (
                          <button
                              type="button"
                              key={avatar.url}
                              onClick={() => setSelectedAvatar(avatar.url)}
                              className={cn(
                                  "rounded-full ring-2 ring-transparent transition-all hover:ring-primary focus:outline-none focus:ring-primary",
                                  selectedAvatar === avatar.url ? "ring-primary ring-offset-2 ring-offset-background" : ""
                              )}
                          >
                              <Avatar className="h-12 w-12">
                                  <AvatarImage src={avatar.url} alt="Avatar" data-ai-hint={avatar.hint} />
                              </Avatar>
                          </button>
                      ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    An avatar selection is required.
                  </p>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleSubmit} disabled={loading || !name.trim() || !selectedAvatar}>
              {loading ? 'Adding...' : 'Add Profile'}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
