import { db } from './client';
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


// Helper to get the children subcollection for a user
const getChildrenCollection = (userId: string) => {
    return collection(db, 'users', userId, 'children');
}

// Fetch all children for a given user
export const getChildrenForUser = async (userId: string): Promise<Child[]> => {
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
export const addChildForUser = async (userId: string, childName: string): Promise<string | null> => {
    try {
        const childrenCollection = getChildrenCollection(userId);
        const newChild: Omit<Child, 'id'> = {
            name: childName,
            avatarUrl: `https://placehold.co/100x100.png`,
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
    try {
        const childDocRef = doc(db, 'users', userId, 'children', childId);
        await updateDoc(childDocRef, data);
    } catch (error) {
        console.error("Error updating child:", error);
    }
}
