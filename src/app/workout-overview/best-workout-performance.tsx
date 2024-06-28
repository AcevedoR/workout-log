import React from "react";
import {Workout} from "@/app/workout";
import {noop} from "@/app/noop";

interface BestWorkoutPerformanceProps {
    onWorkoutLog?: (e: { workout: Workout }) => void;
    personalBestWorkout: Workout;
}

export default function BestWorkoutPerformance(props: BestWorkoutPerformanceProps) {
    const {onWorkoutLog = noop, personalBestWorkout} = props;

    return (
        <div className="form-element col-span-full mt-2">
            <h3>Personal best</h3>
            <div className="flex items-center space-x-4 mt-3">
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
                <div>{new Date(personalBestWorkout.date).toISOString().split('T')[0]} </div>
            </div>
        </div>
    );
}
