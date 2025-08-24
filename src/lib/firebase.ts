// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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
