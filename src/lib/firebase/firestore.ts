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
} from 'firebase/firestore';
import type { Child } from '@/lib/types';

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
const getMockChildren = (): Child[] => {
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
  return [
    {
      id: 'child-1',
      name: 'Olivia',
      avatarUrl: `https://placehold.co/100x100/e91e63/ffffff.png`,
      cycles: oliviaCycles
    },
    {
      id: 'child-2',
      name: 'Emma',
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
      avatarUrl: `https://placehold.co/100x100/4caf50/ffffff.png`,
      cycles: [],
    },
  ];
};


// Helper to get the children subcollection for a user
const getChildrenCollection = (userId: string) => {
    return collection(db, 'users', userId, 'children');
}

// Fetch all children for a given user
export const getChildrenForUser = async (userId: string): Promise<Child[]> => {
  if (!isFirebaseConfigured) {
    return getMockChildren();
  }
  try {
    const childrenCollection = getChildrenCollection(userId);
    const snapshot = await getDocs(query(childrenCollection));
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        const convertedData = convertTimestampsToDates(data);
        return {
            id: doc.id,
            ...convertedData,
        } as Child;
    });
  } catch (error) {
    console.error("Error fetching children for user:", error);
    return [];
  }
};

// Fetch a single child for a user
export const getChildForUser = async (userId: string, childId: string): Promise<Child | null> => {
    if (!isFirebaseConfigured) {
        return getMockChildren().find(c => c.id === childId) || null;
    }
    try {
        const childDocRef = doc(db, 'users', userId, 'children', childId);
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

// Add a new child for a user
export const addChildForUser = async (userId: string, childName: string, avatarUrl: string): Promise<string | null> => {
    if (!isFirebaseConfigured) {
        console.log(`Demo mode: Would add child "${childName}". This is not saved.`);
        return `mock-child-${Date.now()}`;
    }
    try {
        const childrenCollection = getChildrenCollection(userId);
        const newChild: Omit<Child, 'id'> = {
            name: childName,
            avatarUrl: avatarUrl,
            cycles: []
        };
        const docRef = await addDoc(childrenCollection, newChild);
        return docRef.id;
    } catch (error) {
        console.error("Error adding child:", error);
        return null;
    }
}

// Update a child's document
export const updateChild = async (userId: string, childId: string, data: Partial<Omit<Child, 'id'>>) => {
    if (!isFirebaseConfigured) {
        console.log(`Demo mode: Would update child "${childId}" with`, data, " This is not saved.");
        return;
    }
    try {
        const childDocRef = doc(db, 'users', userId, 'children', childId);
        await updateDoc(childDocRef, data);
    } catch (error) {
        console.error("Error updating child:", error);
    }
}
