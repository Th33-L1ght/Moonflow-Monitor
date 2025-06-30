'use client';

import { PlusCircle, User } from 'lucide-react';
import { Header } from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getChildrenForUser } from '@/lib/firebase/firestore';
import type { Child } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AddChildDialog } from '@/components/AddChildDialog';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCycleStatus } from '@/lib/utils';
import { cn } from '@/lib/utils';

const DashboardSkeleton = () => (
    <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="max-w-2xl mx-auto w-full">
                <Skeleton className="h-10 w-48 mb-8" />
                <div className="space-y-4">
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-20 rounded-lg" />
                </div>
            </div>
        </main>
    </div>
);

const ChildListItem = ({ child }: { child: Child }) => {
    const { isOnPeriod, currentDay } = getCycleStatus(child);
    return (
        <Link href={`/child/${child.id}`} className="block">
            <div className="bg-card p-4 rounded-lg flex items-center gap-4 transition-colors hover:bg-white/5">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait" />
                    <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-bold text-lg">{child.name}</p>
                    <p className={cn("text-sm", isOnPeriod ? "text-primary" : "text-muted-foreground")}>
                        {isOnPeriod ? `Period - Day ${currentDay}` : 'Between Cycles'}
                    </p>
                </div>
                <div className={cn("w-3 h-3 rounded-full", isOnPeriod ? 'bg-primary' : 'bg-green-500')} />
            </div>
        </Link>
    )
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddChildOpen, setAddChildOpen] = useState(false);

  const fetchChildren = async () => {
    if (user) {
      // Don't show skeleton on refetch
      if(children.length === 0) setLoading(true);
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
  
  if (loading) {
      return <DashboardSkeleton />;
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col p-4 md:p-8">
          <div className="max-w-2xl mx-auto w-full">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-body">Hello, {user?.displayName || 'Parent'}!</h1>
                    <p className="text-muted-foreground">Select a profile to view their cycle.</p>
                </div>
                <AddChildDialog
                    isOpen={isAddChildOpen}
                    setOpen={setAddChildOpen}
                    onChildAdded={fetchChildren}
                />
            </div>
            
            {children.length > 0 ? (
                <div className="space-y-4">
                    {children.map((child) => (
                        <ChildListItem key={child.id} child={child} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 flex flex-col items-center bg-card rounded-lg">
                    <User className="w-16 h-16 text-muted-foreground mb-4"/>
                    <h2 className="text-xl font-semibold">No children added yet</h2>
                    <p className="text-muted-foreground mt-2 mb-4 max-w-xs">Click the button below to add your first child and start tracking.</p>
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
