'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import { useRouter, usePathname } from 'next/navigation';
import type { AppUser } from '@/lib/types';
import { getChildProfileForChildUser } from '@/lib/firebase/firestore';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      // In demo mode, let's check the path to determine the mock user
      if (pathname.startsWith('/invite')) {
        // Don't set a user on the invite page
         setUser(null);
      } else {
        // Mock parent user for the main app
        setUser({
            uid: 'mock-user-id',
            email: 'parent@example.com',
            displayName: 'Mock Parent',
            photoURL: `https://placehold.co/100x100.png`,
            role: 'parent',
        } as AppUser);
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user is a child
        const childProfile = await getChildProfileForChildUser(firebaseUser.uid);
        if (childProfile) {
            setUser({
                ...firebaseUser,
                role: 'child',
                childProfile: childProfile
            });
            // If child is not on their page, redirect them
            if (!pathname.startsWith(`/child/${childProfile.id}`)) {
                router.replace(`/child/${childProfile.id}`);
            }
        } else {
            // Assume parent
             setUser({
                ...firebaseUser,
                role: 'parent',
            });
             // If parent lands on invite page, redirect to home
            if (pathname.startsWith('/invite')) {
                router.replace('/');
            }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);
  
  const signIn = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  }

  const signUp = (email: string, pass: string) => {
    // This is for parent signup
    return createUserWithEmailAndPassword(auth, email, pass);
  }

  const signOut = async () => {
    if (!isFirebaseConfigured) {
        setUser(null);
        router.push('/login');
        return;
    }
    await firebaseSignOut(auth);
    // After sign out, clear user and redirect to login
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
