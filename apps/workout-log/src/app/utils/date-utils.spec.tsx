import {formatNarrowSmartly, getDateDiffInSecondsAndMinutes, startOfIsoWeek} from "./date-utils";
import {describe, expect, it} from 'vitest'

const US_LOCALE = new Intl.Locale('en-US');
const FR_LOCALE = new Intl.Locale('fr-FR');

const NOW = new Date("2024-07-13T14:00:00");

describe('date utils tests', () => {
    it('formats date before today with day and month', () => {
        let yesterday = new Date("2024-07-12T08:08:08");

        const res = formatNarrowSmartly(yesterday.valueOf(), US_LOCALE, NOW);

        expect(res).toEqual('Jul 12');
    })

    it('formats to HH:mm (US) for one hour ago', () => {
        let oneHourAgo = new Date("2024-07-13T13:00:00");

        const res = formatNarrowSmartly(oneHourAgo.valueOf(), US_LOCALE, NOW);

        expect(res).toEqual('1:00 PM');
    })

    it('formats to HH:mm (FR) for one hour ago', () => {
        let oneHourAgo = new Date("2024-07-13T13:00:00");

        const res = formatNarrowSmartly(oneHourAgo.valueOf(), FR_LOCALE, NOW);

        expect(res).toEqual('13:00');
    })

    it('formats to HH:mm (FR) for twelve minutes ago', () => {
        let oneHourAgo = new Date("2024-07-13T13:48:11");

        const res = formatNarrowSmartly(oneHourAgo.valueOf(), FR_LOCALE, NOW);

        expect(res).toEqual('13:48');
    })

    it('formats to HH:mm (FR) for 30 seconds ago', () => {
        let oneHourAgo = new Date("2024-07-13T13:59:30");

        const res = formatNarrowSmartly(oneHourAgo.valueOf(), FR_LOCALE, NOW);

        expect(res).toEqual('13:59');
    })

    it('formats to HH:mm (FR) for 11 hours ago', () => {
        let oneHourAgo = new Date("2024-07-13T03:00:00");

        const res = formatNarrowSmartly(oneHourAgo.valueOf(), FR_LOCALE, NOW);

        expect(res).toEqual('03:00');
    })
})
describe('startOfIsoWeek', () => {
    it('returns the Monday for a mid-week day', () => {
        // 2024-07-10 is a Wednesday; its ISO week starts Monday 2024-07-08.
        expect(startOfIsoWeek(new Date("2024-07-10T18:30:00"))).toEqual(new Date("2024-07-08T00:00:00"));
    })

    it('returns the same day at midnight when already a Monday', () => {
        expect(startOfIsoWeek(new Date("2024-07-08T09:15:00"))).toEqual(new Date("2024-07-08T00:00:00"));
    })

    it('returns the preceding Monday for a Sunday (not the next one)', () => {
        // 2024-07-14 is a Sunday; it belongs to the week starting Monday 2024-07-08.
        expect(startOfIsoWeek(new Date("2024-07-14T23:59:00"))).toEqual(new Date("2024-07-08T00:00:00"));
    })
})

describe('date diff tests', () => {
    it('returns seconds only', () => {
        const res = getDateDiffInSecondsAndMinutes(new Date("2024-07-12T08:08:00"), new Date("2024-07-12T08:08:30"));

        expect(res).toEqual({minutes: 0, seconds: 30});
    })
    it('returns minutes only', () => {
        const res = getDateDiffInSecondsAndMinutes(new Date("2024-07-12T08:08:00"), new Date("2024-07-12T08:09:00"));

        expect(res).toEqual({minutes: 1, seconds: 0});
    })
    it('returns minutes and seconds', () => {
        const res = getDateDiffInSecondsAndMinutes(new Date("2024-07-12T08:08:00"), new Date("2024-07-12T08:09:30"));

        expect(res).toEqual({minutes: 1, seconds: 30});
    })
    it('returns minutes for 1 hours diff', () => {
        const res = getDateDiffInSecondsAndMinutes(new Date("2024-07-12T08:08:00"), new Date("2024-07-12T09:08:00"));

        expect(res).toEqual({minutes: 60, seconds: 0});
    })
    it('returns minutes overflow for 2 hours diff', () => {
        const res = getDateDiffInSecondsAndMinutes(new Date("2024-07-12T08:08:00"), new Date("2024-07-12T09:08:00"));

        expect(res).toEqual({minutes: 60, seconds: 0});
    })
    it('returns minutes overflow for 2 hours diff and 30 seconds', () => {
        const res = getDateDiffInSecondsAndMinutes(new Date("2024-07-12T08:08:00"), new Date("2024-07-12T09:08:30"));

        expect(res).toEqual({minutes: 60, seconds: 30});
    })
})
