'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { PeriodCalendar } from '@/components/PeriodCalendar';
import { SymptomTracker } from '@/components/SymptomTracker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { getChildForUser } from '@/lib/firebase/firestore';
import type { Child } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AIInsightCard } from '@/components/AIInsightCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CycleStatusWheel } from '@/components/CycleStatusWheel';
import { ArrowLeft } from 'lucide-react';

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

  const fetchChildData = useCallback(async () => {
    if (user && childId) {
        const childData = await getChildForUser(user.uid, childId);
        if (childData) {
            setChild(childData);
        } else {
            setChild(null)
        }
        setLoading(false);
    }
  }, [user, childId]);

  useEffect(() => {
    fetchChildData();
  }, [fetchChildData]);

  if (loading) {
    return <DetailPageSkeleton />;
  }
  
  if (!child) {
    notFound();
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-2xl mx-auto w-full">
            <div className="mb-8 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-card">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait"/>
                  <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                  <h1 className="text-2xl font-bold font-body">{child.name}</h1>
                  <p className="text-muted-foreground">Cycle Overview</p>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-card mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="log">Log</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <CycleStatusWheel child={child} />
                <AIInsightCard child={child} />
              </TabsContent>
              <TabsContent value="calendar">
                <PeriodCalendar child={child} userId={user!.uid} onUpdate={fetchChildData} />
              </TabsContent>
              <TabsContent value="log">
                <SymptomTracker child={child} userId={user!.uid} onUpdate={fetchChildData}/>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
