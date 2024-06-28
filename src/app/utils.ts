export function formatDate(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[0];
}

export function formatDateNarrow(timestamp: number): string {
    return new Date(timestamp).toLocaleString('default', {  day: "numeric",month: 'short' });
}
