import { Entity } from "@/ecs/Entity";
import { CameraComponent, TransformComponent } from "@/types";
import { Vector2 } from "@/math";
import { EntityId } from "@/types";

/**
 * Entidad especializada para cámaras con componentes base pre-configurados
 * @class CameraEntity
 * @extends Entity
 */
export class CameraEntity extends Entity {
    /**
     * Crea una nueva entidad de cámara con Transform y Camera components
     * @param {EntityId} [id] - ID opcional para la entidad
     */
    constructor(id?: EntityId) {
        super(id);

        // Añadir componente de transformación por defecto
        this.addComponent<TransformComponent>({
            type: 'transform',
            position: new Vector2(0, 0),
            rotation: 0,
            scale: new Vector2(1, 1)
        });

        // Añadir componente de cámara por defecto
        this.addComponent<CameraComponent>({
            type: 'camera',
            zoom: 1,
            viewport: { width: 800, height: 600 },
            isActive: false
        });
    }
}