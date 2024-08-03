'use client'

import LogForm from "./form/log-form";
import {Workout, WorkoutRow} from "./workout";
import {useEffect, useRef, useState} from "react";
import WorkoutHistory from "./history/workout-history";

import {add, deleteOne, findPersonalBest, getMostRecents} from "./firestore/WorkoutFirestore";
import {getLastWorkoutInputInLocalStorage, saveLastWorkoutInputInLocalStorage} from "./local-storage.service";
import InfoTooltip from "./utils/info-tooltip";
import BestWorkoutPerformance from "./workout-overview/best-workout-performance";
import {ClockWatch, ClockWatchRef} from "./clockwatch/clock-watch";
import LogoutButton from "./auth/logout-button";
import {UserID} from "./UserID";
import {db} from "./firebase";
import {appDevelopmentInformations, appShortDescription, isDevModeEnabled} from "./FeaturesConfiguration";
import UsualLiftWidget from "./workout-overview/usual-lift-widget";
import {UsualLift} from "./model/usual-lift";
import {findUsualLiftFromDb} from "./firestore/WorkoutStatisticsFirestore";

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
        findUsualLift(input.workout.exercise);
        resetClockWatch();
    }

    const onExerciseSelected = (e: { exercise: string }) => {
        findBestWorkoutPerformance(e.exercise);
        findUsualLift(e.exercise);
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
        let lastWorkoutInputInLocalStorage = getLastWorkoutInputInLocalStorage();
        if (lastWorkoutInputInLocalStorage) {
            findBestWorkoutPerformance(lastWorkoutInputInLocalStorage.exercise);
            findUsualLift(lastWorkoutInputInLocalStorage.exercise);
        }
    }, []);

    const getWorkoutRecentHistory = async () => {
        console.log("getWorkoutRecentHistory");
        const mostRecentWorkouts = await getMostRecents(userID, 10, db);
        setWorkoutRecentHistory(mostRecentWorkouts);
    }

    const [bestWorkoutPerformance, setBestWorkoutPerformance] = useState<WorkoutRow | undefined>(undefined);
    const [usualLift, setUsualLift] = useState<UsualLift | undefined>(undefined);

    const findBestWorkoutPerformance = async (exercice: string) => {
        setBestWorkoutPerformance(await findPersonalBest(userID, exercice, db));
    }
    const findUsualLift = async (exercice: string) => {
        setUsualLift(await findUsualLiftFromDb(userID, exercice, db));
    }

    const subtitle = <p className="text-xs">{appShortDescription}</p>

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-10 pt-6">
            <div>
                <div className="text-4xl flex justify-center items-center">
                    <h1>
                        Workout log{isDevModeEnabled ? " dev mode" : ""}
                    </h1>
                    <InfoTooltip
                        textToShow={appDevelopmentInformations}></InfoTooltip>
                    <div
                        className="w-12 h-8 ml-6 rounded-md bg-rose-800	 hover:bg-red-700 text-white flex items-center justify-center text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        <LogoutButton></LogoutButton>
                    </div>
                </div>
                <div className="flex flex-row justify-evenly">
                    {bestWorkoutPerformance ?
                        <div
                            className="flex flex-col items-center mt-4">
                            <BestWorkoutPerformance
                                personalBestWorkout={bestWorkoutPerformance.value}></BestWorkoutPerformance>
                        </div>
                        : <></>
                    }
                    {usualLift ?
                        <div
                            className="flex flex-col items-center mt-4">
                            <UsualLiftWidget
                                usualLift={usualLift}></UsualLiftWidget>
                        </div>
                        : <></>
                    }
                </div>
                {!bestWorkoutPerformance && !usualLift ? subtitle : <></>}
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
