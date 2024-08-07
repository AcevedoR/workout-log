import {UserID} from "../../workout-log/src/app/UserID";
import {getFirestore} from "firebase-admin/firestore";
import {Workout} from "../../workout-log/src/app/workout";

const WORKOUT_LOG_COLLECTION = "workout-log";

export async function getExercisesToProcessForUser(userId: UserID): Promise<string[]> {
    const lastLogsQuery = await getFirestore()
        .collection(WORKOUT_LOG_COLLECTION)
        .where("user", "==", userId)
        .limit(100)
        .get();

    let exercises: string[] = [];
    lastLogsQuery.forEach((doc) => {
        let workout = doc.data() as Workout;
        exercises.push(workout.exercise);
    });

    return Array.from(new Set(exercises))
}

export async function getLastWorkoutsForExercise(exercise: string) : Promise<Workout[]> {
    let lastWorkoutsForExerciseQuery = await getFirestore()
        .collection(WORKOUT_LOG_COLLECTION)
        .where("exercise", "==", exercise)
        .orderBy('date', 'desc')
        .limit(10)
        .get();

    let workouts: Workout[]= [];
    lastWorkoutsForExerciseQuery.forEach((doc) => {
        let workout = doc.data() as Workout;
        workouts.push(workout);
    });

    return workouts;
}