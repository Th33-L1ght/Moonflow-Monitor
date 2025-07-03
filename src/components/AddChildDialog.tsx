
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
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const resetForm = () => {
    setName('');
    setSelectedAvatar(null);
    setError(null);
    setLoading(false);
  };

  const handleSubmit = async () => {
    setError(null);

    // 1. Validation
    if (!name.trim()) {
      setError('Please enter a name.');
      return;
    }
    if (!selectedAvatar) {
      setError('Please select an avatar.');
      return;
    }
    if (!user) {
      setError('You must be logged in to add a profile.');
      return;
    }

    setLoading(true);

    try {
      const result = await addChildForUser(user.uid, name, selectedAvatar);
      
      if (result.success) {
        toast({
          title: "Profile Added",
          description: (
            <div className="flex items-center gap-2">
                <ButterflyIcon className="h-5 w-5 text-primary" />
                <span>{name} has been added successfully.</span>
            </div>
          ),
        });
        onChildAdded();
        setOpen(false); // Close dialog on success
      } else {
        // Display error from server action inside the dialog
        setError(result.error || 'An unknown error occurred.');
      }
    } catch (err: any) {
        setError(err.message || 'An unexpected client-side error occurred.');
    } finally {
        setLoading(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className='text-left'>
            <DialogTitle>Add New Profile</DialogTitle>
            <DialogDescription>
              Enter a name and choose an avatar to start tracking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Olivia" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Avatar</Label>
              <div className="mt-2 flex flex-wrap gap-3">
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

          {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Adding...' : 'Add Profile'}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
