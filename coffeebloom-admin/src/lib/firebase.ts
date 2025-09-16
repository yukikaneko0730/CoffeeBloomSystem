// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvzuEsftw9qcdloDhNOJH9-yIi9eiEHGg",
  authDomain: "coffeebloomsystem.firebaseapp.com",
  projectId: "coffeebloomsystem",
  storageBucket: "coffeebloomsystem.firebasestorage.app",
  messagingSenderId: "466487995627",
  appId: "1:466487995627:web:538b365a983c359320a2ae",
  measurementId: "G-NJ24VRJ32T"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);