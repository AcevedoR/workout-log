import {formatDateNarrow} from "@/app/utils/date-utils";
import { expect, describe, it } from 'vitest'

const US_LOCALE = new Intl.Locale('en-US');

describe('date utils tests', () => {
    it('formats date before today with day and month', () => {
        let now = new Date("2024-07-13T14:00:00");
        let yesterday =new Date("2024-07-12T08:08:08");

        const res = formatDateNarrow(yesterday.valueOf(), US_LOCALE);

        expect(res).toEqual('Jul 12');
    })
})
