// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {connectAuthEmulator, getAuth} from "firebase/auth";
import {connectFirestoreEmulator, getFirestore} from "@firebase/firestore";
import {isDevModeEnabled} from "./FeaturesConfiguration";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCeV1giwlkriJuW3MU-w1jHQCf0NpJHvy0",
    authDomain: "workout-log-424900.firebaseapp.com",
    projectId: "workout-log-424900",
    storageBucket: "workout-log-424900.appspot.com",
    messagingSenderId: "705852313714",
    appId: "1:705852313714:web:9edcd23401115820e5f2eb"
};

// Initialize Firebase
export const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
export const db = getFirestore(firebase);

if (isDevModeEnabled) {
    console.warn("running in Firebase emulated mode for auth");
    connectAuthEmulator(auth, 'http://192.168.243.20:9099');
    connectFirestoreEmulator(db, '192.168.243.20', 9098);
}

export const getWorkoutLogAuth = () => {
    return auth;
}