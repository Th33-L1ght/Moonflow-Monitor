'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { PeriodCalendar } from '@/components/PeriodCalendar';
import { SymptomTracker } from '@/components/SymptomTracker';
import { CycleInfo } from '@/components/CycleInfo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { getChildForUser } from '@/lib/firebase/firestore';
import type { Child } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AIInsightCard } from '@/components/AIInsightCard';

const DetailPageSkeleton = () => (
    <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="max-w-7xl mx-auto w-full">
                <div className="mb-8 flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                 <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 grid gap-8">
                       <Skeleton className="h-96 rounded-lg" />
                       <Skeleton className="h-80 rounded-lg" />
                    </div>
                    <div className="lg:col-span-1">
                        <Skeleton className="h-[450px] rounded-lg" />
                    </div>
                </div>
            </div>
        </main>
    </div>
);


export default function ChildDetailPage() {
  const { id: childId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChildData = useCallback(async () => {
    if (user && childId) {
        // Don't show skeleton on refetch
        if (!child) {
            setLoading(true);
        }
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
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="mb-8 flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait"/>
                  <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                  <h1 className="text-3xl font-bold font-headline">{child.name}'s Cycle</h1>
                  <p className="text-muted-foreground">Log symptoms and view cycle history.</p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 grid gap-8">
                <PeriodCalendar child={child} userId={user!.uid} onUpdate={fetchChildData} />
                <CycleInfo child={child} />
              </div>
              <div className="lg:col-span-1 flex flex-col gap-8">
                <SymptomTracker child={child} userId={user!.uid} onUpdate={fetchChildData}/>
                <AIInsightCard child={child} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
