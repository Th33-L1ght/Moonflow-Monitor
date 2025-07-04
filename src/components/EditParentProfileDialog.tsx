
'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Camera, AlertCircle } from 'lucide-react';
import { storage } from '@/lib/firebase/client';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { logError } from '@/lib/error-logging';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';


interface EditParentProfileDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

export function EditParentProfileDialog({ isOpen, setOpen }: EditParentProfileDialogProps) {
  const [selectedAvatarPreview, setSelectedAvatarPreview] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.photoURL) {
      setSelectedAvatarPreview(user.photoURL);
    }
    setSelectedAvatarFile(null);
    setError(null);
  }, [user, isOpen]);

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
    if (!user || !selectedAvatarPreview) return;

    setLoading(true);
    setError(null);
    
    try {
      let avatarUrl = user.photoURL || '';
      
      if (selectedAvatarFile && selectedAvatarPreview) {
        if (!storage) throw new Error("Storage not configured.");
        const filePath = `avatars/${user.uid}/${Date.now()}_${selectedAvatarFile.name}`;
        const storageRef = ref(storage, filePath);
        
        await uploadString(storageRef, selectedAvatarPreview, 'data_url');
        avatarUrl = await getDownloadURL(storageRef);
      }

      await updateUserProfile({ photoURL: avatarUrl });
      toast({
        title: "Profile Updated",
        description: "Your avatar has been changed successfully.",
      });
      setOpen(false);
    } catch (err: any) {
      logError(err, { location: 'EditParentProfileDialog.handleSubmit', userId: user.uid });
      setError(err.message || 'Failed to update profile.');
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
              Upload a new avatar for your profile.
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
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                    Avatar
                </Label>
                <div className="col-span-3 flex items-center gap-4">
                    <Avatar className="h-16 w-16 border">
                        <AvatarImage src={selectedAvatarPreview ?? undefined} alt="User avatar" />
                        <AvatarFallback>
                            <Camera className="h-6 w-6 text-muted-foreground" />
                        </AvatarFallback>
                    </Avatar>
                     <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Upload New
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
