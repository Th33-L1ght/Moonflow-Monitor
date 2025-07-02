
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  getAuth,
} from 'firebase/auth';
import type { User, Auth, UserCredential } from 'firebase/auth';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { useRouter, usePathname } from 'next/navigation';
import type { AppUser } from '@/lib/auth-types';
import { getChildProfileForUser } from '@/app/actions';

// Define config and state check directly inside the context file.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => value && !value.startsWith('YOUR_')
);


interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  auth: Auth | null;
  isFirebaseConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<UserCredential>;
  signUp: (email: string, pass: string) => Promise<UserCredential>;
  signUpWithDummyEmail: (username: string, pass: string) => Promise<UserCredential>;
  signUpAndSignIn: (email: string, pass: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: { photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [auth, setAuth] = useState<Auth | null>(null);

  // Initialize Firebase auth object safely on the client side.
  useEffect(() => {
    if (isFirebaseConfigured) {
        try {
            const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
            setAuth(getAuth(app));
        } catch (e) {
            console.error("Firebase initialization failed in AuthContext.", e);
            setLoading(false); // Stop loading on failure
        }
    } else {
        setLoading(false); // Stop loading if not configured
    }
  }, []);


  // Helper function to fetch profile details and set the full AppUser state
  const setUserStateFromFirebaseUser = async (firebaseUser: User) => {
    const childProfile = await getChildProfileForUser(firebaseUser.uid);
    if (childProfile) {
        setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            isAnonymous: firebaseUser.isAnonymous,
            metadata: firebaseUser.metadata,
            providerData: firebaseUser.providerData,
            providerId: firebaseUser.providerId,
            tenantId: firebaseUser.tenantId,
            refreshToken: firebaseUser.refreshToken,
            delete: firebaseUser.delete,
            getIdToken: firebaseUser.getIdToken,
            getIdTokenResult: firebaseUser.getIdTokenResult,
            reload: firebaseUser.reload,
            toJSON: firebaseUser.toJSON,
            role: 'child',
            childProfile: childProfile
        });
    } else {
         setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            isAnonymous: firebaseUser.isAnonymous,
            metadata: firebaseUser.metadata,
            providerData: firebaseUser.providerData,
            providerId: firebaseUser.providerId,
            tenantId: firebaseUser.tenantId,
            refreshToken: firebaseUser.refreshToken,
            delete: firebaseUser.delete,
            getIdToken: firebaseUser.getIdToken,
            getIdTokenResult: firebaseUser.getIdTokenResult,
            reload: firebaseUser.reload,
            toJSON: firebaseUser.toJSON,
            role: 'parent',
        });
    }
  }

  useEffect(() => {
    // This effect handles the auth state listener for keeping the user logged in across page loads.
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
  }, [auth]);

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
    await updateProfile(auth.currentUser, { photoURL: data.photoURL || null });
    // After updating in Firebase, update our local state for immediate UI feedback.
    setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser };
        if (data.photoURL) {
            updatedUser.photoURL = data.photoURL;
        }
        return updatedUser as AppUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, auth, isFirebaseConfigured, signIn, signUp, signUpAndSignIn, signUpWithDummyEmail, signOut, updateUserProfile }}>
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
