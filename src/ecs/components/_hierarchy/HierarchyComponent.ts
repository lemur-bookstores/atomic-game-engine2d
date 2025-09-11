import { HierarchyComponent } from '@/types';

/**
 * Factory para crear componentes de jerarquía con valores por defecto
 */
export function createHierarchyComponent(config: Partial<Omit<HierarchyComponent, 'type'>> = {}): HierarchyComponent {
    return {
        type: "hierarchy",
        parentId: config.parentId || null,
        childrenIds: config.childrenIds || [],
        inheritPosition: config.inheritPosition !== false,
        inheritRotation: config.inheritRotation !== false,
        inheritScale: config.inheritScale !== false,
        transformDirty: true,
        cachedWorldTransform: null,
        useLocalCoordinates: config.useLocalCoordinates !== false,
        preserveLocalTransform: config.preserveLocalTransform !== false,
    };
}