// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApcOnA4L8KmmkPcQ-FN4CisFvApTNURtA",
  authDomain: "xpensex-180dc.firebaseapp.com",
  projectId: "xpensex-180dc",
  storageBucket: "xpensex-180dc.firebasestorage.app",
  messagingSenderId: "731301351931",
  appId: "1:731301351931:web:95e9acc364d72796eafb5e",
  measurementId: "G-EP0BNMRVNB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };