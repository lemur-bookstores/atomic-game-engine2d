import { TransformComponent } from '@/types/components';
import { ComponentType, EntityElement } from '@/types';
import { describe, it, expect, expectTypeOf } from 'vitest';


describe('Type System Tests', () => {
    it('should have correct ComponentsSystem union type', () => {
        // ✅ Test de tipos en tiempo de compilación
        expectTypeOf<ComponentType>().toEqualTypeOf<
            'audio'
            | 'light'
            | 'input'
            | 'transform'
            | 'hierarchy'
            | 'animation'
            | 'anim-machine'
            | 'sprite'
            | 'script'
            | 'physics'
            | 'collider'
            | 'physicsBody'
            | 'particle'
            | 'velocity'
            | 'camera'
            | 'cameraFollow'
            | 'cameraBounds'
            | 'cameraEffects'
            | 'cameraFilters'
        >();
    });

    it('should validate TransformComponent structure', () => {
        const transform: TransformComponent = {
            type: 'transform',
            position: { x: 0, y: 0 },
            rotation: 0,
            scale: { x: 1, y: 1 }
        };

        expectTypeOf(transform).toEqualTypeOf<TransformComponent>();
        expectTypeOf(transform.type).toEqualTypeOf<'transform'>();
        expect(transform.type).toBe('transform');
    });

    it('should validate EntityElement interface', () => {
        // ✅ Test de interfaz abstracta
        expectTypeOf<EntityElement>().toHaveProperty('id');
        expectTypeOf<EntityElement>().toHaveProperty('active');

        // Test de métodos
        expectTypeOf<EntityElement>().toHaveProperty('addComponent');
        expectTypeOf<EntityElement>().toHaveProperty('getComponent');
        expectTypeOf<EntityElement>().toHaveProperty('hasComponent');
    });
});