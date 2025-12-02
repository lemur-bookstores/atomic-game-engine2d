

import { Vector2D } from "@/math/Vector2D";
import { ComponentsSystem } from "./components";
import { AllEventTypes } from "./event-names";
/**
 * Tipos de componentes disponibles en el sistema ECS (Entity-Component-System)
 * @typedef {'audio' | 'light' | 'input' | 'transform' | 'hierarchy' | 'animation' | 'anim-machine' | 'sprite' | 'script' | 'physics' | 'collider' | 'physicsBody' | 'particle' | 'velocity'} ComponentType
 */
export type ComponentType = 'audio'
    | 'light'
    | 'input'
    | 'transform'
    | 'hierarchy'
    | 'animation'
    | 'anim-machine'
    | 'sprite'
    | 'script'
    | 'physics'
    | 'collider'
    | 'physicsBody'
    | 'particle'
    | 'velocity'
    | 'camera'
    | 'cameraFollow'
    | 'cameraBounds'
    | 'cameraEffects'
    | 'cameraFilters';

export type TypesHierarchyChangeEvents = 'parent_set'
    | 'parent_removed'
    | 'child_added'
    | 'child_removed';


/**
 * Tipos de filtros disponibles
 */
export type FilterType =
    | 'sepia'
    | 'grayscale'
    | 'blur'
    | 'brightness'
    | 'contrast'
    | 'saturation'
    | 'hue-rotate'
    | 'invert'
    | 'sin-city'
    | 'vintage'
    | 'pixelate'
    | 'chromatic-aberration'
    | 'vignette';

export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';

export type Easing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
/**
* Configuración base para filtros
*/
export interface FilterConfig {
    type: FilterType;
    intensity: number; // 0.0 a 1.0
    enabled: boolean;
    duration?: number; // Para filtros temporales (ms)
    easing?: Easing;
}

/**
 * Filtros específicos con sus parámetros únicos
 */
export interface SepiaFilter extends FilterConfig {
    type: 'sepia';
    warmth?: number; // 0.0 a 1.0
}

export interface GrayscaleFilter extends FilterConfig {
    type: 'grayscale';
    luminanceWeights?: { r: number; g: number; b: number };
}

export interface BlurFilter extends FilterConfig {
    type: 'blur';
    radius: number; // Radio del blur en píxeles
}

export interface BrightnessFilter extends FilterConfig {
    type: 'brightness';
    level: number; // -1.0 a 1.0 (0 = normal)
}

export interface ContrastFilter extends FilterConfig {
    type: 'contrast';
    level: number; // 0.0 a 2.0 (1.0 = normal)
}

export interface SaturationFilter extends FilterConfig {
    type: 'saturation';
    level: number; // 0.0 a 2.0 (1.0 = normal)
}

export interface HueRotateFilter extends FilterConfig {
    type: 'hue-rotate';
    degrees: number; // 0 a 360
}

export interface InvertFilter extends FilterConfig {
    type: 'invert';
}

export interface SinCityFilter extends FilterConfig {
    type: 'sin-city';
    accentColor: { r: number; g: number; b: number }; // Color que se mantiene
    threshold: number; // 0.0 a 1.0 - umbral para detectar el color
}

export interface VintageFilter extends FilterConfig {
    type: 'vintage';
    tint: { r: number; g: number; b: number };
    vignette: number; // 0.0 a 1.0
    grain: number; // 0.0 a 1.0
}

export interface PixelateFilter extends FilterConfig {
    type: 'pixelate';
    pixelSize: number; // Tamaño del pixel en unidades
}

export interface ChromaticAberrationFilter extends FilterConfig {
    type: 'chromatic-aberration';
    offset: number; // Offset de separación de canales
}

export interface VignetteFilter extends FilterConfig {
    type: 'vignette';
    radius: number; // 0.0 a 1.0
    softness: number; // 0.0 a 1.0
    opacity: number; // 0.0 a 1.0
}

/**
 * Unión de todos los tipos de filtros
 */
export type CameraFilter =
    | SepiaFilter
    | GrayscaleFilter
    | BlurFilter
    | BrightnessFilter
    | ContrastFilter
    | SaturationFilter
    | HueRotateFilter
    | InvertFilter
    | SinCityFilter
    | VintageFilter
    | PixelateFilter
    | ChromaticAberrationFilter
    | VignetteFilter;
/**
 * Tipos de cuerpos físicos disponibles en el motor de física
 * @typedef {'static' | 'dynamic' | 'kinematic'} PhysicsBodyType
 * - static: Cuerpo inmóvil, no afectado por fuerzas
 * - dynamic: Cuerpo móvil, afectado por fuerzas y colisiones
 * - kinematic: Cuerpo móvil controlado por código, no por física
 */
export type PhysicsBodyType = 'static' | 'dynamic' | 'kinematic';

/**
 * Formas geométricas disponibles para colisiones físicas
 * @typedef {'box' | 'circle' | 'polygon'} ShapeType
 */
export type ShapeType = 'box' | 'circle' | 'polygon';

/**
 * Dirección de reproducción de animaciones
 * @typedef {1 | -1} AnimationDirection
 * - 1: Hacia adelante (forward)
 * - -1: Hacia atrás (backward)
 */
export type AnimationDirection = 1 | -1;

/**
 * Estado genérico que puede contener cualquier propiedad
 * @typedef {Record<string, any>} State
 */
export type State = Record<string, any>;

/**
 * Entrada de componente genérica que contiene estado e instancia
 * @template Instance - Tipo de la instancia del componente
 * @typedef {Object} ComponentEntry
 * @property {State} [state] - Estado del componente
 * @property {Instance} [instance] - Instancia del componente
 */
export interface ComponentEntry<Instance> {
    state?: State;
    instance?: Instance;
}

/**
 * Interfaz base para todos los componentes del sistema
 * @interface Component
 * @property {ComponentType} export type - Tipo del componente
 */
export interface Component {
    type: ComponentType;
    [key: string]: any;
}

/**
 * Type definitions for the GameEngine 2D
 */
export type EntityId = string;

export interface PropertyMetadata {
    name: string;
    initialValue: any;
    type: string;
    isReadOnly?: boolean;
    validator?: (value: any) => boolean;
    description?: string;
}

export interface PlaybackHandle {
    id: string;
    sourceNode?: AudioBufferSourceNode;
    gainNode?: GainNode;
}

export interface Color {
    r: number
    g: number
    b: number
    a?: number
}

export interface EngineConfig {
    canvas: string | HTMLCanvasElement;
    width: number;
    height: number;
    renderer: 'webgl' | 'canvas2d' | 'auto';
    backgroundColor?: string;
    pixelRatio?: number;
    antialias?: boolean;
    debug?: boolean;
}

export interface GameEvent<T = any> {
    type: AllEventTypes;
    data: T;
    timestamp: number;
}

export type EventCallback<T> = (event: GameEvent<T>) => void;

export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface TransformData {
    position: Vector2D;
    rotation: number;
    scale: Vector2D;
}

export type SystemUpdateFunction = <T>(entities: T[], deltaTime: number) => void;

export abstract class AnimationStateBase {
    name: string = '';
    frames: number[] = [];
    duration: number = 1000;
    loop: boolean = true;
    pingPong: boolean = false;
    currentFrame: number = 0;
    elapsedTime: number = 0;
    playing: boolean = false;
    direction: AnimationDirection = 1;

    abstract play(): void

    abstract pause(): void

    abstract stop(): void

    abstract restart(): void

    abstract update(deltaTime: number): boolean

    abstract getCurrentFrameIndex(): number

    abstract getProgress(): number

    abstract clone(): AnimationStateBase

    protected abstract nextFrame(): boolean
}

/**
 * Clase abstracta base que representa un elemento entidad en el sistema ECS
 * (Entity-Component-System). Proporciona funcionalidad básica para manejar
 * componentes, capas y ciclo de vida de entidades.
 *
 * @abstract
 * @class EntityElement
 *
 * @example
 * ```typescript
 * class Player extends EntityElement {
 *   constructor() {
 *     super('player-1');
 *     this.addComponent({
 *       type: 'transform',
 *       position: { x: 0, y: 0 },
 *       rotation: 0,
 *       scale: { x: 1, y: 1 }
 *     });
 *   }
 * }
 * ```
 */
export abstract class EntityElement {
    /**
     * Identificador único de la entidad
     * @readonly
     * @declare type {string}
     */
    public readonly id: EntityId = '';

    /**
     * Estado de activación de la entidad. Las entidades inactivas
     * no son procesadas por los sistemas
     * @declare type {boolean}
     */
    public active: boolean = true;

    /**
     * Mapa interno de componentes indexados por su tipo
     * @private
     * @declare type {Map<string, ComponentsSystem>}
     */
    protected components!: Map<string, ComponentsSystem>;

    /**
     * Capa de renderizado o procesamiento de la entidad
     * @private
     * @declare type {string | number}
     */
    protected _layer: string | number = 'default';

    abstract getId(): string;

    /**
     * Añade un componente a la entidad. Si ya existe un componente del mismo tipo,
     * será reemplazado por el nuevo componente.
     *
     * @template T - Tipo del componente que extiende ComponentsSystem
     * @param {T} component - El componente a añadir
     *
     * @example
     * ```typescript
     * entity.addComponent({
     *   type: 'sprite',
     *   texture: 'player.png',
     *   width: 32,
     *   height: 32,
     *   tint: { r: 255, g: 255, b: 255, a: 1 }
     * });
     * ```
     */
    abstract addComponent<T extends ComponentsSystem>(component: T): void;

    /**
     * Verifica si la entidad tiene un componente del tipo especificado
     *
     * @param {ComponentType} declare type - Tipo de componente a verificar
     * @returns {boolean} True si la entidad tiene el componente, false en caso contrario
     *
     * @example
     * ```typescript
     * if (entity.hasComponent('physics')) {
     *   // La entidad tiene componente de física
     *   const physicsComp = entity.getComponent('physics');
     * }
     * ```
     */
    abstract hasComponent(type: ComponentType): boolean;

    /**
     * Obtiene un componente específico de la entidad por su tipo
     *
     * @template T - Tipo del componente que extiende ComponentsSystem
     * @param {T['type']} declare type - Tipo del componente a obtener
     * @returns {T | undefined} El componente si existe, undefined en caso contrario
     *
     * @example
     * ```typescript
     * const transform = entity.getComponent('transform');
     * if (transform) {
     *   transform.position.x += 10;
     * }
     * ```
     */
    abstract getComponent<T extends ComponentsSystem>(type: T['type']): T | undefined;

    /**
     * Obtiene todos los componentes de la entidad como un array
     *
     * @returns {ComponentsSystem[]} Array con todos los componentes de la entidad
     *
     * @example
     * ```typescript
     * const allComponents = entity.getComponents();
     * console.log(`Entity has ${allComponents.length} components`);
     * ```
     */
    abstract getComponents(): ComponentsSystem[];

    /**
     * Elimina un componente de la entidad por su tipo
     *
     * @param {ComponentType} declare type - Tipo del componente a eliminar
     *
     * @example
     * ```typescript
     * // Remover física de la entidad
     * entity.removeComponent('physics');
     * ```
     */
    abstract removeComponent(type: ComponentType): void;

    /**
     * Establece la capa de la entidad para organización y renderizado
     *
     * @param {string | number} layer - Nueva capa para la entidad
     *
     * @example
     * ```typescript
     * entity.setLayer('background'); // Capa con nombre
     * entity.setLayer(0);           // Capa numérica
     * ```
     */
    abstract setLayer(layer: string | number): void;

    /**
     * Obtiene la capa actual de la entidad
     *
     * @returns {string | number} La capa actual de la entidad
     *
     * @example
     * ```typescript
     * const currentLayer = entity.getLayer();
     * if (currentLayer === 'ui') {
     *   // Procesar como elemento de UI
     * }
     * ```
     */
    abstract getLayer(): string | number;

    /**
     * Crea una copia exacta de la entidad con un nuevo ID
     * Las instancias de componentes no se clonan, solo sus propiedades de estado
     *
     * @returns {this} Nueva instancia clonada de la entidad
     *
     * @example
     * ```typescript
     * const originalEntity = new MyEntity();
     * const clonedEntity = originalEntity.clone();
     * // clonedEntity tiene un ID diferente pero los mismos componentes
     * ```
     */
    abstract clone(): EntityElement;

    /**
     * Destruye la entidad y libera todos sus recursos.
     * Llama al método destroy() de todos los componentes que lo implementen
     * y limpia todas las referencias internas.
     *
     * @example
     * ```typescript
     * entity.destroy();
     * // La entidad ya no debe ser usada después de esto
     * ```
     */
    abstract destroy(): void;

    /**
     * Serializa la entidad a formato JSON para persistencia o transmisión
     *
     * @returns {Object} Representación JSON de la entidad
     * @returns {string} returns.id - ID de la entidad
     * @returns {boolean} returns.active - Estado de activación
     * @returns {string | number} returns.layer - Capa de la entidad
     * @returns {Array<ComponentsSystem>} returns.comments - Array de componentes (nota: debería ser 'components')
     *
     * @example
     * ```typescript
     * const entityData = entity.toJSON();
     * const jsonString = JSON.stringify(entityData);
     * // Guardar jsonString en archivo o enviar por red
     * ```
     */
    abstract toJSON(): {
        id: string;
        active: boolean;
        layer: string | number;
        components: Array<ComponentsSystem>;
    };
}