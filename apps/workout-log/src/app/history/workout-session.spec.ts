import {describe, expect, it} from 'vitest'
import {WorkoutRow} from "../workout";
import {groupWorkoutsIntoSessions, resolveSessionId, SESSION_MAX_GAP_IN_MS} from "./workout-session";

function row(id: string, date: Date, overrides?: { exercise?: string, reps?: number, weight?: number, sessionId?: string }): WorkoutRow {
    return {
        id,
        value: {
            exercise: overrides?.exercise ?? "Squat",
            reps: overrides?.reps ?? 5,
            weight: overrides?.weight ?? 80,
            date: date.valueOf(),
            sessionId: overrides?.sessionId,
        }
    };
}

describe('resolveSessionId', () => {
    it('starts a new session when there is no previous workout', () => {
        const id = resolveSessionId(new Date("2024-07-13T10:00:00").valueOf(), undefined, "new-id");

        expect(id).toEqual("new-id");
    })

    it('reuses the previous session when the new log is close enough in time', () => {
        const mostRecent = row("1", new Date("2024-07-13T10:00:00"), {sessionId: "session-A"});

        const id = resolveSessionId(new Date("2024-07-13T10:20:00").valueOf(), mostRecent, "new-id");

        expect(id).toEqual("session-A");
    })

    it('starts a new session when the gap to the previous log exceeds the threshold', () => {
        const mostRecent = row("1", new Date("2024-07-12T10:00:00"), {sessionId: "session-A"});

        const id = resolveSessionId(new Date("2024-07-13T10:00:00").valueOf(), mostRecent, "new-id");

        expect(id).toEqual("new-id");
    })

    it('reuses exactly at the threshold and starts fresh one millisecond past it', () => {
        const base = new Date("2024-07-13T10:00:00").valueOf();
        const mostRecent = row("1", new Date(base), {sessionId: "session-A"});

        expect(resolveSessionId(base + SESSION_MAX_GAP_IN_MS, mostRecent, "new-id")).toEqual("session-A");
        expect(resolveSessionId(base + SESSION_MAX_GAP_IN_MS + 1, mostRecent, "new-id")).toEqual("new-id");
    })

    it('starts a new session when the previous log predates sessions (no sessionId)', () => {
        const legacy = row("1", new Date("2024-07-13T10:00:00"));

        const id = resolveSessionId(new Date("2024-07-13T10:20:00").valueOf(), legacy, "new-id");

        expect(id).toEqual("new-id");
    })
})

describe('groupWorkoutsIntoSessions', () => {
    it('returns no session for an empty list', () => {
        expect(groupWorkoutsIntoSessions([])).toEqual([]);
    })

    it('groups a single workout into one session', () => {
        const only = row("1", new Date("2024-07-13T10:00:00"), {sessionId: "A"});

        const sessions = groupWorkoutsIntoSessions([only]);

        expect(sessions).toHaveLength(1);
        expect(sessions[0].workouts).toEqual([only]);
        expect(sessions[0].sessionId).toEqual("A");
        expect(sessions[0].startDate).toEqual(only.value.date);
        expect(sessions[0].endDate).toEqual(only.value.date);
    })

    it('groups consecutive workouts that share a persisted sessionId', () => {
        // input is sorted most-recent-first, like getMostRecents returns it
        const workouts = [
            row("3", new Date("2024-07-13T10:40:00"), {sessionId: "A"}),
            row("2", new Date("2024-07-13T10:20:00"), {sessionId: "A"}),
            row("1", new Date("2024-07-13T10:00:00"), {sessionId: "A"}),
        ];

        const sessions = groupWorkoutsIntoSessions(workouts);

        expect(sessions).toHaveLength(1);
        expect(sessions[0].workouts).toEqual(workouts);
        expect(sessions[0].startDate).toEqual(new Date("2024-07-13T10:00:00").valueOf());
        expect(sessions[0].endDate).toEqual(new Date("2024-07-13T10:40:00").valueOf());
    })

    it('splits into separate sessions when the persisted sessionId changes', () => {
        const todaySecond = row("4", new Date("2024-07-13T18:20:00"), {sessionId: "B"});
        const todayFirst = row("3", new Date("2024-07-13T18:00:00"), {sessionId: "B"});
        const yesterdaySecond = row("2", new Date("2024-07-12T09:20:00"), {sessionId: "A"});
        const yesterdayFirst = row("1", new Date("2024-07-12T09:00:00"), {sessionId: "A"});

        const sessions = groupWorkoutsIntoSessions([todaySecond, todayFirst, yesterdaySecond, yesterdayFirst]);

        expect(sessions).toHaveLength(2);
        expect(sessions[0].workouts).toEqual([todaySecond, todayFirst]);
        expect(sessions[0].sessionId).toEqual("B");
        expect(sessions[1].workouts).toEqual([yesterdaySecond, yesterdayFirst]);
        expect(sessions[1].sessionId).toEqual("A");
    })

    it('keeps two same-day sessions apart even when their logs are close in time', () => {
        // Persisted ids are authoritative: these would merge under pure time-grouping, but must not.
        const secondSession = row("2", new Date("2024-07-13T10:20:00"), {sessionId: "B"});
        const firstSession = row("1", new Date("2024-07-13T10:00:00"), {sessionId: "A"});

        const sessions = groupWorkoutsIntoSessions([secondSession, firstSession]);

        expect(sessions).toHaveLength(2);
    })

    it('falls back to time proximity for legacy logs without a sessionId', () => {
        const workouts = [
            row("4", new Date("2024-07-13T18:20:00")),
            row("3", new Date("2024-07-13T18:00:00")),
            row("2", new Date("2024-07-12T09:20:00")),
            row("1", new Date("2024-07-12T09:00:00")),
        ];

        const sessions = groupWorkoutsIntoSessions(workouts);

        expect(sessions).toHaveLength(2);
        expect(sessions[0].workouts).toEqual([workouts[0], workouts[1]]);
        expect(sessions[1].workouts).toEqual([workouts[2], workouts[3]]);
    })
})
