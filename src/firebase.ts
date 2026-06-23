import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "atlantean-return-jnmq3",
  appId: "1:1004088073819:web:eb4e7e90fe4bf1c397e97e",
  apiKey: "AIzaSyC0hrfx2PREVSlBgGP6NFY4U_6f4TSiKPg",
  authDomain: "atlantean-return-jnmq3.firebaseapp.com",
  storageBucket: "atlantean-return-jnmq3.firebasestorage.app",
  messagingSenderId: "1004088073819"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore targeting the custom database provisioned specifically for this applet
export const db = getFirestore(app, "ai-studio-feb4824c-fd48-403e-bd89-2a818f38dbee");

