import { describe, it, expect } from 'vitest';
import { EventSystem } from '../../src/core/EventSystem';
import { ErrorHandlerService } from '../../src/core/ErrorHandlerService';
import { MemoryErrorHandler } from '../../src/core/ErrorHandlers';
import { EngineError } from '../../src/core/EngineError';

describe('ErrorHandlerService', () => {
    it('continues to next handler if one throws and the next persists', async () => {
        const evt = EventSystem.getInstance();
        const svc = new ErrorHandlerService(evt as any);

        // Handler that throws
        const badHandler = {
            canHandle: (_: EngineError) => true,
            handleError: async (_: EngineError) => { throw new Error('boom'); }
        } as any;

        const memory = new MemoryErrorHandler(10);

        svc.registerHandler(badHandler);
        svc.registerHandler(memory as any);

        const err = new EngineError('failure', 'FAIL', { foo: 'bar' }, 'tests', false);

        await svc.handleError(err);

        const logs = memory.getLogs();
        expect(logs.length).toBeGreaterThanOrEqual(1);
        expect(logs[0].code).toBe('FAIL');
    });
});
