import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import "firebase/firestore";

// Initialize Firebase
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env
    .VITE_FIREBASE_MESSAGING_SENDER_ID as string,
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

const messaging = getMessaging();

export const requestForToken = async () => {
  // The method getToken(): Promise<string> allows FCM to use the VAPID key credential
  // when sending message requests to different push services
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    }); //to authorize send requests to supported web push services
    if (currentToken) {
      console.log("current token for client: ", currentToken);

      if (
        localStorage.getItem("fcmToken") &&
        currentToken !== localStorage.getItem("fcmToken")
      ) {
        localStorage.setItem("fcmToken", currentToken);
      } else if (!localStorage.getItem("fcmToken")) {
        localStorage.setItem("fcmToken", currentToken);
      }
    } else {
      console.log(
        "No registration token available. Request permission to generate one."
      );
    }
  } catch (err) {
    console.log("An error occurred while retrieving token. ", err);
  }
};

// Handle incoming messages. Called when:
// - a message is received while the app has focus
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
