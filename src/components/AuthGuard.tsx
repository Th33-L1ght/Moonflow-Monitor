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
    // This guard's primary role is now to show a loading state
    // while the initial auth check is happening.
    if (!loading && !user) {
      router.push('/login');
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
  // If not, the effect above will have already started the redirect.
  // We can return null or a skeleton here to prevent a flash of un-authed content.
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
