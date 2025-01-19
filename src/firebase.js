// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB5fdJcpD6wWp9Xdx64QB-Gj5QxAxXvjsM",
  authDomain: "kminventory-b2d6e.firebaseapp.com",
  projectId: "kminventory-b2d6e",
  storageBucket: "kminventory-b2d6e.firebasestorage.app",
  messagingSenderId: "871145541581",
  appId: "1:871145541581:web:bc5e4187bd4a451845be84"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };