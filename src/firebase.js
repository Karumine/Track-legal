import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAjEomo7QTtjUCgREQG0A9y5mHXmwtvXEY",
  authDomain: "legal-task-tracker.firebaseapp.com",
  projectId: "legal-task-tracker",
  storageBucket: "legal-task-tracker.firebasestorage.app",
  messagingSenderId: "398475492694",
  appId: "1:398475492694:web:7f80914d8787db2d8aaaf7",
  measurementId: "G-4GC06QBFBX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export default app;
