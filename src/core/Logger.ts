export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
    private static _instance: Logger | null = null;
    private debugEnabled = false;

    static init(debug: boolean) {
        if (!Logger._instance) Logger._instance = new Logger(debug);
        else Logger._instance.debugEnabled = debug;
    }

    static getInstance(): Logger {
        if (!Logger._instance) Logger._instance = new Logger(false);
        return Logger._instance;
    }

    private constructor(debug: boolean) {
        this.debugEnabled = debug;
    }

    private fmt(level: LogLevel, message: string) {
        return `[Engine ${level.toUpperCase()}] ${message}`;
    }

    debug(message: string, ...args: any[]) {
        if (!this.debugEnabled) return;
        console.debug(this.fmt('debug', message), ...args);
    }

    info(message: string, ...args: any[]) { console.info(this.fmt('info', message), ...args); }
    warn(message: string, ...args: any[]) { console.warn(this.fmt('warn', message), ...args); }
    error(message: string, ...args: any[]) { console.error(this.fmt('error', message), ...args); }
}
