'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Use mock user in demo mode
      setUser({
          uid: 'mock-user-id',
          email: 'parent@example.com',
          displayName: 'Mock Parent',
          photoURL: `https://placehold.co/100x100.png`,
      } as User);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const signIn = (email: string, pass: string) => {
    if (!isFirebaseConfigured) {
        console.log("Demo mode: Sign in clicked");
        router.push('/');
        return Promise.resolve();
    }
    return signInWithEmailAndPassword(auth, email, pass);
  }

  const signUp = (email: string, pass: string) => {
    if (!isFirebaseConfigured) {
        console.log("Demo mode: Sign up clicked");
        // In a real app, you might want to show a toast here.
        return Promise.resolve();
    }
    return createUserWithEmailAndPassword(auth, email, pass);
  }

  const signOut = async () => {
    if (!isFirebaseConfigured) {
        console.log("Demo mode: Sign out clicked");
        setUser(null);
        router.push('/login');
        return;
    }
    await firebaseSignOut(auth);
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
