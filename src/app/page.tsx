'use client'

import LogForm from "@/app/form/log-form";
import {initializeApp} from 'firebase/app';
import {Workout} from "@/app/workout";
import {getFirestore} from "@firebase/firestore";
import {GoogleAuthProvider} from "firebase/auth";
import {
    getAuth,
    signInWithPopup
} from "firebase/auth";
import {useEffect, useState} from "react";
import WorkoutHistory from "@/app/workout-history";
import {add, getMostRecents} from "@/app/firestore/WorkoutFirestore";

export default function Home() {
    const firebaseConfig = {
        apiKey: "AIzaSyCeV1giwlkriJuW3MU-w1jHQCf0NpJHvy0",
        authDomain: "workout-log-424900.firebaseapp.com",
        projectId: "workout-log-424900",
        storageBucket: "workout-log-424900.appspot.com",
        messagingSenderId: "705852313714",
        appId: "1:705852313714:web:9edcd23401115820e5f2eb"
    };
    const firebase = initializeApp(firebaseConfig);
    let auth1 = getAuth(firebase);
    const db = getFirestore(firebase);

    const [aaa, setAaa] = useState(false);

    if (!aaa && !auth1.currentUser) {
        const provider = new GoogleAuthProvider();
        console.log("logging in");
        setAaa(true);

        try {
            signInWithPopup(auth1, provider)
                .then((result) => {
                    // This gives you a Google Access Token. You can use it to access the Google API.
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    const token = credential?.accessToken;
                    // The signed-in user info.
                    const user = result.user;
                    console.log("authenticated: " + user);
                    // IdP data available using getAdditionalUserInfo(result)
                    // ...
                    getWorkoutRecentHistory();
                }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const credential = GoogleAuthProvider.credentialFromError(error);
                console.log("error: " + errorCode);
                console.log("credential linked to error: " + credential);
            });
        } catch (error: any) {
            console.log("ffs an error occurred")
            console.log(error)
        }
    }
    console.log("main page user: " + auth1.currentUser?.email);

    const onWorkoutLog = async (input: { workout: Workout }) => {
        await add(input.workout, db);
        getWorkoutRecentHistory();
    }


    const [workoutRecentHistory, setWorkoutRecentHistory] = useState([] as Workout[]);

    useEffect(() => {
        getWorkoutRecentHistory();
    }, []);

    const getWorkoutRecentHistory = async () => {
        const mostRecentWorkouts = await getMostRecents(10, db);
        setWorkoutRecentHistory(mostRecentWorkouts);
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24 ">

            <script src="bower_components/firebaseui/dist/firebaseui.js"></script>
            <link type="text/css" rel="stylesheet" href="bower_components/firebaseui/dist/firebaseui.css"/>

            <div>
                <h1 className={"text-4xl text-center"}>Workout log</h1>
                <LogForm onWorkoutLog={onWorkoutLog}>
                </LogForm>
                <WorkoutHistory workoutList={workoutRecentHistory}></WorkoutHistory>
            </div>
        </main>
    );
}
