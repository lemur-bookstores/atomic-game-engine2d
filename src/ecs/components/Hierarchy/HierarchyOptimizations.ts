import { TransformComponent, HierarchyComponent } from "atomic-game-engine2d-components";
import { EntityElement } from "atomic-game-engine2d-types";
import { HierarchyUtils } from "./HierarchyUtils";

export class HierarchyOptimizations {
    /**
     * Agrupa actualizaciones de transformación en lotes
     */
    static batchTransformUpdates(entities: EntityElement[]): void {
        const transformUpdates: Array<{
            entity: EntityElement;
            newTransform: TransformComponent;
        }> = [];

        // Recopilar todos los cambios primero
        entities.forEach((entity) => {
            const hierarchyComp = entity.getComponent<HierarchyComponent>("hierarchy");
            if (hierarchyComp?.transformDirty) {
                // Calcular nueva transformación...
                // transformUpdates.push({ entity, newTransform });
            }
        });

        // Aplicar todos los cambios de una vez
        transformUpdates.forEach(({ entity, newTransform }) => {
            const currentTransform = entity.getComponent("transform")!;
            Object.assign(currentTransform, newTransform);
        });
    }

    /**
     * Optimización para jerarquías estáticas (que no cambian frecuentemente)
     */
    static markHierarchyStatic(rootEntity: EntityElement): void {
        const traverse = (entity: EntityElement) => {
            const hierarchyComp =
                entity.getComponent<HierarchyComponent>("hierarchy");
            if (hierarchyComp) {
                // Agregar flag personalizado para jerarquías estáticas
                (hierarchyComp as any).isStatic = true;
            }

            // Recorrer hijos...
            HierarchyUtils.getChildren(entity).forEach((_childId) => {
                // En implementación real, obtener entidad por ID
            });
        };

        traverse(rootEntity);
    }

    /**
     * Culling de jerarquías fuera de la vista de la cámara
     */
    static cullOffscreenHierarchies(
        entities: EntityElement[],
        cameraViewport: { x: number; y: number; width: number; height: number }
    ): EntityElement[] {
        return entities.filter((entity) => {
            const hierarchyComp =
                entity.getComponent<HierarchyComponent>("hierarchy");
            if (!hierarchyComp?.cachedWorldTransform) return true;

            const { position } = hierarchyComp.cachedWorldTransform;
            return (
                position.x >= cameraViewport.x - 100 &&
                position.x <= cameraViewport.x + cameraViewport.width + 100 &&
                position.y >= cameraViewport.y - 100 &&
                position.y <= cameraViewport.y + cameraViewport.height + 100
            );
        });
    }
}