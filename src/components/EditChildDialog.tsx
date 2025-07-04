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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import type { Child } from '@/lib/types';
import { updateChild } from '@/lib/firebase/client-actions';
import { PadsButterflyIcon } from './PadsButterflyIcon';
import { Camera, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/firebase/client';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { logError } from '@/lib/error-logging';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface EditChildDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  child: Child;
  onChildUpdated: () => void;
}

export function EditChildDialog({ isOpen, setOpen, child, onChildUpdated }: EditChildDialogProps) {
  const [name, setName] = useState(child.name);
  const [selectedAvatarPreview, setSelectedAvatarPreview] = useState<string | null>(child.avatarUrl);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();


  useEffect(() => {
    if (child) {
      setName(child.name);
      setSelectedAvatarPreview(child.avatarUrl);
      setSelectedAvatarFile(null);
      setError(null);
    }
  }, [child, isOpen]);

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
    if (!name.trim() || !selectedAvatarPreview) return;
    if (!user) {
        setError("You must be logged in to do this.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      let avatarUrl = child.avatarUrl;
      
      if (selectedAvatarFile && selectedAvatarPreview) {
        if (!storage) throw new Error("Storage not configured.");
        const filePath = `avatars/${user.uid}/${child.id}/${Date.now()}_${selectedAvatarFile.name}`;
        const storageRef = ref(storage, filePath);
        
        await uploadString(storageRef, selectedAvatarPreview, 'data_url');
        avatarUrl = await getDownloadURL(storageRef);
      }

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
                        <AvatarImage src={selectedAvatarPreview ?? undefined} alt={child.name} data-ai-hint="child portrait" />
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
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
