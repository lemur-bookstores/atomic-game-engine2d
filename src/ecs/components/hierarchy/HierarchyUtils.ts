import { HierarchyComponent } from '@/types';
import { EntityElement, Vector2D } from '@/types';
import { createHierarchyComponent } from "./HierarchyComponent";
import { HierarchyManager } from "./HierarchyManager";


export class HierarchyUtils {
    private static manager = HierarchyManager.getInstance();

    /**
     * Crea una jerarquía padre-hijo entre entidades
     */
    static createParentChildRelation(
        parent: EntityElement,
        child: EntityElement,
        config?: Partial<HierarchyComponent>
    ): boolean {
        // Asegurar que el hijo tenga componente de jerarquía
        if (!child.hasComponent("hierarchy")) {
            child.addComponent(createHierarchyComponent(config));
        }

        // Establecer la relación
        const success = this.manager.setParent(child.getId(), parent.getId());

        if (success) {
            // Actualizar componente del hijo
            const hierarchyComp =
                child.getComponent<HierarchyComponent>("hierarchy")!;
            hierarchyComp.parentId = parent.getId();

            // Asegurar que el padre tenga componente de jerarquía
            if (!parent.hasComponent("hierarchy")) {
                parent.addComponent(createHierarchyComponent());
            }

            // Actualizar componente del padre
            const parentHierarchy =
                parent.getComponent<HierarchyComponent>("hierarchy")!;
            if (!parentHierarchy.childrenIds.includes(child.getId())) {
                parentHierarchy.childrenIds.push(child.getId());
            }
        }

        return success;
    }

    /**
     * Rompe la relación padre-hijo
     */
    static breakParentChildRelation(child: EntityElement): boolean {
        const hierarchyComp = child.getComponent<HierarchyComponent>("hierarchy");
        if (!hierarchyComp || !hierarchyComp.parentId) {
            return false;
        }

        // const oldParentId = hierarchyComp.parentId;
        const success = this.manager.setParent(child.getId(), null);

        if (success) {
            hierarchyComp.parentId = null;

            // Actualizar componente del ex-padre
            // Nota: En un sistema real, esto se manejaría mejor con eventos
            // Por ahora asumimos que el HierarchySystem se encarga de esto
        }

        return success;
    }

    /**
     * Obtiene todos los hijos de una entidad
     */
    static getChildren(parent: EntityElement): string[] {
        return this.manager.getChildrenIds(parent.getId());
    }

    /**
     * Obtiene el padre de una entidad
     */
    static getParent(child: EntityElement): string | null {
        return this.manager.getParentId(child.getId());
    }

    /**
     * Verifica si una entidad es ancestro de otra
     */
    static isAncestorOf(
        ancestor: EntityElement,
        descendant: EntityElement
    ): boolean {
        return this.manager.isDescendantOf(descendant.getId(), ancestor.getId());
    }

    /**
     * Encuentra la raíz de una jerarquía
     */
    static getRoot(entity: EntityElement): string {
        const ancestors = this.manager.getAncestors(entity.getId());
        return ancestors.length > 0
            ? ancestors[ancestors.length - 1]
            : entity.getId();
    }

    /**
     * Obtiene la profundidad de una entidad en su jerarquía
     */
    static getDepth(entity: EntityElement): number {
        return this.manager.getAncestors(entity.getId()).length;
    }

    /**
     * Convierte coordenadas locales a mundiales
     */
    static localToWorld(_entity: EntityElement, _localPoint: Vector2D): Vector2D {
        // Esta función requeriría acceso al HierarchySystem para obtener la transform mundial
        // Por simplicidad, asumimos que se implementaría como un método del sistema
        throw new Error("Not implemented - requires HierarchySystem integration");
    }

    /**
     * Convierte coordenadas mundiales a locales
     */
    static worldToLocal(_entity: EntityElement, _worldPoint: Vector2D): Vector2D {
        // Similar al anterior
        throw new Error("Not implemented - requires HierarchySystem integration");
    }
}