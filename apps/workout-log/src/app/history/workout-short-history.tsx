import React from "react";
import {Bounce, toast} from "react-toastify";
import {WorkoutRow} from "../workout";
import {RemoveWorkoutButton} from "./remove-workout-button";
import {formatFullDateTime, formatNarrowSmartly} from "../utils/date-utils";
import {groupWorkoutsIntoSessions} from "./workout-session";
import {classifySessionSets} from "./set-intensity";
import {rpeColor} from "../model/rpe";

// The list shows a deliberately compact date; tapping it surfaces the exact date & time.
function showFullDateTime(timestamp: number): void {
    toast.info(formatFullDateTime(timestamp), {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        theme: "light",
        transition: Bounce,
    });
}

interface WorkoutHistoryProps {
    workoutList: WorkoutRow[],
    onWorkoutDelete?: ((workoutId: string) => void),
}

export default function WorkoutShortHistory(props: WorkoutHistoryProps) {
    const {workoutList, onWorkoutDelete} = props;

    const onDelete = async (workoutId: string) => {
        if(!onWorkoutDelete){
            throw new Error("this function should never be called when onWorkoutDelete is null")
        }
        onWorkoutDelete(workoutId)
    };

    const sessions = groupWorkoutsIntoSessions(workoutList);

    return (
        <div>
            <h3 className="text-center">last workouts</h3>
            <div id="workout-history">
                {
                    sessions.map((session) => {
                    const setIntensity = classifySessionSets(session.workouts);
                    return (
                        <section id="workout-session" key={session.startDate} className="mt-4">
                            <h4 className="text-xs uppercase tracking-wide text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-1">
                                {formatNarrowSmartly(session.endDate)}
                                <span className="ml-2 normal-case">· {session.workouts.length} set{session.workouts.length > 1 ? "s" : ""}</span>
                            </h4>
                            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                                {
                                    session.workouts.map((workout) => (
                                        <li id="workout-history-entry" key={workout.id}
                                            className={`py-3 sm:py-4 transition-opacity ${setIntensity.get(workout.id) === "warmup" ? "opacity-40" : ""}`}
                                            title={setIntensity.get(workout.id) === "warmup" ? "warm-up set" : undefined}>
                                            <div className="flex flex-row space-x-4 justify-between">

                                                <button
                                                    type="button"
                                                    className="text-gray-500 hover:underline focus:underline cursor-pointer"
                                                    title="Show full date & time"
                                                    onClick={() => showFullDateTime(workout.value.date)}>
                                                    {formatNarrowSmartly(workout.value.date)}
                                                </button>
                                                <div className="inline-flex min-w-0">
                                                    {workout.value.exercise}
                                                </div>
                                                <div className="space-x-3 flex justify-between">
                                                    <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                        {workout.value.reps}
                                                    </div>
                                                    <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                        x
                                                    </div>
                                                    <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                        {workout.value.weight}
                                                        <p className="text-gray-500 text-sm">kg</p>
                                                    </div>
                                                    {workout.value.rpe !== undefined ?
                                                        <div className="inline-flex items-center justify-center rounded px-1.5 text-xs font-semibold text-black/70"
                                                             style={{backgroundColor: rpeColor(workout.value.rpe)}}
                                                             title="Rate of Perceived Exertion">
                                                            {workout.value.rpe}
                                                        </div>
                                                        : <></>
                                                    }
                                                    <div>
                                                        {onWorkoutDelete ?
                                                            <RemoveWorkoutButton
                                                                onClick={() => onDelete(workout.id)}>
                                                            </RemoveWorkoutButton> : <></>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                }
                            </ul>
                        </section>
                    );
                    })
                }
            </div>
        </div>
    );
}
