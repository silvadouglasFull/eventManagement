export class Logger {
    /**
     * Logs a message with a custom tag and a red color for errors.
     * @param tag The tag for the log message (e.g., 'Repository').
     * @param message The error message to log.
     * @param error The error object to be logged.
     */
    public static error(tag: string, message: string, error: unknown): void {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [${tag}] [ERROR] - ${message}`, error);
    }
    /**
 * Logs a message with a custom tag and a red color for errors.
 * @param tag The tag for the log message (e.g., 'Repository').
 * @param message The error message to log.
 * @param error The error object to be logged.
 */
    public static info(tag: string, message: string): void {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [${tag}] [ERROR] - ${message}`);
    }
}