// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCeV1giwlkriJuW3MU-w1jHQCf0NpJHvy0",
    authDomain: "workout-log-git-try-acevedors-projects.vercel.app",
    projectId: "workout-log-424900",
    storageBucket: "workout-log-424900.appspot.com",
    messagingSenderId: "705852313714",
    appId: "1:705852313714:web:9edcd23401115820e5f2eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
