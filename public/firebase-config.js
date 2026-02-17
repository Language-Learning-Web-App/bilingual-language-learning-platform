// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOPHIPsxDKNfxkGOVDoqWacGOrI1LKl-k",
  authDomain: "languagelearningwebapp-577e2.firebaseapp.com",
  projectId: "languagelearningwebapp-577e2",
  storageBucket: "languagelearningwebapp-577e2.firebasestorage.app",
  messagingSenderId: "670067272595",
  appId: "1:670067272595:web:9a098d88df28509e2dd666",
  measurementId: "G-1ZRGH0YDGH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);