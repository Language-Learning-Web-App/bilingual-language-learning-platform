import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
//import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCOPHIPsxDKNfxkGOVDoqWacGOrI1LKl-k",
  authDomain: "languagelearningwebapp-577e2.firebaseapp.com",
  projectId: "languagelearningwebapp-577e2",
  storageBucket: "languagelearningwebapp-577e2.firebasestorage.app",
  messagingSenderId: "670067272595",
  appId: "1:670067272595:web:9a098d88df28509e2dd666",
  measurementId: "G-1ZRGH0YDGH",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
//export const db = getFirestore(app);
export default app;