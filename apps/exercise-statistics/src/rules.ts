import {auth} from "firebase-admin";
import UserRecord = auth.UserRecord;

const RECENTLY: number = 1000 * 60 * 60 * 24;

export function wasUserActiveLast24h(userRecord: UserRecord): boolean {
    if (!userRecord.metadata || !userRecord.metadata.lastSignInTime) {
        throw new Error(`Not enough information to find if user is active, User id: ${userRecord.uid}, UserRecord: ${JSON.stringify(userRecord)}`);
    }

    return userSignedInRecently(userRecord) || userRefreshedTokenRecently(userRecord);
}

function userSignedInRecently(userRecord: UserRecord) {
    return (Date.now() - Date.parse(userRecord.metadata.lastSignInTime)) <= RECENTLY;
}

function userRefreshedTokenRecently(userRecord: UserRecord) {
    return (userRecord.metadata.lastRefreshTime !== undefined && userRecord.metadata.lastRefreshTime !== null) && (Date.now() - Date.parse(userRecord.metadata.lastRefreshTime)) <= RECENTLY;
}