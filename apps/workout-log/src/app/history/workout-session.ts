import {WorkoutRow} from "../workout";

// Two workouts logged within this window belong to the same gym session.
// Longer than a rest between sets/exercises, shorter than the gap between two visits to the gym.
export const SESSION_MAX_GAP_IN_MS = 3 * 60 * 60 * 1000; // 3 hours

export interface WorkoutSession {
    startDate: number,
    endDate: number,
    workouts: WorkoutRow[],
}

/**
 * Groups workout logs into sessions purely from their timestamps — no session id is ever stored.
 * Consecutive logs are attached to the same session as long as the gap between them stays within
 * `maxGapInMs`; a larger gap starts a new session.
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
        const gap = Math.abs(workouts[i - 1].value.date - workouts[i].value.date);
        if (gap <= maxGapInMs) {
            current.push(workouts[i]);
        } else {
            sessions.push(toSession(current));
            current = [workouts[i]];
        }
    }
    sessions.push(toSession(current));

    return sessions;
}

function toSession(workouts: WorkoutRow[]): WorkoutSession {
    const dates = workouts.map(w => w.value.date);
    return {
        startDate: Math.min(...dates),
        endDate: Math.max(...dates),
        workouts,
    };
}
