
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { addChildForUser } from '@/lib/firebase/client-actions';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { PadsButterflyIcon as ButterflyIcon } from './PadsButterflyIcon';

interface AddChildDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  onChildAdded: () => void;
}

interface AvatarOption {
  url: string;
  hint: string;
}

const avatars: AvatarOption[] = [
  { url: 'https://placehold.co/100x100/fecdd3/9f1239.png', hint: 'butterfly pink' },
  { url: 'https://placehold.co/100x100/d9f99d/365314.png', hint: 'butterfly green' },
  { url: 'https://placehold.co/100x100/cffafe/155e75.png', hint: 'butterfly cyan' },
  { url: 'https://placehold.co/100x100/e9d5ff/581c87.png', hint: 'butterfly purple' },
  { url: 'https://placehold.co/100x100/fed7aa/9a3412.png', hint: 'butterfly orange' },
  { url: 'https://placehold.co/100x100/bfdbfe/1e3a8a.png', hint: 'butterfly blue' },
];

const formSchema = z.object({
  name: z.string().min(1, { message: 'Please enter a name.' }),
  avatarUrl: z.string({ required_error: 'Please select an avatar.' }),
});

export function AddChildDialog({ isOpen, setOpen, onChildAdded }: AddChildDialogProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: 'Error: Not Logged In',
        description: 'You must be logged in to add a profile.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await addChildForUser(user.uid, values.name, values.avatarUrl);
      if (result.success) {
        toast({
          title: "Profile Added",
          description: (
              <div className="flex items-center gap-2">
                  <ButterflyIcon className="h-5 w-5 text-primary" />
                  <span>{values.name} has been added successfully.</span>
              </div>
          ),
        });
        setOpen(false);
        onChildAdded();
        form.reset();
      } else {
        toast({
            title: 'Failed to Add Profile',
            description: result.error || 'An unknown error occurred.',
            variant: 'destructive',
        });
      }
    } catch (err: any) {
        toast({
            title: 'Critical Error',
            description: err.message || 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        form.reset();
      }
      setOpen(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader className='text-left'>
              <DialogTitle>Add New Profile</DialogTitle>
              <DialogDescription>
                Enter a name and choose an avatar to start tracking.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Olivia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-3">
                        {avatars.map(avatar => (
                          <button
                            type="button"
                            key={avatar.url}
                            onClick={() => field.onChange(avatar.url)}
                            className={cn(
                              "rounded-full ring-2 ring-transparent transition-all hover:ring-primary focus:outline-none focus:ring-primary",
                              field.value === avatar.url ? "ring-primary ring-offset-2 ring-offset-background" : ""
                            )}
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={avatar.url} alt="Avatar" data-ai-hint={avatar.hint} />
                            </Avatar>
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Profile'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
