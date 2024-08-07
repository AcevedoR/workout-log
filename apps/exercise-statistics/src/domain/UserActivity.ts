import {auth} from "firebase-admin";
import UserRecord = auth.UserRecord;
import {trace} from "../logger.js";

const RECENTLY: number = 1000 * 60 * 60 * 24;


export function wasUserActiveLast24h(userRecord: UserRecord): boolean {
    if (!userRecord.metadata || !userRecord.metadata.lastSignInTime) {
        throw new Error(`Not enough information to find if user is active, User id: ${userRecord.uid}, UserRecord: ${JSON.stringify(userRecord)}`);
    }

    let isActive = userSignedInRecently(userRecord) || userRefreshedTokenRecently(userRecord);
    trace(`wasUserActiveLast24h: ${isActive}, userId: ${userRecord.uid}`);
    return isActive;
}

function userSignedInRecently(userRecord: UserRecord) {
    let x = (Date.now() - Date.parse(userRecord.metadata.lastSignInTime)) <= RECENTLY;
    trace(`userSignedInRecently: ${x}`);
    return x;
}

function userRefreshedTokenRecently(userRecord: UserRecord) {
    let x = (userRecord.metadata.lastRefreshTime !== undefined && userRecord.metadata.lastRefreshTime !== null) && (Date.now() - Date.parse(userRecord.metadata.lastRefreshTime)) <= RECENTLY;
    trace(`userRefreshedTokenRecently: ${x}`);
    return x;
}