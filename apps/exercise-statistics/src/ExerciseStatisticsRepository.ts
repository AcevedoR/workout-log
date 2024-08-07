import {UsualLift} from "../../workout-log/src/app/model/usual-lift";
import {UserID} from "../../workout-log/src/app/UserID";
import {Workout, WorkoutRow} from "../../workout-log/src/app/workout";
import {getFirestore} from "firebase-admin/firestore";
import {ExerciseStatistics} from "../../workout-log/src/app/firestore/exercise-statistics";

const EXERCISE_STATISTICS_COLLECTION = "exercise-statistics";

export async function upsertExerciseStatistics(input: { userId: UserID, usualLift: UsualLift }): Promise<void> {
    try {
        const collectionReference = getFirestore().collection(EXERCISE_STATISTICS_COLLECTION);
        let exerciseStatisticsAlreadyExisting = await collectionReference
            .where("userId", "==", input.userId)
            .where("exercise", "==", input.usualLift.exercise).get();

        if (exerciseStatisticsAlreadyExisting.size > 1) {
            throw new Error("Critical error, there should only be one ExerciseStatistic row for an User and an Exercise");
        }

        if (exerciseStatisticsAlreadyExisting.empty) {
        } else {
            exerciseStatisticsAlreadyExisting.forEach(doc => {
                const exerciseStatistics = doc.data() as ExerciseStatistics
                // TODO I stopped here
            })
        }
    } catch
        (e: any) {
        console.log('Unsuccessful' + e)
    }
}
