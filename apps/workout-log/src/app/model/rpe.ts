export const RPE_MIN = 1;
export const RPE_MAX = 10;

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
