'use client';

import { Bell, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { ChildStatusCard } from '@/components/ChildStatusCard';
import { AddChildDialog } from '@/components/AddChildDialog';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getChildrenForUser } from '@/lib/firebase/firestore';
import type { Child } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const DashboardSkeleton = () => (
    <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="max-w-7xl mx-auto w-full">
                <Skeleton className="h-10 w-64 mb-2" />
                <Skeleton className="h-4 w-96 mb-8" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-48 rounded-lg" />
                    <Skeleton className="h-48 rounded-lg" />
                    <Skeleton className="h-48 rounded-lg" />
                </div>
            </div>
        </main>
    </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddChildOpen, setAddChildOpen] = useState(false);

  const fetchChildren = async () => {
    if (user) {
      setLoading(true);
      const userChildren = await getChildrenForUser(user.uid);
      setChildren(userChildren);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchChildren();
    }
  }, [user]);

  const childrenWithSevereSymptoms = children.filter(child =>
    child.cycles.some(cycle =>
      cycle.symptoms.some(symptom => symptom.crampLevel > 3)
    )
  );
  
  if (loading) {
      return <DashboardSkeleton />;
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your family's cycles.</p>
                </div>
                <AddChildDialog
                    isOpen={isAddChildOpen}
                    setOpen={setAddChildOpen}
                    onChildAdded={fetchChildren}
                />
            </div>

            {childrenWithSevereSymptoms.length > 0 && (
              <Card className="mb-8 bg-pink-50 border-pink-200 dark:bg-pink-950/50 dark:border-pink-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-pink-700 dark:text-pink-300">
                    <Bell className="h-4 w-4" />
                    Urgent Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-pink-800 dark:text-pink-200">
                    Severe symptoms reported
                  </div>
                  <p className="text-xs text-pink-600 dark:text-pink-400">
                    {childrenWithSevereSymptoms.map(c => c.name).join(', ')} reported strong cramps or mood swings.
                  </p>
                </CardContent>
              </Card>
            )}

            {children.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {children.map((child) => (
                        <ChildStatusCard key={child.id} child={child} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 flex flex-col items-center">
                    <h2 className="text-xl font-semibold">No children added yet</h2>
                    <p className="text-muted-foreground mt-2 mb-4">Click the button below to add your first child and start tracking.</p>
                     <Button onClick={() => setAddChildOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add Child
                    </Button>
                </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
