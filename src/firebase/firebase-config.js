// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALdBZSPLS989MdYZzWHEQx-RFvDsp4LnE",
  authDomain: "superpanda-f8fd1.firebaseapp.com",
  projectId: "superpanda-f8fd1",
  storageBucket: "superpanda-f8fd1.firebasestorage.app",
  messagingSenderId: "325605002296",
  appId: "1:325605002296:web:ee73958864b461e1a32acd",
  measurementId: "G-F10BHW16DF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
