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
    // This effect only handles the auth state listener and should only run once.
    if (!isFirebaseConfigured) {
        // In demo mode, auth state is handled manually by signIn/signOut.
        // We just need to set loading to false on initial load.
        setLoading(false);
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
        } else {
            // Assume parent
             setUser({
                ...firebaseUser,
                role: 'parent',
            });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Run only once on mount

  // This effect handles redirects based on user role and current path.
  // It runs whenever the user logs in/out or navigates.
  useEffect(() => {
    if (loading) {
      return;
    }
    
    // If user is logged in, handle redirects away from public pages
    if (user) {
        if (user.role === 'child' && user.childProfile) {
            if (!pathname.startsWith(`/child/${user.childProfile.id}`)) {
                router.replace(`/child/${user.childProfile.id}`);
            }
        } else if (user.role === 'parent') {
            if (pathname.startsWith('/login') || pathname.startsWith('/invite')) {
                router.replace('/');
            }
        }
    } else {
        // If user is not logged in, ensure they are on a public page
        if (!pathname.startsWith('/login') && !pathname.startsWith('/invite')) {
            router.replace('/login');
        }
    }
  }, [user, loading, pathname, router]);
  
  const signIn = (email: string, pass: string) => {
    if (!isFirebaseConfigured) {
        console.log("Demo mode: Signing in parent");
        const mockUser = {
            uid: 'mock-user-id',
            email: email,
            displayName: 'Parent',
            photoURL: `https://placehold.co/100x100.png`,
            role: 'parent',
        } as AppUser;
        setUser(mockUser);
        return Promise.resolve(mockUser);
    }
    return signInWithEmailAndPassword(auth, email, pass);
  }

  const signUp = (email: string, pass: string) => {
     if (!isFirebaseConfigured) {
        console.log("Demo mode: Sign up complete. User can now log in.");
        // In demo mode, we just log them in
        return signIn(email, pass);
    }
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
