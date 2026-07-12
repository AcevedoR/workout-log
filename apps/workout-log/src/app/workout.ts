export interface Workout {
    exercise: string,
    reps: number,
    weight: number,
    date: number,
    // Id of the gym session this log belongs to, resolved and persisted at creation time.
    // Optional because logs created before this feature don't have one.
    sessionId?: string,
    // Rate of Perceived Exertion (1..10). Optional — logs may be recorded without it.
    rpe?: number,
}

export interface WorkoutRow {
    id: string,
    value: Workout
}