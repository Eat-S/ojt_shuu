// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'; // Import Firestore service

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfEjIN62cziILtgZ_z6di1yh9MinR_ZaU",
  authDomain: "inventory-beginner.firebaseapp.com",
  projectId: "inventory-beginner",
  storageBucket: "inventory-beginner.firebasestorage.app",
  messagingSenderId: "712568182225",
  appId: "1:712568182225:web:339bcd7ba29836f78f7cf0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
export{ db };
