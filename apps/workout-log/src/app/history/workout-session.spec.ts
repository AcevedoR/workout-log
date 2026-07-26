import {describe, expect, it} from 'vitest'
import {WorkoutRow} from "../workout";
import {countSessionsThisWeek, groupWorkoutsIntoSessions, resolveSessionId, SESSION_MAX_GAP_IN_MS} from "./workout-session";

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

    it('heals a spurious split: neighbours with different ids but within the gap merge', () => {
        // resolveSessionId only mints a new id after a >gap pause or a failed read of the previous
        // set, so two sets 20 min apart carrying different ids can only be a single session that was
        // wrongly split at write time. Time proximity must win here.
        const secondSet = row("2", new Date("2024-07-13T10:20:00"), {sessionId: "B"});
        const firstSet = row("1", new Date("2024-07-13T10:00:00"), {sessionId: "A"});

        const sessions = groupWorkoutsIntoSessions([secondSet, firstSet]);

        expect(sessions).toHaveLength(1);
        expect(sessions[0].workouts).toEqual([secondSet, firstSet]);
    })

    it('heals the real prod split (a 31-min bench session broken at a 7.5-min gap)', () => {
        // Exact shape of the reported bug: one continuous session whose sets carry two different ids
        // because a mid-session write got a fresh id. Every consecutive gap is a few minutes.
        const sessionA = "64649f8d-a016-415c-b41f-1cd62f7bd395";
        const sessionB = "7ded470d-ba50-4ad0-8316-21943d260b85";
        const workouts = [
            row("QYFTun", new Date(1784743631556), {sessionId: sessionB}),
            row("qx1K9h", new Date(1784743356196), {sessionId: sessionB}),
            row("oI13iu", new Date(1784743188424), {sessionId: sessionB}),
            row("rzLgSq", new Date(1784742954833), {sessionId: sessionB}),
            row("oCr4uV", new Date(1784742507438), {sessionId: sessionA}),
            row("tDUX72", new Date(1784742156704), {sessionId: sessionA}),
            row("KbvXzC", new Date(1784741776900), {sessionId: sessionA}),
        ];

        const sessions = groupWorkoutsIntoSessions(workouts);

        expect(sessions).toHaveLength(1);
        expect(sessions[0].workouts).toHaveLength(7);
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

describe('countSessionsThisWeek', () => {
    // Week under test: Monday 2024-07-08 → Sunday 2024-07-14. "now" is that Wednesday.
    const now = new Date("2024-07-10T12:00:00");

    it('counts no session for an empty list', () => {
        expect(countSessionsThisWeek([], now)).toEqual(0);
    })

    it('counts each distinct session started within the week', () => {
        const workouts = [
            row("4", new Date("2024-07-10T18:20:00"), {sessionId: "wed"}),
            row("3", new Date("2024-07-10T18:00:00"), {sessionId: "wed"}),
            row("2", new Date("2024-07-08T09:20:00"), {sessionId: "mon"}),
            row("1", new Date("2024-07-08T09:00:00"), {sessionId: "mon"}),
        ];

        expect(countSessionsThisWeek(workouts, now)).toEqual(2);
    })

    it('excludes sessions from the previous week', () => {
        const workouts = [
            row("2", new Date("2024-07-08T09:00:00"), {sessionId: "thisWeek"}),
            row("1", new Date("2024-07-07T09:00:00"), {sessionId: "lastWeekSunday"}),
        ];

        expect(countSessionsThisWeek(workouts, now)).toEqual(1);
    })

    it('includes a session starting exactly at Monday 00:00 and excludes the following Monday', () => {
        const workouts = [
            row("2", new Date("2024-07-15T00:00:00"), {sessionId: "nextWeek"}),
            row("1", new Date("2024-07-08T00:00:00"), {sessionId: "monMidnight"}),
        ];

        expect(countSessionsThisWeek(workouts, now)).toEqual(1);
    })

    it('counts a spuriously-split session (two ids, minutes apart) once', () => {
        // The real prod data: one Wed 2026-07-22 bench session broken into two ids at a 7.5-min gap.
        // Week under test here: Monday 2026-07-20 → Sunday 2026-07-26.
        const july22 = new Date("2026-07-24T12:00:00");
        const workouts = [
            row("QYFTun", new Date(1784743631556), {sessionId: "7ded470d"}),
            row("rzLgSq", new Date(1784742954833), {sessionId: "7ded470d"}),
            row("oCr4uV", new Date(1784742507438), {sessionId: "64649f8d"}),
            row("KbvXzC", new Date(1784741776900), {sessionId: "64649f8d"}),
        ];

        expect(countSessionsThisWeek(workouts, july22)).toEqual(1);
    })
})
