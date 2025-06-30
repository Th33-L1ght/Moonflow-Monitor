
import { db, isFirebaseConfigured } from './client';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  Timestamp,
  query,
  where,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import type { Child, Invite } from '@/lib/types';

// Helper function to recursively convert Firestore Timestamps to JS Date objects
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

// --- Mock Data for Demo Mode ---
// This is now a stateful variable that can be mutated in demo mode.
const today = new Date();
const oliviaCycles = [
  {
    id: 'cycle-1-1',
    startDate: new Date(today.getFullYear(), today.getMonth() - 2, 10),
    endDate: new Date(today.getFullYear(), today.getMonth() - 2, 14),
    symptoms: [
      { date: new Date(today.getFullYear(), today.getMonth() - 2, 10), crampLevel: 2, mood: 'Sad' as const },
    ]
  },
  {
    id: 'cycle-1-2',
    startDate: new Date(today.getFullYear(), today.getMonth() - 1, 5),
    endDate: new Date(today.getFullYear(), today.getMonth() - 1, 9),
    symptoms: [
      { date: new Date(today.getFullYear(), today.getMonth() - 1, 5), crampLevel: 3, mood: 'Moody' as const },
      { date: new Date(today.getFullYear(), today.getMonth() - 1, 6), crampLevel: 2, mood: 'Sad' as const },
    ],
  },
  // Current cycle
  {
    id: 'cycle-1-3',
    startDate: new Date(today.getFullYear(), today.getMonth(), 2),
    endDate: new Date(today.getFullYear(), today.getMonth(), 6),
    symptoms: [
        { date: new Date(today.getFullYear(), today.getMonth(), 2), crampLevel: 4, mood: 'Moody' as const },
        { date: new Date(), crampLevel: 2, mood: 'Happy' as const }
    ],
  },
];
let MOCK_CHILDREN: Child[] = [
  {
    id: 'child-1',
    name: 'Olivia',
    parentUid: 'mock-user-id',
    avatarUrl: `https://placehold.co/100x100/e91e63/ffffff.png`,
    cycles: oliviaCycles
  },
  {
    id: 'child-2',
    name: 'Emma',
    parentUid: 'mock-user-id',
    avatarUrl: `https://placehold.co/100x100/3f51b5/ffffff.png`,
    cycles: [
      {
        id: 'cycle-2-1',
        startDate: new Date(today.getFullYear(), today.getMonth(), 20),
        endDate: new Date(today.getFullYear(), today.getMonth(), 24),
        symptoms: [],
      },
    ],
  },
   {
    id: 'child-3',
    name: 'Sophia',
    parentUid: 'mock-user-id',
    avatarUrl: `https://placehold.co/100x100/4caf50/ffffff.png`,
    cycles: [],
  },
];

let MOCK_INVITES: Invite[] = [];


// Helper to get the children collection
const getChildrenCollection = () => collection(db, 'children');
const getInvitesCollection = () => collection(db, 'invites');


// Fetch all children for a given parent user
export const getChildrenForUser = async (userId: string): Promise<Child[]> => {
  if (!isFirebaseConfigured) {
    // Return a copy to avoid direct mutation of the mock data from client components
    return JSON.parse(JSON.stringify(MOCK_CHILDREN));
  }
  try {
    const q = query(getChildrenCollection(), where('parentUid', '==', userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        const convertedData = convertTimestampsToDates(data);
        return { id: doc.id, ...convertedData } as Child;
    });
  } catch (error) {
    console.error("Error fetching children for user:", error);
    return [];
  }
};


// Fetch a single child by its ID
export const getChild = async (childId: string): Promise<Child | null> => {
    if (!isFirebaseConfigured) {
        const child = MOCK_CHILDREN.find(c => c.id === childId) || null;
        return child ? JSON.parse(JSON.stringify(child)) : null;
    }
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

// Fetch a child profile for a given child user UID
export const getChildProfileForChildUser = async (childUid: string): Promise<Child | null> => {
    if (!isFirebaseConfigured) {
        const child = MOCK_CHILDREN.find(c => c.childUid === childUid) || null;
        return child ? JSON.parse(JSON.stringify(child)) : null;
    }
    const q = query(getChildrenCollection(), where('childUid', '==', childUid), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const childDoc = snapshot.docs[0];
    return { id: childDoc.id, ...convertTimestampsToDates(childDoc.data()) } as Child;
}

// Add a new child for a user
export const addChildForUser = async (userId: string, childName: string, avatarUrl: string): Promise<string | null> => {
    if (!isFirebaseConfigured) {
        const newChild: Child = {
            id: `mock-child-${Date.now()}`,
            name: childName,
            avatarUrl: avatarUrl,
            parentUid: userId,
            cycles: [],
        };
        MOCK_CHILDREN.push(newChild);
        console.log(`Demo mode: Added child "${childName}".`);
        return newChild.id;
    }
    try {
        const newChild: Omit<Child, 'id'> = {
            name: childName,
            avatarUrl: avatarUrl,
            cycles: [],
            parentUid: userId,
        };
        const docRef = await addDoc(getChildrenCollection(), newChild);
        return docRef.id;
    } catch (error) {
        console.error("Error adding child:", error);
        return null;
    }
}

// Update a child's document
export const updateChild = async (childId: string, data: Partial<Omit<Child, 'id'>>) => {
    if (!isFirebaseConfigured) {
        const childIndex = MOCK_CHILDREN.findIndex(c => c.id === childId);
        if (childIndex > -1) {
            MOCK_CHILDREN[childIndex] = { ...MOCK_CHILDREN[childIndex], ...data };
            console.log(`Demo mode: Updated child "${childId}" with`, data);
        }
        return;
    }
    try {
        const childDocRef = doc(db, 'children', childId);
        await updateDoc(childDocRef, data);
    } catch (error) {
        console.error("Error updating child:", error);
    }
}


// --- Invitation System ---

export const createInvite = async (parentUid: string, childId: string): Promise<string> => {
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
    const inviteData = {
        parentUid,
        childId,
        status: 'pending',
        createdAt: serverTimestamp()
    };
    const docRef = await addDoc(getInvitesCollection(), inviteData);
    return docRef.id;
}

export const getInvite = async (inviteId: string): Promise<Invite | null> => {
    if (!isFirebaseConfigured) {
        const invite = MOCK_INVITES.find(inv => inv.id === inviteId) || null;
        return invite ? JSON.parse(JSON.stringify(invite)) : null;
    }
    const docRef = doc(db, 'invites', inviteId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...convertTimestampsToDates(docSnap.data()) } as Invite;
}

export const acceptInvite = async (inviteId: string, childUid: string): Promise<void> => {
    if (!isFirebaseConfigured) {
        const inviteIndex = MOCK_INVITES.findIndex(inv => inv.id === inviteId);
        if (inviteIndex > -1) {
            // Mark invite as accepted
            MOCK_INVITES[inviteIndex].status = 'accepted';
            
            // Link the child profile to the new user UID
            const childId = MOCK_INVITES[inviteIndex].childId;
            const childIndex = MOCK_CHILDREN.findIndex(c => c.id === childId);
            if (childIndex > -1) {
                MOCK_CHILDREN[childIndex].childUid = childUid;
            }
        }
        return;
    }
    const batch = writeBatch(db);
    
    // 1. Get the invite
    const inviteRef = doc(db, 'invites', inviteId);
    const inviteSnap = await getDoc(inviteRef);
    if (!inviteSnap.exists() || inviteSnap.data().status !== 'pending') {
        throw new Error("Invite is invalid or has already been accepted.");
    }
    const invite = inviteSnap.data() as Omit<Invite, 'id'>;

    // 2. Update the child document with the new child's UID
    const childRef = doc(db, 'children', invite.childId);
    batch.update(childRef, { childUid: childUid });

    // 3. Update the invite status to "accepted"
    batch.update(inviteRef, { status: 'accepted' });

    await batch.commit();
}
