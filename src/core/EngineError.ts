/**
 * EngineError: estandariza los errores lanzados por el motor
 */
export class EngineError extends Error {
    public readonly code: string;
    public readonly details?: any;
    public readonly sourceModule?: string;
    public readonly isCritical: boolean;
    public readonly timestamp: Date;

    constructor(
        message: string,
        code: string,
        details?: any,
        sourceModule?: string,
        isCritical: boolean = false,
        innerError?: Error,
    ) {
        super(message);
        this.name = 'EngineError';
        this.code = code;
        this.details = details;
        this.sourceModule = sourceModule;
        this.isCritical = isCritical;
        this.timestamp = new Date(Date.now());

        if (innerError && innerError.stack) {
            this.stack = `${this.stack}\nCaused by: ${innerError.stack}`;
        } else if ((Error as any).captureStackTrace) {
            try { (Error as any).captureStackTrace(this, (this as any).constructor); } catch (_) { }
        }
    }

    toJSON() {
        const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (_key: string, value: any) => {
                if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) {
                        return '[Circular Reference]';
                    }
                    seen.add(value);
                }
                return value;
            };
        };

        try {
            return {
                name: this.name,
                message: this.message,
                code: this.code,
                details: this.details ? JSON.parse(JSON.stringify(this.details, getCircularReplacer())) : this.details,
                sourceModule: this.sourceModule,
                isCritical: this.isCritical,
                timestamp: this.timestamp.toISOString(),
                stack: this.stack,
            };
        } catch (error) {
            return {
                name: this.name,
                message: this.message,
                code: this.code,
                details: '[Serialization Error]',
                sourceModule: this.sourceModule,
                isCritical: this.isCritical,
                timestamp: this.timestamp.toISOString(),
                stack: this.stack,
            };
        }
    }

    toString(): string {
        const base = super.toString();
        if (this.code) return `${base} [${this.code}]`;
        return base;
    }
}
