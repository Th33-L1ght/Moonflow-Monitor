
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
import { PlusCircle } from 'lucide-react';

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

const EmptyState = ({ onAddChildClick }: { onAddChildClick: () => void }) => (
    <div className="text-center py-20 px-6 rounded-lg border-2 border-dashed bg-muted/20 relative overflow-hidden">
        <FlyingButterflies />
        <div className="relative z-10 flex flex-col items-center">
            <div className="p-4 bg-background/80 backdrop-blur-sm rounded-full mb-4 inline-block">
                 <Logo />
            </div>
            <h2 className="text-2xl font-bold font-body">Welcome to Light Flow</h2>
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

  const fetchChildren = useCallback(async () => {
    if (user) {
      setLoading(true);
      const userChildren = await getChildrenForUser(user.uid);
      setChildren(userChildren || []);
      setLoading(false);
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
