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
            userId: input.userId,
            exercise: input.usualLift.exercise,
            usualLift: {
                reps: input.usualLift.reps,
                weight: input.usualLift.weight
            }
        }
        const collectionReference = getFirestore().collection(EXERCISE_STATISTICS_COLLECTION);
        let dataToInsert = JSON.parse(JSON.stringify(data));
        await collectionReference
            .doc(getExerciseStatisticsId(input.userId, input.usualLift))
            .set(
                dataToInsert
            )
        trace(`upsertExerciseStatistics end, inserted data: ${JSON.stringify(dataToInsert)}`);
    } catch
        (e: any) {
        console.error('Unsuccessful', e)
    }
}

function getExerciseStatisticsId(userId: UserID, usualLift: UsualLift): string {
    return `${userId}-${usualLift.exercise}`;
}