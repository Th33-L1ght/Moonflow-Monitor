'use client';

import { PlusCircle, User, Share2, Info, ShoppingBag } from 'lucide-react';
import { Header } from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { getChildrenForUser, updateChild } from '@/lib/firebase/firestore';
import type { Child } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AddChildDialog } from '@/components/AddChildDialog';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCycleStatus, getCyclePrediction } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { InviteDialog } from '@/components/InviteDialog';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PeriodToggleSwitch } from '@/components/PeriodToggleSwitch';

const DashboardSkeleton = () => (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="max-w-4xl mx-auto w-full">
                <Skeleton className="h-10 w-64 mb-8" />
                <div className="space-y-4">
                    <Skeleton className="h-28 rounded-lg" />
                    <Skeleton className="h-28 rounded-lg" />
                    <Skeleton className="h-28 rounded-lg" />
                </div>
            </div>
        </main>
    </div>
);

const ChildListItem = ({ child, onInvite, onUpdate }: { child: Child; onInvite: (childId: string) => void; onUpdate: (childId: string, updatedData: Partial<Child>) => void; }) => {
    const { isOnPeriod, currentDay } = getCycleStatus(child);
    const { daysUntilNextCycle } = getCyclePrediction(child);
    const showInviteButton = !child.childUid;
    const showReminder = daysUntilNextCycle !== null && daysUntilNextCycle > 0 && daysUntilNextCycle <= 7;

    return (
        <Card className="p-4 flex items-center gap-6 transition-all hover:shadow-lg hover:border-primary/50">
            <Link href={`/child/${child.id}`} className="flex items-center gap-6 flex-1">
                <Avatar className="h-20 w-20 border-2 border-card">
                    <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait" />
                    <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-baseline gap-4">
                        <p className="text-3xl font-medium text-foreground">{child.name}</p>
                        <div className={cn("w-3 h-3 rounded-full shrink-0", isOnPeriod ? 'bg-destructive' : 'bg-chart-2')} />
                    </div>
                    <p className={cn("text-sm mt-1", isOnPeriod ? "text-destructive" : "text-muted-foreground")}>
                        {isOnPeriod ? `Period - Day ${currentDay}` : 'Between Cycles'}
                    </p>
                    {showReminder && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-accent-foreground font-medium">
                            <ShoppingBag className="h-4 w-4" />
                            <span>Next period in {daysUntilNextCycle} {daysUntilNextCycle === 1 ? 'day' : 'days'}.</span>
                        </div>
                    )}
                </div>
            </Link>
            <div className="flex items-center gap-4">
                <PeriodToggleSwitch child={child} onUpdate={(updatedData) => onUpdate(child.id, updatedData)} />
                {showInviteButton && (
                    <Button variant="outline" size="sm" onClick={() => onInvite(child.id)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Invite
                    </Button>
                )}
            </div>
        </Card>
    )
}

function ParentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddChildOpen, setAddChildOpen] = useState(false);

  const [isInviteOpen, setInviteOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const fetchChildren = useCallback(async () => {
    if (user && user.role === 'parent') {
      setLoading(true);
      const userChildren = await getChildrenForUser(user.uid);
      setChildren(userChildren);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      if (user.role === 'parent') {
        fetchChildren();
      } else if (user.role === 'child' && user.childProfile) {
        router.replace(`/child/${user.childProfile.id}`);
      }
    }
  }, [user, router, fetchChildren]);

  const handleInviteClick = (childId: string) => {
    setSelectedChildId(childId);
    setInviteOpen(true);
  };
  
  const handleChildUpdate = (childId: string, updatedData: Partial<Child>) => {
    // Update firestore (or mock data)
    updateChild(childId, updatedData);

    // Update local state to re-render immediately
    setChildren(prevChildren => 
        prevChildren.map(child => {
            if (child.id === childId) {
                return { ...child, ...updatedData, cycles: updatedData.cycles || child.cycles };
            }
            return child;
        })
    );
  };

  if (loading || user?.role !== 'parent') {
    return <DashboardSkeleton />;
  }

  return (
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

            {!isFirebaseConfigured && (
                <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Demo Mode</AlertTitle>
                    <AlertDescription>
                        You are currently in demo mode. Any profiles you add will be lost when you log out or refresh the page.
                    </AlertDescription>
                </Alert>
            )}
            
            {children.length > 0 ? (
                <div className="space-y-4">
                    {children.map((child) => (
                        <ChildListItem key={child.id} child={child} onInvite={handleInviteClick} onUpdate={handleChildUpdate} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 flex flex-col items-center bg-card rounded-lg border-2 border-dashed">
                    <User className="w-16 h-16 text-muted-foreground mb-4"/>
                    <h2 className="text-2xl font-display">No children added yet</h2>
                    <p className="text-muted-foreground mt-2 mb-4 max-w-xs">Click the button below to add your first child and start tracking.</p>
                     <Button onClick={() => setAddChildOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add Child Profile
                    </Button>
                </div>
            )}
             {selectedChildId && (
                <InviteDialog 
                    isOpen={isInviteOpen} 
                    setOpen={setInviteOpen} 
                    childId={selectedChildId} 
                />
            )}
          </div>
        </main>
      </div>
  );
}


export default function DashboardPage() {
  return (
    <AuthGuard>
      <ParentDashboard />
    </AuthGuard>
  );
}
