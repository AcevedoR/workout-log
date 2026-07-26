import {WorkoutRow} from "../workout";
import {startOfIsoWeek} from "../utils/date-utils";

// Two workouts logged within this window belong to the same gym session.
// Longer than a rest between sets/exercises, shorter than the gap between two visits to the gym.
export const SESSION_MAX_GAP_IN_MS = 3 * 60 * 60 * 1000; // 3 hours

export interface WorkoutSession {
    sessionId?: string,
    startDate: number,
    endDate: number,
    workouts: WorkoutRow[],
}

/**
 * Generates a brand-new session id. Kept separate from `resolveSessionId` so the decision logic
 * stays pure and testable while the randomness lives here.
 */
export function generateSessionId(): string {
    return crypto.randomUUID();
}

/**
 * Decides which session a newly logged workout belongs to, so the id can be persisted on the doc.
 * Reuses the most recent workout's session when the new log falls within `maxGapInMs` of it;
 * otherwise returns `newSessionId` to start a fresh session. Logs predating this feature carry no
 * `sessionId`, so they can never be extended — a new session starts instead.
 */
export function resolveSessionId(
    newWorkoutDate: number,
    mostRecentWorkout: WorkoutRow | undefined,
    newSessionId: string,
    maxGapInMs: number = SESSION_MAX_GAP_IN_MS,
): string {
    if (mostRecentWorkout?.value.sessionId
        && Math.abs(newWorkoutDate - mostRecentWorkout.value.date) <= maxGapInMs) {
        return mostRecentWorkout.value.sessionId;
    }
    return newSessionId;
}

/**
 * Groups workout logs into sessions for display. When both neighbours carry a persisted `sessionId`
 * that id is authoritative; for legacy logs without one it falls back to time proximity.
 *
 * `workouts` is expected to be sorted most-recent-first (as returned by `getMostRecents`); the
 * returned sessions and the workouts inside them preserve that order.
 */
export function groupWorkoutsIntoSessions(workouts: WorkoutRow[], maxGapInMs: number = SESSION_MAX_GAP_IN_MS): WorkoutSession[] {
    if (workouts.length === 0) {
        return [];
    }

    const sessions: WorkoutSession[] = [];
    let current: WorkoutRow[] = [workouts[0]];

    for (let i = 1; i < workouts.length; i++) {
        if (belongToSameSession(workouts[i - 1], workouts[i], maxGapInMs)) {
            current.push(workouts[i]);
        } else {
            sessions.push(toSession(current));
            current = [workouts[i]];
        }
    }
    sessions.push(toSession(current));

    return sessions;
}

/**
 * Counts how many distinct gym sessions fall within the current week (Monday→Sunday, local time).
 * A session is attributed to the week of its first set (`startDate`). `now` is injectable for testing.
 *
 * `workouts` must be sorted most-recent-first, as returned by `getMostRecents`. Note the count is only
 * accurate if the fetched window reaches back far enough to include every set logged this week.
 */
export function countSessionsThisWeek(workouts: WorkoutRow[], now: Date = new Date(), maxGapInMs: number = SESSION_MAX_GAP_IN_MS): number {
    const weekStart = startOfIsoWeek(now).valueOf();
    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;

    return groupWorkoutsIntoSessions(workouts, maxGapInMs)
        .filter(session => session.startDate >= weekStart && session.startDate < weekEnd)
        .length;
}

function belongToSameSession(a: WorkoutRow, b: WorkoutRow, maxGapInMs: number): boolean {
    if (a.value.sessionId && b.value.sessionId) {
        return a.value.sessionId === b.value.sessionId;
    }
    return Math.abs(a.value.date - b.value.date) <= maxGapInMs;
}

function toSession(workouts: WorkoutRow[]): WorkoutSession {
    const dates = workouts.map(w => w.value.date);
    return {
        sessionId: workouts[0].value.sessionId,
        startDate: Math.min(...dates),
        endDate: Math.max(...dates),
        workouts,
    };
}
