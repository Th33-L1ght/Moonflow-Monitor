
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  deleteUser,
} from 'firebase/auth';
import type { User, UserCredential } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import type { AppUser } from '@/lib/auth-types';
import { getChildProfileForUser, deleteAllUserDataAction } from '@/lib/firebase/client-actions';
import { auth } from '@/lib/firebase/client';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { logError } from '@/lib/error-logging';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<UserCredential>;
  signUp: (email: string, pass: string) => Promise<UserCredential>;
  signUpWithDummyEmail: (username: string, pass: string) => Promise<UserCredential>;
  signUpAndSignIn: (email: string, pass: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: { photoURL?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const setUserStateFromFirebaseUser = async (firebaseUser: User) => {
    const childProfile = await getChildProfileForUser(firebaseUser.uid);
    const appUser: AppUser = {
      ...firebaseUser,
      reload: firebaseUser.reload,
      toJSON: firebaseUser.toJSON,
      role: childProfile ? 'child' : 'parent',
      childProfile: childProfile || undefined,
    };
    setUser(appUser);
  };

  useEffect(() => {
    if (!auth) {
      if (!isFirebaseConfigured) setLoading(false);
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
  }, []);

  useEffect(() => {
    if (loading) return;
    
    const isPublicPage = pathname.startsWith('/login') || pathname.startsWith('/invite');

    if (user) {
      if (user.role === 'child' && user.childProfile) {
        if (!pathname.startsWith(`/child/${user.childProfile.id}`)) {
          router.replace(`/child/${user.childProfile.id}`);
        }
      } else if (user.role === 'parent' && isPublicPage) {
        router.replace('/');
      }
    } else if (!isPublicPage) {
      router.replace('/login');
    }
  }, [user, loading, pathname, router]);
  
  const signIn = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase not configured.");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      await setUserStateFromFirebaseUser(userCredential.user);
      return userCredential;
    } catch(err) {
      logError(err, { location: 'AuthContext.signIn', email });
      throw err;
    }
  }

  const signUp = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase not configured.");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      // Only send verification for real emails, not child username accounts
      if (!email.endsWith('@lightflow.app')) {
        await sendEmailVerification(userCredential.user);
      }
      await setUserStateFromFirebaseUser(userCredential.user);
      return userCredential;
    } catch(err) {
      logError(err, { location: 'AuthContext.signUp', email });
      throw err;
    }
  }

  const signUpWithDummyEmail = async (username: string, pass: string) => {
    if (!auth) throw new Error("Firebase not configured.");
    const dummyEmail = `${username.toLowerCase().trim()}@lightflow.app`;
    try {
      return await createUserWithEmailAndPassword(auth, dummyEmail, pass);
    } catch(err) {
      logError(err, { location: 'AuthContext.signUpWithDummyEmail', username });
      throw err;
    }
  }

  const signUpAndSignIn = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase not configured.");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await sendEmailVerification(userCredential.user);
      await setUserStateFromFirebaseUser(userCredential.user);
      return userCredential;
    } catch(err) {
      logError(err, { location: 'AuthContext.signUpAndSignIn', email });
      throw err;
    }
  }

  const signOut = async () => {
    if (!auth) throw new Error("Firebase not configured.");
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      logError(err, { location: 'AuthContext.signOut' });
    }
  };

  const updateUserProfile = async (data: { photoURL?: string }) => {
    if (!auth?.currentUser) throw new Error("User not authenticated.");
    try {
      await updateProfile(auth.currentUser, { photoURL: data.photoURL || null });
      await auth.currentUser.reload();
      await setUserStateFromFirebaseUser(auth.currentUser);
    } catch (err) {
      logError(err, { location: 'AuthContext.updateUserProfile', userId: auth.currentUser.uid });
      throw err;
    }
  };

  const deleteAccount = async () => {
    if (!auth?.currentUser) throw new Error("User not authenticated.");
    const userId = auth.currentUser.uid;
    try {
        // Step 1: Delete all Firestore data associated with the user
        const deleteDataResult = await deleteAllUserDataAction(userId);
        if (!deleteDataResult.success) {
            throw new Error(deleteDataResult.error || 'Failed to delete user data.');
        }

        // Step 2: Delete the user from Firebase Auth
        await deleteUser(auth.currentUser);
        setUser(null); // Force sign out in the app state
    } catch (err: any) {
        logError(err, { location: 'AuthContext.deleteAccount', userId });
        if (err.code === 'auth/requires-recent-login') {
            throw new Error('This is a sensitive operation. Please log out and log back in before deleting your account.');
        }
        throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isFirebaseConfigured, signIn, signUp, signUpAndSignIn, signUpWithDummyEmail, signOut, updateUserProfile, deleteAccount }}>
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
