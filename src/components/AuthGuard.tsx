'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // The main redirection logic is now handled in AuthContext.
    // This guard's primary role is to show a loading state
    // while the initial auth check is happening. If after loading,
    // there's still no user, the context will handle the redirect.
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
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

  // If we have a user, we can render the children.
  // If not, the effect in AuthContext will handle the redirect.
  // Returning null here prevents a flash of un-authenticated content.
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
