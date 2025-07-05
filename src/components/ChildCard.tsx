
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserPlus, Trash2, Edit, LogIn, Link2Off, HeartHandshake } from 'lucide-react';
import { getCycleStatus, getCyclePrediction } from '@/lib/utils';
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
import { Progress } from './ui/progress';

interface ChildCardProps {
  child: Child;
  onChildDeleted: () => void;
  onChildUpdated: () => void;
}

export function ChildCard({ child, onChildDeleted, onChildUpdated }: ChildCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { isOnPeriod, currentDay } = getCycleStatus(child);
  const { daysUntilNextCycle } = getCyclePrediction(child);
  const { isFirebaseConfigured } = useAuth();
  
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [isCreateLoginOpen, setCreateLoginOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isUnlinkConfirmOpen, setUnlinkConfirmOpen] = useState(false);

  const hasAccount = !!child.childUid;

  const getStatusText = () => {
    if (isOnPeriod) return `On Period - Day ${currentDay}`;
    if (daysUntilNextCycle !== null) {
      if (daysUntilNextCycle <= 0) return 'Period expected';
      return `Next period in ~${daysUntilNextCycle} days`;
    }
    return 'Not on Period';
  };
  
  const statusColor = isOnPeriod ? 'destructive' : 'secondary';
  const averageCycleLength = getCyclePrediction(child).predictedStartDate ? 30 : 28;
  const progress = daysUntilNextCycle !== null ? ((averageCycleLength - daysUntilNextCycle) / averageCycleLength) * 100 : 0;
  
  const handleUnlink = async () => {
    setUnlinkConfirmOpen(false);
    const result = await unlinkChildAccountAction(child.id);
     if (result.success) {
        toast({
            title: "Account Unlinked",
            description: `${child.name}'s login has been removed. You can now create a new one.`,
        });
        onChildUpdated();
    } else {
        toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
        });
    }
  }

  const handleDelete = async () => {
    setDeleteConfirmOpen(false);
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
  }

  return (
    <>
      <div className="relative flex flex-col items-center text-center p-6 transition-all hover:shadow-lg rounded-3xl bg-card border">
        <div className="absolute top-2 right-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/child/${child.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>View & Edit Details</span>
              </DropdownMenuItem>

              {!child.isParentProfile && (
                <>
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
                        <DropdownMenuItem onSelect={() => setUnlinkConfirmOpen(true)}>
                            <Link2Off className="mr-2 h-4 w-4" />
                            <span>Unlink Account</span>
                        </DropdownMenuItem>
                    )}
                </>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setDeleteConfirmOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Profile</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Avatar className="h-24 w-24 border-2 mb-4">
            <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait" />
            <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <CardTitle className="flex items-center gap-2 text-xl mb-1">
            {child.isParentProfile && <HeartHandshake className="h-5 w-5 text-primary" />}
            {child.name}
        </CardTitle>
        <CardDescription className="text-xs mb-4">{getStatusText()}</CardDescription>

        <div className="h-12 w-full mb-4 flex flex-col items-center justify-center">
            {isOnPeriod ? (
                 <Badge variant={statusColor}>On Period</Badge>
            ) : daysUntilNextCycle !== null ? (
                <div className="w-full px-4">
                <Progress value={progress} aria-label={`${progress.toFixed(0)}% until next period`} />
                <p className="text-xs text-muted-foreground mt-1">
                    Next period predicted in {daysUntilNextCycle} {daysUntilNextCycle === 1 ? 'day' : 'days'}.
                </p>
                </div>
            ) : (
                 <Badge variant="secondary">No period data</Badge>
            )}
        </div>

        <Button className="w-full font-bold mt-auto" onClick={() => router.push(`/child/${child.id}`)}>View Dashboard</Button>
      </div>

      {isFirebaseConfigured && (
        <>
            <InviteDialog isOpen={isInviteOpen} setOpen={setInviteOpen} childId={child.id} />
            <CreateChildLoginDialog isOpen={isCreateLoginOpen} setOpen={setCreateLoginOpen} child={child} onLoginCreated={onChildUpdated} />
        </>
      )}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this profile?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {child.name}'s profile and all of their associated data.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete Profile</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
       <AlertDialog open={isUnlinkConfirmOpen} onOpenChange={setUnlinkConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Unlink {child.name}'s Account?</AlertDialogTitle>
            <AlertDialogDescription>
                This will remove their current login. They will no longer be able to sign in. You can create a new login for them afterwards. This will not delete any of their cycle data.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlink}>Unlink Account</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
