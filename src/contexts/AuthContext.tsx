'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import { useRouter, usePathname } from 'next/navigation';
import type { AppUser } from '@/lib/types';
import { getChildProfileForUser } from '@/app/actions';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: { photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Helper function to fetch profile details and set the full AppUser state
  const setUserStateFromFirebaseUser = async (firebaseUser: User) => {
    const childProfile = await getChildProfileForUser(firebaseUser.uid);
    if (childProfile) {
        setUser({
            ...firebaseUser,
            role: 'child',
            childProfile: childProfile
        });
    } else {
         setUser({
            ...firebaseUser,
            role: 'parent',
        });
    }
  }

  useEffect(() => {
    // This effect handles the auth state listener for keeping the user logged in across page loads.
    if (!auth) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await setUserStateFromFirebaseUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Run only once on mount

  // This effect handles redirects based on user role and current path.
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
        // Only redirect if not configured, otherwise let the login page show.
        if (isFirebaseConfigured && !pathname.startsWith('/login') && !pathname.startsWith('/invite')) {
            router.replace('/login');
        }
    }
  }, [user, loading, pathname, router]);
  
  const signIn = async (email: string, pass: string) => {
    if (!auth) {
        console.log("Demo mode: Signing in parent");
        const mockUser = {
            uid: 'mock-user-id',
            email: email,
            displayName: 'Parent',
            photoURL: `https://placehold.co/100x100/e0e7ff/3730a3.png`,
            role: 'parent',
        } as AppUser;
        setUser(mockUser);
        return Promise.resolve(mockUser);
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    // Proactively set user state to trigger redirect faster instead of waiting for onAuthStateChanged
    await setUserStateFromFirebaseUser(userCredential.user); 
    return userCredential;
  }

  const signUp = async (email: string, pass: string) => {
     if (!auth) {
        console.log("Demo mode: Sign up complete. User can now log in.");
        return signIn(email, pass);
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    // After creation, user is automatically signed in.
    // Proactively set the state to trigger redirects and UI updates faster.
    await setUserStateFromFirebaseUser(userCredential.user);
    return userCredential;
  }

  const signOut = async () => {
    if (!auth) {
        setUser(null);
        router.push('/login');
        return;
    }
    await firebaseSignOut(auth);
    setUser(null);
    router.push('/login');
  };

  const updateUserProfile = async (data: { photoURL?: string }) => {
    if (!auth) {
        setUser(prevUser => {
            if (!prevUser) return null;
            return { ...prevUser, ...data } as AppUser;
        });
        console.log("Demo Mode: Parent profile updated", data);
        return;
    }

    if (auth.currentUser) {
        await updateProfile(auth.currentUser, data);
        setUser(prevUser => {
            if (!prevUser) return null;
            const newUser = { ...prevUser } as AppUser;
            if (data.photoURL) newUser.photoURL = data.photoURL;
            return newUser;
        });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUserProfile }}>
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
