import { HierarchyManager } from "./HierarchyManager";

export class HierarchyDebugger {
    private hierarchyManager: HierarchyManager;

    constructor() {
        this.hierarchyManager = HierarchyManager.getInstance();
    }

    /**
     * Imprime la estructura jerárquica en consola
     */
    printHierarchyTree(rootEntityId?: string): void {
        const roots = rootEntityId
            ? [rootEntityId]
            : this.hierarchyManager.getRootEntities();

        roots.forEach((rootId) => {
            this.printEntityTree(rootId, 0);
        });
    }

    private printEntityTree(entityId: string, depth: number): void {
        const indent = "  ".repeat(depth);
        const children = this.hierarchyManager.getChildrenIds(entityId);

        console.log(`${indent}├─ Entity ${entityId} (${children.length} children)`);

        children.forEach((childId, _index) => {
            this.printEntityTree(childId, depth + 1);
        });
    }

    /**
     * Valida la integridad de las jerarquías
     */
    validateHierarchyIntegrity(): {
        valid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];
        const visited = new Set<string>();

        // Verificar ciclos
        const checkCycles = (entityId: string, path: string[]) => {
            if (path.includes(entityId)) {
                errors.push(`Cycle detected: ${path.join(" -> ")} -> ${entityId}`);
                return;
            }

            if (visited.has(entityId)) return;
            visited.add(entityId);

            const children = this.hierarchyManager.getChildrenIds(entityId);
            children.forEach((childId) => {
                checkCycles(childId, [...path, entityId]);
            });
        };

        const roots = this.hierarchyManager.getRootEntities();
        roots.forEach((rootId) => {
            checkCycles(rootId, []);
        });

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Obtiene métricas de rendimiento
     */
    getPerformanceMetrics(): {
        totalEntities: number;
        maxDepth: number;
        rootEntities: number;
        avgChildrenPerParent: number;
        memoryUsage: number;
    } {
        const {
            rootEntities,
            maxDepth,
            avgChildrenPerParent,
        } = this.hierarchyManager.getStats();

        return {
            rootEntities,
            maxDepth,
            avgChildrenPerParent,
            memoryUsage: this.estimateMemoryUsage(),
            totalEntities: 0,
        };
    }

    private estimateMemoryUsage(): number {
        // Estimación aproximada del uso de memoria
        const stats = this.hierarchyManager.getStats();
        const bytesPerRelation = 100; // Estimación
        return stats.totalRelations * bytesPerRelation;
    }
}