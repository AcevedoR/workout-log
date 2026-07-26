/**
 * Curated catalog of exercises grouped into families of variants. It ships with the app so a brand
 * new user (or a user who hasn't logged a given variant yet) still gets good suggestions; the user's
 * own logged exercises are merged on top at search time (see exercise-suggestions.ts).
 *
 * Conventions:
 *  - Every name is already in canonical form (lowercase, single-spaced) — the same form the app
 *    stores via normalizeExercise(). Keep it that way so suggestions map straight onto stored data.
 *  - variants[0] is the family DEFAULT (the one surfaced first / starred).
 *  - `family` is extra searchable text: typing "bench" matches the whole "bench press" family, so
 *    every variant shows up even though the token isn't in, say, "dumbbell bench press" verbatim.
 *
 * To add or rename a variant, edit this list — it is the single source of truth for suggestions.
 */
export interface ExerciseFamily {
    /** Canonical family label, also used as searchable text (e.g. "bench press"). */
    family: string;
    /** Canonical variant names in priority order; variants[0] is the family default. */
    variants: string[];
}

export const EXERCISE_CATALOG: ExerciseFamily[] = [
    {
        family: "bench press",
        variants: [
            "barbell bench press",
            "dumbbell bench press",
            "machine bench press",
            "incline barbell bench press",
            "incline dumbbell bench press",
            "paused bench press",
            "close grip bench press",
        ],
    },
    {
        family: "squat",
        variants: [
            "squat",
            "front squat",
            "paused squat",
            "hack squat",
            "box squat",
            "goblet squat",
        ],
    },
    {
        family: "deadlift",
        variants: [
            "deadlift",
            "romanian deadlift",
            "snatch deadlift",
            "trap bar deadlift",
            "sumo deadlift",
        ],
    },
    {
        family: "overhead press",
        variants: [
            "overhead press",
            "military press",
            "seated dumbbell press",
            "arnold press",
        ],
    },
    {
        family: "row",
        variants: [
            "barbell row",
            "low row",
            "seated cable row",
            "one-arm dumbbell row",
            "t-bar row",
        ],
    },
    {
        family: "lat pulldown",
        variants: [
            "lat pulldown",
            "close grip lat pulldown",
            "wide grip lat pulldown",
        ],
    },
    {
        family: "chest press",
        variants: [
            "chest press",
            "pectoral machine",
            "cable fly",
        ],
    },
    {
        family: "leg press",
        variants: [
            "leg press",
            "leg extension",
            "leg curl",
        ],
    },
    {
        family: "curl",
        variants: [
            "biceps curl",
            "hammer curl",
            "preacher curl",
        ],
    },
    {
        family: "triceps",
        variants: [
            "triceps pushdown",
            "skullcrusher",
            "dips",
        ],
    },
];
