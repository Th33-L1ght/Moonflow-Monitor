'use server';

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
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
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase/client';
import type { Child, Invite } from '@/lib/types';

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

// --- Mock Data for Demo Mode ---
const getInitialMockData = () => {
    const today = new Date();
    const children: Child[] = [
    {
        id: 'child-1',
        name: 'Olivia',
        parentUid: 'mock-user-id',
        childUid: 'mock-child-uid-1',
        username: 'olivia',
        avatarUrl: `https://placehold.co/100x100/e9d5ff/581c87.png`,
        cycles: [
        {
            id: 'cycle-1-1',
            startDate: new Date(today.getFullYear(), today.getMonth() - 2, 10),
            endDate: new Date(today.getFullYear(), today.getMonth() - 2, 14),
            symptoms: [
            { date: new Date(today.getFullYear(), today.getMonth() - 2, 10), crampLevel: 2, mood: 'Sad' as const, note: '' },
            ]
        },
        {
            id: 'cycle-1-2',
            startDate: new Date(today.getFullYear(), today.getMonth() - 1, 5),
            endDate: new Date(today.getFullYear(), today.getMonth() - 1, 9),
            symptoms: [
            { date: new Date(today.getFullYear(), today.getMonth() - 1, 5), crampLevel: 3, mood: 'Moody' as const, note: '' },
            { date: new Date(today.getFullYear(), today.getMonth() - 1, 6), crampLevel: 2, mood: 'Sad' as const, note: '' },
            ],
        },
        // Current cycle
        {
            id: 'cycle-1-3',
            startDate: new Date(today.getFullYear(), today.getMonth(), 2),
            endDate: new Date(today.getFullYear(), today.getMonth(), 6),
            symptoms: [
                { date: new Date(today.getFullYear(), today.getMonth(), 2), crampLevel: 4, mood: 'Moody' as const, note: "Feeling extra tired and had a slight headache today." },
                { date: new Date(), crampLevel: 2, mood: 'Happy' as const, note: '' }
            ],
        },
        ]
    },
    {
        id: 'child-2',
        name: 'Emma',
        parentUid: 'mock-user-id',
        avatarUrl: `https://placehold.co/100x100/cffafe/155e75.png`,
        cycles: [
        {
            id: 'cycle-2-1',
            startDate: new Date(today.getFullYear(), today.getMonth() - 2, 16),
            endDate: new Date(today.getFullYear(), today.getMonth() - 2, 20),
            symptoms: [],
        },
        {
            id: 'cycle-2-2',
            startDate: new Date(today.getFullYear(), today.getMonth() - 1, 18),
            endDate: new Date(today.getFullYear(), today.getMonth() - 1, 22),
            symptoms: [],
        },
        ],
    },
    {
        id: 'child-3',
        name: 'Sophia',
        parentUid: 'mock-user-id',
        avatarUrl: `https://placehold.co/100x100/fecdd3/9f1239.png`,
        cycles: [],
    },
    ];
    const invites: Invite[] = [];
    return { children, invites };
};

let MOCK_CHILDREN: Child[] = getInitialMockData().children;
let MOCK_INVITES: Invite[] = getInitialMockData().invites;

const getChildrenCollection = () => collection(db!, 'children');
const getInvitesCollection = () => collection(db!, 'invites');
const getFeedbackCollection = () => collection(db!, 'feedback');


// --- Server Actions ---

export async function getChild(childId: string): Promise<Child | null> {
    if (!isFirebaseConfigured) {
        const child = MOCK_CHILDREN.find(c => c.id === childId) || null;
        return child ? JSON.parse(JSON.stringify(child)) : null;
    }
    try {
        const childDocRef = doc(db!, 'children', childId);
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
    if (!isFirebaseConfigured) {
        const childIndex = MOCK_CHILDREN.findIndex(c => c.id === childId);
        if (childIndex > -1) {
            MOCK_CHILDREN[childIndex] = { ...MOCK_CHILDREN[childIndex], ...data };
        }
        return { success: true };
    }
    try {
        const childDocRef = doc(db!, 'children', childId);
        await updateDoc(childDocRef, data);
        return { success: true };
    } catch (error) {
        console.error("Failed to update child:", error);
        return { success: false, error: 'Failed to update profile.' };
    }
}

export async function getChildProfileForUser(userId: string): Promise<Child | null> {
    if (!isFirebaseConfigured) {
        const child = MOCK_CHILDREN.find(c => c.childUid === userId) || null;
        return child ? JSON.parse(JSON.stringify(child)) : null;
    }
    const q = query(getChildrenCollection(), where('childUid', '==', userId), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const childDoc = snapshot.docs[0];
    return { id: childDoc.id, ...convertTimestampsToDates(childDoc.data()) } as Child;
}

export async function getChildrenForUser(userId: string): Promise<Child[]> {
  if (!isFirebaseConfigured) {
    return JSON.parse(JSON.stringify(MOCK_CHILDREN.filter(c => c.parentUid === userId)));
  }
  try {
    const q = query(getChildrenCollection(), where('parentUid', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...convertTimestampsToDates(doc.data()) } as Child));
  } catch (error) {
    console.error("Error fetching children for user:", error);
    return [];
  }
}

export async function addChildForUser(userId: string, childName: string, avatarUrl: string): Promise<{ success: boolean; error?: string }> {
    if (!isFirebaseConfigured) {
        const newChild: Child = {
            id: `mock-child-${Date.now()}`,
            name: childName,
            avatarUrl,
            parentUid: userId,
            cycles: [],
        };
        MOCK_CHILDREN.push(newChild);
        return { success: true };
    }
    try {
        const newChildData: Omit<Child, 'id'> = {
            name: childName,
            avatarUrl,
            cycles: [],
            parentUid: userId,
        };
        await addDoc(getChildrenCollection(), newChildData);
        return { success: true };
    } catch (error) {
        console.error("Failed to add child:", error);
        return { success: false, error: 'Failed to add profile.' };
    }
}

async function getInvite(inviteId: string): Promise<Invite | null> {
    if (!isFirebaseConfigured) {
        return MOCK_INVITES.find(inv => inv.id === inviteId) || null;
    }
    const docRef = doc(db!, 'invites', inviteId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...convertTimestampsToDates(docSnap.data()) } as Invite;
}

async function acceptInviteInDb(inviteId: string, childUid: string): Promise<void> {
    const invite = await getInvite(inviteId);
    if (!invite || invite.status !== 'pending') {
        throw new Error("Invite is invalid or has already been accepted.");
    }

    if (!isFirebaseConfigured) {
        const inviteIndex = MOCK_INVITES.findIndex(inv => inv.id === inviteId);
        if (inviteIndex > -1) {
            MOCK_INVITES[inviteIndex].status = 'accepted';
        }
        const childIndex = MOCK_CHILDREN.findIndex(c => c.id === invite.childId);
        if (childIndex > -1) {
            MOCK_CHILDREN[childIndex].childUid = childUid;
        }
        return;
    }
    
    const batch = writeBatch(db!);
    const inviteRef = doc(db!, 'invites', inviteId);
    const childRef = doc(db!, 'children', invite.childId);
    batch.update(childRef, { childUid: childUid });
    batch.update(inviteRef, { status: 'accepted' });
    await batch.commit();
}


export async function generateInvite(parentUid: string, childId: string): Promise<string | null> {
    if (!isFirebaseConfigured) {
        const newInvite: Invite = {
            id: `mock-invite-${Date.now()}`,
            parentUid,
            childId,
            status: 'pending',
            createdAt: new Date(),
        };
        MOCK_INVITES.push(newInvite);
        return newInvite.id;
    }
    try {
        const inviteData = { parentUid, childId, status: 'pending', createdAt: serverTimestamp() };
        const docRef = await addDoc(getInvitesCollection(), inviteData);
        return docRef.id;
    } catch (error) {
        console.error("Failed to generate invite:", error);
        return null;
    }
}

export async function getInviteInfo(inviteId: string): Promise<{ childName: string } | { error: string }> {
    if (!isFirebaseConfigured) {
        const invite = await getInvite(inviteId);
         if (!invite || invite.status !== 'pending') {
            return { error: 'This invite is invalid or has already been used.' };
        }
        const child = MOCK_CHILDREN.find(c => c.id === invite.childId);
        if (!child) {
            return { error: 'The profile associated with this invite could not be found.' };
        }
        return { childName: child.name };
    }
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
    if (!isFirebaseConfigured) {
        const invite = await getInvite(inviteId);
        if (!invite || invite.status !== 'pending') {
            return { success: false, error: 'This invite is invalid or has already been used.' };
        }
        const newChildUid = `mock-child-uid-${Date.now()}`;
        await acceptInviteInDb(inviteId, newChildUid);
        return { success: true };
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth!, email, pass);
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

export async function resetDemoData(): Promise<{ success: boolean }> {
    try {
        if (!isFirebaseConfigured) {
            const initialData = getInitialMockData();
            MOCK_CHILDREN = initialData.children;
            MOCK_INVITES = initialData.invites;
        }
        return { success: true };
    } catch (error) {
        console.error("Failed to reset demo data:", error);
        return { success: false };
    }
}

export async function deleteChildAction(childId: string): Promise<{ success: boolean; error?: string }> {
    if (!isFirebaseConfigured) {
        MOCK_CHILDREN = MOCK_CHILDREN.filter(c => c.id !== childId);
        return { success: true };
    }
    try {
        await deleteDoc(doc(db!, 'children', childId));
        return { success: true };
    } catch (error) {
        console.error("Failed to delete child:", error);
        return { success: false, error: 'Failed to delete profile.' };
    }
}

export async function sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    if (!isFirebaseConfigured) {
        console.log(`Demo mode: password reset for ${email}`);
        return { success: true };
    }
    try {
        await sendPasswordResetEmail(auth!, email);
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
    if (!isFirebaseConfigured) {
        const childIndex = MOCK_CHILDREN.findIndex(c => c.id === childId);
        if (childIndex > -1) {
            MOCK_CHILDREN[childIndex].childUid = `mock-child-uid-${Date.now()}`;
            MOCK_CHILDREN[childIndex].username = username;
        }
        return { success: true };
    }
    
    try {
        const dummyEmail = `${username.toLowerCase().trim()}@lightflow.app`;
        const userCredential = await createUserWithEmailAndPassword(auth!, dummyEmail, password);
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
    if (!isFirebaseConfigured) {
        console.log(`Demo mode: Feedback from ${userId}: "${feedbackText}"`);
        return { success: true };
    }
    try {
        await addDoc(getFeedbackCollection(), {
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
