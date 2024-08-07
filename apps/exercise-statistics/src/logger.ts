const LOGGING_LEVEL = "TRACE";

export function trace(s: string) {
    if (LOGGING_LEVEL === "TRACE") {
        console.info(s);
    }
}