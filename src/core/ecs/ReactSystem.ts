/**
 * Sistema reactivo que mantiene automáticamente una lista filtrada de entidades.
 * Ideal para sistemas que procesan las mismas entidades cada frame.
 *
 * @abstract
 * @example MovementSystem, RenderSystem, PhysicsSystem
 */

import { ComponentType, EntityElement } from "atomic-game-engine2d-types";

export abstract class ReactSystem {
    protected entities: Set<EntityElement>;
    private componentTypes: ComponentType[];

    constructor(componentTypes: ComponentType[]) {
        this.entities = new Set();
        this.componentTypes = componentTypes;
    }

    public onEntityAdded(entity: EntityElement): void {
        if (this.matchesRequirements(entity)) {
            this.entities.add(entity);
        }
    }

    public onEntityRemoved(entity: EntityElement): void {
        this.entities.delete(entity);
    }

    private matchesRequirements(entity: EntityElement): boolean {
        return this.componentTypes.every(type => entity.hasComponent(type));
    }

    public abstract update(deltaTime: number): void;
}
