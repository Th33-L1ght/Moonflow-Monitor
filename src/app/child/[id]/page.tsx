
'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { getChild, updateChild, deleteChildAction, unlinkChildAccountAction } from '@/lib/firebase/client-actions';
import type { Child } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, MoreVertical, Trash2, Link2Off } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
import { getCyclePrediction } from '@/lib/utils';
import { PadReminderCard } from '@/components/PadReminderCard';
import { CycleStatusWheel } from '@/components/CycleStatusWheel';
import { PeriodToggleSwitch } from '@/components/PeriodToggleSwitch';
import { EditChildDialog } from '@/components/EditChildDialog';
import { AIInsightCard } from '@/components/AIInsightCard';
import PeriodCalendar from '@/components/PeriodCalendar';
import MoodChart from '@/components/MoodChart';
import CycleLengthChart from '@/components/CycleLengthChart';
import JournalView from '@/components/JournalView';
import SymptomTracker from '@/components/SymptomTracker';


const DetailPageSkeleton = () => (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto w-full">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div>
                            <Skeleton className="h-8 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                     <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-10 w-full mb-8" />
                <Skeleton className="h-96 w-full" />
            </div>
        </main>
    </div>
);

export default function ChildDetailPage() {
  const params = useParams();
  const childId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditChildOpen, setEditChildOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isUnlinkConfirmOpen, setUnlinkConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user || !childId) return;

    if (user.role === 'child' && user.childProfile && user.childProfile.id === childId) {
      setChild(user.childProfile);
      setLoading(false);
    } else {
      const fetchChildData = async () => {
        setLoading(true);
        const childData = await getChild(childId);
        if (childData && (childData.parentUid === user.uid || childData.childUid === user.uid)) {
          setChild(childData);
        } else {
          setChild(null);
        }
        setLoading(false);
      };
      fetchChildData();
    }
  }, [childId, user]);


  const handleUpdate = (newChildData: Partial<Omit<Child, 'id'>>) => {
    if (user && child) {
        setChild(prev => prev ? { ...prev, ...newChildData, cycles: newChildData.cycles || prev.cycles } : null);
        updateChild(child.id, newChildData);
    }
  }

  const handleProfileUpdate = async () => {
    if (childId && user) {
        setLoading(true);
        const childData = await getChild(childId);
        setChild(childData);
        setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!child) return;
    const result = await deleteChildAction(child.id);
    if (result.success) {
        toast({
            title: "Profile Deleted",
            description: `${child.name}'s profile has been removed.`,
        });
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
    if (!child) return;
    const result = await unlinkChildAccountAction(child.id);
     if (result.success) {
        toast({
            title: "Account Unlinked",
            description: `The login for ${child.name} has been unlinked.`,
        });
        handleProfileUpdate();
    } else {
        toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
        });
    }
    setUnlinkConfirmOpen(false);
  }

  if (loading) {
    return <DetailPageSkeleton />;
  }
  
  if (!child) {
    notFound();
  }
  
  const { daysUntilNextCycle } = getCyclePrediction(child);
  const canEdit = user?.role === 'parent' || user?.uid === child.childUid;

  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full flex-col bg-muted/40 text-foreground">
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto w-full">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {user?.role === 'parent' && (
                        <Button variant="outline" size="icon" onClick={() => router.push('/')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <Avatar className="h-16 w-16 border">
                      <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait"/>
                      <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="font-body text-2xl md:text-3xl font-bold">{child.name}</h1>
                      <p className="text-muted-foreground">Cycle Dashboard</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {canEdit && <PeriodToggleSwitch child={child} onUpdate={handleUpdate} />}
                    {canEdit && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-5 w-5" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => setEditChildOpen(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit Profile</span>
                                </DropdownMenuItem>
                                {child.childUid && (
                                    <DropdownMenuItem onSelect={() => setUnlinkConfirmOpen(true)}>
                                        <Link2Off className="mr-2 h-4 w-4" />
                                        <span>Unlink Account</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => setDeleteConfirmOpen(true)} className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete Profile</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-card mb-6 border">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="calendar" className="text-xs sm:text-sm">Calendar</TabsTrigger>
                <TabsTrigger value="charts" className="text-xs sm:text-sm">Charts</TabsTrigger>
                <TabsTrigger value="journal" className="text-xs sm:text-sm">Journal</TabsTrigger>
                <TabsTrigger value="log" className="text-xs sm:text-sm">Log Symptoms</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="mt-6">
                <div hidden={activeTab !== 'overview'}>
                    <div className="space-y-6">
                        <CycleStatusWheel child={child} />
                        <AIInsightCard />
                        <PadReminderCard daysUntilNextCycle={daysUntilNextCycle} />
                    </div>
                </div>
                <div hidden={activeTab !== 'calendar'}>
                    <PeriodCalendar child={child} onUpdate={handleUpdate} canEdit={canEdit} />
                </div>
                <div hidden={activeTab !== 'charts'}>
                    <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                        <MoodChart child={child} />
                        <CycleLengthChart child={child} />
                    </div>
                </div>
                <div hidden={activeTab !== 'journal'}>
                    <JournalView child={child} />
                </div>
                <div hidden={activeTab !== 'log'}>
                    <SymptomTracker child={child} onUpdate={handleUpdate} canEdit={canEdit} />
                </div>
            </div>

          </div>
        </main>
      </div>
      {canEdit && (
        <EditChildDialog 
            isOpen={isEditChildOpen} 
            setOpen={setEditChildOpen} 
            child={child} 
            onChildUpdated={handleProfileUpdate}
        />
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
    </AuthGuard>
  );
}
