import { FunctionalSystem } from "@/ecs/FunctionalSystem";
import { EntityElement, ComponentType } from "@/types";

export class CameraSystem extends FunctionalSystem {
    requiredComponents: ComponentType[] = ['camera', 'transform'];

    update(_entities: EntityElement[], _deltaTime: number): void {
        // Manage multiple cameras
        // Update transformations
        // Handle priorities
    }
}
