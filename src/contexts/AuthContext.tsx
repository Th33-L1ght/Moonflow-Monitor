'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, getAuth, type Auth } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig, isFirebaseConfigured } from '@/lib/firebase/client';
import { useRouter, usePathname } from 'next/navigation';
import type { AppUser } from '@/lib/types';
import { getChildProfileForUser } from '@/app/actions';

// --- Client-Side Firebase Initialization ---
let auth: Auth | null = null;
if (isFirebaseConfigured) {
    try {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
    } catch(e) {
        console.error("Firebase initialization failed in AuthContext.", e);
    }
}
// --- End Client-Side Firebase Initialization ---

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
        // If firebase is not configured, redirect to login page where a message will be shown.
        if (!pathname.startsWith('/login')) {
            router.replace('/login');
        }
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
  }, [pathname, router]); // Add dependencies to re-run if they change

  // This effect handles redirects based on user role and current path.
  useEffect(() => {
    if (loading || !isFirebaseConfigured) {
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
  
  const signIn = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase not configured.");
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    await setUserStateFromFirebaseUser(userCredential.user); 
    return userCredential;
  }

  const signUp = async (email: string, pass: string) => {
     if (!auth) throw new Error("Firebase not configured.");
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await setUserStateFromFirebaseUser(userCredential.user);
    return userCredential;
  }

  const signOut = async () => {
    if (!auth) throw new Error("Firebase not configured.");
    await firebaseSignOut(auth);
    setUser(null);
    router.push('/login');
  };

  const updateUserProfile = async (data: { photoURL?: string }) => {
    if (!auth?.currentUser) throw new Error("User not authenticated.");
    await updateProfile(auth.currentUser, data);
    setUser(prevUser => {
        if (!prevUser) return null;
        const newUser = { ...prevUser } as AppUser;
        if (data.photoURL) newUser.photoURL = data.photoURL;
        return newUser;
    });
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
