
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// NOTE: In a real app, you would not want to do this.
// This is for demonstration purposes to create users if they don't exist.
export const seedAuth = async () => {
    try {
        await signInWithEmailAndPassword(auth, 'admin@gudang.com', 'password123');
    } catch (error) {
        console.log("Admin user not found, creating it.");
        await createUserWithEmailAndPassword(auth, 'admin@gudang.com', 'password123');
    }

    try {
        await signInWithEmailAndPassword(auth, 'user@gudang.com', 'password123');
    } catch (error) {
        console.log("Regular user not found, creating it.");
        await createUserWithEmailAndPassword(auth, 'user@gudang.com', 'password123');
    }

     try {
        await signInWithEmailAndPassword(auth, 'helpdesk@gudang.com', 'password123');
    } catch (error) {
        console.log("Helpdesk user not found, creating it.");
        await createUserWithEmailAndPassword(auth, 'helpdesk@gudang.com', 'password123');
    }
};

if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence);
}
