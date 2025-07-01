'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { PeriodCalendar } from '@/components/PeriodCalendar';
import { SymptomTracker } from '@/components/SymptomTracker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { getChild, updateChild } from '@/app/actions';
import type { Child } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AIInsightCard } from '@/components/AIInsightCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCyclePrediction } from '@/lib/utils';
import { PadReminderCard } from '@/components/PadReminderCard';
import { CycleStatusWheel } from '@/components/CycleStatusWheel';
import { PeriodToggleSwitch } from '@/components/PeriodToggleSwitch';
import { MoodChart } from '@/components/MoodChart';
import { CycleLengthChart } from '@/components/CycleLengthChart';
import { JournalView } from '@/components/JournalView';
import { EditChildDialog } from '@/components/EditChildDialog';

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


export default function ChildDetailPage() {
  const { id: childId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditChildOpen, setEditChildOpen] = useState(false);

  const fetchChildData = useCallback(async () => {
    if (childId) {
        setLoading(true);
        const childData = await getChild(childId);
        if (childData && user) {
            const isParent = user.role === 'parent' && childData.parentUid === user.uid;
            const isChild = user.role === 'child' && childData.id === user.childProfile?.id;
            if (isParent || isChild) {
                 setChild(childData);
            } else {
                setChild(null);
            }
        } else {
            setChild(null);
        }
        setLoading(false);
    }
  }, [childId, user]);

  useEffect(() => {
    if (user) {
        fetchChildData();
    }
  }, [fetchChildData, user]);

  const handleUpdate = (newChildData: Partial<Omit<Child, 'id'>>) => {
    if (user && child) {
        // Optimistically update the local state first for a responsive UI
        setChild(prev => prev ? { ...prev, ...newChildData, cycles: newChildData.cycles || prev.cycles } : null);
        // Then, update the data in Firestore
        updateChild(child.id, newChildData);
    }
  }

  const handleProfileUpdate = () => {
    fetchChildData();
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

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-card mb-6 border">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="journal">Journal</TabsTrigger>
                <TabsTrigger value="log">Log Symptoms</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                    <CycleStatusWheel child={child} />
                    <AIInsightCard child={child} />
                    <PadReminderCard daysUntilNextCycle={daysUntilNextCycle} />
                </div>
              </TabsContent>

              <TabsContent value="calendar">
                <Card>
                    <CardHeader>
                        <CardTitle>Period Calendar</CardTitle>
                        <CardDescription>
                        Visualize current and past cycles. Click a date range to log a new period.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PeriodCalendar child={child} onUpdate={handleUpdate} canEdit={canEdit} />
                    </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="charts">
                <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                    <MoodChart child={child} />
                    <CycleLengthChart child={child} />
                </div>
              </TabsContent>

              <TabsContent value="journal">
                <JournalView child={child} />
              </TabsContent>

              <TabsContent value="log">
                 <SymptomTracker child={child} onUpdate={handleUpdate} canEdit={canEdit} />
              </TabsContent>
            </Tabs>
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
