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

export function getDateDiffInSecondsAndMinutes(d1: Date, d2: Date): { seconds: number, minutes: number } {
    let timer = new Date(Math.abs(d1.getTime() - d2.getTime()));

    const minutes = Math.floor(timer.getTime() / (1000 * 60));
    const seconds =Math.floor((timer.getTime() - minutes * 1000 *60) / 1000);

    return {seconds, minutes};
}