
'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { getChild, updateChild } from '@/lib/firebase/client-actions';
import type { Child } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
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


const DetailPageSkeleton = () => (
    <div className="flex min-h-screen w-full flex-col bg-background">
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
                <Skeleton className="h-96 w-full" />
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                 </div>
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
            
            <div className="relative mb-6 text-center">
                {user?.role === 'parent' && (
                    <Button variant="outline" size="icon" onClick={() => router.push('/')} className="absolute top-0 left-0 z-10">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Dashboard</span>
                    </Button>
                )}
                {canEdit && (
                    <Button variant="ghost" size="icon" onClick={() => setEditChildOpen(true)} className="absolute top-0 right-0 z-10">
                        <Edit className="h-5 w-5" />
                        <span className="sr-only">Edit Profile</span>
                    </Button>
                )}
                
                <CycleStatusWheel child={child} />
            </div>
            
            <div className="flex justify-center mb-12">
                 {canEdit && <PeriodToggleSwitch child={child} onUpdate={handleUpdate} />}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    <SymptomTracker child={child} onUpdate={handleUpdate} canEdit={canEdit} />
                    <PadReminderCard daysUntilNextCycle={daysUntilNextCycle} />
                    <AIInsightCard />
                    <JournalView child={child} />
                </div>
                {/* Right Column */}
                <div className="space-y-8">
                    <PeriodCalendar child={child} onUpdate={handleUpdate} canEdit={canEdit} />
                    <MoodChart child={child} />
                    <CycleLengthChart child={child} />
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
