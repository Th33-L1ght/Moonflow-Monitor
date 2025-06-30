'use client';

import { PlusCircle, User, LogIn } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

const DashboardSkeleton = () => (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="max-w-4xl mx-auto w-full">
                <Skeleton className="h-10 w-64 mb-8" />
                <div className="space-y-4">
                    <Skeleton className="h-24 rounded-lg" />
                    <Skeleton className="h-24 rounded-lg" />
                    <Skeleton className="h-24 rounded-lg" />
                </div>
            </div>
        </main>
    </div>
);

const ChildListItem = ({ child }: { child: Child }) => {
    const { isOnPeriod, currentDay } = getCycleStatus(child);
    return (
        <Link href={`/child/${child.id}`} className="block">
            <Card className="p-4 flex items-center gap-4 transition-all hover:shadow-md hover:border-primary/50">
                <Avatar className="h-16 w-16 border">
                    <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait" />
                    <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <p className="font-bold text-xl">{child.name}</p>
                        <div className={cn("w-3 h-3 rounded-full shrink-0", isOnPeriod ? 'bg-red-500' : 'bg-green-500')} />
                    </div>
                    <p className={cn("text-sm", isOnPeriod ? "text-red-600" : "text-muted-foreground")}>
                        {isOnPeriod ? `Period - Day ${currentDay}` : 'Between Cycles'}
                    </p>
                </div>
            </Card>
        </Link>
    )
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddChildOpen, setAddChildOpen] = useState(false);

  const fetchChildren = async () => {
    if (user && user.role === 'parent') {
      if(children.length === 0) setLoading(true);
      const userChildren = await getChildrenForUser(user.uid);
      setChildren(userChildren);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        if (user.role === 'parent') {
            fetchChildren();
        } else if (user.role === 'child' && user.childProfile) {
            router.replace(`/child/${user.childProfile.id}`);
        } else {
            setLoading(false);
        }
    } else {
        setLoading(false);
    }
  }, [user, router]);
  
  if (loading) {
      return <DashboardSkeleton />;
  }
  
  if (user?.role !== 'parent') {
      return (
        <div className="flex flex-col min-h-screen w-full bg-background items-center justify-center">
            <div className="text-center">
                <LogIn className="mx-auto h-12 w-12 text-muted-foreground" />
                <h1 className="mt-4 text-2xl font-bold">Loading your dashboard...</h1>
                <p className="mt-2 text-muted-foreground">Please wait a moment.</p>
            </div>
        </div>
      );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Header />
        <main className="flex flex-1 flex-col p-4 md:p-8">
          <div className="max-w-4xl mx-auto w-full">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Hello, {user?.displayName || 'Parent'}!</h1>
                    <p className="text-muted-foreground">Select a profile to view their cycle details.</p>
                </div>
                <AddChildDialog
                    isOpen={isAddChildOpen}
                    setOpen={setAddChildOpen}
                    onChildAdded={fetchChildren}
                />
            </div>
            
            {children.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {children.map((child) => (
                        <ChildListItem key={child.id} child={child} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 flex flex-col items-center bg-card rounded-lg border-2 border-dashed">
                    <User className="w-16 h-16 text-muted-foreground mb-4"/>
                    <h2 className="text-xl font-semibold">No children added yet</h2>
                    <p className="text-muted-foreground mt-2 mb-4 max-w-xs">Click the button below to add your first child and start tracking.</p>
                     <Button onClick={() => setAddChildOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add Child Profile
                    </Button>
                </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
