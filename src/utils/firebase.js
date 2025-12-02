// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAV7ThrKVFxrxozSD3s6XGsq2OYKhma1s4",
  authDomain: "estateproo.firebaseapp.com",
  projectId: "estateproo",
  storageBucket: "estateproo.firebasestorage.app",
  messagingSenderId: "49701011592",
  appId: "1:49701011592:web:c8bdac5dc5f7897eb5df3d",
  measurementId: "G-T2VHRW4ETV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
