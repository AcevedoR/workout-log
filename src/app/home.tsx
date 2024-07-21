'use client'

import LogForm from "@/app/form/log-form";
import {Workout, WorkoutRow} from "@/app/workout";
import {useEffect, useRef, useState} from "react";
import WorkoutHistory from "@/app/history/workout-history";

import {add, deleteOne, findPersonalBest, getMostRecents} from "@/app/firestore/WorkoutFirestore";
import {getLastWorkoutInputInLocalStorage, saveLastWorkoutInputInLocalStorage} from "@/app/local-storage.service";
import InfoTooltip from "@/app/utils/info-tooltip";
import BestWorkoutPerformance from "@/app/workout-overview/best-workout-performance";
import {ClockWatch, ClockWatchRef} from "@/app/clockwatch/clock-watch";
import LogoutButton from "@/app/auth/logout-button";
import {UserID} from "@/app/UserID";
import {db} from "@/app/firebase";
import {appShortDescription} from "@/app/FeaturesConfiguration";

export interface HomeProps {
    userID: UserID
}

export default function Home(props: HomeProps) {
    const {userID} = props;

    const onWorkoutLog = async (input: { workout: Workout }) => {
        await add(userID, input.workout, db);
        saveLastWorkoutInputInLocalStorage(input.workout);
        getWorkoutRecentHistory();
        findBestWorkoutPerformance(input.workout.exercise);
        resetClockWatch();
    }

    const onExerciseSelected = (e: { exercise: string }) => {
        findBestWorkoutPerformance(e.exercise);
    }

    const onWorkoutDelete = async (workoutId: string) => {
        await deleteOne(workoutId, db);
        getWorkoutRecentHistory();
    }

    const clockWatchChildRef = useRef<ClockWatchRef>(null)
    const resetClockWatch = (): void => {
        clockWatchChildRef?.current?.resetClockWatch();
    };

    const [workoutRecentHistory, setWorkoutRecentHistory] = useState([] as WorkoutRow[]);

    useEffect(() => {
        getWorkoutRecentHistory();
    }, []);

    const getWorkoutRecentHistory = async () => {
        console.log("getWorkoutRecentHistory");
        const mostRecentWorkouts = await getMostRecents(userID, 10, db);
        setWorkoutRecentHistory(mostRecentWorkouts);
    }

    const [bestWorkoutPerformance, setBestWorkoutPerformance] = useState<WorkoutRow | undefined>(undefined);
    const findBestWorkoutPerformance = async (exercice: string) => {
        setBestWorkoutPerformance(await findPersonalBest(userID, exercice, db));
    }

    const subtitle = <p className="text-xs">{appShortDescription}</p>

    const bestWorkoutPerformanceWidget = (bestWorkoutPerformance: Workout) => <div
        className="flex flex-col items-center mt-4">
        <BestWorkoutPerformance personalBestWorkout={bestWorkoutPerformance}></BestWorkoutPerformance>
    </div>;

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-10 pt-6">
            <div>
                <div className="text-4xl flex justify-center items-center">
                    <h1>
                        Workout log
                    </h1>
                    <InfoTooltip
                        textToShow={"Hey, this minimalistic app is still in early development, the code source is open source and available here: https://github.com/AcevedoR/workout-log"}></InfoTooltip>
                    <div
                        className="w-12 h-8 ml-6 rounded-md bg-rose-800	 hover:bg-red-700 text-white flex items-center justify-center text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        <LogoutButton></LogoutButton>
                    </div>
                </div>
                {bestWorkoutPerformance ? bestWorkoutPerformanceWidget(bestWorkoutPerformance.value) : subtitle}
                <ClockWatch getLastWorkoutDate={() => getLastWorkoutInputInLocalStorage()?.date}
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
