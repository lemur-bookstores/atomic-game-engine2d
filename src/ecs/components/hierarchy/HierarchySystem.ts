import { EventSystem } from "@/core";
import { ReactSystem } from "@/core/ecs/ReactSystem";
import { Transform, Vector2 } from "@/math";
import { HierarchyComponent, TransformComponent } from "atomic-game-engine2d-components";
import { EntityElement } from "atomic-game-engine2d-types";
import { HierarchyManager } from "./HierarchyManager";
import { HIERARCHY_EVENTS } from "@/types/event-const";


/**
 * Sistema reactivo para manejo de jerarquías de entidades
 * Procesa automáticamente entidades con componentes hierarchy y transform
 */
export class HierarchySystem extends ReactSystem {
    private hierarchyManager: HierarchyManager;
    private eventSystem: EventSystem;
    private dirtyEntities: Set<string> = new Set();
    private transformCache: Map<string, Transform> = new Map();

    /**
     * Sistema de detección de cambios sin modificar Entity
     * Guarda una copia del transform anterior para detectar cambios
     */
    private transformSnapshots: Map<string, {
        position: { x: number, y: number },
        rotation: number,
        scale: { x: number, y: number }
    }> = new Map();

    constructor() {
        super(['hierarchy', 'transform']);
        this.hierarchyManager = HierarchyManager.getInstance();
        this.eventSystem = EventSystem.getInstance();
        this.setupEventListeners();
    }

    /**
     * Configurar listeners para eventos de jerarquía
     */
    private setupEventListeners(): void {
        // Escuchar cambios en jerarquía
        this.eventSystem.on(HIERARCHY_EVENTS.CHANGED, (data: any) => {
            this.markEntityDirty(data.entityId);

            // Si se cambió el padre, también marcar el nuevo padre como dirty
            if (data.newParentId) {
                this.markEntityDirty(data.newParentId);
            }
        });

        // Escuchar cuando se marcan entidades como dirty
        this.eventSystem.on(HIERARCHY_EVENTS.TRANSFORM_DIRTY, ({ data }: { data: { entityIds: string[] } }) => {
            data.entityIds.forEach(id => this.markEntityDirty(id));
        });

        // Escuchar cuando se remueve una entidad
        this.eventSystem.on(HIERARCHY_EVENTS.ENTITY_REMOVED, ({ data }: { data: { entityId: string } }) => {
            this.cleanupEntity(data.entityId);
        });
    }

    /**
     * Se ejecuta cuando se añade una nueva entidad al sistema
     */
    public onEntityAdded(entity: EntityElement): void {
        super.onEntityAdded(entity);

        const hierarchyComp = entity.getComponent<HierarchyComponent>('hierarchy');
        if (hierarchyComp) {
            // Sincronizar con HierarchyManager
            if (hierarchyComp.parentId) {
                this.hierarchyManager.setParent(entity.getId(), hierarchyComp.parentId);
            }

            // Configurar tracking de transformación
            this.setupTransformTracking(entity);

            // Marcar como dirty para cálculo inicial
            this.markEntityDirty(entity.getId());
        }
    }

    /**
     * Se ejecuta cuando se remueve una entidad del sistema
     */
    public onEntityRemoved(entity: EntityElement): void {
        super.onEntityRemoved(entity);
        this.hierarchyManager.removeEntity(entity.getId());
        this.cleanupEntity(entity.getId());
    }

    /**
     * Actualización principal del sistema
     */
    public update(_deltaTime: number): void {
        // Primero detectar cambios en transforms
        this.detectTransformChanges();

        if (this.dirtyEntities.size === 0) {
            return; // No hay nada que actualizar
        }

        // Procesar solo las entidades raíz que están dirty
        const rootEntities = this.hierarchyManager.getRootEntities()
            .filter(id => this.shouldProcessEntity(id));

        // Procesar cada árbol jerárquico
        rootEntities.forEach(rootId => {
            this.processEntityTree(rootId, null);
        });

        // Limpiar dirty flags
        this.dirtyEntities.clear();
    }

    /**
     * Procesa un árbol completo de entidades recursivamente
     */
    private processEntityTree(entityId: string, parentWorldTransform: Transform | null): void {
        const entity = this.findEntityById(entityId);
        if (!entity || !entity.active) return;

        const hierarchyComp = entity.getComponent<HierarchyComponent>('hierarchy');
        const transformComp = entity.getComponent<TransformComponent>('transform');

        if (!hierarchyComp || !transformComp) return;

        let worldTransform: Transform;

        if (parentWorldTransform && hierarchyComp.useLocalCoordinates) {
            // Calcular transformación mundial a partir de local + padre
            worldTransform = this.calculateWorldTransform(
                transformComp,
                parentWorldTransform,
                hierarchyComp
            );

            // Actualizar el componente transform con valores mundiales
            if (!hierarchyComp.preserveLocalTransform) {
                transformComp.position.x = worldTransform.position.x;
                transformComp.position.y = worldTransform.position.y;
                transformComp.rotation = worldTransform.rotation;
                transformComp.scale.x = worldTransform.scale.x;
                transformComp.scale.y = worldTransform.scale.y;
            }
        } else {
            // Usar transformación actual como mundial
            worldTransform = new Transform(
                new Vector2(transformComp.position.x, transformComp.position.y),
                transformComp.rotation,
                new Vector2(transformComp.scale.x, transformComp.scale.y)
            );
        }

        // Actualizar cache
        this.transformCache.set(entityId, worldTransform.clone());

        // Actualizar cache del componente
        hierarchyComp.cachedWorldTransform = {
            position: { x: worldTransform.position.x, y: worldTransform.position.y },
            rotation: worldTransform.rotation,
            scale: { x: worldTransform.scale.x, y: worldTransform.scale.y }
        };
        hierarchyComp.transformDirty = false;

        // Procesar hijos
        const childrenIds = this.hierarchyManager.getChildrenIds(entityId);
        childrenIds.forEach(childId => {
            this.processEntityTree(childId, worldTransform);
        });
    }

    /**
     * Calcula la transformación mundial combinando local + padre
     */
    private calculateWorldTransform(
        localTransform: TransformComponent,
        parentWorldTransform: Transform,
        hierarchyConfig: HierarchyComponent
    ): Transform {
        const result = new Transform();

        // Crear transform local
        const local = new Transform(
            new Vector2(localTransform.position.x, localTransform.position.y),
            localTransform.rotation,
            new Vector2(localTransform.scale.x, localTransform.scale.y)
        );

        // Aplicar herencia selectiva
        if (hierarchyConfig.inheritPosition) {
            result.position = parentWorldTransform.transformPoint(local.position);
        } else {
            result.position = local.position.clone();
        }

        if (hierarchyConfig.inheritRotation) {
            result.rotation = parentWorldTransform.rotation + local.rotation;
        } else {
            result.rotation = local.rotation;
        }

        if (hierarchyConfig.inheritScale) {
            result.scale = new Vector2(
                parentWorldTransform.scale.x * local.scale.x,
                parentWorldTransform.scale.y * local.scale.y
            );
        } else {
            result.scale = local.scale.clone();
        }

        return result;
    }

    /**
     * Sistema de detección de cambios sin modificar Entity
     */
    private setupTransformTracking(entity: EntityElement): void {
        const transform = entity.getComponent<TransformComponent>('transform');
        if (transform) {
            // Guardar snapshot inicial
            this.transformSnapshots.set(entity.getId(), {
                position: { x: transform.position.x, y: transform.position.y },
                rotation: transform.rotation,
                scale: { x: transform.scale.x, y: transform.scale.y }
            });
        }
    }

    /**
     * Detecta cambios comparando con snapshots anteriores
     */
    private detectTransformChanges(): void {
        this.entities.forEach(entity => {
            if (!entity.active) return;

            const transform = entity.getComponent<TransformComponent>('transform');
            if (!transform) return;

            const entityId = entity.getId();
            const snapshot = this.transformSnapshots.get(entityId);

            if (!snapshot) {
                this.setupTransformTracking(entity);
                this.markEntityDirty(entityId);
                return;
            }

            // Comparar con snapshot anterior con tolerancia para errores de punto flotante
            const epsilon = 0.0001;
            const hasChanged = (
                Math.abs(snapshot.position.x - transform.position.x) > epsilon ||
                Math.abs(snapshot.position.y - transform.position.y) > epsilon ||
                Math.abs(snapshot.rotation - transform.rotation) > epsilon ||
                Math.abs(snapshot.scale.x - transform.scale.x) > epsilon ||
                Math.abs(snapshot.scale.y - transform.scale.y) > epsilon
            );

            if (hasChanged) {
                this.markEntityDirty(entityId);

                // Actualizar snapshot
                snapshot.position.x = transform.position.x;
                snapshot.position.y = transform.position.y;
                snapshot.rotation = transform.rotation;
                snapshot.scale.x = transform.scale.x;
                snapshot.scale.y = transform.scale.y;
            }
        });
    }

    /**
     * Marca una entidad como dirty para recálculo
     */
    private markEntityDirty(entityId: string): void {
        this.dirtyEntities.add(entityId);

        // También marcar todos los descendientes como dirty
        const descendants = this.hierarchyManager.getDescendants(entityId);
        descendants.forEach(id => this.dirtyEntities.add(id));
    }

    /**
     * Verifica si una entidad debe ser procesada
     */
    private shouldProcessEntity(entityId: string): boolean {
        return this.dirtyEntities.has(entityId);
    }

    /**
     * Encuentra una entidad por ID en las entidades gestionadas
     */
    private findEntityById(entityId: string): EntityElement | null {
        for (const entity of this.entities) {
            if (entity.getId() === entityId) {
                return entity;
            }
        }
        return null;
    }

    /**
     * Limpia recursos de una entidad
     */
    private cleanupEntity(entityId: string): void {
        this.dirtyEntities.delete(entityId);
        this.transformCache.delete(entityId);
        this.transformSnapshots.delete(entityId);
    }

    /**
     * Obtiene la transformación mundial cacheada de una entidad
     */
    public getWorldTransform(entityId: string): Transform | null {
        return this.transformCache.get(entityId)?.clone() || null;
    }

    /**
     * Fuerza el recálculo de toda la jerarquía
     */
    public forceRecalculate(): void {
        this.entities.forEach(entity => {
            this.markEntityDirty(entity.getId());
        });
    }

    /**
     * Fuerza marcar una entidad específica como dirty desde código externo
     * Útil para cuando se modifica una transformación programáticamente
     */
    public markTransformDirty(entityId: string): void {
        this.markEntityDirty(entityId);
    }

    /**
     * Obtiene estadísticas del sistema para debugging
     */
    public getDebugStats(): {
        totalEntities: number;
        dirtyEntities: number;
        cachedTransforms: number;
        snapshotCount: number;
        hierarchyStats: any;
    } {
        return {
            totalEntities: this.entities.size,
            dirtyEntities: this.dirtyEntities.size,
            cachedTransforms: this.transformCache.size,
            snapshotCount: this.transformSnapshots.size,
            hierarchyStats: this.hierarchyManager.getStats()
        };
    }

    /**
     * Limpia todos los caches y fuerza reinicialización
     * Útil para debugging o cuando se detectan inconsistencias
     */
    public resetSystem(): void {
        this.dirtyEntities.clear();
        this.transformCache.clear();
        this.transformSnapshots.clear();

        // Reinicializar todas las entidades
        this.entities.forEach(entity => {
            this.setupTransformTracking(entity);
            this.markEntityDirty(entity.getId());
        });
    }
}