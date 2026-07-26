import {normalizeExercise} from "../../apps/workout-log/src/app/model/exercise";

/**
 * Explicit one-off renames applied on top of normalization. Keyed by the *normalized* form of the
 * messy source name (lowercased, trimmed, internal whitespace collapsed), so the casing/spacing
 * actually stored doesn't matter — e.g. both "Barred bench press" and "Barred bench press "
 * (trailing space) resolve through the same key. Values are already in canonical (lowercase) form.
 *
 *   "Bench press"        -> these were actually dumbbell bench press
 *   "Barred bench press" -> "barred" is a typo of "barbell"; the barbell bench press
 */
export const EXERCISE_RENAMES: Record<string, string> = {
    "bench press": "dumbbell bench press",
    "barred bench press": "barbell bench press",
};

/**
 * The canonical exercise name a raw value should collapse to: normalized (trim, collapse internal
 * whitespace, lowercase — the exact function the app uses at write time), then any explicit rename.
 * This is the single decision function the migration uses for every document.
 */
export function resolveCanonicalExercise(raw: string): string {
    const normalized = normalizeExercise(raw);
    return EXERCISE_RENAMES[normalized] ?? normalized;
}
