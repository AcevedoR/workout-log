import React from "react";
import {WorkoutRow} from "@/app/workout";
import {noop} from "@/app/noop";
import {RemoveWorkoutButton} from "@/app/history/remove-workout-button";

interface WorkoutHistoryProps {
    workoutList: WorkoutRow[],
    onWorkoutDelete: (workoutId: string) => void,
}

export default function WorkoutHistory(props: WorkoutHistoryProps) {
    const {workoutList, onWorkoutDelete = noop} = props;

    const onDelete = async (workoutId: string) => {
        onWorkoutDelete(workoutId)
    };

    return (
        <div>
            <h3 className="text-center">last workouts</h3>
            {
                workoutList.map((workout, _i) => (
                    <div>
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                            <li className="py-3 sm:py-4">
                                <div className="flex items-center space-x-4">

                                    <div className="flex-shrink-0">
                                    </div>
                                    <div className="inline-flex min-w-0">
                                        {workout.value.exercise}
                                    </div>
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
                                        <RemoveWorkoutButton
                                            onClick={() => onDelete(workout.id)}>
                                        </RemoveWorkoutButton>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                ))
            }
        </div>
    );
}