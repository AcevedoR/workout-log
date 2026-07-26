/**
 * Canonicalizes an exercise name so that variations a user naturally types map to a single
 * exercise. Firestore queries match the `exercise` field exactly (case- and whitespace-sensitive),
 * so without this "benchpress", "Benchpress" and "  benchpress " would each be a distinct exercise
 * with its own history, personal best and usual-lift stats.
 *
 * Normalization: trim, collapse runs of internal whitespace, and lowercase. Applied at the
 * Firestore boundary (both writes and exercise-keyed reads) so every entry converges on one key.
 * The doc-id convention `${userId}-${exercise}` in the exercise-statistics collection relies on
 * this too.
 */
export function normalizeExercise(exercise: string): string {
    return exercise.trim().replace(/\s+/g, " ").toLowerCase();
}
