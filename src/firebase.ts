import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);
}

function getApp() {
  if (!isFirebaseConfigured()) return null;
  app ??= initializeApp(firebaseConfig);
  return app;
}

export function listenToUser(callback: (user: User | null) => void) {
  const activeApp = getApp();
  if (!activeApp) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(getAuth(activeApp), callback);
}

export async function loginWithGoogle() {
  const activeApp = getApp();
  if (!activeApp) return null;
  const credential = await signInWithPopup(getAuth(activeApp), new GoogleAuthProvider());
  return credential.user;
}

export async function logout() {
  const activeApp = getApp();
  if (!activeApp) return;
  await signOut(getAuth(activeApp));
}

export async function saveStudySession(userId: string, payload: { focusArea: string; selectedCondition: string }) {
  const activeApp = getApp();
  if (!activeApp) return;
  const db = getFirestore(activeApp);
  await setDoc(doc(db, "users", userId, "studySessions", crypto.randomUUID()), {
    ...payload,
    savedAt: serverTimestamp(),
    source: "health-info-web",
    schemaVersion: 1,
  });
}

