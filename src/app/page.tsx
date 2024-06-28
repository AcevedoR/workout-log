'use client'

import LogForm from "@/app/form/log-form";
import {initializeApp} from 'firebase/app';
import {Workout, WorkoutRow} from "@/app/workout";
import {getFirestore} from "@firebase/firestore";
import {getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import {useEffect, useState} from "react";
import WorkoutHistory from "@/app/history/workout-history";
import {add, deleteOne, findBestPerformance, getMostRecents} from "@/app/firestore/WorkoutFirestore";
import {getLastWorkoutInputInLocalStorage, saveLastWorkoutInputInLocalStorage} from "@/app/local-storage.service";
import InfoTooltip from "@/app/utils/info-tooltip";
import BestWorkoutPerformance from "@/app/workout-overview/best-workout-performance";

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


    if (!auth1.currentUser) {
        const provider = new GoogleAuthProvider();
        console.log("logging in");

        try {
            signInWithPopup(auth1, provider)
                .then((result) => {
                    // This gives you a Google Access Token. You can use it to access the Google API.
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    const token = credential?.accessToken;
                    // The signed-in user info.
                    const user = result.user;
                    // console.log("authenticated: " + JSON.stringify(user));
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

    const onWorkoutLog = async (input: { workout: Workout }) => {
        if (auth1.currentUser) {
            await add(auth1.currentUser.uid, input.workout, db);
            saveLastWorkoutInputInLocalStorage(input.workout);
            getWorkoutRecentHistory();
        }
    }

    const onWorkoutDelete = async (workoutId: string) => {
        if (auth1.currentUser) {
            await deleteOne(workoutId, db);
            getWorkoutRecentHistory();
        }
    }

    const [workoutRecentHistory, setWorkoutRecentHistory] = useState([] as WorkoutRow[]);

    useEffect(() => {
        getWorkoutRecentHistory;
    }, []);

    const getWorkoutRecentHistory = async () => {
        if (auth1.currentUser) {
            const mostRecentWorkouts = await getMostRecents(auth1.currentUser.uid, 10, db);
            setWorkoutRecentHistory(mostRecentWorkouts);
        }
    }

    const [bestWorkoutPerformance, setBestWorkoutPerformance] = useState<WorkoutRow|undefined>(undefined);
    const findBestWorkoutPerformance = async (exercice: string) => {
        if (auth1.currentUser) {
            setBestWorkoutPerformance(await findBestPerformance(auth1.currentUser.uid, exercice, db));
        }
    }

    const bestWorkoutPerformanceWidget = <div
        className="ml-20 log-form flex flex-col items-center border-b border-gray-900/10 pb-6 mt-4 gap-x-6 gap-y-8 sm:grid-cols-6">
        <BestWorkoutPerformance personalBestWorkout={{
            exercise: 'deadlift',
            weight: 120,
            reps: 1,
            date: Date.now()
        }}></BestWorkoutPerformance>
    </div>;

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-10 pt-6">
            <div>
                <div className="text-4xl flex justify-center">
                    <h1>
                        Workout log
                    </h1>
                    <InfoTooltip
                        textToShow={"Hey, this minimalistic app is still in early development, the code source is open source and available here: https://github.com/AcevedoR/workout-log"}></InfoTooltip>
                </div>
                <p>A simple app to help you log your workout sessions</p>
                <div>
                    <LogForm onWorkoutLog={onWorkoutLog} lastWorkoutInput={getLastWorkoutInputInLocalStorage()}>
                    </LogForm>
                    {/*feature disabled for now*/}
                    {false ? bestWorkoutPerformanceWidget : <div></div>}
                </div>
                <WorkoutHistory workoutList={workoutRecentHistory}
                                onWorkoutDelete={workoutId => onWorkoutDelete(workoutId)}></WorkoutHistory>
            </div>
        </main>
    );
}
