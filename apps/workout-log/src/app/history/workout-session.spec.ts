import {describe, expect, it} from 'vitest'
import {WorkoutRow} from "../workout";
import {groupWorkoutsIntoSessions, SESSION_MAX_GAP_IN_MS} from "./workout-session";

function row(id: string, date: Date, overrides?: { exercise?: string, reps?: number, weight?: number }): WorkoutRow {
    return {
        id,
        value: {
            exercise: overrides?.exercise ?? "Squat",
            reps: overrides?.reps ?? 5,
            weight: overrides?.weight ?? 80,
            date: date.valueOf(),
        }
    };
}

describe('groupWorkoutsIntoSessions', () => {
    it('returns no session for an empty list', () => {
        expect(groupWorkoutsIntoSessions([])).toEqual([]);
    })

    it('groups a single workout into one session', () => {
        const only = row("1", new Date("2024-07-13T10:00:00"));

        const sessions = groupWorkoutsIntoSessions([only]);

        expect(sessions).toHaveLength(1);
        expect(sessions[0].workouts).toEqual([only]);
        expect(sessions[0].startDate).toEqual(only.value.date);
        expect(sessions[0].endDate).toEqual(only.value.date);
    })

    it('keeps workouts close in time in the same session', () => {
        // input is sorted most-recent-first, like getMostRecents returns it
        const workouts = [
            row("3", new Date("2024-07-13T10:40:00")),
            row("2", new Date("2024-07-13T10:20:00")),
            row("1", new Date("2024-07-13T10:00:00")),
        ];

        const sessions = groupWorkoutsIntoSessions(workouts);

        expect(sessions).toHaveLength(1);
        expect(sessions[0].workouts).toEqual(workouts);
        expect(sessions[0].startDate).toEqual(new Date("2024-07-13T10:00:00").valueOf());
        expect(sessions[0].endDate).toEqual(new Date("2024-07-13T10:40:00").valueOf());
    })

    it('splits into separate sessions when the gap is larger than the threshold', () => {
        const todaySecond = row("4", new Date("2024-07-13T18:20:00"));
        const todayFirst = row("3", new Date("2024-07-13T18:00:00"));
        const yesterdaySecond = row("2", new Date("2024-07-12T09:20:00"));
        const yesterdayFirst = row("1", new Date("2024-07-12T09:00:00"));

        const sessions = groupWorkoutsIntoSessions([todaySecond, todayFirst, yesterdaySecond, yesterdayFirst]);

        expect(sessions).toHaveLength(2);
        expect(sessions[0].workouts).toEqual([todaySecond, todayFirst]);
        expect(sessions[1].workouts).toEqual([yesterdaySecond, yesterdayFirst]);
    })

    it('starts a new session exactly when the gap exceeds the threshold', () => {
        const base = new Date("2024-07-13T10:00:00").valueOf();
        const within = row("2", new Date(base + SESSION_MAX_GAP_IN_MS));
        const beyond = row("3", new Date(base + SESSION_MAX_GAP_IN_MS + 1));
        const first = row("1", new Date(base));

        // ordered most-recent-first
        const atThreshold = groupWorkoutsIntoSessions([within, first]);
        expect(atThreshold).toHaveLength(1);

        const overThreshold = groupWorkoutsIntoSessions([beyond, first]);
        expect(overThreshold).toHaveLength(2);
    })

    it('honours a custom max gap', () => {
        const workouts = [
            row("2", new Date("2024-07-13T10:30:00")),
            row("1", new Date("2024-07-13T10:00:00")),
        ];

        const oneHourGap = groupWorkoutsIntoSessions(workouts, 60 * 60 * 1000);
        expect(oneHourGap).toHaveLength(1);

        const tenMinuteGap = groupWorkoutsIntoSessions(workouts, 10 * 60 * 1000);
        expect(tenMinuteGap).toHaveLength(2);
    })
})
