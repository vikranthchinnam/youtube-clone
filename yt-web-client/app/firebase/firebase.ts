// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBafUz8lPYSCqO1wb01nPcHhaQh2jSPV7Y",
  authDomain: "yt-clone-b0069.firebaseapp.com",
  projectId: "yt-clone-b0069",
  appId: "1:855892590542:web:b92953adf942c165bc359f",
  measurementId: "G-4B4789VKE1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const auth = getAuth(app);

/**
 * Signs the user in with a Google popup.
 * @returns A promise that resolves with the user's credentials.
 */
export function SignInWithGoogle(){
    return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Signs the user out.
 * @returns A promise that resolves when the user is signed out.
 */
export function signOut(){
    return auth.signOut();
}

/**
 * Trigger a
 * @param callback when user auth state changes.
 * @returns A function to unsubscribe the callback. 
 */
export function onAuthStateChangedHelper(callback: (user:User | null) => void){
    return onAuthStateChanged(auth, callback);
}