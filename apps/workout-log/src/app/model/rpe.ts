export const RPE_MIN = 1;
export const RPE_MAX = 10;

export const RPE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Effort scale: grey (easy) → green → yellow → red (maximal), one colour per RPE 1..10.
const RPE_COLORS = [
    '#9ca3af', // 1  grey
    '#4ade80', // 2  green
    '#a3e635', // 3  light green
    '#d9e021', // 4  yellow-green
    '#facc15', // 5  yellow
    '#fbbf24', // 6  amber
    '#f59e0b', // 7  dark amber
    '#f97316', // 8  orange
    '#ef4444', // 9  red
    '#dc2626', // 10 dark red
];

/**
 * Colour for an RPE on the grey→green→yellow→red effort scale. Out-of-range values clamp to the
 * nearest end so callers never get `undefined`.
 */
export function rpeColor(rpe: number): string {
    const clamped = Math.min(Math.max(Math.round(rpe), RPE_MIN), RPE_MAX);
    return RPE_COLORS[clamped - RPE_MIN];
}

/**
 * Normalizes a raw RPE (Rate of Perceived Exertion) input into a stored value.
 * RPE is optional, so anything blank, non-numeric, non-integer, or outside 1..10 becomes
 * `undefined` ("no RPE recorded") rather than an error — the log is still valid without it.
 */
export function sanitizeRpe(value: unknown): number | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (typeof value === "string" && value.trim() === "") {
        return undefined;
    }

    const rpe = typeof value === "number" ? value : Number(value);
    if (!Number.isInteger(rpe) || rpe < RPE_MIN || rpe > RPE_MAX) {
        return undefined;
    }
    return rpe;
}
