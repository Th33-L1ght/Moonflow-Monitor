'use client';

import { useState, useRef } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { addChildForUser } from '@/lib/firebase/client-actions';
import { AlertCircle, Camera } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { storage } from '@/lib/firebase/client';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { logError } from '@/lib/error-logging';

interface AddChildDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  onChildAdded: () => void;
}

export function AddChildDialog({ isOpen, setOpen, onChildAdded }: AddChildDialogProps) {
  const [name, setName] = useState('');
  const [selectedAvatarPreview, setSelectedAvatarPreview] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName('');
    setSelectedAvatarPreview(null);
    setSelectedAvatarFile(null);
    setLoading(false);
    setError(null);
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          setError("File is too large. Please select an image under 2MB.");
          return;
      }
      setSelectedAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim() || !selectedAvatarFile || !selectedAvatarPreview) {
        setError('Please enter a name and upload an avatar.');
        return;
    }

    setLoading(true);
    setError(null);
    
    try {
        if (!storage) throw new Error("Storage not configured.");

        const filePath = `avatars/${user.uid}/${Date.now()}_${selectedAvatarFile.name}`;
        const storageRef = ref(storage, filePath);
        
        await uploadString(storageRef, selectedAvatarPreview, 'data_url');
        const avatarUrl = await getDownloadURL(storageRef);
        
        const result = await addChildForUser(user.uid, name.trim(), avatarUrl);

        if (result.success) {
        toast({
            title: 'Profile Added!',
            description: `${name.trim()} has been added to your family.`,
        });
        onChildAdded();
        setOpen(false);
        resetForm();
        } else {
        setError(result.error || 'An unexpected error occurred.');
        }

    } catch (err: any) {
        logError(err, { location: 'AddChildDialog.handleSubmit' });
        setError(err.message || 'Failed to upload avatar.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            resetForm();
        }
        setOpen(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Profile</DialogTitle>
            <DialogDescription>
              Create a new profile to track a new cycle.
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
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-x-4 gap-y-2">
              <Label htmlFor="name" className="md:text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="md:col-span-3"
                placeholder="e.g. Olivia"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-x-4 gap-y-2">
                <Label className="md:text-right">
                    Avatar
                </Label>
                <div className="md:col-span-3 flex items-center gap-4">
                    <Avatar className="h-16 w-16 border">
                        <AvatarImage src={selectedAvatarPreview ?? undefined} alt="Avatar preview" />
                        <AvatarFallback>
                            <Camera className="h-6 w-6 text-muted-foreground" />
                        </AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Upload Image
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif"
                    />
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !name.trim() || !selectedAvatarFile}>
              {loading ? 'Adding...' : 'Add Profile'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
