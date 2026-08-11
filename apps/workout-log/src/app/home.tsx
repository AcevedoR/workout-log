'use client'

import LogForm from "./form/log-form";
import {Workout, WorkoutRow} from "./workout";
import React, {useEffect, useMemo, useRef, useState} from "react";
import WorkoutShortHistory from "./history/workout-short-history";

import {add, deleteOne, findPersonalBest, getMostRecents} from "./firestore/WorkoutFirestore";
import {getLastWorkoutInputInLocalStorage, saveLastWorkoutInputInLocalStorage} from "./local-storage.service";
import InfoTooltip from "./utils/info-tooltip";
import BestWorkoutPerformance from "./workout-overview/best-workout-performance";
import {ClockWatch, ClockWatchRef} from "./clockwatch/clock-watch";
import LogoutButton from "./auth/logout-button";
import {UserID} from "./UserID";
import {db} from "./firebase";
import {appDevelopmentInformations, isDevModeEnabled} from "./FeaturesConfiguration";
import UsualLiftWidget from "./workout-overview/usual-lift-widget";
import {UsualLift} from "./model/usual-lift";
import {findUsualLiftFromDb} from "./firestore/WorkoutStatisticsFirestore";
import WorkoutHistoryPage from "./history/workout-history-page";
import WeeklySessionCounter from "./workout-overview/weekly-session-counter";
import {findOngoingSession} from "./history/workout-session";

export interface HomeProps {
    userID: UserID
}

// How many recent workouts to fetch. Larger than what the short history shows, so the weekly
// session counter has enough data to count every session since Monday.
const WORKOUT_FETCH_LIMIT = 50;
// How many recent workouts the "last workouts" list renders (the rest only feed the weekly counter).
const SHORT_HISTORY_LIMIT = 20;

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

    const [displayWorkoutHistoryPage, setDisplayWorkoutHistoryPage] = useState<boolean>(false);
    const [currentSelectedExercise, setCurrentSelectedExercise] = useState<string | null>(null);
    const onExerciseSelected = (e: { exercise: string }) => {
        setCurrentSelectedExercise(e.exercise)
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
            setCurrentSelectedExercise(lastWorkoutInputInLocalStorage.exercise)
        }
    }, []);

    const getWorkoutRecentHistory = async () => {
        console.log("getWorkoutRecentHistory");
        // Fetch a wider window than we display so the weekly session counter can see every set logged
        // this week (a busy week easily exceeds the handful of rows shown in the short history).
        const mostRecentWorkouts = await getMostRecents(db, userID, WORKOUT_FETCH_LIMIT);
        setWorkoutRecentHistory(mostRecentWorkouts);
    }

    const [bestWorkoutPerformance, setBestWorkoutPerformance] = useState<WorkoutRow | undefined>(undefined);
    const [usualLift, setUsualLift] = useState<UsualLift | undefined>(undefined);

    // Distinct exercises the user has logged (within the fetched window), with counts, so the log
    // form can suggest and rank the exercises they actually use alongside the shipped catalog.
    const knownExercises = useMemo(() => {
        const counts = new Map<string, number>();
        for (const row of workoutRecentHistory) {
            const name = row.value.exercise;
            counts.set(name, (counts.get(name) ?? 0) + 1);
        }
        return Array.from(counts.entries()).map(([name, count]) => ({name, count}));
    }, [workoutRecentHistory]);

    // The session the user is training in right now, if any — recomputed whenever a new set lands, so the
    // displayed session duration starts from the first set of the current gym visit.
    const ongoingSession = useMemo(() => findOngoingSession(workoutRecentHistory), [workoutRecentHistory]);

    const findBestWorkoutPerformance = async (exercice: string) => {
        setBestWorkoutPerformance(await findPersonalBest(userID, exercice, db));
    }
    const findUsualLift = async (exercice: string) => {
        setUsualLift(await findUsualLiftFromDb(userID, exercice, db));
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-5 pt-4 sm:p-10 sm:pt-6">
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

                {displayWorkoutHistoryPage && currentSelectedExercise ?
                    <WorkoutHistoryPage db={db} userID={userID} exercice={currentSelectedExercise}
                                        setDisplayWorkoutHistoryPage={setDisplayWorkoutHistoryPage}></WorkoutHistoryPage>
                    :
                    <>
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
                        <ClockWatch getLastWorkoutDate={() => getLastWorkoutInputInLocalStorage()?.date}
                                    ref={clockWatchChildRef}
                                    sessionStartDate={ongoingSession?.startDate}
                                    trailing={<WeeklySessionCounter workoutList={workoutRecentHistory}></WeeklySessionCounter>}></ClockWatch>
                        <div>
                            <LogForm onWorkoutLog={onWorkoutLog} onExerciseSelected={onExerciseSelected}
                                     lastWorkoutInput={getLastWorkoutInputInLocalStorage()}
                                     canShowExerciseHistory={!!currentSelectedExercise}
                                     knownExercises={knownExercises}
                                     onShowExerciseHistory={() => setDisplayWorkoutHistoryPage(true)}>
                            </LogForm>
                        </div>
                        <WorkoutShortHistory workoutList={workoutRecentHistory.slice(0, SHORT_HISTORY_LIMIT)}
                                             onWorkoutDelete={workoutId => onWorkoutDelete(workoutId)}></WorkoutShortHistory>
                    </>
                }
            </div>
        </main>
    )
        ;
}
