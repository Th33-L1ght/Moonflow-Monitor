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
import { createChildLogin } from '@/app/actions';
import type { Child } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
        setError("Username and password cannot be empty.");
        return;
    }
    setError(null);
    setLoading(true);

    const result = await createChildLogin(child.id, username.trim(), password);

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
        setError(result.error || 'An unknown error occurred.');
    }
    setLoading(false);
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="col-span-3"
                placeholder="e.g. olivia"
                required
                autoComplete="off"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
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
