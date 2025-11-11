import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCrlWwKC1D1Evpz1WK6xwbEEI5xevGJY2U",
  authDomain: "speakzy-ae5fa.firebaseapp.com",
  projectId: "speakzy-ae5fa",
  storageBucket: "speakzy-ae5fa.firebasestorage.app",
  messagingSenderId: "144287210535",
  appId: "1:144287210535:web:efd9c03a3849b04b17c202",
  measurementId: "G-7T4SHBPRKS"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleprovider = new GoogleAuthProvider(app);
export const database = getFirestore(app);