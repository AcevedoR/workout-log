export interface Workout {
    exercise: string,
    reps: number,
    weight: number,
    date: number,
}

export interface WorkoutRow {
    id: string,
    value: Workout
}