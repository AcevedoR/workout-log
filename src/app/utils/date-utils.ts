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

export function getDateDiffInSecondsAndMinutes(d1: Date, d2: Date): { seconds: number, minutes: number } {
    let timer = new Date(Math.abs(d1.getTime() - d2.getTime()));

    const minutes = Math.floor(timer.getTime() / (1000 * 60));
    const seconds =Math.floor((timer.getTime() - minutes * 1000 *60) / 1000);

    return {seconds, minutes};
}