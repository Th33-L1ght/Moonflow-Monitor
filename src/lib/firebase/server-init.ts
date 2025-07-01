
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

// This function is self-contained and handles all server-side Firebase initialization.
// It uses a singleton pattern to ensure that it only initializes the app once.
export function getDb(): Firestore | null {
    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const isConfigured = Object.values(firebaseConfig).every(
      (value) => value && !value.startsWith('YOUR_')
    );

    if (!isConfigured) {
        console.warn("Firebase is not configured. Server-side DB operations will be skipped.");
        return null;
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    return getFirestore(app);
}
