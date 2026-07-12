import {describe, expect, it} from 'vitest'
import {RPE_MAX, RPE_MIN, RPE_VALUES, rpeColor, sanitizeRpe} from "./rpe";

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

describe('rpeColor', () => {
    it('exposes the ten selectable values 1..10', () => {
        expect(RPE_VALUES).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    })

    it('returns a hex colour for every RPE value', () => {
        for (const value of RPE_VALUES) {
            expect(rpeColor(value)).toMatch(/^#[0-9a-f]{6}$/i);
        }
    })

    it('ramps from grey at the bottom to red at the top', () => {
        expect(rpeColor(RPE_MIN)).toEqual('#9ca3af');
        expect(rpeColor(RPE_MAX)).toEqual('#dc2626');
    })

    it('clamps out-of-range values to the nearest end of the scale', () => {
        expect(rpeColor(0)).toEqual(rpeColor(RPE_MIN));
        expect(rpeColor(42)).toEqual(rpeColor(RPE_MAX));
    })
})
