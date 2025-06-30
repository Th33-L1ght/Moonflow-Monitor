'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { PeriodCalendar } from '@/components/PeriodCalendar';
import { SymptomTracker } from '@/components/SymptomTracker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { getChild, updateChild } from '@/lib/firebase/firestore';
import type { Child } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AIInsightCard } from '@/components/AIInsightCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CycleStatusWheel } from '@/components/CycleStatusWheel';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InviteDialog } from '@/components/InviteDialog';
import { Button } from '@/components/ui/button';
import { getCyclePrediction } from '@/lib/utils';
import { PadReminderCard } from '@/components/PadReminderCard';

const DetailPageSkeleton = () => (
    <div className="flex min-h-screen w-full flex-col bg-background">
        <main className="flex-1 p-4 md:p-8">
            <div className="max-w-2xl mx-auto w-full">
                <Skeleton className="h-10 w-48 mb-4" />
                <Skeleton className="h-40 w-full mb-8" />
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
  const [isInviteOpen, setInviteOpen] = useState(false);

  const fetchChildData = useCallback(async () => {
    if (childId) {
        setLoading(true);
        const childData = await getChild(childId);
        // Security check: Ensure the logged-in user is authorized to view this page.
        if (childData && user) {
            const isParent = user.role === 'parent' && childData.parentUid === user.uid;
            const isChild = user.role === 'child' && childData.id === user.childProfile?.id;
            if (isParent || isChild) {
                 setChild(childData);
            } else {
                setChild(null); // Not authorized
            }
        } else {
            setChild(null);
        }
        setLoading(false);
    }
  }, [childId, user]);

  useEffect(() => {
    if (user) { // Only fetch when user is loaded
        fetchChildData();
    }
  }, [fetchChildData, user]);

  const handleUpdate = (newChildData: Partial<Omit<Child, 'id'>>) => {
    if (user && child) {
        updateChild(child.id, newChildData);
        // Optimistically update UI
        setChild(prev => prev ? { ...prev, ...newChildData, cycles: newChildData.cycles || prev.cycles } : null);
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
  const showInviteButton = user?.role === 'parent' && !child.childUid;

  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-2xl mx-auto w-full">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {user?.role === 'parent' && (
                        <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-card">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    )}
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait"/>
                      <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-2xl font-bold font-body">{child.name}</h1>
                      <p className="text-muted-foreground">Cycle Overview</p>
                    </div>
                </div>
                {showInviteButton && (
                    <>
                        <Button variant="outline" size="sm" onClick={() => setInviteOpen(true)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Invite
                        </Button>
                        <InviteDialog isOpen={isInviteOpen} setOpen={setInviteOpen} childId={child.id} />
                    </>
                )}
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-card mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="log">Log</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <div className="space-y-6">
                    <CycleStatusWheel child={child} />
                    <PadReminderCard daysUntilNextCycle={daysUntilNextCycle} />
                    <AIInsightCard child={child} />
                </div>
              </TabsContent>
              <TabsContent value="calendar">
                <Card className="bg-card border-none shadow-none">
                    <CardHeader>
                        <CardTitle className="font-body text-xl">Calendar</CardTitle>
                        <CardDescription>
                        Visualize the current and past cycles.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PeriodCalendar child={child} onUpdate={handleUpdate} canEdit={canEdit} />
                    </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="log">
                 <SymptomTracker child={child} onUpdate={handleUpdate} canEdit={canEdit} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
