
'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { getChild, updateChild } from '@/app/actions';
import type { Child } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AIInsightCard } from '@/components/AIInsightCard';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCyclePrediction } from '@/lib/utils';
import { PadReminderCard } from '@/components/PadReminderCard';
import { CycleStatusWheel } from '@/components/CycleStatusWheel';
import { PeriodToggleSwitch } from '@/components/PeriodToggleSwitch';
import { EditChildDialog } from '@/components/EditChildDialog';
import dynamic from 'next/dynamic';

const DetailPageSkeleton = () => (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto w-full">
                <Skeleton className="h-10 w-48 mb-4" />
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Skeleton className="h-28 rounded-lg" />
                    <Skeleton className="h-28 rounded-lg" />
                    <Skeleton className="h-28 rounded-lg" />
                </div>
                <Skeleton className="h-10 w-full mb-8" />
                <Skeleton className="h-96 w-full" />
            </div>
        </main>
    </div>
);

const PeriodCalendar = dynamic(() => import('@/components/PeriodCalendar').then(mod => mod.PeriodCalendar), {
    loading: () => (
        <Card>
            <CardHeader>
                <CardTitle>Period Calendar</CardTitle>
                <CardDescription>
                Visualize current and past cycles. Click a date range to log a new period.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center p-4 border rounded-lg bg-background">
                    <Skeleton className="h-[290px] w-[280px]" />
                </div>
            </CardContent>
        </Card>
    ),
    ssr: false
});

const MoodChart = dynamic(() => import('@/components/MoodChart').then(mod => mod.MoodChart), {
    loading: () => (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-48 w-full" />
            </CardContent>
        </Card>
    ),
    ssr: false
});

const CycleLengthChart = dynamic(() => import('@/components/CycleLengthChart').then(mod => mod.CycleLengthChart), {
    loading: () => (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-48 w-full" />
            </CardContent>
        </Card>
    ),
    ssr: false
});

const JournalView = dynamic(() => import('@/components/JournalView').then(mod => mod.JournalView), {
    loading: () => (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-96 w-full" />
            </CardContent>
        </Card>
    )
});

const SymptomTracker = dynamic(() => import('@/components/SymptomTracker').then(mod => mod.SymptomTracker), {
    loading: () => (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3 mt-2" />
            </CardHeader>
            <CardContent className="grid gap-8">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
    ),
    ssr: false
});


export default function ChildDetailPage() {
  const { id: childId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditChildOpen, setEditChildOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user || !childId) return;

    // Optimization: If the logged-in user is the child being viewed,
    // use the profile data we already fetched during login to avoid a network request.
    if (user.role === 'child' && user.childProfile && user.childProfile.id === childId) {
      setChild(user.childProfile);
      setLoading(false);
    } else {
      // Otherwise, fetch the data (e.g., for a parent viewing the page)
      const fetchChildData = async () => {
        setLoading(true);
        const childData = await getChild(childId);
        // Ensure the user is authorized to view this profile
        if (childData && (childData.parentUid === user.uid || childData.childUid === user.uid)) {
          setChild(childData);
        } else {
          setChild(null); // Not found or not authorized
        }
        setLoading(false);
      };
      fetchChildData();
    }
  }, [childId, user]);


  const handleUpdate = (newChildData: Partial<Omit<Child, 'id'>>) => {
    if (user && child) {
        // Optimistically update the local state first for a responsive UI
        setChild(prev => prev ? { ...prev, ...newChildData, cycles: newChildData.cycles || prev.cycles } : null);
        // Then, update the data in Firestore
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
            <div className="mb-8 flex items-center justify-between">
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
                      <h1 className="font-body text-3xl font-bold">{child.name}</h1>
                      <p className="text-muted-foreground">Cycle Dashboard</p>
                    </div>
                     {canEdit && (
                        <Button variant="ghost" size="icon" onClick={() => setEditChildOpen(true)}>
                            <Edit className="h-5 w-5" />
                            <span className="sr-only">Edit Profile</span>
                        </Button>
                    )}
                </div>
                {canEdit && <PeriodToggleSwitch child={child} onUpdate={handleUpdate} />}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-card mb-6 border">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="journal">Journal</TabsTrigger>
                <TabsTrigger value="log">Log Symptoms</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="mt-6">
                <div hidden={activeTab !== 'overview'}>
                    <div className="space-y-6">
                        <CycleStatusWheel child={child} />
                        <AIInsightCard child={child} />
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
    </AuthGuard>
  );
}
