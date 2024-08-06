// TODO make this a mono repo ?
// we need to deploy this and probably have a separate piece of CI and tests

// from https://firebase.google.com/docs/functions/get-started?gen=2nd
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import {logger} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";

// The Firebase Admin SDK to access Firestore.
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";
import {auth} from "firebase-admin";
import {wasUserActiveLast24h} from "./rules";

initializeApp();

export const calculate = onRequest(async (req, res) => {
    logger.log("Starting function");
    const maxHandledUserCount = 20;
    let userProcessed = 0;
    await getAuth()
        .listUsers(maxHandledUserCount)
        .then((listUsersResult) => {
            listUsersResult.users.forEach((userRecord) => {
                if (wasUserActiveLast24h(userRecord)) {
                    // todo
                    userProcessed++;
                }
            });
            if (listUsersResult.pageToken) {
                console.error(`Critical warning, there is more than :${maxHandledUserCount} in database`);
            }
        })
        .catch((error) => {
            console.error('Error listing users:', error);
        });

    const exercisesToProcessForUser = getFirestore()
        .collection("workout-log")
        .where("exercise", "==", exercise)
        .orderBy('date', 'desc')
        .limit(10);

    const exercise = "Squat";
    const lastExercises = getFirestore()
        .collection("workout-log")
        .where("exercise", "==", exercise)
        .orderBy('date', 'desc')
        .limit(10);
    // Push the new message into Firestore using the Firebase Admin SDK.
    // const writeResult = await getFirestore()
    //     .collection("messages")
    //     .add({original: original});
    // Send back a message that we've successfully written the message
    res.json({result: `hey back ${req.query} ${req.body}`});
});

export async function calculateUsualLift() {
    // firestore smart query
    //
}