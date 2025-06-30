'use client';

import { PlusCircle, Share2, Info, Bell, RefreshCw, MoreVertical, Edit, Trash2, KeyRound } from 'lucide-react';
import { Header } from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { getChildrenForUser, updateChild } from '@/lib/firebase/firestore';
import type { Child } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button, buttonVariants } from '@/components/ui/button';
import { AddChildDialog } from '@/components/AddChildDialog';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCycleStatus, getCyclePrediction } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { InviteDialog } from '@/components/InviteDialog';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PeriodToggleSwitch } from '@/components/PeriodToggleSwitch';
import { PadsButterflyIcon as ButterflyIcon } from '@/components/PadsButterflyIcon';
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
import { useToast } from '@/hooks/use-toast';
import { resetDemoData, deleteChildAction } from '@/app/actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditChildDialog } from '@/components/EditChildDialog';
import { CreateChildLoginDialog } from '@/components/CreateChildLoginDialog';


const DashboardSkeleton = () => (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="max-w-4xl mx-auto w-full">
                <Skeleton className="h-10 w-64 mb-8" />
                <div className="space-y-4">
                    <Skeleton className="h-28 rounded-lg" />
                    <Skeleton className="h-28 rounded-lg" />
                    <Skeleton className="h-28 rounded-lg" />
                </div>
            </div>
        </main>
    </div>
);

const ChildListItem = ({ child, onInvite, onUpdate, onEdit, onDelete, onCreateLogin }: { child: Child; onInvite: (childId: string) => void; onUpdate: (childId: string, updatedData: Partial<Child>) => void; onEdit: (child: Child) => void; onDelete: (childId: string) => void; onCreateLogin: (child: Child) => void; }) => {
    const { isOnPeriod, currentDay } = getCycleStatus(child);

    return (
        <Card className="p-4 flex items-center justify-between gap-6 transition-all hover:shadow-lg hover:border-primary/50">
            <div className="flex items-center gap-6">
                <Link href={`/child/${child.id}`}>
                    <Avatar className="h-20 w-20 border-2 border-card">
                        <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait" />
                        <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Link>
                <div>
                    <Link href={`/child/${child.id}`}>
                        <div className="flex items-baseline gap-3">
                            <p className="font-body text-3xl font-medium text-foreground">{child.name}</p>
                            <div className={cn("w-3 h-3 rounded-full shrink-0", isOnPeriod ? 'bg-destructive' : 'bg-chart-2')} title={isOnPeriod ? 'On Period' : 'Between Cycles'} />
                        </div>
                    </Link>
                    <p className={cn("text-sm mt-1 mb-2", isOnPeriod ? "text-destructive" : "text-muted-foreground")}>
                        {isOnPeriod ? `Period - Day ${currentDay}` : 'Between Cycles'}
                    </p>
                    <PeriodToggleSwitch child={child} onUpdate={(updatedData) => onUpdate(child.id, updatedData)} />
                </div>
            </div>

            <div className="flex items-center gap-1">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onEdit(child)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Profile</span>
                        </DropdownMenuItem>
                         {!child.childUid && (
                            <>
                                <DropdownMenuItem onSelect={() => onCreateLogin(child)}>
                                    <KeyRound className="mr-2 h-4 w-4" />
                                    <span>Create Login</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => onInvite(child.id)}>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    <span>Invite via Link</span>
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuItem onSelect={() => onDelete(child.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Profile</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Card>
    )
}

function ParentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddChildOpen, setAddChildOpen] = useState(false);

  const [isInviteOpen, setInviteOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const [isReminderAlertOpen, setReminderAlertOpen] = useState(false);
  const [reminderMessages, setReminderMessages] = useState<string[]>([]);
  const [isResetting, setIsResetting] = useState(false);

  const [isEditChildOpen, setEditChildOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [isCreateLoginOpen, setCreateLoginOpen] = useState(false);
  const [childToEdit, setChildToEdit] = useState<Child | null>(null);
  const [childToDelete, setChildToDelete] = useState<string | null>(null);
  const [childToCreateLogin, setChildToCreateLogin] = useState<Child | null>(null);


  const fetchChildren = useCallback(async () => {
    if (user && user.role === 'parent') {
      setLoading(true);
      const userChildren = await getChildrenForUser(user.uid);
      setChildren(userChildren);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      if (user.role === 'parent') {
        fetchChildren();
      } else if (user.role === 'child' && user.childProfile) {
        router.replace(`/child/${user.childProfile.id}`);
      }
    }
  }, [user, router, fetchChildren]);
  
  useEffect(() => {
    if (children.length > 0) {
        const reminders: string[] = [];
        children.forEach(child => {
            const { daysUntilNextCycle } = getCyclePrediction(child);
            if (daysUntilNextCycle !== null && daysUntilNextCycle > 0 && daysUntilNextCycle <= 7) {
                const message = `Next period for ${child.name} in ${daysUntilNextCycle} ${daysUntilNextCycle === 1 ? 'day' : 'days'}.`;
                reminders.push(message);
            }
        });

        if (reminders.length > 0) {
            setReminderMessages(reminders);
            setReminderAlertOpen(true);
        }
    }
  }, [children]);

  const handleInviteClick = (childId: string) => {
    setSelectedChildId(childId);
    setInviteOpen(true);
  };
  
  const handleChildUpdate = (childId: string, updatedData: Partial<Child>) => {
    // Update firestore (or mock data)
    updateChild(childId, updatedData);

    // Update local state to re-render immediately
    setChildren(prevChildren => 
        prevChildren.map(child => {
            if (child.id === childId) {
                return { ...child, ...updatedData, cycles: updatedData.cycles || child.cycles };
            }
            return child;
        })
    );
  };

  const handleEditClick = (child: Child) => {
    setChildToEdit(child);
    setEditChildOpen(true);
  };
  
  const handleCreateLoginClick = (child: Child) => {
    setChildToCreateLogin(child);
    setCreateLoginOpen(true);
  };

  const handleDeleteClick = (childId: string) => {
    setChildToDelete(childId);
    setDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!childToDelete) return;
    const result = await deleteChildAction(childToDelete);
    if (result.success) {
      toast({
        title: "Profile Deleted",
        description: "The profile has been removed successfully.",
      });
      fetchChildren(); // refetch children list
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete profile.",
        variant: "destructive",
      });
    }
    setDeleteAlertOpen(false);
    setChildToDelete(null);
  };
  
  const handleResetData = async () => {
    setIsResetting(true);
    const result = await resetDemoData();
    if (result.success) {
      await fetchChildren();
      toast({
        title: "Demo Data Reset",
        description: "The sample data has been restored to its original state.",
      });
    } else {
       toast({
        title: "Error",
        description: "Could not reset demo data.",
        variant: "destructive",
      });
    }
    setIsResetting(false);
  };

  if (loading || user?.role !== 'parent') {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Header />
        <main className="flex flex-1 flex-col p-4 md:p-8">
          <div className="max-w-4xl mx-auto w-full">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="font-body text-3xl font-bold">Hello, {user?.displayName || 'Parent'}!</h1>
                    <p className="text-muted-foreground">Select a profile to view their cycle details.</p>
                </div>
                <div className="flex items-center gap-2">
                    {!isFirebaseConfigured && (
                        <Button variant="outline" size="sm" onClick={handleResetData} disabled={isResetting}>
                            <RefreshCw className={cn("mr-2 h-3.5 w-3.5", isResetting && "animate-spin")} />
                            {isResetting ? 'Resetting...' : 'Reset Data'}
                        </Button>
                    )}
                    <AddChildDialog
                        isOpen={isAddChildOpen}
                        setOpen={setAddChildOpen}
                        onChildAdded={fetchChildren}
                    />
                </div>
            </div>

            {!isFirebaseConfigured && (
                <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Demo Mode</AlertTitle>
                    <AlertDescription>
                        You are currently in demo mode. Changes are not saved. Use the 'Reset Data' button to restore the original sample data.
                    </AlertDescription>
                </Alert>
            )}
            
            {children.length > 0 ? (
                <div className="space-y-4">
                    {children.map((child) => (
                        <ChildListItem key={child.id} child={child} onInvite={handleInviteClick} onUpdate={handleChildUpdate} onEdit={handleEditClick} onDelete={handleDeleteClick} onCreateLogin={handleCreateLoginClick} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 flex flex-col items-center bg-card rounded-lg border-2 border-dashed">
                    <ButterflyIcon className="w-16 h-16 text-muted-foreground mb-4"/>
                    <h2 className="font-body text-2xl">No children added yet</h2>
                    <p className="text-muted-foreground mt-2 mb-4 max-w-xs">Click the button below to add your first child and start tracking.</p>
                     <Button onClick={() => setAddChildOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add Child Profile
                    </Button>
                </div>
            )}
            
            {childToEdit && (
                <EditChildDialog 
                    isOpen={isEditChildOpen} 
                    setOpen={setEditChildOpen} 
                    child={childToEdit} 
                    onChildUpdated={fetchChildren}
                />
            )}
            {childToCreateLogin && (
                <CreateChildLoginDialog
                    isOpen={isCreateLoginOpen}
                    setOpen={setCreateLoginOpen}
                    child={childToCreateLogin}
                    onLoginCreated={fetchChildren}
                />
            )}
             {selectedChildId && (
                <InviteDialog 
                    isOpen={isInviteOpen} 
                    setOpen={setInviteOpen} 
                    childId={selectedChildId} 
                />
            )}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this profile and all of its associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setChildToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isReminderAlertOpen} onOpenChange={setReminderAlertOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <ButterflyIcon className="h-6 w-6 text-accent-foreground" />
                    Heads Up: Time for Supplies!
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    A friendly reminder about upcoming periods:
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-foreground">
                        {reminderMessages.map((msg, index) => (
                            <li key={index}>{msg}</li>
                        ))}
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setReminderAlertOpen(false)}>Got it</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </main>
      </div>
  );
}


export default function DashboardPage() {
  return (
    <AuthGuard>
      <ParentDashboard />
    </AuthGuard>
  );
}
