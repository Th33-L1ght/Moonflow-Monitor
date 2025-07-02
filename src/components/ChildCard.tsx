'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserPlus, Trash2, Edit, LogIn, Link2Off, UserCheck2 } from 'lucide-react';
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
import { deleteChildAction, unlinkChildAccountAction } from '@/lib/firebase/client-actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { logError } from '@/lib/error-logging';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

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
  const [isUnlinkConfirmOpen, setUnlinkConfirmOpen] = useState(false);

  const statusText = isOnPeriod ? `On Period - Day ${currentDay}` : 'Not on Period';
  const statusColor = isOnPeriod ? 'destructive' : 'secondary';
  
  const hasAccount = !!child.childUid;

  const handleDelete = async () => {
    try {
      const result = await deleteChildAction(child.id);
      if (result.success) {
          toast({
              title: "Profile Deleted",
              description: `${child.name}'s profile has been removed.`,
          });
          onChildDeleted();
      } else {
          throw new Error(result.error);
      }
    } catch (error: any) {
      logError(error, { location: 'ChildCard.handleDelete', childId: child.id });
       toast({
          title: "Error Deleting Profile",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
      });
    }
    setDeleteConfirmOpen(false);
  }

  const handleUnlink = async () => {
    try {
        const result = await unlinkChildAccountAction(child.id);
        if (result.success) {
            toast({
                title: "Account Unlinked",
                description: `The login for ${child.name} has been unlinked. You can now create a new one.`,
            });
            onChildUpdated();
        } else {
            throw new Error(result.error);
        }
    } catch (error: any) {
        logError(error, { location: 'ChildCard.handleUnlink', childId: child.id });
        toast({
            title: "Error Unlinking Account",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    }
    setUnlinkConfirmOpen(false);
  }

  const DeleteMenuItem = () => (
    <DropdownMenuItem 
        onSelect={() => setDeleteConfirmOpen(true)} 
        className="text-destructive focus:text-destructive"
        disabled={hasAccount}
    >
        <Trash2 className="mr-2 h-4 w-4" />
        <span>Delete Profile</span>
    </DropdownMenuItem>
  );

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
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
              <Badge variant={statusColor}>{statusText}</Badge>
              {hasAccount && (
                <Badge variant="outline" className="gap-1 pl-1.5 pr-2.5">
                  <UserCheck2 className="h-3.5 w-3.5" />
                  Account Linked
                </Badge>
              )}
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

              {isFirebaseConfigured && <DropdownMenuSeparator />}
              
              {isFirebaseConfigured && (
                hasAccount ? (
                  <DropdownMenuItem onSelect={() => setUnlinkConfirmOpen(true)}>
                    <Link2Off className="mr-2 h-4 w-4" />
                    <span>Unlink Account</span>
                  </DropdownMenuItem>
                ) : (
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
                )
              )}

              <DropdownMenuSeparator />
              
              {hasAccount ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div><DeleteMenuItem /></div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Unlink account before deleting profile.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DeleteMenuItem />
              )}
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

      <AlertDialog open={isUnlinkConfirmOpen} onOpenChange={setUnlinkConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Unlink Account?</AlertDialogTitle>
            <AlertDialogDescription>
                This will remove the current login from {child.name}'s profile. This action does not delete any cycle data. You should only do this if they have forgotten their password. You can then create a new login for them.
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
