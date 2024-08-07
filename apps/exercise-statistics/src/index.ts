// TODO make this a mono repo ?
// we need to deploy this and probably have a separate piece of CI and tests

// from https://firebase.google.com/docs/functions/get-started?gen=2nd
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import {logger} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";

// The Firebase Admin SDK to access Firestore.
import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {UserID} from "../../workout-log/src/app/UserID";
import {getExercisesToProcessForUser, getLastWorkoutsForExercise} from "./WorkoutLogRepository";
import {upsertExerciseStatistics} from "./ExerciseStatisticsRepository";
import {wasUserActiveLast24h} from "./domain/UserActivity";
import {calculateUsualLift} from "./domain/CalculateUsualLift";

initializeApp();


const MAX_HANDLED_USER_COUNT = 20;

export const calculate = onRequest(async (req, res) => {
    logger.log("Starting function");
    let userProcessed = 0;
    let exercisesProcessed = 0;

    await getAuth()
        .listUsers(MAX_HANDLED_USER_COUNT)
        .then((listUsersResult) => {
            listUsersResult.users.forEach(async (userRecord) => {
                if (wasUserActiveLast24h(userRecord)) {

                    const exercisesToProcessForUser = await getExercisesToProcessForUser(userRecord.uid as UserID);

                    for (const exercise of exercisesToProcessForUser) {
                        const lastWorkouts = await getLastWorkoutsForExercise(exercise);
                        const usualLift = calculateUsualLift(lastWorkouts);
                        if (usualLift != null) {
                            await upsertExerciseStatistics({userId: userRecord.uid, usualLift});
                            exercisesProcessed++;
                        }
                    }

                    userProcessed++;
                }
            });
            if (listUsersResult.pageToken) {
                console.error(`Critical warning, there is more than :${MAX_HANDLED_USER_COUNT} in database`);
            }
        })
        .catch((error) => {
            console.error('Error listing users:', error);
        });

    let resultMessage = `processed ${userProcessed} users and ${exercisesProcessed} exercises`;
    console.info(resultMessage);
    res.json({result: resultMessage});
});

