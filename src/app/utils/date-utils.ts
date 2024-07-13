export function formatDate(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[0];
}

export function formatDateNarrow(timestamp: number, locale?: Intl.Locale, currentDate?: Date): string {
    return new Date(timestamp).toLocaleString(locale ? locale : 'default', {  day: "numeric",month: 'short' });
}
