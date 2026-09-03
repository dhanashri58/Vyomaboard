import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBFBV6B6Ifo2DyWLwlVdg7stetC6dkJbak",
  authDomain: "sync-nexus-1a92b.firebaseapp.com",
  projectId: "sync-nexus-1a92b",
  storageBucket: "sync-nexus-1a92b.firebasestorage.app",
  messagingSenderId: "98483375256",
  appId: "1:98483375256:web:411c685bbbd5349646d4ed",
  measurementId: "G-L5GKKRGEFZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
