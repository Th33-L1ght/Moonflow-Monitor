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
import { Camera, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/firebase/client';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { logError } from '@/lib/error-logging';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { defaultAvatars } from '@/lib/default-avatars';
import { cn, resizeImage } from '@/lib/utils';

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
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();


  useEffect(() => {
    if (child) {
      setName(child.name);
      setAvatarUrl(child.avatarUrl);
      setError(null);
    }
  }, [child, isOpen]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
       if (file.size > 5 * 1024 * 1024) { // 5MB limit
          setError("File is too large. Please select an image under 5MB.");
          return;
      }
      const reader = new FileReader();
      reader.onloadstart = () => {
        setIsProcessingImage(true);
        setError(null);
      };
      reader.onloadend = async () => {
        try {
            const originalDataUrl = reader.result as string;
            const resizedDataUrl = await resizeImage(originalDataUrl, 512, 512);
            setAvatarUrl(resizedDataUrl);
        } catch (err) {
            logError(err, { location: 'EditChildDialog.handleAvatarChange' });
            setError("Could not process image. Please try a different one.");
        } finally {
            setIsProcessingImage(false);
        }
      };
      reader.onerror = () => {
        setError("Failed to read the selected file.");
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

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
      let finalAvatarUrl = child.avatarUrl;
      
      if (avatarUrl && avatarUrl !== child.avatarUrl) {
          if (!storage) throw new Error("Storage not configured.");
          const filePath = `avatars/${user.uid}/${child.id}/${Date.now()}`;
          const storageRef = ref(storage, filePath);
          
          await uploadString(storageRef, avatarUrl, 'data_url');
          finalAvatarUrl = await getDownloadURL(storageRef);
      }
      
      const updatedData = {
        name: name.trim(),
        avatarUrl: finalAvatarUrl,
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
                    <button type="button" disabled={isProcessingImage} onClick={() => fileInputRef.current?.click()} className={cn("rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", avatarUrl && !defaultAvatars.includes(avatarUrl ?? '') && "ring-2 ring-primary")}>
                         <Avatar className="h-12 w-12 border-dashed border-2 flex items-center justify-center bg-muted">
                            {isProcessingImage ? (
                                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                            ) : (
                                <>
                                    <AvatarImage src={avatarUrl ?? undefined} alt="Uploaded Avatar" />
                                    <AvatarFallback>
                                        <Camera className="h-5 w-5 text-muted-foreground" />
                                    </AvatarFallback>
                                </>
                            )}
                         </Avatar>
                    </button>
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
            <Button type="submit" disabled={loading || isProcessingImage || !name.trim()}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
