import React from "react";
import {Workout} from "@/app/workout";
import {noop} from "@/app/noop";
import {formatDateNarrow} from "@/app/utils";

interface BestWorkoutPerformanceProps {
    onWorkoutLog?: (e: { workout: Workout }) => void;
    personalBestWorkout: Workout;
}

export default function BestWorkoutPerformance(props: BestWorkoutPerformanceProps) {
    const {onWorkoutLog = noop, personalBestWorkout} = props;

    return (
        <div className="block border-solid border-2 border-gray-400 p-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <h3>Personal best</h3>
            <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2">
                    <div className="inline-flex items-center text-base font-semibold text-gray-900">
                        {personalBestWorkout.reps}
                    </div>
                    <div className="inline-flex items-center text-base font-semibold text-gray-900">
                        x
                    </div>
                    <div className="inline-flex items-center text-base font-semibold text-gray-900">
                        {personalBestWorkout.weight}
                        <p className="text-gray-500 text-sm">kg</p>
                    </div>
                </div>
                <div className="text-gray-500">{formatDateNarrow(personalBestWorkout.date)} </div>
            </div>
        </div>
    );
}
