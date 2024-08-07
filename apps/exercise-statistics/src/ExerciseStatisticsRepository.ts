import {UsualLift} from "../../workout-log/src/app/model/usual-lift.js";
import {UserID} from "../../workout-log/src/app/UserID.js";
import {getFirestore} from "firebase-admin/firestore";
import {ExerciseStatistics} from "../../workout-log/src/app/firestore/exercise-statistics.js";
import {trace} from "./logger.js";

const EXERCISE_STATISTICS_COLLECTION = "exercise-statistics";

export async function upsertExerciseStatistics(input: { userId: UserID, usualLift: UsualLift }): Promise<void> {
    try {
        trace(`upsertExerciseStatistics start`);

        const data: ExerciseStatistics = {
            _updatedDate: Date.now(),
            exercise: input.usualLift.exercise,
            usualLift: {
                reps: input.usualLift.reps,
                weight: input.usualLift.weight
            }
        }
        const collectionReference = getFirestore().collection(EXERCISE_STATISTICS_COLLECTION);
        await collectionReference
            .doc(getExerciseStatisticsId(input.userId, input.usualLift))
            .set(
                data
            )
        trace(`upsertExerciseStatistics end`);
    } catch
        (e: any) {
        console.log('Unsuccessful' + e)
    }
}

function getExerciseStatisticsId(userId: UserID, usualLift: UsualLift): string {
    return `${userId}-${usualLift.exercise}`;
}