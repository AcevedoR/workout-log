import {addDoc, collection, Firestore, getDocs, limit, orderBy, query} from "@firebase/firestore";
import {Workout} from "@/app/workout";

const WORKOUT_LOG_COLLECTION = "workout-log";

export async function add(workout: Workout, db: Firestore) {
    try {
        await addDoc(collection(db, WORKOUT_LOG_COLLECTION),
            workout
        );
        console.log('Task successfully added');
    } catch
        (e: any) {
        console.log('Unsuccessful')
    }
}

export async function getMostRecents(lasts: number, db: Firestore): Promise<Workout[]> {
    try {
        const citiesRef = collection(db, WORKOUT_LOG_COLLECTION);
        let query1 = query(citiesRef, orderBy("date"), limit(lasts));
        console.log('Task successfully added');
        const querySnapshot = await getDocs(query1);
        let res: Workout[] = [];
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            res.push(doc.data() as Workout)
        });
        return res;
    } catch
        (e: any) {
        console.log('Unsuccessful')
    }
    return [];
}