'use server';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { createInvite, getInvite, acceptInvite as acceptInviteInDb, getChild, resetMockData, deleteChild as deleteChildFromDb } from '@/lib/firebase/firestore';

export async function generateInvite(parentUid: string, childId: string): Promise<string | null> {
    try {
        const inviteId = await createInvite(parentUid, childId);
        return inviteId;
    } catch (error) {
        console.error("Failed to generate invite:", error);
        return null;
    }
}


export async function getInviteInfo(inviteId: string): Promise<{ childName: string } | { error: string }> {
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
    try {
        const invite = await getInvite(inviteId);
        if (!invite || invite.status !== 'pending') {
            return { success: false, error: 'This invite is invalid or has already been used.' };
        }

        // 1. Create the user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const newChildUid = userCredential.user.uid;

        // 2. Link the new user to the child profile in Firestore
        await acceptInviteInDb(inviteId, newChildUid);

        return { success: true };

    } catch (error: any) {
        console.error("Error accepting invite and creating user:", error);
        // Provide a more user-friendly error message
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
        resetMockData();
        return { success: true };
    } catch (error) {
        console.error("Failed to reset demo data:", error);
        return { success: false };
    }
}

export async function deleteChildAction(childId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await deleteChildFromDb(childId);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete child:", error);
        return { success: false, error: 'Failed to delete profile.' };
    }
}
