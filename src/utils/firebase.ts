import { initializeApp } from "firebase/app";
import { getAuth /*, initializeAuth*/ } from "firebase/auth";
import { getStorage } from "firebase/storage";
import "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

const firebase = initializeApp(firebaseConfig);

export const app = firebase;

export const auth = getAuth(app);

// Export function to initialize Firebase
export const initFirebase = () => {
  return app;
};

export const storageDb = getStorage(app);
