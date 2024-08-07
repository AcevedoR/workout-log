import {UsualLiftRange} from "../model/usual-lift";

export interface ExerciseStatistics {
    exercise: string,
    usualLift: {
        reps: number | UsualLiftRange,
        weight: number
    }
    _updatedDate: number
}
