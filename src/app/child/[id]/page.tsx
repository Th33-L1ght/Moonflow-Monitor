
'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { getChild, updateChild } from '@/lib/firebase/client-actions';
import type { Child } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCyclePrediction } from '@/lib/utils';
import { PadReminderCard } from '@/components/PadReminderCard';
import { CycleStatusWheel } from '@/components/CycleStatusWheel';
import { PeriodToggleSwitch } from '@/components/PeriodToggleSwitch';
import { EditChildDialog } from '@/components/EditChildDialog';
import { AIInsightCard } from '@/components/AIInsightCard';
import PeriodCalendar from '@/components/PeriodCalendar';
import MoodChart from '@/components/MoodChart';
import CycleLengthChart from '@/components/CycleLengthChart';
import JournalView from '@/components/JournalView';
import SymptomTracker from '@/components/SymptomTracker';


const DetailPageSkeleton = () => (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto w-full">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div>
                            <Skeleton className="h-8 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                     <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-10 w-full mb-8" />
                <Skeleton className="h-96 w-full" />
            </div>
        </main>
    </div>
);

export default function ChildDetailPage() {
  const params = useParams();
  const childId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditChildOpen, setEditChildOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user || !childId) return;

    if (user.role === 'child' && user.childProfile && user.childProfile.id === childId) {
      setChild(user.childProfile);
      setLoading(false);
    } else {
      const fetchChildData = async () => {
        setLoading(true);
        const childData = await getChild(childId);
        if (childData && (childData.parentUid === user.uid || childData.childUid === user.uid)) {
          setChild(childData);
        } else {
          setChild(null);
        }
        setLoading(false);
      };
      fetchChildData();
    }
  }, [childId, user]);


  const handleUpdate = (newChildData: Partial<Omit<Child, 'id'>>) => {
    if (user && child) {
        setChild(prev => prev ? { ...prev, ...newChildData, cycles: newChildData.cycles || prev.cycles } : null);
        updateChild(child.id, newChildData);
    }
  }

  const handleProfileUpdate = async () => {
    if (childId && user) {
        setLoading(true);
        const childData = await getChild(childId);
        setChild(childData);
        setLoading(false);
    }
  }

  if (loading) {
    return <DetailPageSkeleton />;
  }
  
  if (!child) {
    notFound();
  }
  
  const { daysUntilNextCycle } = getCyclePrediction(child);
  const canEdit = user?.role === 'parent' || user?.uid === child.childUid;

  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full flex-col bg-muted/40 text-foreground">
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto w-full">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {user?.role === 'parent' && (
                        <Button variant="outline" size="icon" onClick={() => router.push('/')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <Avatar className="h-16 w-16 border">
                      <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait" />
                      <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="font-body text-2xl md:text-3xl font-bold">{child.name}</h1>
                      <p className="text-muted-foreground">Cycle Dashboard</p>
                    </div>
                     {canEdit && (
                        <Button variant="ghost" size="icon" onClick={() => setEditChildOpen(true)}>
                            <Edit className="h-5 w-5" />
                            <span className="sr-only">Edit Profile</span>
                        </Button>
                    )}
                </div>
                {canEdit && <PeriodToggleSwitch child={child} onUpdate={handleUpdate} />}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-card mb-6 border">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="calendar" className="text-xs sm:text-sm">Calendar</TabsTrigger>
                <TabsTrigger value="charts" className="text-xs sm:text-sm">Charts</TabsTrigger>
                <TabsTrigger value="journal" className="text-xs sm:text-sm">Journal</TabsTrigger>
                <TabsTrigger value="log" className="text-xs sm:text-sm">Log Symptoms</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="mt-6">
                <div hidden={activeTab !== 'overview'}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <CycleStatusWheel child={child} />
                        <div className="space-y-6">
                            <AIInsightCard />
                            <PadReminderCard daysUntilNextCycle={daysUntilNextCycle} />
                        </div>
                    </div>
                </div>
                <div hidden={activeTab !== 'calendar'}>
                    <PeriodCalendar child={child} onUpdate={handleUpdate} canEdit={canEdit} />
                </div>
                <div hidden={activeTab !== 'charts'}>
                    <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                        <MoodChart child={child} />
                        <CycleLengthChart child={child} />
                    </div>
                </div>
                <div hidden={activeTab !== 'journal'}>
                    <JournalView child={child} />
                </div>
                <div hidden={activeTab !== 'log'}>
                    <SymptomTracker child={child} onUpdate={handleUpdate} canEdit={canEdit} />
                </div>
            </div>

          </div>
        </main>
      </div>
      {canEdit && (
        <EditChildDialog 
            isOpen={isEditChildOpen} 
            setOpen={setEditChildOpen} 
            child={child} 
            onChildUpdated={handleProfileUpdate}
        />
      )}
    </AuthGuard>
  );
}
