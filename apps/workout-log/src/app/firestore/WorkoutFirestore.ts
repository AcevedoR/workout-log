import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    Firestore,
    getDocs,
    limit,
    orderBy,
    query,
    QueryConstraint,
    where
} from "@firebase/firestore";
import {Workout, WorkoutRow} from "../workout";

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
        console.error('Unsuccessful', e)
    }
}

export async function deleteOne(workoutId: string, db: Firestore) {
    try {
        await deleteDoc(
            doc(db, WORKOUT_LOG_COLLECTION, workoutId)
        );
    } catch
        (e: any) {
        console.error('Unsuccessful', e)
    }
}

export async function getMostRecents(db: Firestore, userId: string, lasts: number, options?: {
    exercise?: string
}): Promise<WorkoutRow[]> {
    try {
        const workoutLogCollection = collection(db, WORKOUT_LOG_COLLECTION);
        const queryConstraints: QueryConstraint[] = [
            where("userId", "==", userId)
        ];
        if (options?.exercise) {
            queryConstraints.push(where("exercise", "==", options.exercise));
        }
        queryConstraints.push(orderBy("date", "desc"));
        queryConstraints.push(limit(lasts));

        let query1 = query(
            workoutLogCollection,
            ...queryConstraints
        );

        const querySnapshot = await getDocs(query1);
        let res: WorkoutRow[] = [];
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            res.push({id: doc.id, value: doc.data() as Workout})
        });
        return res;
    } catch
        (e: any) {
        console.error('Unsuccessful', e)
    }
    return [];
}

export async function findPersonalBest(userId: string, exercise: string, db: Firestore): Promise<WorkoutRow | undefined> {
    try {
        const workoutLogCollection = collection(db, WORKOUT_LOG_COLLECTION);

        console.info("findPersonalBest: " + exercise)
        const querySnapshot = await getDocs(
            query(workoutLogCollection,
                where("userId", "==", userId),
                where("exercise", "==", exercise),
                orderBy("weight", "desc"),
                orderBy("reps", "desc"),
                limit(1)
            )
        );

        let found = undefined;
        if (querySnapshot.size > 1) {
            throw new Error("findPersonalBest returned more than one result");
        }
        querySnapshot.forEach((doc) => {
            console.info("found personal best: " + JSON.stringify({id: doc.id, value: doc.data() as Workout}))
            found = {id: doc.id, value: doc.data() as Workout};
        });
        return found;
    } catch
        (e: any) {
        console.error('Unsuccessful', e)
    }
    return undefined;
}

