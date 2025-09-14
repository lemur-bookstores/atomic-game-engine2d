import { FunctionalSystem } from "@/ecs/FunctionalSystem";
import { EntityElement, ComponentType, CameraComponent, CameraFiltersComponent, CameraFilter } from "@/types";
import { FILTER_PRESETS, FilterPreset } from "./CameraFiltersPreset";

/**
 * Sistema de filtros de cámara - Procesa y aplica filtros visuales
 */
export class CameraFiltersSystem extends FunctionalSystem {
    requiredComponents: ComponentType[] = ['camera', 'cameraFilters'];
    private canvas2DFiltersSupported: boolean = false;
    private webGLFiltersSupported: boolean = false;

    constructor() {
        super();
        this.detectFilterSupport();
    }

    update(entities: EntityElement[], deltaTime: number): void {
        const cameraEntities = this.getEntitiesWithComponents(entities, this.requiredComponents);

        for (const entity of cameraEntities) {
            const camera = entity.getComponent('camera') as CameraComponent;
            const filters = entity.getComponent('cameraFilters') as CameraFiltersComponent;

            if (!camera || !filters || !camera.isActive || !filters.enabled) {
                continue;
            }

            this.processFilters(entity, filters, deltaTime);
        }
    }

    /**
     * Procesa todos los filtros de una entidad de cámara
     */
    private processFilters(entity: EntityElement, filtersComponent: CameraFiltersComponent, deltaTime: number): void {
        const expiredFilters: string[] = [];

        for (const [name, filter] of filtersComponent.filters) {
            // Actualizar filtros temporales
            if (filter.duration !== undefined) {
                filter.duration -= deltaTime;
                if (filter.duration <= 0) {
                    expiredFilters.push(name);
                    continue;
                }
            }

            // Aplicar filtro según el tipo disponible
            if (this.webGLFiltersSupported) {
                this.applyWebGLFilter(entity, filter);
            } else if (this.canvas2DFiltersSupported) {
                this.applyCanvas2DFilter(entity, filter);
            } else {
                this.applySoftwareFilter(entity, filter);
            }
        }

        // Eliminar filtros expirados
        for (const name of expiredFilters) {
            filtersComponent.filters.delete(name);
        }
    }

    /**
     * Aplicar filtro usando WebGL (mejor rendimiento)
     */
    private applyWebGLFilter(entity: EntityElement, filter: CameraFilter): void {
        // Implementación de filtros WebGL con shaders
        switch (filter.type) {
            case 'sepia':
                this.applyWebGLSepia(entity, filter);
                break;
            case 'grayscale':
                this.applyWebGLGrayscale(entity, filter);
                break;
            case 'blur':
                this.applyWebGLBlur(entity, filter);
                break;
            case 'brightness':
            case 'contrast':
            case 'saturation':
                this.applyWebGLColorAdjustment(entity, filter);
                break;
            default:
                console.warn(`WebGL filter not implemented: ${filter.type}`);
        }
    }

    /**
     * Aplicar filtro usando Canvas 2D filter API
     */
    private applyCanvas2DFilter(entity: EntityElement, filter: CameraFilter): void {
        const canvas = this.getEntityCanvas(entity);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Construir string de filtro CSS
        const filterString = this.buildCanvas2DFilterString(filter);
        if (filterString) {
            ctx.filter = filterString;
        }
    }

    /**
     * TODO: Aplicar filtro por software (fallback)
     */
    private applySoftwareFilter(entity: EntityElement, filter: CameraFilter): void {
        // Implementación por software usando manipulación de ImageData
        console.log(`Applying software filter: ${filter.type} with intensity ${filter.intensity}`);
    }

    /**
     * API pública para gestión de filtros
     */

    /**
     * Agregar filtro a una cámara
     */
    public addFilter(entity: EntityElement, name: string, filter: CameraFilter): void {
        const filtersComponent = entity.getComponent('cameraFilters') as CameraFiltersComponent;
        if (!filtersComponent) {
            console.warn('Entity does not have cameraFilters component');
            return;
        }

        filtersComponent.filters.set(name, filter);
    }

    /**
     * Remover filtro de una cámara
     */
    public removeFilter(entity: EntityElement, name: string): void {
        const filtersComponent = entity.getComponent('cameraFilters') as CameraFiltersComponent;
        if (!filtersComponent) return;

        filtersComponent.filters.delete(name);
    }

    /**
     * Obtener filtro por nombre
     */
    public getFilter(entity: EntityElement, name: string): CameraFilter | undefined {
        const filtersComponent = entity.getComponent('cameraFilters') as CameraFiltersComponent;
        if (!filtersComponent) return undefined;

        return filtersComponent.filters.get(name);
    }

    /**
     * Aplicar preset de filtros
     */
    public applyPreset(entity: EntityElement, presetName: string): void {
        const preset = FILTER_PRESETS.find(p => p.name === presetName);
        if (!preset) {
            console.warn(`Filter preset not found: ${presetName}`);
            return;
        }

        this.clearAllFilters(entity);

        preset.filters.forEach((filter, index) => {
            this.addFilter(entity, `${presetName}_${index}`, filter);
        });
    }

    /**
     * Limpiar todos los filtros
     */
    public clearAllFilters(entity: EntityElement): void {
        const filtersComponent = entity.getComponent('cameraFilters') as CameraFiltersComponent;
        if (!filtersComponent) return;

        filtersComponent.filters.clear();
    }

    /**
     * Activar/desactivar filtros
     */
    public setFiltersEnabled(entity: EntityElement, enabled: boolean): void {
        const filtersComponent = entity.getComponent('cameraFilters') as CameraFiltersComponent;
        if (!filtersComponent) return;

        filtersComponent.enabled = enabled;
    }

    /**
     * Métodos de implementación específicos
     */

    private detectFilterSupport(): void {
        // Detectar soporte para Canvas 2D filters
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx && 'filter' in ctx) {
            this.canvas2DFiltersSupported = true;
        }

        // Detectar soporte para WebGL
        const webglCanvas = document.createElement('canvas');
        const gl = webglCanvas.getContext('webgl') || webglCanvas.getContext('experimental-webgl');
        if (gl) {
            this.webGLFiltersSupported = true;
        }
    }

    private getEntityCanvas(entity: EntityElement): HTMLCanvasElement | null {
        // TODO: Obtener el canvas asociado a la entidad
        // Esto dependería de la implementación del RenderSystem
        return null;
    }

    private buildCanvas2DFilterString(filter: CameraFilter): string {
        switch (filter.type) {
            case 'sepia':
                return `sepia(${filter.intensity * 100}%)`;
            case 'grayscale':
                return `grayscale(${filter.intensity * 100}%)`;
            case 'blur':
                const blurFilter = filter as any;
                return `blur(${blurFilter.radius || 1}px)`;
            case 'brightness':
                const brightnessFilter = filter as any;
                const brightness = 100 + (brightnessFilter.level || 0) * 100;
                return `brightness(${brightness}%)`;
            case 'contrast':
                const contrastFilter = filter as any;
                const contrast = (contrastFilter.level || 1) * 100;
                return `contrast(${contrast}%)`;
            case 'saturation':
                const saturationFilter = filter as any;
                const saturation = (saturationFilter.level || 1) * 100;
                return `saturate(${saturation}%)`;
            case 'hue-rotate':
                const hueFilter = filter as any;
                return `hue-rotate(${hueFilter.degrees || 0}deg)`;
            case 'invert':
                return `invert(${filter.intensity * 100}%)`;
            default:
                return '';
        }
    }

    // Implementaciones WebGL (esqueletos)
    private applyWebGLSepia(entity: EntityElement, filter: CameraFilter): void {
        // Shader sepia WebGL
        console.log(`WebGL Sepia filter applied with intensity ${filter.intensity}`);
    }

    private applyWebGLGrayscale(entity: EntityElement, filter: CameraFilter): void {
        // Shader grayscale WebGL
        console.log(`WebGL Grayscale filter applied with intensity ${filter.intensity}`);
    }

    private applyWebGLBlur(entity: EntityElement, filter: CameraFilter): void {
        // Shader blur WebGL
        console.log(`WebGL Blur filter applied with intensity ${filter.intensity}`);
    }

    private applyWebGLColorAdjustment(entity: EntityElement, filter: CameraFilter): void {
        // Shader para ajustes de color WebGL
        console.log(`WebGL Color adjustment filter applied: ${filter.type} with intensity ${filter.intensity}`);
    }

    /**
     * Obtener información del sistema
     */
    public getFilterSupport(): { webgl: boolean; canvas2d: boolean } {
        return {
            webgl: this.webGLFiltersSupported,
            canvas2d: this.canvas2DFiltersSupported
        };
    }

    /**
     * Obtener lista de presets disponibles
     */
    public getAvailablePresets(): FilterPreset[] {
        return [...FILTER_PRESETS];
    }
}