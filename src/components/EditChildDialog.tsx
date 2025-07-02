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
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import type { Child } from '@/lib/types';
import { updateChild } from '@/app/actions';
import { PadsButterflyIcon } from './PadsButterflyIcon';

interface EditChildDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  child: Child;
  onChildUpdated: () => void;
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

export function EditChildDialog({ isOpen, setOpen, child, onChildUpdated }: EditChildDialogProps) {
  const [name, setName] = useState(child.name);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(child.avatarUrl);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (child) {
      setName(child.name);
      setSelectedAvatar(child.avatarUrl);
    }
  }, [child, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedAvatar) return;

    setLoading(true);
    try {
      const updatedData = {
        name: name.trim(),
        avatarUrl: selectedAvatar,
      };
      await updateChild(child.id, updatedData);
      toast({
        title: "Profile Updated",
        description: (
            <div className="flex items-center gap-2">
                <PadsButterflyIcon className="h-5 w-5 text-primary" />
                <span>{updatedData.name}'s profile has been updated successfully.</span>
            </div>
        ),
      });
      onChildUpdated();
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
            <DialogTitle>Edit {child.name}'s Profile</DialogTitle>
            <DialogDescription>
              Update the name or avatar for this profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
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
            <Button type="submit" disabled={loading || !name.trim() || !selectedAvatar}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
