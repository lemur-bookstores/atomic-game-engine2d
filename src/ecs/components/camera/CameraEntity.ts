import { Entity } from "@/ecs/Entity";
import { TransformComponent } from "@/types";
import { Vector2 } from "@/math";
import { CameraComponent } from "./CameraComponent";
import { EntityId } from "@/types";

export class CameraEntity extends Entity {
    constructor(id?: EntityId) {
        super(id);

        this.addComponent<TransformComponent>({
            type: 'transform',
            position: new Vector2(0, 0),
            rotation: 0,
            scale: new Vector2(1, 1)
        });

        this.addComponent<CameraComponent>({
            type: 'camera',
            zoom: 1,
            viewport: { width: 800, height: 600 },
            isActive: false
        });
    }
}
