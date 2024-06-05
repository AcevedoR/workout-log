import {addDoc, collection, Firestore, getDocs, limit, orderBy, query, where} from "@firebase/firestore";
import {Workout} from "@/app/workout";

const WORKOUT_LOG_COLLECTION = "workout-log";

export async function add(userId: string, workout: Workout, db: Firestore) {
    try {
        await addDoc(
            collection(db, WORKOUT_LOG_COLLECTION),
            {
                weight: workout.weight,
                date: workout.date,
                reps: workout.reps,
                exercise: workout.exercise,
                userId: userId
            }
        );
    } catch
        (e: any) {
        console.log('Unsuccessful' + e)
    }
}

export async function getMostRecents(userId: string, lasts: number, db: Firestore): Promise<Workout[]> {
    try {
        const workoutLogCollection = collection(db, WORKOUT_LOG_COLLECTION);
        let query1 = query(workoutLogCollection,
            where("userId", "==", userId),
            orderBy("date", "desc"), limit(lasts)
        );

        const querySnapshot = await getDocs(query1);
        let res: Workout[] = [];
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            res.push(doc.data() as Workout)
        });
        return res;
    } catch
        (e: any) {
        console.log('Unsuccessful' + e)
    }
    return [];
}