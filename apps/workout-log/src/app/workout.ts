export interface Workout {
    exercise: string,
    reps: number,
    weight: number,
    date: number,
    // Id of the gym session this log belongs to, resolved and persisted at creation time.
    // Optional because logs created before this feature don't have one.
    sessionId?: string,
}

export interface WorkoutRow {
    id: string,
    value: Workout
}