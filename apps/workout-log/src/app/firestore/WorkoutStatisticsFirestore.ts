import {collection, doc, Firestore, getDoc, limit, query, where} from "@firebase/firestore";
import {UsualLift} from "../model/usual-lift";
import {ExerciseStatistics} from "./exercise-statistics";
import {UserID} from "../UserID";
import {normalizeExercise} from "../model/exercise";

const EXERCISE_STATISTICS_COLLECTION = "exercise-statistics";

export async function findUsualLiftFromDb(userId: UserID, exercise: string, db: Firestore): Promise<UsualLift | undefined> {
    try {

        console.info("findUsualLiftFromDb: " + exercise + " " + userId)
        const docSnapshot = await getDoc(
            // Doc id is `${userId}-${normalizedExercise}`; normalize so lookups match the ids the
            // cloud function writes from already-normalized workout docs.
            doc(db, EXERCISE_STATISTICS_COLLECTION, `${userId}-${normalizeExercise(exercise)}`)// TODO put this in common with cloud function
        );

        if (docSnapshot.exists()) {
            const found = docSnapshot.data() as ExerciseStatistics;
            console.info("found exercise statistics: " + JSON.stringify(found))
            return {
                exercise: found.exercise,
                reps: found.usualLift.reps,
                weight: found.usualLift.weight,
            } as UsualLift;
        }
    } catch
        (e: any) {
        console.error('Unsuccessful', e)
    }
    return undefined;
}

