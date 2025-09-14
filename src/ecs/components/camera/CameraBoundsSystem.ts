import { FunctionalSystem } from "@/ecs/FunctionalSystem";
import { EntityElement, ComponentType, CameraBoundsComponent, TransformComponent, CameraComponent } from "@/types";
import { Vector2 } from "@/math";

export class CameraBoundsSystem extends FunctionalSystem {
    requiredComponents: ComponentType[] = ['camera', 'cameraBounds', 'transform'];

    update(entities: EntityElement[], deltaTime: number): void {
        for (const entity of entities) {
            const cameraComponent = entity.getComponent<CameraComponent>('camera');
            const boundsComponent = entity.getComponent<CameraBoundsComponent>('cameraBounds');
            const transformComponent = entity.getComponent<TransformComponent>('transform');

            if (!cameraComponent?.isActive || !boundsComponent || !transformComponent) {
                continue;
            }

            this.applyBounds(transformComponent, boundsComponent, cameraComponent, deltaTime);
        }
    }

    private applyBounds(
        transform: TransformComponent,
        bounds: CameraBoundsComponent,
        camera: CameraComponent,
        deltaTime: number
    ): void {
        const { bounds: rect, softBounds, elasticity } = bounds;

        // Calcular el área visible de la cámara
        const halfWidth = (camera.viewport.width / camera.zoom) / 2;
        const halfHeight = (camera.viewport.height / camera.zoom) / 2;

        // Calcular límites efectivos
        const minX = rect.x + halfWidth;
        const maxX = rect.x + rect.width - halfWidth;
        const minY = rect.y + halfHeight;
        const maxY = rect.y + rect.height - halfHeight;

        const currentPos = transform.position;
        let newX = currentPos.x;
        let newY = currentPos.y;

        if (softBounds && elasticity) {
            // Aplicar bounds suaves con elasticidad
            newX = this.applySoftBound(currentPos.x, minX, maxX, elasticity, deltaTime);
            newY = this.applySoftBound(currentPos.y, minY, maxY, elasticity, deltaTime);
        } else {
            // Aplicar bounds duros
            newX = Math.max(minX, Math.min(maxX, currentPos.x));
            newY = Math.max(minY, Math.min(maxY, currentPos.y));
        }

        // Actualizar posición solo si cambió
        if (newX !== currentPos.x || newY !== currentPos.y) {
            transform.position.x = newX;
            transform.position.y = newY;
        }
    }

    private applySoftBound(
        current: number,
        min: number,
        max: number,
        elasticity: number,
        deltaTime: number
    ): number {
        let target = current;

        if (current < min) {
            // Fuera del límite izquierdo/superior
            const distance = min - current;
            const force = distance * elasticity;
            target = current + force * deltaTime * 60; // Normalizar a 60 FPS
        } else if (current > max) {
            // Fuera del límite derecho/inferior
            const distance = current - max;
            const force = distance * elasticity;
            target = current - force * deltaTime * 60; // Normalizar a 60 FPS
        }

        return target;
    }

    /**
     * Verifica si una cámara está dentro de los bounds configurados
     */
    public isWithinBounds(entity: EntityElement): boolean {
        const boundsComponent = entity.getComponent<CameraBoundsComponent>('cameraBounds');
        const transformComponent = entity.getComponent<TransformComponent>('transform');
        const cameraComponent = entity.getComponent<CameraComponent>('camera');

        if (!boundsComponent || !transformComponent || !cameraComponent) {
            return true; // Sin bounds = siempre dentro
        }

        const { bounds: rect } = boundsComponent;
        const halfWidth = (cameraComponent.viewport.width / cameraComponent.zoom) / 2;
        const halfHeight = (cameraComponent.viewport.height / cameraComponent.zoom) / 2;

        const minX = rect.x + halfWidth;
        const maxX = rect.x + rect.width - halfWidth;
        const minY = rect.y + halfHeight;
        const maxY = rect.y + rect.height - halfHeight;

        const pos = transformComponent.position;

        return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY;
    }

    /**
     * Obtiene la distancia hasta el bound más cercano
     */
    public getDistanceToBounds(entity: EntityElement): Vector2 {
        const boundsComponent = entity.getComponent<CameraBoundsComponent>('cameraBounds');
        const transformComponent = entity.getComponent<TransformComponent>('transform');

        if (!boundsComponent || !transformComponent) {
            return new Vector2(0, 0);
        }

        const { bounds: rect } = boundsComponent;
        const pos = transformComponent.position;

        const distanceToLeft = pos.x - rect.x;
        const distanceToRight = (rect.x + rect.width) - pos.x;
        const distanceToTop = pos.y - rect.y;
        const distanceToBottom = (rect.y + rect.height) - pos.y;

        const minDistanceX = Math.min(distanceToLeft, distanceToRight);
        const minDistanceY = Math.min(distanceToTop, distanceToBottom);

        return new Vector2(minDistanceX, minDistanceY);
    }
}