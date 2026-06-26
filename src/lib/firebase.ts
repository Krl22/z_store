import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { getAnalytics, logEvent, type Analytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, type Messaging } from "firebase/messaging";

export const hasFirebaseEnv = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID
);

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyDemoDemoDemoDemoDemoDemoDemoDemoDemo",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "zeta-dorada-demo.firebaseapp.com",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    "https://zeta-dorada-demo.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "zeta-dorada-demo",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "zeta-dorada-demo.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:123456789012:web:abcdef1234567890abcdef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ZETAV2DEMO",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics: Analytics | null = hasFirebaseEnv
  ? getAnalytics(app)
  : null;
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const storage = getStorage(app);

// Initialize Firebase Cloud Messaging
export const messaging: Messaging | null = hasFirebaseEnv
  ? getMessaging(app)
  : null;

// VAPID key
export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

type EventParams = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(name: string, params?: EventParams) {
  if (!analytics) return;
  logEvent(analytics, name, params);
}
