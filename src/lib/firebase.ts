
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, inMemoryPersistence, setPersistence } from 'firebase/auth';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: 'gudang-pintar-3f8yl',
  appId: '1:448507006798:web:c26eec14d9d56fbaa0181f',
  storageBucket: 'gudang-pintar-3f8yl.firebasestorage.app',
  apiKey: 'AIzaSyDqV26E8CZWtU10Dhf1L0WEA6vWZWNPbOE',
  authDomain: 'gudang-pintar-3f8yl.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '448507006798',
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
};

if (typeof window !== 'undefined') {
    setPersistence(auth, inMemoryPersistence);
}
