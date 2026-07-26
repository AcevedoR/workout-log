import {applicationDefault, getApps, initializeApp} from "firebase-admin/app";
import {Firestore, getFirestore} from "firebase-admin/firestore";

export const DEFAULT_PROJECT_ID = "workout-log-424900";

/**
 * Connects to the real Firestore of the given project using Application Default Credentials.
 * Run `gcloud auth application-default login` once (as an account with Firestore access) before
 * using this against production.
 */
export function initFirestore(projectId: string = DEFAULT_PROJECT_ID): Firestore {
    if (getApps().length === 0) {
        initializeApp({
            credential: applicationDefault(),
            projectId,
        });
    }
    return getFirestore();
}
