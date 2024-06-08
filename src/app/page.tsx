'use client'

import LogForm from "@/app/form/log-form";
import {initializeApp} from 'firebase/app';
import {Workout, WorkoutRow} from "@/app/workout";
import {getFirestore} from "@firebase/firestore";
import {GoogleAuthProvider} from "firebase/auth";
import {
    getAuth,
    signInWithRedirect,
    getRedirectResult,
    User,
    UserCredential
} from "firebase/auth";
import {useEffect, useState} from "react";
import WorkoutHistory from "@/app/history/workout-history";
import {add, deleteOne, getMostRecents} from "@/app/firestore/WorkoutFirestore";

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
    let currentUser: User | null = auth1.currentUser;
    let redirectResult: UserCredential | null = null;

    auth1.onAuthStateChanged(user => currentUser = user);


    getRedirectResult(auth1)
        .then((result) => {
            if (result) {
                redirectResult = result;
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential?.accessToken;
                // The signed-in currentUser info.
                const user = result.user;
                // console.log("authenticated: " + JSON.stringify(currentUser));
                // IdP data available using getAdditionalUserInfo(result)
                // ...
                getWorkoutRecentHistory();
            } else {
                console.log("currentUser not authenticated after redirection");
                if (!redirectResult && !currentUser) {
                    const provider = new GoogleAuthProvider();
                    console.log("logging in");

                    try {
                        signInWithRedirect(auth1, provider);
                    } catch (error: any) {
                        console.log("ffs an error occurred")
                        console.log(error)
                    }
                }
            }
        }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log("error: " + errorCode);
        console.log("credential linked to error: " + credential);
    });

    const onWorkoutLog = async (input: { workout: Workout }) => {
        if (currentUser) {
            await add(currentUser.uid, input.workout, db);
            getWorkoutRecentHistory();
        }
    }

    const onWorkoutDelete = async (workoutId: string) => {
        if (currentUser) {
            await deleteOne(workoutId, db);
            getWorkoutRecentHistory();
        }
    }

    const [workoutRecentHistory, setWorkoutRecentHistory] = useState([] as WorkoutRow[]);

    useEffect(() => {
        getWorkoutRecentHistory;
    }, []);

    const getWorkoutRecentHistory = async () => {
        if (currentUser) {
            const mostRecentWorkouts = await getMostRecents(currentUser.uid, 10, db);
            setWorkoutRecentHistory(mostRecentWorkouts);
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24 ">
            <div>
                <h1 className={"text-4xl text-center"}>Workout log</h1>
                <LogForm onWorkoutLog={onWorkoutLog}>
                </LogForm>
                <WorkoutHistory workoutList={workoutRecentHistory}
                                onWorkoutDelete={workoutId => onWorkoutDelete(workoutId)}></WorkoutHistory>
            </div>
        </main>
    );
}
