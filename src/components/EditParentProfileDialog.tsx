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
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface EditParentProfileDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

interface AvatarOption {
  url: string;
  hint: string;
}

const avatars: AvatarOption[] = [
  { url: 'https://placehold.co/100x100/fecaca/991b1b.png', hint: 'child smiling' },
  { url: 'https://placehold.co/100x100/d1fae5/065f46.png', hint: 'teenager nature' },
  { url: 'https://placehold.co/100x100/cffafe/0e7490.png', hint: 'kid playing' },
  { url: 'https://placehold.co/100x100/fef08a/854d0e.png', hint: 'person happy' },
  { url: 'https://placehold.co/100x100/e0e7ff/3730a3.png', hint: 'child portrait' },
  { url: 'https://placehold.co/100x100/fce7f3/9d174d.png', hint: 'girl laughing' },
];

export function EditParentProfileDialog({ isOpen, setOpen }: EditParentProfileDialogProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.photoURL) {
      setSelectedAvatar(user.photoURL);
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedAvatar) return;

    setLoading(true);
    try {
      await updateUserProfile({ photoURL: selectedAvatar });
      toast({
        title: "Profile Updated",
        description: "Your avatar has been changed successfully.",
      });
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Choose a new avatar for your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                    Avatar
                </Label>
                <div className="col-span-3 flex flex-wrap gap-3">
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
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !selectedAvatar}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
