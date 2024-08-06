import {beforeAll, describe, expect, it, vi} from "vitest";
import {auth} from "firebase-admin";

import {wasUserActiveLast24h} from "./rules";
import UserRecord = auth.UserRecord;


describe('business rules', () => {
    beforeAll(async () => {
        vi.useFakeTimers()
        vi.setSystemTime(Date.parse('Sat, 03 Feb 2001 00:00:00 GMT'))
    })
    it('user is considered as active if he created his account recently', () => {
        expect(wasUserActiveLast24h(
            createFakeUser({
                creationTime: 'Sat, 02 Feb 2001 00:00:00 GMT',
                lastSignInTime: 'Sat, 02 Feb 2001 00:00:00 GMT'
            })
        )).toBeTruthy();
    })
    it('user is considered as active if he signed in recently', () => {
        expect(wasUserActiveLast24h(
            createFakeUser({
                creationTime: 'Sat, 01 Feb 2000 00:00:00 GMT',
                lastSignInTime: 'Sat, 02 Feb 2001 00:00:00 GMT'
            })
        )).toBeTruthy();
    })
    it('user is considered as active if he refreshed his token recently', () => {
        expect(wasUserActiveLast24h(
            createFakeUser({
                creationTime: 'Sat, 01 Feb 2000 00:00:00 GMT',
                lastSignInTime: 'Sat, 01 Jan 2001 00:00:00 GMT',
                lastRefreshTime: 'Sat, 02 Feb 2001 00:00:00 GMT',
            })
        )).toBeTruthy();
    })
    it('user is considered as inactive if he didn\'t signed in recently', () => {
        expect(wasUserActiveLast24h(
            createFakeUser({
                creationTime: 'Sat, 01 Feb 2000 00:00:00 GMT',
                lastSignInTime: 'Sat, 01 Feb 2000 00:00:00 GMT',
            })
        )).toBeFalsy();
    })

})

function createFakeUser(input: { creationTime: string, lastSignInTime: string, lastRefreshTime?: string }): UserRecord {
    return {
        disabled: false,
        emailVerified: false,
        metadata: {
            creationTime: input.creationTime,
            lastSignInTime: input.lastSignInTime,
            lastRefreshTime: input.lastRefreshTime,
            toJSON(): object {
                return undefined;
            }
        },
        providerData: [],
        uid: "",
        toJSON(): object {
            return undefined;
        }
    };
}