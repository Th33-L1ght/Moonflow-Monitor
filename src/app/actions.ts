'use server';

import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { createInvite, getInvite, acceptInvite as acceptInviteInDb, getChild, resetMockData, deleteChild as deleteChildFromDb, updateChild, addFeedback } from '@/lib/firebase/firestore';

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

export async function sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    if (!auth) {
        console.log(`Demo mode: password reset for ${email}`);
        return { success: true };
    }
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
     if (!auth) {
        // In demo mode, we just pretend it worked and update the mock data.
        const child = await getChild(childId);
        if (child) {
            const mockChildUid = `mock-child-uid-${Date.now()}`;
            await updateChild(childId, { childUid: mockChildUid, username: username });
        }
        return { success: true };
    }
    
    try {
        const dummyEmail = `${username.toLowerCase().trim()}@lightflow.app`;

        const userCredential = await createUserWithEmailAndPassword(auth, dummyEmail, password);
        const newChildUid = userCredential.user.uid;

        await updateChild(childId, { childUid: newChildUid, username: username.trim() });

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
    try {
        await addFeedback(userId, feedbackText);
        return { success: true };
    } catch (error) {
        console.error("Failed to submit feedback:", error);
        return { success: false, error: 'Failed to submit feedback.' };
    }
}
