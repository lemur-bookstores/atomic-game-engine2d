import { ComponentType, EntityElement } from "atomic-game-engine2d-types";

/**
 * Sistema funcional que recibe entidades y las filtra según necesidades.
 * Ideal para sistemas con lógica compleja de filtrado o múltiples casos.
 *
 * @abstract
 * @example AISystem, GameplaySystem, ScriptSystem
 */
export abstract class FunctionalSystem {
    abstract readonly requiredComponents: Array<ComponentType>;

    abstract update(entities: EntityElement[], deltaTime: number): void;

    protected getEntitiesWithComponents(entities: EntityElement[], components: Array<ComponentType>): EntityElement[] {
        return entities.filter(entity =>
            entity.active && components.every(comp => entity.hasComponent(comp))
        );
    }

    protected filterInactiveEntities(entities: EntityElement[]): EntityElement[] {
        return entities.filter(entity => entity.active);
    }
}
