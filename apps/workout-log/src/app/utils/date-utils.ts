export function formatDate(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[0];
}

export function formatNarrowSmartly(timestampToFormat: number, overrideDefaultLocale?: Intl.Locale, overrideCurrentDate?: Date): string {
    const locale = overrideDefaultLocale ? overrideDefaultLocale : 'default';
    const currentDate = overrideCurrentDate ? overrideCurrentDate.valueOf() : Date.now();

    if (currentDate - timestampToFormat > 1000 * 60 * 60 * 12) {
        return new Date(timestampToFormat).toLocaleString(locale, {day: "numeric", month: 'short'});
    } else {
        return new Date(timestampToFormat).toLocaleString(locale, {hour: "numeric", minute: 'numeric'});
    }
}

/**
 * Full, human-readable date + time for a log — shown when the user taps a log's short date.
 * `formatNarrowSmartly` deliberately hides most of this to stay compact, so this is the "see everything" view.
 */
export function formatFullDateTime(timestamp: number, overrideDefaultLocale?: Intl.Locale): string {
    const locale = overrideDefaultLocale ? overrideDefaultLocale : 'default';
    return new Date(timestamp).toLocaleString(locale, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

/**
 * Returns the start (00:00:00.000, local time) of the ISO week — i.e. the Monday — containing `date`.
 * Used to bound "this week" as Monday→Sunday for the weekly session counter.
 */
export function startOfIsoWeek(date: Date): Date {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    // getDay(): Sunday=0..Saturday=6. Shift so Monday is the first day of the week.
    const daysSinceMonday = (result.getDay() + 6) % 7;
    result.setDate(result.getDate() - daysSinceMonday);
    return result;
}

/**
 * Compact elapsed-duration label for the ongoing session, e.g. `0m`, `47m`, `1h07`.
 * Deliberately terser than the rest timer (which counts seconds) — session length only matters
 * to the minute, and it sits next to the timer where space is tight.
 */
export function formatDurationShort(durationInMs: number): string {
    const totalMinutes = Math.max(0, Math.floor(durationInMs / (1000 * 60)));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
        return `${minutes}m`;
    }
    return `${hours}h${String(minutes).padStart(2, '0')}`;
}

export function getDateDiffInSecondsAndMinutes(d1: Date, d2: Date): { seconds: number, minutes: number } {
    let timer = new Date(Math.abs(d1.getTime() - d2.getTime()));

    const minutes = Math.floor(timer.getTime() / (1000 * 60));
    const seconds =Math.floor((timer.getTime() - minutes * 1000 *60) / 1000);

    return {seconds, minutes};
}