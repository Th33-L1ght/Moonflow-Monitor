
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getChildrenForUser } from '@/lib/firebase/client-actions';
import type { Child } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';
import { Header } from '@/components/Header';
import { ChildCard } from '@/components/ChildCard';
import { Skeleton } from '@/components/ui/skeleton';
import { FlyingButterflies } from '@/components/FlyingButterflies';
import { Logo } from '@/components/Logo';
import { AlertCircle } from 'lucide-react';
import { setCache } from '@/lib/cache';
import FamilyMoodChart from '@/components/FamilyMoodChart';

const DashboardSkeleton = () => (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center space-y-3 p-4 rounded-3xl aspect-square bg-card border">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-20" />
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
                It looks like you haven't created any profiles yet. Add one from the user menu in the top right to get started.
            </p>
        </div>
    </div>
);

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    if (user) {
      setLoading(true);
      setDashboardError(null);
      try {
        const userProfiles = await getChildrenForUser(user.uid);
        // Add fetched profiles to the cache to speed up navigation
        userProfiles.forEach(profile => setCache(`child-${profile.id}`, profile));
        setProfiles(userProfiles.sort((a,b) => (a.isParentProfile ? -1 : 1)));
      } catch (error: any) {
        let message = error.message || "Failed to load your dashboard data.";
        if (error.code === 'failed-precondition') {
          message = "Your database needs a special index to display your data. Please check the developer console (press F12) for a link to create it.";
        } else if (error.code === 'permission-denied') {
          message = "Your database security rules are preventing you from seeing your data. Please update your rules in the Firebase Console."
        }
        setDashboardError(message);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfiles();
    } else {
      setLoading(false);
      setProfiles([]);
    }
  }, [user, fetchProfiles]);
  
  const hasParentProfile = profiles.some(p => p.isParentProfile);
  const childProfiles = profiles.filter(p => !p.isParentProfile);

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-background">
        <Header onProfileAdded={fetchProfiles} hasParentProfile={hasParentProfile} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <h1 className="font-body text-3xl font-bold md:text-4xl">Your Family's Dashboard</h1>
            </div>

            {loading ? (
              <DashboardSkeleton />
            ) : dashboardError ? (
                <DashboardErrorState message={dashboardError} />
            ) : profiles.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="flex flex-col gap-8 xl:flex-row">
                    <div className="flex-1">
                        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                            {profiles.map((profile) => (
                            <ChildCard 
                                key={profile.id} 
                                child={profile} 
                                onChildDeleted={fetchProfiles}
                                onChildUpdated={fetchProfiles}
                            />
                            ))}
                        </div>
                    </div>
                     <aside className="w-full xl:w-1/3 xl:flex-shrink-0">
                        <div className="space-y-6">
                            <FamilyMoodChart profiles={childProfiles} />
                        </div>
                    </aside>
                </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
