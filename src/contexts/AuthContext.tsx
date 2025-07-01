
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, getAuth, type Auth, type UserCredential } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig, isFirebaseConfigured } from '@/lib/firebase/client';
import { useRouter, usePathname } from 'next/navigation';
import type { AppUser } from '@/lib/types';
import { getChildProfileForUser } from '@/app/actions';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  auth: Auth | null;
  signIn: (email: string, pass: string) => Promise<UserCredential>;
  signUp: (email: string, pass: string) => Promise<UserCredential>;
  signUpWithDummyEmail: (username: string, pass: string) => Promise<UserCredential>;
  signUpAndSignIn: (email: string, pass: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: { photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Moved Firebase initialization into a function to avoid module-level side effects.
const getFirebaseAuth = (): Auth | null => {
    if (isFirebaseConfigured) {
        try {
            const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
            return getAuth(app);
        } catch (e) {
            console.error("Firebase initialization failed in AuthContext.", e);
            return null;
        }
    }
    return null;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  // Store auth instance in state to ensure it's created only once.
  const [auth] = useState<Auth | null>(getFirebaseAuth());

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
        setUser(null);
        setLoading(false);
        return; // No auth instance, so stop here. Redirect logic will handle it.
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
  }, [auth]); // Dependency on auth instance

  // This effect handles redirects based on user role and current path.
  useEffect(() => {
    if (loading) {
      return; // Don't do anything until auth state is resolved
    }
    
    const isPublicPage = pathname.startsWith('/login') || pathname.startsWith('/invite');

    // If user is logged in, handle redirects away from public pages
    if (user) {
        if (user.role === 'child' && user.childProfile) {
            // If a child is not on their own page, redirect them.
            if (!pathname.startsWith(`/child/${user.childProfile.id}`)) {
                router.replace(`/child/${user.childProfile.id}`);
            }
        } else if (user.role === 'parent') {
            // If a parent is on a public page, redirect them to the dashboard.
            if (isPublicPage) {
                router.replace('/');
            }
        }
    } else {
        // If user is not logged in, ensure they are on a public page
        if (!isPublicPage) {
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

  const signUpWithDummyEmail = async (username: string, pass: string) => {
     if (!auth) throw new Error("Firebase not configured.");
     const dummyEmail = `${username.toLowerCase().trim()}@lightflow.app`;
     // Does not sign in the user or update context, as this is a parent action
     return await createUserWithEmailAndPassword(auth, dummyEmail, pass);
  }

  const signUpAndSignIn = async (email: string, pass: string) => {
     if (!auth) throw new Error("Firebase not configured.");
     const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
     await setUserStateFromFirebaseUser(userCredential.user);
     return userCredential;
  }

  const signOut = async () => {
    if (!auth) throw new Error("Firebase not configured.");
    await firebaseSignOut(auth);
    setUser(null); // The redirect effect will handle router.push
  };

  const updateUserProfile = async (data: { photoURL?: string }) => {
    if (!auth?.currentUser) throw new Error("User not authenticated.");
    await updateProfile(auth.currentUser, data);
    // The user object in firebase has been updated, now update our local AppUser
    setUser(prevUser => {
        if (!prevUser) return null;
        return { ...prevUser, ...data };
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, auth, signIn, signUp, signUpAndSignIn, signUpWithDummyEmail, signOut, updateUserProfile }}>
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
