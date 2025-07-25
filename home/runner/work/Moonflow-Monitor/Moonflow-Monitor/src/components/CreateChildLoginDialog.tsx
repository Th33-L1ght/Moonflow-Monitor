
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
import { useToast } from '@/hooks/use-toast';
import { updateChild } from '@/lib/firebase/client-actions';
import type { Child } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { logError } from '@/lib/error-logging';

interface CreateChildLoginDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  child: Child;
  onLoginCreated: () => void;
}

export function CreateChildLoginDialog({ isOpen, setOpen, child, onLoginCreated }: CreateChildLoginDialogProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { signUpWithDummyEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
        setError("Username and password cannot be empty.");
        return;
    }
    setError(null);
    setLoading(true);
    
    try {
        const userCredential = await signUpWithDummyEmail(username, password);
        const result = await updateChild(child.id, { childUid: userCredential.user.uid, username: username.trim() });

        if (result.success) {
            toast({
                title: "Login Created",
                description: `A login has been created for ${child.name}.`,
            });
            onLoginCreated();
            setOpen(false);
            setUsername('');
            setPassword('');
        } else {
            throw new Error(result.error || 'Failed to update child profile.');
        }

    } catch(error: any) {
        logError(error, { location: 'CreateChildLoginDialog.handleSubmit', childId: child.id, username });
        let message = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
            message = 'This username is already taken. Please choose another one.';
        } else if (error.code === 'auth/weak-password') {
            message = 'The password is too weak. Please choose a stronger password (at least 6 characters).';
        } else if (error.message) {
            message = error.message;
        }
        setError(message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            setError(null);
            setUsername('');
            setPassword('');
        }
        setOpen(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Login for {child.name}</DialogTitle>
            <DialogDescription>
              Create a simple username and password for your child to log in. They won't need an email address.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-x-4 gap-y-2">
              <Label htmlFor="username" className="md:text-right">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="md:col-span-3"
                placeholder="e.g. olivia"
                required
                autoComplete="off"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-x-4 gap-y-2">
              <Label htmlFor="password" className="md:text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="md:col-span-3"
                required
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Login'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
