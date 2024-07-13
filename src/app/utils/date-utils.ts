export function formatDate(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[0];
}

export function formatNarrowSmartly(timestampToFormat: number, overrideDefaultLocale?: Intl.Locale, overrideCurrentDate?: Date): string {
    const locale = overrideDefaultLocale ? overrideDefaultLocale : 'default';
    const currentDate = overrideCurrentDate ?  overrideCurrentDate.valueOf() : Date.now();

    if (currentDate - timestampToFormat > 1000 * 60 * 60 * 12){
        return new Date(timestampToFormat).toLocaleString(locale, {  day: "numeric",month: 'short' });
    }else {
        return new Date(timestampToFormat).toLocaleString(locale, {  hour: "numeric", minute: 'numeric' });
    }
}
