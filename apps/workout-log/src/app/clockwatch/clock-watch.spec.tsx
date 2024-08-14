import {beforeAll, expect, test, vi} from 'vitest'
import {displayClockWatch} from './clock-watch'

const CURRENT_TIME = Date.parse('Sat, 03 Feb 2001 00:00:00 GMT');
beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(CURRENT_TIME)
})

test('ClockWatch should display time when last exercise was 30 seconds ago', async () => {
    const weekOldDate = Date.parse('Sat, 03 Feb 2001 00:00:30 GMT');

    expect(displayClockWatch(new Date(weekOldDate))).toEqual({minutes: 0, seconds: 30});
})
test('ClockWatch should display time when last exercise was one minute ago', async () => {
    const weekOldDate = Date.parse('Sat, 03 Feb 2001 00:01:00 GMT');

    expect(displayClockWatch(new Date(weekOldDate))).toEqual({minutes: 1, seconds: 0});
})
test('ClockWatch should display time when last exercise was 10 minutes and 30 seconds ago', async () => {
    const weekOldDate = Date.parse('Sat, 03 Feb 2001 00:10:30 GMT');

    expect(displayClockWatch(new Date(weekOldDate))).toEqual({minutes: 10, seconds: 30});
})
test('ClockWatch should not display when last exercise was one hour ago', async () => {
    const weekOldDate = Date.parse('Sat, 03 Feb 2001 01:00:00 GMT');

    expect(displayClockWatch(new Date(weekOldDate))).toBeNull();
})
test('ClockWatch should display time when last exercise was one day ago', async () => {
    const weekOldDate = Date.parse('Sat, 02 Feb 2001 00:00:00 GMT');

    expect(displayClockWatch(new Date(weekOldDate))).toBeNull();
})