import { AllEventTypes } from '@/types/event-names';
import { EntityElement } from '@/types';
import { FunctionalSystem } from './FunctionalSystem'
import { ReactSystem } from '@/core/ecs/ReactSystem';
import { WORLD_EVENTS } from '@/types/event-const';
import { EventSystem } from '../core/EventSystem';
import { HierarchySystem } from './components/_hierarchy/HierarchySystem';
import { Entity } from './Entity';
import { HierarchyUtils } from './components/_hierarchy/HierarchyUtils';

type Systems = FunctionalSystem | ReactSystem;

export class World {
    private entities: Map<string, Entity>;
    private systems: Array<Systems>;
    private eventSystem: EventSystem;
    private hierarchySystem: HierarchySystem | null = null;

    constructor() {
        this.entities = new Map();
        this.systems = [];
        this.eventSystem = EventSystem.getInstance();
        this.hierarchySystem = new HierarchySystem();
        this.addSystem(this.hierarchySystem);
    }

    /**
     * Crea una entidad con un padre opcional
     */
    createEntityWithParent(parent?: EntityElement): EntityElement {
        const entity = this.createEntity();

        if (parent) {
            HierarchyUtils.createParentChildRelation(parent, entity);
        }

        return entity;
    }

    /**
     * Obtiene el sistema de jerarquías
     */
    getHierarchySystem(): HierarchySystem | null {
        return this.hierarchySystem;
    }

    /**
     * Fuerza el recálculo de todas las jerarquías
     */
    recalculateHierarchies(): void {
        this.hierarchySystem?.forceRecalculate();
    }

    createEntity(): EntityElement {
        const entity = new Entity();
        this.entities.set(entity.id, entity);
        this.eventSystem.emit(WORLD_EVENTS.ENTITY_CREATED, { entity });
        return entity;
    }

    removeEntity(entityId: string): void {
        const entity = this.entities.get(entityId);
        if (entity) {
            entity.destroy();
            this.entities.delete(entityId);
            this.eventSystem.emit(WORLD_EVENTS.ENTITY_DESTROYED, { entityId });
        }
    }

    addSystem(system: Systems): void {
        this.systems.push(system);
    }

    removeSystem(system: Systems): void {
        const index = this.systems.indexOf(system);
        if (index !== -1) {
            this.systems.splice(index, 1);
        }
    }

    update(deltaTime: number): void {
        const activeEntities = Array.from(this.entities.values()).filter(entity => entity.active);
        for (const system of this.systems) {
            if (system instanceof FunctionalSystem) {
                system.update(activeEntities, deltaTime);
            } else {
                system.update(deltaTime);
            }

        }
    }

    getEntity(entityId: string): EntityElement | undefined {
        return this.entities.get(entityId);
    }

    getEntities(): EntityElement[] {
        return Array.from(this.entities.values());
    }

    getActiveEntities(): EntityElement[] {
        return this.getEntities().filter(entity => entity.active);
    }

    clear(): void {
        this.entities.clear();
        this.systems = [];
        this.eventSystem.emit(WORLD_EVENTS.WORLD_CLEARED, {});
    }

    on(eventName: AllEventTypes, callback: Function): void {
        this.eventSystem.on(eventName, callback as any);
    }

    off(eventName: AllEventTypes, callback: Function): void {
        this.eventSystem.off(eventName, callback as any);
    }
}
