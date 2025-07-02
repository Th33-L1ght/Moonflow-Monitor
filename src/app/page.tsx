
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getChildrenForUser } from '@/lib/firebase/client-actions';
import type { Child } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';
import { Header } from '@/components/Header';
import { ChildCard } from '@/components/ChildCard';
import { AddChildDialog } from '@/components/AddChildDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FlyingButterflies } from '@/components/FlyingButterflies';
import { Logo } from '@/components/Logo';
import { PlusCircle, AlertCircle } from 'lucide-react';

const DashboardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-40 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
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


const EmptyState = ({ onAddChildClick }: { onAddChildClick: () => void }) => (
    <div className="text-center py-20 px-6 rounded-lg border-2 border-dashed bg-muted/20 relative overflow-hidden">
        <FlyingButterflies />
        <div className="relative z-10 flex flex-col items-center">
            <div className="p-4 bg-background/80 backdrop-blur-sm rounded-full mb-4 inline-block">
                 <Logo />
            </div>
            <h2 className="text-2xl font-bold font-body">Welcome to Moonflow Monitor</h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                It looks like you don't have any child profiles yet. Get started by adding your first child.
            </p>
            <Button onClick={onAddChildClick} className="mt-6">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Child
            </Button>
        </div>
    </div>
);

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddChildOpen, setAddChildOpen] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const fetchChildren = useCallback(async () => {
    if (user) {
      setLoading(true);
      setDashboardError(null);
      try {
        const userChildren = await getChildrenForUser(user.uid);
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
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-body text-4xl font-bold">Your Family's Cycles</h1>
              <div className="flex items-center gap-2">
                 {children.length > 0 && (
                    <Button onClick={() => setAddChildOpen(true)} size="sm" className="gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Add Another Child
                        </span>
                    </Button>
                 )}
              </div>
            </div>
            
            <AddChildDialog 
                isOpen={isAddChildOpen}
                setOpen={setAddChildOpen}
                onChildAdded={fetchChildren}
            />

            {loading ? (
              <DashboardSkeleton />
            ) : dashboardError ? (
                <DashboardErrorState message={dashboardError} />
            ) : children.length === 0 ? (
                <EmptyState onAddChildClick={() => setAddChildOpen(true)} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children.map((child) => (
                  <ChildCard 
                    key={child.id} 
                    child={child} 
                    onChildDeleted={fetchChildren}
                    onChildUpdated={fetchChildren}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
