'use server';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, type Auth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  limit, 
  serverTimestamp, 
  writeBatch,
  deleteDoc,
  type Firestore
} from 'firebase/firestore';
import type { Child, Invite } from '@/lib/types';
import { firebaseConfig, isFirebaseConfigured } from '@/lib/firebase/client';

// --- LAZY INITIALIZATION PATTERN ---
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function getFirebaseServices() {
    if (isFirebaseConfigured && !app) {
        try {
            app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);
        } catch (error) {
            console.error("Firebase initialization failed on server.", error);
            app = null;
            auth = null;
            db = null;
        }
    }
    return { app, auth, db };
}
// --- END LAZY INITIALIZATION PATTERN ---


// --- Helper function from firestore.ts ---
// This version avoids importing `Timestamp` from the client SDK
function convertTimestampsToDates(data: any): any {
  if (data && typeof data.toDate === 'function') {
    return data.toDate();
  }
  if (Array.isArray(data)) {
    return data.map(convertTimestampsToDates);
  }
  if (data !== null && typeof data === 'object') {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = convertTimestampsToDates(data[key]);
      return acc;
    }, {} as { [key: string]: any });
  }
  return data;
}

// --- Server Actions ---

export async function getChild(childId: string): Promise<Child | null> {
    const { db } = getFirebaseServices();
    if (!db) return null;
    try {
        const childDocRef = doc(db, 'children', childId);
        const docSnap = await getDoc(childDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const convertedData = convertTimestampsToDates(data);
            return { id: docSnap.id, ...convertedData } as Child;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching child:", error);
        return null;
    }
}

export async function updateChild(childId: string, data: Partial<Omit<Child, 'id'>>): Promise<{ success: boolean; error?: string }> {
    const { db } = getFirebaseServices();
    if (!db) return { success: false, error: 'Firebase not configured.'};
    try {
        const childDocRef = doc(db, 'children', childId);
        await updateDoc(childDocRef, data);
        return { success: true };
    } catch (error) {
        console.error("Failed to update child:", error);
        return { success: false, error: 'Failed to update profile.' };
    }
}

export async function getChildProfileForUser(userId: string): Promise<Child | null> {
    const { db } = getFirebaseServices();
    if (!db) return null;
    const q = query(collection(db, 'children'), where('childUid', '==', userId), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const childDoc = snapshot.docs[0];
    return { id: childDoc.id, ...convertTimestampsToDates(childDoc.data()) } as Child;
}

export async function getChildrenForUser(userId: string): Promise<Child[]> {
  const { db } = getFirebaseServices();
  if (!db) return [];
  try {
    const q = query(collection(db, 'children'), where('parentUid', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...convertTimestampsToDates(doc.data()) } as Child));
  } catch (error) {
    console.error("Error fetching children for user:", error);
    return [];
  }
}

export async function addChildForUser(userId: string, childName: string, avatarUrl: string): Promise<{ success: boolean; error?: string }> {
    const { db } = getFirebaseServices();
    if (!db) return { success: false, error: 'Firebase not configured.'};
    try {
        const newChildData: Omit<Child, 'id'> = {
            name: childName,
            avatarUrl,
            cycles: [],
            parentUid: userId,
        };
        await addDoc(collection(db, 'children'), newChildData);
        return { success: true };
    } catch (error) {
        console.error("Failed to add child:", error);
        return { success: false, error: 'Failed to add profile.' };
    }
}

async function getInvite(inviteId: string): Promise<Invite | null> {
    const { db } = getFirebaseServices();
    if (!db) return null;
    const docRef = doc(db, 'invites', inviteId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...convertTimestampsToDates(docSnap.data()) } as Invite;
}

async function acceptInviteInDb(inviteId: string, childUid: string): Promise<void> {
    const { db } = getFirebaseServices();
    if (!db) {
        throw new Error("Database not configured.");
    }
    const invite = await getInvite(inviteId);
    if (!invite || invite.status !== 'pending') {
        throw new Error("Invite is invalid or has already been accepted.");
    }
    
    const batch = writeBatch(db);
    const inviteRef = doc(db, 'invites', inviteId);
    const childRef = doc(db, 'children', invite.childId);
    batch.update(childRef, { childUid: childUid });
    batch.update(inviteRef, { status: 'accepted' });
    await batch.commit();
}


export async function generateInvite(parentUid: string, childId: string): Promise<string | null> {
    const { db } = getFirebaseServices();
    if (!db) return null;
    try {
        const inviteData = { parentUid, childId, status: 'pending', createdAt: serverTimestamp() };
        const docRef = await addDoc(collection(db, 'invites'), inviteData);
        return docRef.id;
    } catch (error) {
        console.error("Failed to generate invite:", error);
        return null;
    }
}

export async function getInviteInfo(inviteId: string): Promise<{ childName: string } | { error: string }> {
    const { db } = getFirebaseServices();
    if (!db) return { error: 'Firebase not configured.'};
    try {
        const invite = await getInvite(inviteId);
        if (!invite || invite.status !== 'pending') {
            return { error: 'This invite is invalid or has already been used.' };
        }
        const child = await getChild(invite.childId);
        if (!child) {
            return { error: 'The profile associated with this invite could not be found.' };
        }
        return { childName: child.name };
    } catch (error) {
        console.error("Error fetching invite info:", error);
        return { error: 'An unexpected error occurred.' };
    }
}

export async function acceptInviteAndCreateUser(inviteId: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    const { auth } = getFirebaseServices();
    if (!auth) return { success: false, error: 'Firebase not configured.'};
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await acceptInviteInDb(inviteId, userCredential.user.uid);
        return { success: true };
    } catch (error: any) {
        console.error("Error accepting invite and creating user:", error);
        let message = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
            message = 'This email address is already in use. Please use a different email.';
        } else if (error.code === 'auth/weak-password') {
            message = 'The password is too weak. Please choose a stronger password.';
        }
        return { success: false, error: message };
    }
}

export async function deleteChildAction(childId: string): Promise<{ success: boolean; error?: string }> {
    const { db } = getFirebaseServices();
    if (!db) return { success: false, error: 'Firebase not configured.'};
    try {
        await deleteDoc(doc(db, 'children', childId));
        return { success: true };
    } catch (error) {
        console.error("Failed to delete child:", error);
        return { success: false, error: 'Failed to delete profile.' };
    }
}

export async function sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    const { auth } = getFirebaseServices();
    if (!auth) return { success: false, error: 'Firebase not configured.'};
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to send password reset email:", error);
        let message = 'An unexpected error occurred.';
        if (error.code === 'auth/user-not-found') {
            message = 'No user found with this email address.';
        }
        return { success: false, error: message };
    }
}

export async function createChildLogin(childId: string, username: string, password: string): Promise<{ success: boolean; error?: string }> {
    const { auth } = getFirebaseServices();
    if (!auth) return { success: false, error: 'Firebase not configured.'};
    
    try {
        const dummyEmail = `${username.toLowerCase().trim()}@lightflow.app`;
        const userCredential = await createUserWithEmailAndPassword(auth, dummyEmail, password);
        await updateChild(childId, { childUid: userCredential.user.uid, username: username.trim() });
        return { success: true };
    } catch (error: any) {
        console.error("Error creating child login:", error);
        let message = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
            message = 'This username is already taken. Please choose another one.';
        } else if (error.code === 'auth/weak-password') {
            message = 'The password is too weak. Please choose a stronger password (at least 6 characters).';
        }
        return { success: false, error: message };
    }
}

export async function submitFeedbackAction(userId: string, feedbackText: string): Promise<{ success: boolean; error?: string }> {
    const { db } = getFirebaseServices();
    if (!db) return { success: false, error: 'Firebase not configured.'};
    try {
        await addDoc(collection(db, 'feedback'), {
            userId,
            text: feedbackText,
            createdAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to submit feedback:", error);
        return { success: false, error: 'Failed to submit feedback.' };
    }
}
