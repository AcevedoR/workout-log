import React from "react";
import {WorkoutRow} from "../workout";
import {noop} from "../noop";
import {RemoveWorkoutButton} from "./remove-workout-button";
import {formatNarrowSmartly} from "../utils/date-utils";

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

    return (
        <div>
            <h3 className="text-center">last workouts</h3>
            <ul id="workout-history" role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                {
                    workoutList.map((workout, _i) => (
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
        </div>
    );
}
