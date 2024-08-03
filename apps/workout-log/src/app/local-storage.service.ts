'use client'

import {Workout} from "./workout";

const LAST_WORKOUT_INPUT_STORAGE_KEY = 'last-workout-input';

export function saveLastWorkoutInputInLocalStorage(
    workout: Workout
) {
    if (global?.window !== undefined) {
        localStorage.setItem(
            LAST_WORKOUT_INPUT_STORAGE_KEY,
            JSON.stringify(workout)
        )
    }
}

export function getLastWorkoutInputInLocalStorage(): Workout | undefined {
    if (global?.window !== undefined) {
        const lastWorkoutInput = localStorage.getItem(LAST_WORKOUT_INPUT_STORAGE_KEY);
        if (!lastWorkoutInput) {
            return undefined;
        }
        return JSON.parse(lastWorkoutInput);
    }
    return undefined;
}