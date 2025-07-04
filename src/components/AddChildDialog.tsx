'use client';

import { useState, useRef, useEffect } from 'react';
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
import { AlertCircle, Camera, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { storage } from '@/lib/firebase/client';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { logError } from '@/lib/error-logging';
import { defaultAvatars } from '@/lib/default-avatars';
import { cn, resizeImage } from '@/lib/utils';

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
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          logError(err, { location: 'AddChildDialog.handleAvatarChange' });
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
    if (!user || !name.trim() || !avatarUrl) {
        setError('Please enter a name and select an avatar.');
        return;
    }

    setLoading(true);
    setError(null);
    
    try {
        if (!storage) throw new Error("Storage not configured.");

        let finalAvatarUrl = avatarUrl;
        
        // Only upload to storage if it's a new file upload (base64 image data)
        // Default avatars are already public-friendly data URIs but we upload them for consistency
        if (avatarUrl.startsWith('data:image/jpeg') || avatarUrl.startsWith('data:image/png') || avatarUrl.startsWith('data:image/gif') || avatarUrl.startsWith('data:image/svg+xml')) {
            const filePath = `avatars/${user.uid}/${Date.now()}`;
            const storageRef = ref(storage, filePath);
            await uploadString(storageRef, avatarUrl, 'data_url');
            finalAvatarUrl = await getDownloadURL(storageRef);
        }
        
        const result = await addChildForUser(user.uid, name.trim(), finalAvatarUrl, isForParent);

        if (result.success) {
        toast({
            title: 'Profile Added!',
            description: `${name.trim()} has been added.`,
        });
        onProfileAdded();
        setOpen(false);
        resetForm();
        } else {
        setError(result.error || 'An unexpected error occurred.');
        }

    } catch (err: any) {
        logError(err, { location: 'AddChildDialog.handleSubmit' });
        setError(err.message || 'Failed to create profile.');
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
                    <button type="button" disabled={isProcessingImage} onClick={() => fileInputRef.current?.click()} className={cn("rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", avatarUrl && !defaultAvatars.includes(avatarUrl) && "ring-2 ring-primary")}>
                         <Avatar className="h-12 w-12 border-dashed border-2 flex items-center justify-center bg-muted">
                            {isProcessingImage ? (
                                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                             ) : avatarUrl && !defaultAvatars.includes(avatarUrl) ? (
                                 <AvatarImage src={avatarUrl} alt="Uploaded Avatar" />
                            ) : (
                                <Camera className="h-5 w-5 text-muted-foreground" />
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
            <Button type="submit" disabled={loading || isProcessingImage || !name.trim() || !avatarUrl}>
              {loading ? 'Adding...' : 'Add Profile'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
