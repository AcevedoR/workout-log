import {UsualLift} from "../../workout-log/src/app/model/usual-lift";
import {UserID} from "../../workout-log/src/app/UserID";
import {getFirestore} from "firebase-admin/firestore";
import {ExerciseStatistics} from "../../workout-log/src/app/firestore/exercise-statistics";

const EXERCISE_STATISTICS_COLLECTION = "exercise-statistics";

export async function upsertExerciseStatistics(input: { userId: UserID, usualLift: UsualLift }): Promise<void> {
    try {
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
    } catch
        (e: any) {
        console.log('Unsuccessful' + e)
    }
}

function getExerciseStatisticsId(userId: UserID, usualLift: UsualLift): string {
    return `${userId}-${usualLift.exercise}`;
}