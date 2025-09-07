
import { expectTypeOf, it } from 'vitest';

it('should validate component types', () => {
    expectTypeOf<ComponentsSystem>().toBeObject();
});