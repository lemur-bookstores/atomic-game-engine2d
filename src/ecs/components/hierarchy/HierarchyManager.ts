import { EventSystem } from "@/core";
import { HIERARCHY_EVENTS } from "@/types/event-const";
import { EntityId, TypesHierarchyChangeEvents } from "atomic-game-engine2d-types";

export interface HierarchyRelation {
    parentId: EntityId | null;
    childrenIds: Set<EntityId>;
}

export interface HierarchyChangeEvent {
    entityId: EntityId;
    oldParentId: EntityId | null;
    newParentId: EntityId | null;
    changeType: TypesHierarchyChangeEvents;
}

/**
 * Gestor centralizado de relaciones jerárquicas entre entidades
 * Mantiene la coherencia y previene ciclos
 */
export class HierarchyManager {
    private static instance: HierarchyManager | null = null;
    private relations: Map<string, HierarchyRelation> = new Map();
    private eventSystem: EventSystem;

    // Cache para optimización
    private rootEntitiesCache: Set<string> = new Set();
    private cacheValid: boolean = false;

    private constructor() {
        this.eventSystem = EventSystem.getInstance();
    }

    public static getInstance(): HierarchyManager {
        if (!HierarchyManager.instance) {
            HierarchyManager.instance = new HierarchyManager();
        }
        return HierarchyManager.instance;
    }

    /**
     * Establece una relación padre-hijo entre entidades
     */
    public setParent(childId: string, parentId: string | null): boolean {
        // Validar que no se cree un ciclo
        if (parentId && this.wouldCreateCycle(childId, parentId)) {
            console.warn(
                `Cannot set parent: would create cycle between ${childId} and ${parentId}`
            );
            return false;
        }

        const oldParentId = this.getParentId(childId);

        // Si ya tiene ese padre, no hacer nada
        if (oldParentId === parentId) {
            return true;
        }

        // Remover de padre anterior
        if (oldParentId) {
            this.removeChildFromParent(childId, oldParentId);
        }

        // Establecer nuevo padre
        if (parentId) {
            this.addChildToParent(childId, parentId);
        }

        // Actualizar relación del hijo
        this.ensureRelation(childId).parentId = parentId;

        // Invalidar cache
        this.cacheValid = false;

        // Emitir evento
        this.eventSystem.emit(HIERARCHY_EVENTS.CHANGED, {
            entityId: childId,
            oldParentId,
            newParentId: parentId,
            changeType: parentId ? "parent_set" : "parent_removed",
        } as HierarchyChangeEvent);

        return true;
    }

    /**
     * Obtiene el ID del padre de una entidad
     */
    public getParentId(entityId: string): string | null {
        return this.relations.get(entityId)?.parentId || null;
    }

    /**
     * Obtiene los IDs de los hijos de una entidad
     */
    public getChildrenIds(entityId: string): string[] {
        const relation = this.relations.get(entityId);
        return relation ? Array.from(relation.childrenIds) : [];
    }

    /**
     * Obtiene todas las entidades raíz (sin padre)
     */
    public getRootEntities(): string[] {
        if (!this.cacheValid) {
            this.rebuildRootCache();
        }
        return Array.from(this.rootEntitiesCache);
    }

    /**
     * Obtiene todos los descendientes de una entidad
     */
    public getDescendants(entityId: string): string[] {
        const descendants: string[] = [];
        const toProcess = [...this.getChildrenIds(entityId)];

        while (toProcess.length > 0) {
            const current = toProcess.pop()!;
            descendants.push(current);
            toProcess.push(...this.getChildrenIds(current));
        }

        return descendants;
    }

    /**
     * Obtiene todos los ancestros de una entidad
     */
    public getAncestors(entityId: string): string[] {
        const ancestors: string[] = [];
        let currentId = this.getParentId(entityId);

        while (currentId) {
            ancestors.push(currentId);
            currentId = this.getParentId(currentId);
        }

        return ancestors;
    }

    /**
     * Verifica si una entidad es descendiente de otra
     */
    public isDescendantOf(childId: string, ancestorId: string): boolean {
        let currentId = this.getParentId(childId);

        while (currentId) {
            if (currentId === ancestorId) return true;
            currentId = this.getParentId(currentId);
        }

        return false;
    }

    /**
     * Limpia todas las referencias de una entidad
     */
    public removeEntity(entityId: string): void {
        const relation = this.relations.get(entityId);
        if (!relation) return;

        // Remover de padre
        if (relation.parentId) {
            this.removeChildFromParent(entityId, relation.parentId);
        }

        // Remover hijos (establecer sus padres a null)
        relation.childrenIds.forEach((childId) => {
            const childRelation = this.relations.get(childId);
            if (childRelation) {
                childRelation.parentId = null;
            }
        });

        // Eliminar relación
        this.relations.delete(entityId);
        this.cacheValid = false;

        // Emitir evento
        this.eventSystem.emit(HIERARCHY_EVENTS.ENTITY_REMOVED, { entityId });
    }

    /**
     * Marca una entidad como dirty para recálculo de transformación
     */
    public markTransformDirty(entityId: string): void {
        // Marcar la entidad y todos sus descendientes
        const toMark = [entityId, ...this.getDescendants(entityId)];

        this.eventSystem.emit(HIERARCHY_EVENTS.TRANSFORM_DIRTY, {
            entityIds: toMark,
        });
    }

    /**
     * Obtiene estadísticas del manager para debugging
     */
    public getStats(): {
        totalRelations: number;
        rootEntities: number;
        maxDepth: number;
        avgChildrenPerParent: number;
    } {
        const totalRelations = this.relations.size;
        const rootEntities = this.getRootEntities().length;

        let maxDepth = 0;
        let totalChildren = 0;
        let parentsWithChildren = 0;

        this.relations.forEach((relation, entityId) => {
            if (relation.childrenIds.size > 0) {
                parentsWithChildren++;
                totalChildren += relation.childrenIds.size;
            }

            const depth = this.getAncestors(entityId).length;
            maxDepth = Math.max(maxDepth, depth);
        });

        return {
            totalRelations,
            rootEntities,
            maxDepth,
            avgChildrenPerParent:
                parentsWithChildren > 0 ? totalChildren / parentsWithChildren : 0,
        };
    }

    // Métodos privados
    private ensureRelation(entityId: string): HierarchyRelation {
        if (!this.relations.has(entityId)) {
            this.relations.set(entityId, {
                parentId: null,
                childrenIds: new Set(),
            });
        }
        return this.relations.get(entityId)!;
    }

    private addChildToParent(childId: string, parentId: string): void {
        this.ensureRelation(parentId).childrenIds.add(childId);
    }

    private removeChildFromParent(childId: string, parentId: string): void {
        const parentRelation = this.relations.get(parentId);
        if (parentRelation) {
            parentRelation.childrenIds.delete(childId);
        }
    }

    private wouldCreateCycle(
        childId: string,
        potentialParentId: string
    ): boolean {
        return this.isDescendantOf(potentialParentId, childId);
    }

    private rebuildRootCache(): void {
        this.rootEntitiesCache.clear();

        this.relations.forEach((relation, entityId) => {
            if (relation.parentId === null) {
                this.rootEntitiesCache.add(entityId);
            }
        });

        this.cacheValid = true;
    }
}