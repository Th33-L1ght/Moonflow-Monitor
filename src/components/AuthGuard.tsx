'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
        <div className="w-full max-w-7xl mx-auto">
            <Skeleton className="h-16 w-full mb-8" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            </div>
        </div>
       </div>
    )
  }

  return <>{children}</>;
}
