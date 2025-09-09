import { ComponentType, EntityElement } from '@/types';
import { TransformComponent, ColliderComponent } from '@/types/components';
import { FunctionalSystem } from './FunctionalSystem';
import { EventSystem } from '../core/EventSystem';
import { PHYSICS_EVENTS } from '../types/event-const';
import { Logger } from '../core/Logger';

export class CollisionSystem extends FunctionalSystem {
    readonly requiredComponents: Array<ComponentType> = ['transform', 'collider'];
    private eventSystem: EventSystem;

    constructor() {
        super();
        this.eventSystem = EventSystem.getInstance();
    }

    update(entities: EntityElement[], _deltaTime: number): void {
        const collidableEntities = this.getEntitiesWithComponents(entities, this.requiredComponents);

        if (collidableEntities.length > 0) {
            Logger.getInstance().debug(`CollisionSystem: Checking ${collidableEntities.length} entities for collisions`);
        }

        // Check collisions between all pairs of entities
        for (let i = 0; i < collidableEntities.length; i++) {
            for (let j = i + 1; j < collidableEntities.length; j++) {
                const entityA = collidableEntities[i];
                const entityB = collidableEntities[j];

                if (this.checkCollision(entityA, entityB)) {
                    Logger.getInstance().debug('Collision detected between entities:', entityA.id, entityB.id);

                    this.eventSystem.emit(PHYSICS_EVENTS.COLLISION_BEGIN, {
                        entityA,
                        entityB,
                        point: this.getCollisionPoint(entityA, entityB),
                        normal: this.getCollisionNormal(entityA, entityB)
                    });
                }
            }
        }
    }

    private checkCollision(entityA: EntityElement, entityB: EntityElement): boolean {
        const transformA = entityA.getComponent<TransformComponent>('transform');
        const colliderA = entityA.getComponent<ColliderComponent>('collider');
        const transformB = entityB.getComponent<TransformComponent>('transform');
        const colliderB = entityB.getComponent<ColliderComponent>('collider');

        if (!transformA || !colliderA || !transformB || !colliderB) {
            return false;
        }

        // Simple AABB (Axis-Aligned Bounding Box) collision detection
        const aLeft = transformA.position.x - colliderA.width / 2;
        const aRight = transformA.position.x + colliderA.width / 2;
        const aTop = transformA.position.y - colliderA.height / 2;
        const aBottom = transformA.position.y + colliderA.height / 2;

        const bLeft = transformB.position.x - colliderB.width / 2;
        const bRight = transformB.position.x + colliderB.width / 2;
        const bTop = transformB.position.y - colliderB.height / 2;
        const bBottom = transformB.position.y + colliderB.height / 2;

        return (
            aLeft < bRight &&
            aRight > bLeft &&
            aTop < bBottom &&
            aBottom > bTop
        );
    }

    private getCollisionPoint(entityA: EntityElement, entityB: EntityElement): { x: number; y: number } {
        const transformA = entityA.getComponent<TransformComponent>('transform');
        const transformB = entityB.getComponent<TransformComponent>('transform');

        if (!transformA || !transformB) {
            return { x: 0, y: 0 };
        }

        // Return the midpoint between the two entities
        return {
            x: (transformA.position.x + transformB.position.x) / 2,
            y: (transformA.position.y + transformB.position.y) / 2
        };
    }

    private getCollisionNormal(entityA: EntityElement, entityB: EntityElement): { x: number; y: number } {
        const transformA = entityA.getComponent<TransformComponent>('transform');
        const transformB = entityB.getComponent<TransformComponent>('transform');

        if (!transformA || !transformB) {
            return { x: 0, y: 1 };
        }

        // Calculate normal vector from A to B
        const dx = transformB.position.x - transformA.position.x;
        const dy = transformB.position.y - transformA.position.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) {
            return { x: 0, y: 1 };
        }

        return {
            x: dx / length,
            y: dy / length
        };
    }
}
