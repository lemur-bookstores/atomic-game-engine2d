import { ComponentType, EntityElement } from '@/types';
import { TransformComponent, PhysicsComponent } from '@/types/components';
import { FunctionalSystem } from './FunctionalSystem';

export class MovementSystem extends FunctionalSystem {
    readonly requiredComponents: Array<ComponentType> = ['transform', 'physics'];

    update(entities: EntityElement[], deltaTime: number): void {
        const movableEntities = this.getEntitiesWithComponents(entities, this.requiredComponents);

        movableEntities.forEach(entity => {
            const transform = entity.getComponent<TransformComponent>('transform');
            const physics = entity.getComponent<PhysicsComponent>('physics');

            if (transform && physics) {
                // Update position based on velocity
                transform.position.x += physics.velocity.x * deltaTime;
                transform.position.y += physics.velocity.y * deltaTime;

                // Update rotation based on angular velocity
                transform.rotation += physics.angularVelocity * deltaTime;

                // Normalize rotation to keep it between 0 and 2π
                transform.rotation = transform.rotation % (2 * Math.PI);
            }
        });
    }
}
