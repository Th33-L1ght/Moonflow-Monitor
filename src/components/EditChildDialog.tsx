
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { updateChild, deleteChildAction, unlinkChildAccountAction } from '@/lib/firebase/client-actions';
import { PadsButterflyIcon } from './PadsButterflyIcon';
import { Camera, AlertCircle, Trash2, Link2Off } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/firebase/client';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { logError } from '@/lib/error-logging';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


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
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isUnlinkConfirmOpen, setUnlinkConfirmOpen] = useState(false);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const router = useRouter();


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

  const handleDelete = async () => {
    const result = await deleteChildAction(child.id);
    if (result.success) {
        toast({
            title: "Profile Deleted",
            description: `${child.name}'s profile has been removed.`,
        });
        setDeleteConfirmOpen(false);
        setOpen(false);
        router.push('/');
    } else {
        toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
        });
    }
    setDeleteConfirmOpen(false);
  }

  const handleUnlink = async () => {
    const result = await unlinkChildAccountAction(child.id);
     if (result.success) {
        toast({
            title: "Account Unlinked",
            description: `The login for ${child.name} has been unlinked.`,
        });
        onChildUpdated();
    } else {
        toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
        });
    }
    setUnlinkConfirmOpen(false);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit {child.name}'s Profile</DialogTitle>
              <DialogDescription>
                Update the name, avatar, or manage the profile.
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
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                      Avatar
                  </Label>
                  <div className="col-span-3 flex items-center gap-4">
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
            <DialogFooter className="sm:justify-between">
              <div className="flex gap-2">
                {child.childUid && (
                  <Button type="button" variant="outline" size="icon" onClick={() => setUnlinkConfirmOpen(true)}>
                    <Link2Off className="h-4 w-4" />
                    <span className="sr-only">Unlink Account</span>
                  </Button>
                )}
                <Button type="button" variant="destructive" size="icon" onClick={() => setDeleteConfirmOpen(true)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete Profile</span>
                </Button>
              </div>
              <Button type="submit" disabled={loading || !name.trim()}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {child.name}'s profile and all of their associated data.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
       <AlertDialog open={isUnlinkConfirmOpen} onOpenChange={setUnlinkConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Unlink {child.name}'s Account?</AlertDialogTitle>
            <AlertDialogDescription>
                This will remove their ability to log in with their current username. Their cycle data will NOT be deleted. You can create a new login for them afterwards.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlink}>Unlink</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
