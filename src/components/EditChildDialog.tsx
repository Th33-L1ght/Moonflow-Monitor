
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
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import type { Child } from '@/lib/types';
import { updateChild } from '@/lib/firebase/client-actions';
import { PadsButterflyIcon } from '@/components/PadsButterflyIcon';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { logError } from '@/lib/error-logging';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { defaultAvatars } from '@/lib/default-avatars';
import { cn } from '@/lib/utils';

interface EditChildDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  child: Child;
  onChildUpdated: () => void;
}

export function EditChildDialog({ isOpen, setOpen, child, onChildUpdated }: EditChildDialogProps) {
  const [name, setName] = useState(child.name);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(child.avatarUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();


  useEffect(() => {
    if (child) {
      setName(child.name);
      setAvatarUrl(child.avatarUrl);
      setError(null);
    }
  }, [child, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !avatarUrl) return;
    if (!user) {
        setError("You must be logged in to do this.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedData = {
        name: name.trim(),
        avatarUrl: avatarUrl,
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
    } catch (err: any) {
      logError(err, { location: 'EditChildDialog.handleSubmit', childId: child.id });
      const errorMessage = err.message || 'Failed to update profile.';
      setError(errorMessage);
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit {child.name}'s Profile</DialogTitle>
            <DialogDescription>
              Update the name or avatar for this profile.
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
                placeholder="e.g. Olivia"
                required
                disabled={!!child.isParentProfile}
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
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
