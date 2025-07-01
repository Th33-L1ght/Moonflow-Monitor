
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserPlus, Trash2, Edit, LogIn } from 'lucide-react';
import { getCycleStatus } from '@/lib/utils';
import type { Child } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { InviteDialog } from './InviteDialog';
import { CreateChildLoginDialog } from './CreateChildLoginDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteChildAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ChildCardProps {
  child: Child;
  onChildDeleted: () => void;
  onChildUpdated: () => void;
}

export function ChildCard({ child, onChildDeleted, onChildUpdated }: ChildCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { isOnPeriod, currentDay } = getCycleStatus(child);
  const { isFirebaseConfigured } = useAuth();
  
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [isCreateLoginOpen, setCreateLoginOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const statusText = isOnPeriod ? `On Period - Day ${currentDay}` : 'Not on Period';
  const statusColor = isOnPeriod ? 'destructive' : 'secondary';
  
  const hasAccount = !!child.childUid;

  const handleDelete = async () => {
    const result = await deleteChildAction(child.id);
    if (result.success) {
        toast({
            title: "Profile Deleted",
            description: `${child.name}'s profile has been removed.`,
        });
        onChildDeleted();
    } else {
        toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
        });
    }
    setDeleteConfirmOpen(false);
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait" />
            <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl">{child.name}</CardTitle>
            <div className="text-sm text-muted-foreground">
              <Badge variant={statusColor} className="mt-1">{statusText}</Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/child/${child.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>View & Edit Details</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isFirebaseConfigured && !hasAccount && (
                <>
                <DropdownMenuItem onSelect={() => setCreateLoginOpen(true)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Create Child Login</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onSelect={() => setInviteOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Invite via Email</span>
                </DropdownMenuItem>
                </>
              )}
               {isFirebaseConfigured && hasAccount && (
                 <DropdownMenuItem disabled>
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Account Linked</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setDeleteConfirmOpen(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Profile</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
                Click 'View Dashboard' to see the full calendar, log symptoms, and view charts.
            </p>
        </CardContent>
        <CardFooter>
            <Button className="w-full" onClick={() => router.push(`/child/${child.id}`)}>View Dashboard</Button>
        </CardFooter>
      </Card>
      {isFirebaseConfigured && (
        <>
            <InviteDialog isOpen={isInviteOpen} setOpen={setInviteOpen} childId={child.id} />
            <CreateChildLoginDialog isOpen={isCreateLoginOpen} setOpen={setCreateLoginOpen} child={child} onLoginCreated={onChildUpdated} />
        </>
      )}
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
    </>
  );
}
