import { EventSystem } from './EventSystem';
import { EngineError } from './EngineError';
import { Logger } from './Logger';

export interface ErrorHandler {
    canHandle(error: EngineError): boolean;
    handleError(error: EngineError): Promise<void>;
}

export class ErrorHandlerService {
    private handlers: ErrorHandler[] = [];
    constructor(private eventSystem: EventSystem) { }

    registerHandler(handler: ErrorHandler) {
        this.handlers.push(handler);
    }

    async handleError(error: Error | EngineError): Promise<void> {
        const engineError = error instanceof EngineError ? error : new EngineError(error.message || String(error), 'UNKNOWN', undefined, 'unknown', false, error as Error);

        // Emit event for listeners
        try {
            this.eventSystem.emit('engine.error' as any, { error: engineError });
        } catch (e) { /* ignore */ }

        let handled = false;
        for (const h of this.handlers) {
            try {
                if (h.canHandle(engineError)) {
                    await h.handleError(engineError);
                    handled = true;
                    break;
                }
            } catch (handlerErr) {
                Logger.getInstance().error('Error handler failed:', handlerErr as any);
                // continue to next
            }
        }

        if (!handled) {
            Logger.getInstance().warn('No error handlers handled the error:', engineError);
        }

        if (engineError.isCritical) {
            try {
                this.eventSystem.emit('engine.critical_error' as any, { error: engineError });
            } catch (e) { /* ignore */ }
        }
    }
}
