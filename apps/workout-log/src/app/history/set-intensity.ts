import {WorkoutRow} from "../workout";

export type SetIntensity = 'working' | 'warmup';

/**
 * Classifies each set of a session as a working set or a warm-up, purely from the logged weights.
 *
 * Within a session the heaviest weight reached for a given exercise is taken as its working weight;
 * sets at that weight are `working`, lighter ramp-up sets below it are `warmup`. Each exercise is
 * judged on its own, so a light exercise is never dimmed just because a heavier one shares the
 * session. When every set of an exercise is the same weight they all count as working.
 *
 * Returns a map keyed by workout id.
 */
export function classifySessionSets(workouts: WorkoutRow[]): Map<string, SetIntensity> {
    const workingWeightByExercise = new Map<string, number>();
    for (const workout of workouts) {
        const currentMax = workingWeightByExercise.get(workout.value.exercise);
        if (currentMax === undefined || workout.value.weight > currentMax) {
            workingWeightByExercise.set(workout.value.exercise, workout.value.weight);
        }
    }

    const classification = new Map<string, SetIntensity>();
    for (const workout of workouts) {
        const workingWeight = workingWeightByExercise.get(workout.value.exercise)!;
        classification.set(workout.id, workout.value.weight >= workingWeight ? 'working' : 'warmup');
    }
    return classification;
}
