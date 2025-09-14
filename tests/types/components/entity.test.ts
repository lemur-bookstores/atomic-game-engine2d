import { Entity } from '@/ecs'
import { TransformComponent, SpriteComponent } from '@/types/components'
import { describe, expect, expectTypeOf, it } from 'vitest'


it('Entity should have correct type signature', () => {
    const entity = new Entity()

    // Verificar que el método existe y tiene el tipo correcto
    expectTypeOf(entity.addComponent).toBeFunction()
    expectTypeOf(entity.hasComponent).returns.toBeBoolean()
    expectTypeOf(entity.getComponent<TransformComponent>).toBeFunction()
})


describe('Entity Component System', () => {
    it('should add and retrieve components correctly', () => {
        const entity = new Entity();

        const transformComponent: TransformComponent = {
            type: 'transform',
            position: { x: 10, y: 20 },
            rotation: 0,
            scale: { x: 1, y: 1 }
        };

        entity.addComponent(transformComponent);

        expect(entity.hasComponent('transform')).toBe(true);

        const retrievedTransform = entity.getComponent<TransformComponent>('transform');
        expect(retrievedTransform).toBeDefined();
        expect(retrievedTransform?.position.x).toBe(10);
        expect(retrievedTransform?.position.y).toBe(20);
    });

    it('should handle multiple components', () => {
        const entity = new Entity();

        // Usar tipos para validación
        entity.addComponent<TransformComponent>({
            type: 'transform',
            position: { x: 0, y: 0 },
            rotation: 0,
            scale: { x: 1, y: 1 }
        });

        entity.addComponent<SpriteComponent>({
            type: 'sprite',
            texture: 'player.png',
            width: 32,
            height: 32,
            tint: { r: 255, g: 255, b: 255, a: 1 },
            uvX: 0,
            uvY: 0,
            uvWidth: 1,
            uvHeight: 1,
            flipX: false,
            flipY: false
        });

        const components = entity.getComponents();
        expect(components).toHaveLength(2);
        expect(entity.hasComponent('transform')).toBe(true);
        expect(entity.hasComponent('sprite')).toBe(true);
    });
});