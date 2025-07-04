
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
import { getCache, setCache } from '@/lib/cache';
import Link from 'next/link';


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

    // Attempt to load from cache first for instant navigation
    const cachedChild = getCache<Child>(`child-${childId}`);
    if (cachedChild) {
        setChild(cachedChild);
        setLoading(false);
        return;
    }
    
    // Fallback for child user or direct navigation/refresh
    if (user.role === 'child' && user.childProfile && user.childProfile.id === childId) {
      setChild(user.childProfile);
      setLoading(false);
    } else {
      const fetchChildData = async () => {
        setLoading(true);
        const childData = await getChild(childId);
        if (childData) {
            if (childData.parentUid === user.uid || childData.childUid === user.uid) {
                setCache(`child-${childId}`, childData); // Populate cache on fetch
                setChild(childData);
            } else {
                setChild(null); // Permission denied
            }
        } else {
          setChild(null); // Not found
        }
        setLoading(false);
      };
      fetchChildData();
    }
  }, [childId, user]);


  const handleUpdate = (newChildData: Partial<Omit<Child, 'id'>>) => {
    if (user && child) {
        const updatedChild = { ...child, ...newChildData, cycles: newChildData.cycles || child.cycles };
        setChild(updatedChild);
        setCache(`child-${child.id}`, updatedChild);
        updateChild(child.id, newChildData);
    }
  }

  const handleProfileUpdate = async () => {
    if (childId && user) {
        setLoading(true);
        const childData = await getChild(childId);
        if (childData) {
            setCache(`child-${childId}`, childData);
        }
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
      <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
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
                      <AvatarImage src={child.avatarUrl} alt={child.name} data-ai-hint="child portrait"/>
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

            <div className="w-full overflow-x-auto scrollbar-hide">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="inline-block min-w-full">
                <TabsList className="bg-card mb-6 border">
                  <TabsTrigger value="overview" className="px-2">Overview</TabsTrigger>
                  <TabsTrigger value="calendar" className="px-2">Calendar</TabsTrigger>
                  <TabsTrigger value="charts" className="px-2">Charts</TabsTrigger>
                  <TabsTrigger value="journal" className="px-2">Journal</TabsTrigger>
                  <TabsTrigger value="log" className="px-2">Log Symptoms</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="mt-6">
                <div hidden={activeTab !== 'overview'}>
                    <div className="space-y-6">
                        <CycleStatusWheel child={child} />
                        <AIInsightCard />
                        <PadReminderCard daysUntilNextCycle={daysUntilNextCycle} />
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
