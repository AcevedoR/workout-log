import React from "react";
import {Workout} from "../workout";
import {formatNarrowSmartly} from "../utils/date-utils";

interface BestWorkoutPerformanceProps {
    personalBestWorkout: Workout;
}

export default function BestWorkoutPerformance(props: BestWorkoutPerformanceProps) {
    const {personalBestWorkout} = props;

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
                <div className="text-gray-500">{formatNarrowSmartly(personalBestWorkout.date)} </div>
            </div>
        </div>
    );
}
