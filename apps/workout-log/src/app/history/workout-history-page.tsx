'use client'


import WorkoutShortHistory from "./workout-short-history";
import {Firestore} from "@firebase/firestore";
import {UserID} from "../UserID";
import {getMostRecents} from "../firestore/WorkoutFirestore";
import React, {useEffect, useState} from "react";
import {WorkoutRow} from "../workout";

export interface WorkoutHistoryPageProps {
    userID: UserID
    db: Firestore
    exercice: string,
    setDisplayWorkoutHistoryPage: (b: boolean) => void
}

export default function WorkoutHistoryPage(props: WorkoutHistoryPageProps) {
    const {db, userID, exercice, setDisplayWorkoutHistoryPage} = props;

    const [workoutRecentHistory, setWorkoutRecentHistory] = useState([] as WorkoutRow[]);

    const getWorkoutHistory = async () => {
        const mostRecentWorkouts = await getMostRecents(db, userID, 50, {exercise: exercice});
        setWorkoutRecentHistory(mostRecentWorkouts);
    }

    useEffect(() => {
        getWorkoutHistory();
    }, []);

    return (

        <div className="mt-4">
            <h1 className="text-center  text-2xl">Exercise: {exercice}</h1>
            {workoutRecentHistory.length > 0 ?
                <WorkoutShortHistory workoutList={workoutRecentHistory}></WorkoutShortHistory>
                : <div>No workout found</div>
            }
            <button
                onClick={() => setDisplayWorkoutHistoryPage(false)}
                className="rounded-md bg-main px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-main/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                go back
            </button>
        </div>
    );
}
