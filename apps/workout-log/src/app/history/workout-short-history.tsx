import React from "react";
import {WorkoutRow} from "../workout";
import {RemoveWorkoutButton} from "./remove-workout-button";
import {formatNarrowSmartly} from "../utils/date-utils";
import {groupWorkoutsIntoSessions} from "./workout-session";

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
                    sessions.map((session) => (
                        <section id="workout-session" key={session.startDate} className="mt-4">
                            <h4 className="text-xs uppercase tracking-wide text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-1">
                                {formatNarrowSmartly(session.endDate)}
                                <span className="ml-2 normal-case">· {session.workouts.length} set{session.workouts.length > 1 ? "s" : ""}</span>
                            </h4>
                            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                                {
                                    session.workouts.map((workout) => (
                                        <li id="workout-history-entry" key={workout.id} className="py-3 sm:py-4">
                                            <div className="flex flex-row space-x-4 justify-between">

                                                <div className="text-gray-500">
                                                    {formatNarrowSmartly(workout.value.date)}
                                                </div>
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
                    ))
                }
            </div>
        </div>
    );
}
