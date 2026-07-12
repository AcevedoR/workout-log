import {describe, expect, it} from 'vitest'
import {RPE_MAX, RPE_MIN, sanitizeRpe} from "./rpe";

describe('sanitizeRpe', () => {
    it('treats blank / missing input as "no RPE"', () => {
        expect(sanitizeRpe(undefined)).toBeUndefined();
        expect(sanitizeRpe(null)).toBeUndefined();
        expect(sanitizeRpe("")).toBeUndefined();
        expect(sanitizeRpe("   ")).toBeUndefined();
        expect(sanitizeRpe(NaN)).toBeUndefined();
    })

    it('accepts an integer within 1..10 from a number or a string', () => {
        expect(sanitizeRpe(8)).toEqual(8);
        expect(sanitizeRpe("8")).toEqual(8);
        expect(sanitizeRpe(RPE_MIN)).toEqual(1);
        expect(sanitizeRpe(RPE_MAX)).toEqual(10);
    })

    it('rejects values outside the 1..10 range', () => {
        expect(sanitizeRpe(0)).toBeUndefined();
        expect(sanitizeRpe(11)).toBeUndefined();
        expect(sanitizeRpe(-3)).toBeUndefined();
        expect(sanitizeRpe("100")).toBeUndefined();
    })

    it('rejects non-integer values', () => {
        expect(sanitizeRpe(7.5)).toBeUndefined();
        expect(sanitizeRpe("abc")).toBeUndefined();
    })
})
