
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
  Timestamp,
  deleteField,
} from 'firebase/firestore';
import type { Child } from '@/lib/types';
import { db } from './client';
import { logError } from '../error-logging';

// Helper function to convert Firestore Timestamps to JS Date objects
function convertTimestampsToDates(data: any): any {
  if (data instanceof Timestamp) {
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

// Internal Invite Type
interface Invite {
    id: string;
    parentUid: string;
    childId: string;
    status: 'pending' | 'accepted';
    createdAt: Date;
}

// Client-side Actions

export async function getChild(childId: string): Promise<Child | null> {
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
        logError(error, { location: 'client-actions.getChild', childId });
        return null;
    }
}

export async function updateChild(childId: string, data: Partial<Omit<Child, 'id'>>): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: 'Firebase not configured.'};
    try {
        const childDocRef = doc(db, 'children', childId);
        await updateDoc(childDocRef, data);
        return { success: true };
    } catch (error) {
        logError(error, { location: 'client-actions.updateChild', childId });
        return { success: false, error: 'Failed to update profile.' };
    }
}

export async function getChildProfileForUser(userId: string): Promise<Child | null> {
    if (!db) return null;
    try {
        const q = query(collection(db, 'children'), where('childUid', '==', userId), limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return null;
        }
        const childDoc = snapshot.docs[0];
        return { id: childDoc.id, ...convertTimestampsToDates(childDoc.data()) } as Child;
    } catch (error) {
        logError(error, { location: 'client-actions.getChildProfileForUser', userId });
        return null;
    }
}

export async function getChildrenForUser(userId: string): Promise<Child[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'children'), where('parentUid', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...convertTimestampsToDates(doc.data()) } as Child));
  } catch (error: any) {
    logError(error, { location: 'client-actions.getChildrenForUser', userId });
    let message = error.message || "Failed to load your dashboard data.";
    if (error.code === 'failed-precondition') {
      message = "Your database needs a special index to display your data. Please check the developer console (press F12) for a link to create it.";
    } else if (error.code === 'permission-denied') {
      message = "Your database security rules are preventing you from seeing your data. Please update your rules in the Firebase Console."
    }
    throw new Error(message);
  }
}

export async function addChildForUser(userId: string, profileName: string, avatarUrl: string, isParentProfile: boolean): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: 'Firebase not configured.'};
    try {
        const newProfileData: Omit<Child, 'id'> = {
            name: profileName,
            avatarUrl,
            cycles: [],
            parentUid: userId,
            isParentProfile: isParentProfile,
        };
        await addDoc(collection(db, 'children'), newProfileData);
        return { success: true };
    } catch (error: any) {
      logError(error, { location: 'client-actions.addChildForUser', userId, profileName });
      let message = error.message || 'An unknown error occurred while adding the profile.';
      if (error.code === 'permission-denied') {
        message = 'Permission Denied: Your database security rules are blocking this request. Please update your rules in the Firebase Console.';
      } else if (error.code === 'failed-precondition') {
          message = "Your database needs a special index to work correctly. Please check the developer console (press F12) for a link to create it.";
      }
      return { success: false, error: message };
    }
}

async function getInvite(inviteId: string): Promise<Invite | null> {
    if (!db) return null;
    try {
        const docRef = doc(db, 'invites', inviteId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...convertTimestampsToDates(docSnap.data()) } as Invite;
    } catch(error) {
        logError(error, { location: 'client-actions.getInvite', inviteId });
        return null;
    }
}

export async function acceptInviteInDb(inviteId: string, childUid: string): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "Database not configured." };
    }
    const invite = await getInvite(inviteId);
    if (!invite || invite.status !== 'accepted') {
        return { success: false, error: "Invite is invalid or has already been accepted." };
    }
    
    try {
      const batch = writeBatch(db);
      const inviteRef = doc(db, 'invites', inviteId);
      const childRef = doc(db, 'children', invite.childId);
      batch.update(childRef, { childUid: childUid });
      batch.update(inviteRef, { status: 'accepted' });
      await batch.commit();
      return { success: true };
    } catch(error: any) {
        logError(error, { location: 'client-actions.acceptInviteInDb', inviteId, childUid });
        return { success: false, error: error.message || "Failed to update database." };
    }
}


export async function generateInvite(parentUid: string, childId: string): Promise<string | null> {
    if (!db) return null;
    try {
        const inviteData = { parentUid, childId, status: 'pending', createdAt: serverTimestamp() };
        const docRef = await addDoc(collection(db, 'invites'), inviteData);
        return docRef.id;
    } catch (error) {
        logError(error, { location: 'client-actions.generateInvite', parentUid, childId });
        return null;
    }
}

export async function getInviteInfo(inviteId: string): Promise<{ childName: string } | { error: string }> {
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
        logError(error, { location: 'client-actions.getInviteInfo', inviteId });
        return { error: 'An unexpected error occurred.' };
    }
}

export async function deleteChildAction(childId: string): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: 'Firebase not configured.'};
    try {
        const child = await getChild(childId);
        if (child?.childUid) {
            return { success: false, error: "Cannot delete a profile with a linked user account. Please unlink the account first." };
        }
        await deleteDoc(doc(db, 'children', childId));
        return { success: true };
    } catch (error) {
        logError(error, { location: 'client-actions.deleteChildAction', childId });
        return { success: false, error: 'Failed to delete profile.' };
    }
}

export async function unlinkChildAccountAction(childId: string): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: 'Firebase not configured.' };
    try {
        const childDocRef = doc(db, 'children', childId);
        await updateDoc(childDocRef, {
            childUid: deleteField(),
            username: deleteField()
        });
        return { success: true };
    } catch (error) {
        logError(error, { location: 'client-actions.unlinkChildAccountAction', childId });
        return { success: false, error: 'Failed to unlink account.' };
    }
}


export async function submitFeedbackAction(userId: string, feedbackText: string): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: 'Firebase not configured.'};
    try {
        await addDoc(collection(db, 'feedback'), {
            userId,
            text: feedbackText,
            createdAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error: any) {
        logError(error, { location: 'client-actions.submitFeedbackAction', userId });
        let message = error.message || 'An unknown error occurred while submitting feedback.';
        if (error.code === 'permission-denied') {
            message = 'Permission Denied: Your database security rules are blocking this request. Please update your rules in the Firebase Console.';
        }
        return { success: false, error: message };
    }
}

export async function deleteAllUserDataAction(userId: string): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: 'Firebase not configured.' };

    try {
        const batch = writeBatch(db);

        // Find and delete children documents
        const childrenQuery = query(collection(db, 'children'), where('parentUid', '==', userId));
        const childrenSnapshot = await getDocs(childrenQuery);
        childrenSnapshot.forEach(doc => batch.delete(doc.ref));

        // Find and delete feedback documents
        const feedbackQuery = query(collection(db, 'feedback'), where('userId', '==', userId));
        const feedbackSnapshot = await getDocs(feedbackQuery);
        feedbackSnapshot.forEach(doc => batch.delete(doc.ref));
        
        // Find and delete invite documents
        const invitesQuery = query(collection(db, 'invites'), where('parentUid', '==', userId));
        const invitesSnapshot = await getDocs(invitesQuery);
        invitesSnapshot.forEach(doc => batch.delete(doc.ref));

        await batch.commit();
        return { success: true };
    } catch (error) {
        logError(error, { location: 'client-actions.deleteAllUserDataAction', userId });
        return { success: false, error: 'Failed to delete user data.' };
    }
}
