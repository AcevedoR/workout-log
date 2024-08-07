// from https://firebase.google.com/docs/functions/get-started?gen=2nd
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import {logger} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";

// The Firebase Admin SDK to access Firestore.
import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {UserID} from "../../workout-log/src/app/UserID.js";
import {getExercisesToProcessForUser, getLastWorkoutsForExercise} from "./WorkoutLogRepository.js";
import {upsertExerciseStatistics} from "./ExerciseStatisticsRepository.js";
import {wasUserActiveLast24h} from "./domain/UserActivity.js";
import {calculateUsualLift} from "./domain/CalculateUsualLift.js";
import {trace} from "./logger.js";

initializeApp();


const MAX_HANDLED_USER_COUNT = 20;

export const calculate = onRequest(async (req, res) => {
    logger.log("Starting function");
    let userProcessed = 0;
    let exercisesProcessed = 0;

    trace("getting users");

    await getAuth()
        .listUsers(MAX_HANDLED_USER_COUNT)
        .then((listUsersResult) => {
            listUsersResult.users.forEach(async (userRecord) => {
                if (wasUserActiveLast24h(userRecord)) {

                    const exercisesToProcessForUser = await getExercisesToProcessForUser(userRecord.uid as UserID);

                    for (const exercise of exercisesToProcessForUser) {
                        const lastWorkouts = await getLastWorkoutsForExercise(exercise);

                        const usualLift = calculateUsualLift(lastWorkouts);
                        trace(`calculateUsualLift: ${JSON.stringify(usualLift)}`);

                        if (usualLift != null) {
                            await upsertExerciseStatistics({userId: userRecord.uid, usualLift});
                            exercisesProcessed =  exercisesProcessed +1;
                        }
                    }

                    userProcessed = userProcessed +1;// TODO fix not working
                }
            });
            if (listUsersResult.pageToken) {
                console.error(`Critical warning, there is more than :${MAX_HANDLED_USER_COUNT} in database`);
            }
            let resultMessage = `processed ${userProcessed} users and ${exercisesProcessed} exercises`;
            console.info(resultMessage);
            res.json({result: resultMessage});
        })
        .catch((error) => {
            console.error('Error listing users:', error);
            res.status(500).json({
                "error": error
            });
        });
});

