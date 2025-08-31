import { describe, it, expect } from 'vitest';
import { EngineError } from '../../src/core/EngineError';

describe('EngineError serialization', () => {
    it('serializes details with circular references without throwing', () => {
        const a: any = { name: 'a' };
        const b: any = { name: 'b', ref: a };
        a.ref = b; // circular

        const err = new EngineError('Test', 'TEST_CODE', { a, b }, 'tests', false);

        expect(() => JSON.stringify(err.toJSON())).not.toThrow();
        const json = err.toJSON();
        expect(json.code).toBe('TEST_CODE');
        expect(json.details).toBeDefined();
    });
});
