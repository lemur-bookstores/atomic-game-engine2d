import { FunctionalSystem } from "@/ecs/FunctionalSystem";
import { EntityElement, ComponentType, CameraFollowComponent, TransformComponent, CameraComponent } from "@/types";
import { Vector2 } from "@/math";

export class CameraFollowSystem extends FunctionalSystem {
    requiredComponents: ComponentType[] = ['camera', 'cameraFollow', 'transform'];

    update(entities: EntityElement[], deltaTime: number): void {
        // FunctionalSystem already filters entities by requiredComponents
        for (const entity of entities) {
            const cameraComponent = entity.getComponent<CameraComponent>('camera');
            const followComponent = entity.getComponent<CameraFollowComponent>('cameraFollow');
            const transformComponent = entity.getComponent<TransformComponent>('transform');

            if (!cameraComponent?.isActive || !followComponent?.target || !transformComponent) {
                continue;
            }

            const targetTransform = followComponent.target.getComponent<TransformComponent>('transform');
            if (!targetTransform) {
                continue;
            }

            // Calcular posición objetivo
            const targetPosition = new Vector2(
                targetTransform.position.x + followComponent.offset.x,
                targetTransform.position.y + followComponent.offset.y
            );

            // Aplicar dead zone si está configurado
            if (followComponent.deadZone) {
                const deadZone = followComponent.deadZone;
                const currentPos = transformComponent.position;

                const deltaX = targetPosition.x - currentPos.x;
                const deltaY = targetPosition.y - currentPos.y;

                // Solo mover si está fuera de la dead zone
                if (Math.abs(deltaX) > deadZone.width / 2) {
                    const adjustedX = deltaX > 0 ? deltaX - deadZone.width / 2 : deltaX + deadZone.width / 2;
                    targetPosition.x = currentPos.x + adjustedX;
                } else {
                    targetPosition.x = currentPos.x;
                }

                if (Math.abs(deltaY) > deadZone.height / 2) {
                    const adjustedY = deltaY > 0 ? deltaY - deadZone.height / 2 : deltaY + deadZone.height / 2;
                    targetPosition.y = currentPos.y + adjustedY;
                } else {
                    targetPosition.y = currentPos.y;
                }
            }

            // Aplicar lead amount (anticipación de movimiento)
            if (followComponent.leadAmount && followComponent.leadAmount > 0) {
                const targetVelocity = this.getEntityVelocity(followComponent.target);
                if (targetVelocity) {
                    targetPosition.x += targetVelocity.x * followComponent.leadAmount;
                    targetPosition.y += targetVelocity.y * followComponent.leadAmount;
                }
            }

            // Aplicar interpolación suave
            const lerpFactor = Math.min(1.0, followComponent.lerp * deltaTime * 60); // Normalizar a 60 FPS

            transformComponent.position.x = this.lerp(
                transformComponent.position.x,
                targetPosition.x,
                lerpFactor
            );

            transformComponent.position.y = this.lerp(
                transformComponent.position.y,
                targetPosition.y,
                lerpFactor
            );
        }
    }

    private lerp(start: number, end: number, factor: number): number {
        return start + (end - start) * factor;
    }

    private getEntityVelocity(entity: EntityElement): Vector2 | null {
        // Intentar obtener velocidad de diferentes componentes posibles
        const velocityComponent = entity.getComponent('velocity');
        if (velocityComponent && 'velocity' in velocityComponent) {
            return velocityComponent.velocity as Vector2;
        }

        const physicsComponent = entity.getComponent('physicsBody');
        if (physicsComponent && 'velocity' in physicsComponent) {
            return physicsComponent.velocity as Vector2;
        }

        return null;
    }
}