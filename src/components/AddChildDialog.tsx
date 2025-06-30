'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { addChildForUser } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';

interface AddChildDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  onChildAdded: () => void;
}

const avatars = [
  'https://placehold.co/100x100/e91e63/ffffff.png',
  'https://placehold.co/100x100/3f51b5/ffffff.png',
  'https://placehold.co/100x100/4caf50/ffffff.png',
  'https://placehold.co/100x100/ff9800/ffffff.png',
  'https://placehold.co/100x100/795548/ffffff.png',
  'https://placehold.co/100x100/607d8b/ffffff.png',
];

export function AddChildDialog({ isOpen, setOpen, onChildAdded }: AddChildDialogProps) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim() || !selectedAvatar) return;

    setLoading(true);
    try {
      await addChildForUser(user.uid, name.trim(), selectedAvatar);
      toast({
        title: 'Child Added',
        description: `${name.trim()} has been added successfully.`,
      });
      onChildAdded();
      setOpen(false);
      setName('');
      setSelectedAvatar(null);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to add child. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Child
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a New Profile</DialogTitle>
            <DialogDescription>
              Enter a name and choose an avatar to start tracking.
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
                    {avatars.map(avatarUrl => (
                        <button
                            type="button"
                            key={avatarUrl}
                            onClick={() => setSelectedAvatar(avatarUrl)}
                            className={cn(
                                "rounded-full ring-2 ring-transparent transition-all hover:ring-primary focus:outline-none focus:ring-primary",
                                selectedAvatar === avatarUrl ? "ring-primary ring-offset-2 ring-offset-background" : ""
                            )}
                        >
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={avatarUrl} alt="Avatar" data-ai-hint="avatar color" />
                            </Avatar>
                        </button>
                    ))}
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !name.trim() || !selectedAvatar}>
              {loading ? 'Adding...' : 'Add Child'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
