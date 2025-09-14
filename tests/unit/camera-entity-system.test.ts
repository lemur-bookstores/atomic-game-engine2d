import { describe, it, expect, beforeEach } from 'vitest';
import { CameraEntity } from '@/ecs/components/camera/CameraEntity';
import { CameraSystem } from '@/ecs/components/camera/CameraSystem';
import { CameraFollowSystem } from '@/ecs/components/camera/CameraFollowSystem';
import { CameraEffectsSystem } from '@/ecs/components/camera/CameraEffectsSystem';
import { CameraBoundsSystem } from '@/ecs/components/camera/CameraBoundsSystem';
import { Entity } from '@/ecs/Entity';
import { Vector2 } from '@/math';
import {
    CameraComponent,
    CameraEffectsComponent,
    CameraFollowComponent,
    TransformComponent
} from '@/types';

describe('Camera Entity System', () => {
    let cameraEntity: CameraEntity;
    let cameraSystem: CameraSystem;
    let targetEntity: Entity;

    beforeEach(() => {
        cameraEntity = new CameraEntity('test-camera');
        cameraSystem = new CameraSystem();
        targetEntity = new Entity('test-target');

        // Setup target entity with transform
        targetEntity.addComponent({
            type: 'transform',
            position: new Vector2(100, 100),
            rotation: 0,
            scale: new Vector2(1, 1)
        });
    });

    describe('CameraEntity', () => {
        it('should create camera entity with required components', () => {
            expect(cameraEntity.hasComponent('camera')).toBe(true);
            expect(cameraEntity.hasComponent('transform')).toBe(true);

            const cameraComponent = cameraEntity.getComponent<CameraComponent>('camera');
            if (!cameraComponent) throw new Error('Camera component is missing');
            expect(cameraComponent).toBeDefined();
            expect(cameraComponent.type).toBe('camera');
            expect(cameraComponent.zoom).toBe(1);
            expect(cameraComponent.isActive).toBe(false);
        });

        it('should allow adding camera effects component', () => {
            cameraEntity.addComponent({
                type: 'cameraEffects',
                shake: {
                    intensity: 0,
                    duration: 0,
                    frequency: 60,
                    decay: 0.9,
                    active: false
                },
                screenEffects: {},
                customEffects: new Map()
            });

            expect(cameraEntity.hasComponent('cameraEffects')).toBe(true);
        });
    });

    describe('CameraSystem', () => {
        it('should manage active cameras', () => {
            const cameraComponent = cameraEntity.getComponent('camera') as CameraComponent;
            if (!cameraComponent) throw new Error('Camera component not found');

            cameraComponent.isActive = true;

            cameraSystem.update([cameraEntity], 0.016);

            expect(cameraSystem.getActiveCameras()).toContain(cameraEntity);
        });

        it('should set main camera', () => {
            cameraSystem.setMainCamera(cameraEntity);
            expect(cameraSystem.getMainCamera()).toBe(cameraEntity);
        });
    });

    describe('CameraFollowSystem', () => {
        let followSystem: CameraFollowSystem;

        beforeEach(() => {
            followSystem = new CameraFollowSystem();

            // Setup camera with follow component
            cameraEntity.addComponent({
                type: 'cameraFollow',
                target: targetEntity,
                lerp: 0.1,
                offset: new Vector2(0, 0)
            });

            const cameraComponent = cameraEntity.getComponent<CameraComponent>('camera');
            if (!cameraComponent) throw new Error('Camera component not found');
            cameraComponent.isActive = true;
        });

        it('should follow target entity', () => {
            const initialCameraTransform = cameraEntity.getComponent<TransformComponent>('transform');
            const targetTransform = targetEntity.getComponent<TransformComponent>('transform');

            if (!initialCameraTransform || !targetTransform) {
                throw new Error('Transform components not found');
            }

            const initialCameraPos = new Vector2(initialCameraTransform.position.x, initialCameraTransform.position.y);

            followSystem.update([cameraEntity], 0.016);

            const finalCameraPos = initialCameraTransform.position;

            // Camera should move towards target
            expect(finalCameraPos.x).not.toBe(initialCameraPos.x);
            expect(finalCameraPos.y).not.toBe(initialCameraPos.y);
        });

        it('should respect dead zone', () => {
            const followComponent = cameraEntity.getComponent('cameraFollow') as CameraFollowComponent;
            if (!followComponent) throw new Error('Follow component not found');

            followComponent.deadZone = { width: 50, height: 50 };

            const cameraTransform = cameraEntity.getComponent('transform') as TransformComponent;
            if (!cameraTransform) throw new Error('Camera transform not found');

            cameraTransform.position = new Vector2(90, 90); // Within dead zone

            const initialPos = new Vector2(cameraTransform.position.x, cameraTransform.position.y);

            followSystem.update([cameraEntity], 0.016);

            // Camera should not move significantly within dead zone
            expect(Math.abs(cameraTransform.position.x - initialPos.x)).toBeLessThan(1);
            expect(Math.abs(cameraTransform.position.y - initialPos.y)).toBeLessThan(1);
        });
    });

    describe('CameraEffectsSystem', () => {
        let effectsSystem: CameraEffectsSystem;

        beforeEach(() => {
            effectsSystem = new CameraEffectsSystem();

            cameraEntity.addComponent({
                type: 'cameraEffects',
                shake: {
                    intensity: 0,
                    duration: 0,
                    frequency: 60,
                    decay: 0.9,
                    active: false
                },
                screenEffects: {},
                customEffects: new Map()
            });

            const cameraComponent = cameraEntity.getComponent('camera') as CameraComponent;
            if (!cameraComponent) throw new Error('Camera component not found');
            cameraComponent.isActive = true;
        });

        it('should trigger screen shake', () => {
            effectsSystem.triggerShake(cameraEntity, 10, 0.5, 60);

            const effectsComponent = cameraEntity.getComponent('cameraEffects') as CameraEffectsComponent;
            if (!effectsComponent) throw new Error('Effects component not found');

            expect(effectsComponent.shake.active).toBe(true);
            expect(effectsComponent.shake.intensity).toBe(10);
            expect(effectsComponent.shake.duration).toBe(0.5);
        });

        it('should apply screen shake to camera position', () => {
            const cameraTransform = cameraEntity.getComponent('transform') as TransformComponent;
            if (!cameraTransform) throw new Error('Camera transform not found');

            const initialPos = new Vector2(
                cameraTransform.position.x,
                cameraTransform.position.y
            );

            effectsSystem.triggerShake(cameraEntity, 10, 1.0, 60);
            effectsSystem.update([cameraEntity], 0.016);

            const finalPos = cameraTransform.position;

            // Position should be different due to shake
            expect(finalPos.x).not.toBe(initialPos.x);
            expect(finalPos.y).not.toBe(initialPos.y);
        });
    });

    describe('CameraBoundsSystem', () => {
        let boundsSystem: CameraBoundsSystem;

        beforeEach(() => {
            boundsSystem = new CameraBoundsSystem();

            cameraEntity.addComponent({
                type: 'cameraBounds',
                bounds: { x: 0, y: 0, width: 800, height: 600 },
                softBounds: false
            });

            const cameraComponent = cameraEntity.getComponent('camera') as CameraComponent;
            if (!cameraComponent) throw new Error('Camera component not found');
            cameraComponent.isActive = true;
        });

        it('should clamp camera position to bounds', () => {
            const transform = cameraEntity.getComponent('transform') as TransformComponent;
            if (!transform) throw new Error('Transform component not found');

            transform.position = new Vector2(-1000, -1000); // Outside bounds

            boundsSystem.update([cameraEntity], 0.016);

            // Camera should be clamped to valid bounds
            expect(transform.position.x).toBeGreaterThan(-1000);
            expect(transform.position.y).toBeGreaterThan(-1000);
        });

        it('should detect if camera is within bounds', () => {
            const transform = cameraEntity.getComponent('transform') as TransformComponent;
            if (!transform) throw new Error('Transform component not found');

            transform.position = new Vector2(400, 300); // Center of bounds

            expect(boundsSystem.isWithinBounds(cameraEntity)).toBe(true);

            transform.position = new Vector2(-1000, -1000); // Outside bounds
            expect(boundsSystem.isWithinBounds(cameraEntity)).toBe(false);
        });
    });
});