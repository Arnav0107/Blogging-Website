// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdQpQgIEPShgTuqyBH-WbakwWjTpQ2j8E",
  authDomain: "react-js-blog-website-82fff.firebaseapp.com",
  projectId: "react-js-blog-website-82fff",
  storageBucket: "react-js-blog-website-82fff.firebasestorage.app",
  messagingSenderId: "562783344550",
  appId: "1:562783344550:web:68b8fd848c75e59381e167"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// google auth
const provider = new GoogleAuthProvider();
const auth = getAuth(app);

export const authWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result; // return full result
  } catch (err) {
    console.log(err);
  }
};