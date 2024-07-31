import {collection, Firestore, getDocs, limit, query, where} from "@firebase/firestore";
import {UsualLift} from "@/app/model/usual-lift";
import {ExerciseStatistics} from "@/app/firestore/exercise-statistics";
import {UserID} from "@/app/UserID";

const EXERCISE_STATISTICS_COLLECTION = "exercise-statistics";

export async function findUsualLiftFromDb(userId: UserID, exercise: string, db: Firestore): Promise<UsualLift | undefined> {
    try {
        const exerciseStatisticsCollection = collection(db, EXERCISE_STATISTICS_COLLECTION);

        console.info("findUsualLiftFromDb: " + exercise + " " + userId)
        const querySnapshot = await getDocs(
            query(exerciseStatisticsCollection,
                where("userId", "==", userId),
                where("exercise", "==", exercise),
                limit(1)
            )
        );

        let found: ExerciseStatistics | undefined;
        if (querySnapshot.size > 1) {
            throw new Error("findUsualLiftFromDb returned more than one result");
        }
        querySnapshot.forEach((doc) => {
            found = doc.data() as ExerciseStatistics;
            console.info("found usual lift: " + JSON.stringify(found))
        });
        if (found) {
            return {
                exercise: found.exercise,
                reps: found.usualLift.reps,
                weight: found.usualLift.weight,
            } as UsualLift;
        } else {
            return undefined;
        }
    } catch
        (e: any) {
        console.log('Unsuccessful' + e)
    }
    return undefined;
}

