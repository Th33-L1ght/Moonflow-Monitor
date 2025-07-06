
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
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { addChildForUser } from '@/lib/firebase/client-actions';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { logError } from '@/lib/error-logging';
import { defaultAvatars } from '@/lib/default-avatars';
import { cn } from '@/lib/utils';

interface AddChildDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  onProfileAdded: () => void;
  isForParent: boolean;
}

export function AddChildDialog({ isOpen, setOpen, onProfileAdded, isForParent }: AddChildDialogProps) {
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
        if (isForParent && user?.displayName) {
            setName(user.displayName);
        } else if (isForParent && user?.email) {
            setName(user.email.split('@')[0]);
        }
    }
  }, [isOpen, isForParent, user]);


  const resetForm = () => {
    setName('');
    setAvatarUrl(null);
    setLoading(false);
    setError(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim() || !avatarUrl) {
        const message = 'Please enter a name and select an avatar to continue.';
        setError(message);
        toast({
            title: 'Missing Information',
            description: message,
            variant: 'destructive',
        });
        return;
    }

    setLoading(true);
    setError(null);
    
    try {
        const result = await addChildForUser(user.uid, name.trim(), avatarUrl, isForParent);

        if (result.success) {
            toast({
                title: 'Profile Added!',
                description: `${name.trim()} has been added.`,
            });
            onProfileAdded();
            setOpen(false);
            resetForm();
        } else {
            const errorMessage = result.error || 'An unexpected error occurred.';
            setError(errorMessage);
            toast({
                title: 'Creation Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        }

    } catch (err: any) {
        logError(err, { location: 'AddChildDialog.handleSubmit' });
        const errorMessage = err.message || 'Failed to create profile.';
        setError(errorMessage);
        toast({
            title: 'Creation Failed',
            description: errorMessage,
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  };
  
  const dialogTitle = isForParent ? "Create Your Private Profile" : "Add New Child Profile";
  const dialogDesc = isForParent 
    ? "This profile is just for you. Your cycle data will be kept private."
    : "Create a new profile for a child to track their cycle.";


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            resetForm();
        }
        setOpen(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {dialogDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
             {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isForParent ? "Your Name" : "e.g. Olivia"}
                required
                disabled={isForParent}
              />
            </div>
            <div className="space-y-2">
                <Label>
                    Avatar
                </Label>
                <div className="flex flex-wrap items-center gap-3">
                    {defaultAvatars.map((url, index) => (
                        <button key={index} type="button" onClick={() => setAvatarUrl(url)} className={cn("rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", avatarUrl === url && "ring-2 ring-primary")}>
                            <Avatar className="h-12 w-12 border-2 border-transparent">
                                <AvatarImage src={url} alt={`Default Avatar ${index + 1}`} />
                            </Avatar>
                        </button>
                    ))}
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Profile'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
