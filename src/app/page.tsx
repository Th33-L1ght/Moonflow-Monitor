'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getChildrenForUser } from '@/lib/firebase/client-actions';
import type { Child } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';
import { Header } from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { FlyingButterflies } from '@/components/FlyingButterflies';
import { Logo } from '@/components/Logo';
import { AlertCircle } from 'lucide-react';
import { setCache } from '@/lib/cache';
import { CycleStatusWheel } from '@/components/CycleStatusWheel';
import Link from 'next/link';

const DashboardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 place-items-center">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-4">
                <Skeleton className="h-64 w-64 rounded-full" />
                <Skeleton className="h-8 w-32" />
            </div>
        ))}
    </div>
);

const DashboardErrorState = ({ message }: { message: string }) => (
    <div className="text-center py-20 px-6 rounded-lg border-2 border-dashed border-destructive/50 bg-destructive/10">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-2xl font-bold font-body text-destructive-foreground">Dashboard Error</h2>
        <p className="mt-2 text-destructive-foreground/80 max-w-lg mx-auto">
            There was a problem loading your data from the database. This is usually due to a configuration issue in your Firebase project.
        </p>
        <p className="mt-2 text-sm text-destructive-foreground/60 max-w-lg mx-auto">
             Error details: {message}
        </p>
    </div>
);


const EmptyState = () => (
    <div className="text-center py-20 px-6 rounded-lg border-2 border-dashed bg-muted/20 relative overflow-hidden">
        <FlyingButterflies />
        <div className="relative z-10 flex flex-col items-center">
            <div className="p-4 bg-background/80 backdrop-blur-sm rounded-full mb-4 inline-block">
                 <Logo />
            </div>
            <h2 className="text-2xl font-bold font-body">Welcome to Light Flo</h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                It looks like you don&apos;t have any child profiles yet. Add one from the user menu in the top right to get started.
            </p>
        </div>
    </div>
);

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const fetchChildren = useCallback(async () => {
    if (user) {
      setLoading(true);
      setDashboardError(null);
      try {
        const userChildren = await getChildrenForUser(user.uid);
        // Add fetched children to the cache to speed up navigation
        userChildren.forEach(child => setCache(`child-${child.id}`, child));
        setChildren(userChildren || []);
      } catch (error: any) {
        let message = error.message || "Failed to load your dashboard data.";
        if (error.code === 'failed-precondition') {
          message = "Your database needs a special index to display your data. Please check the developer console (press F12) for a link to create it.";
        } else if (error.code === 'permission-denied') {
          message = "Your database security rules are preventing you from seeing your data. Please update your rules in the Firebase Console."
        }
        setDashboardError(message);
        setChildren([]);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchChildren();
    } else {
      setLoading(false);
      setChildren([]);
    }
  }, [user, fetchChildren]);
  

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-muted/40">
        <Header onChildAdded={fetchChildren} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <h1 className="font-body text-3xl md:text-4xl font-bold">Your Family's Cycles</h1>
            </div>

            {loading ? (
              <DashboardSkeleton />
            ) : dashboardError ? (
                <DashboardErrorState message={dashboardError} />
            ) : children.length === 0 ? (
                <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 place-items-center">
                {children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/child/${child.id}`}
                    className="flex flex-col items-center justify-center gap-2 text-center group"
                  >
                    <CycleStatusWheel child={child} />
                    <h2 className="text-2xl font-bold font-body transition-colors group-hover:text-primary">{child.name}</h2>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
