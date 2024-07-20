'use client'

import LogForm from "@/app/form/log-form";
import {initializeApp} from 'firebase/app';
import {Workout, WorkoutRow} from "@/app/workout";
import {getFirestore} from "@firebase/firestore";
import {getAuth} from "firebase/auth";
import {useEffect, useRef, useState} from "react";
import WorkoutHistory from "@/app/history/workout-history";
import {add, deleteOne, findPersonalBest, getMostRecents} from "@/app/firestore/WorkoutFirestore";
import {getLastWorkoutInputInLocalStorage, saveLastWorkoutInputInLocalStorage} from "@/app/local-storage.service";
import InfoTooltip from "@/app/utils/info-tooltip";
import BestWorkoutPerformance from "@/app/workout-overview/best-workout-performance";
import {ClockWatch, ClockWatchRef} from "@/app/clockwatch/clock-watch";
import LogoutButton from "@/app/auth/logout-button";

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


    const onWorkoutLog = async (input: { workout: Workout }) => {
        if (auth1.currentUser) {
            await add(auth1.currentUser.uid, input.workout, db);
            saveLastWorkoutInputInLocalStorage(input.workout);
            getWorkoutRecentHistory();
            findBestWorkoutPerformance(input.workout.exercise);
            resetClockWatch();
        }
    }

    const onExerciseSelected = (e: { exercise: string }) => {
        findBestWorkoutPerformance(e.exercise);
    }

    const onWorkoutDelete = async (workoutId: string) => {
        if (auth1.currentUser) {
            await deleteOne(workoutId, db);
            getWorkoutRecentHistory();
        }
    }

    const clockWatchChildRef = useRef<ClockWatchRef>(null)
    const resetClockWatch = (): void => {
        clockWatchChildRef?.current?.resetClockWatch();
    };

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

    const [bestWorkoutPerformance, setBestWorkoutPerformance] = useState<WorkoutRow | undefined>(undefined);
    const findBestWorkoutPerformance = async (exercice: string) => {
        if (auth1.currentUser) {
            setBestWorkoutPerformance(await findPersonalBest(auth1.currentUser.uid, exercice, db));
        }
    }

    const subtitle = <p>A simple app to help you log your workout sessions</p>

    const bestWorkoutPerformanceWidget = (bestWorkoutPerformance: Workout) => <div
        className="flex flex-col items-center mt-4">
        <BestWorkoutPerformance personalBestWorkout={bestWorkoutPerformance}></BestWorkoutPerformance>
    </div>;

    getWorkoutRecentHistory();

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-10 pt-6">
            <div>
                <div className="text-4xl flex justify-center">
                    <h1>
                        Workout log
                    </h1>
                    <InfoTooltip
                        textToShow={"Hey, this minimalistic app is still in early development, the code source is open source and available here: https://github.com/AcevedoR/workout-log"}></InfoTooltip>
                    <div className="ml-10 rounded-md bg-red-500 hover:bg-red-700 text-white px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        <LogoutButton></LogoutButton>
                    </div>
                </div>
                {bestWorkoutPerformance ? bestWorkoutPerformanceWidget(bestWorkoutPerformance.value) : subtitle}
                <ClockWatch lastWorkoutDate={getLastWorkoutInputInLocalStorage()?.date}
                            ref={clockWatchChildRef}></ClockWatch>
                <div>
                    <LogForm onWorkoutLog={onWorkoutLog} onExerciseSelected={onExerciseSelected}
                             lastWorkoutInput={getLastWorkoutInputInLocalStorage()}>
                    </LogForm>
                </div>
                <WorkoutHistory workoutList={workoutRecentHistory}
                                onWorkoutDelete={workoutId => onWorkoutDelete(workoutId)}></WorkoutHistory>
            </div>
        </main>
    );
}
