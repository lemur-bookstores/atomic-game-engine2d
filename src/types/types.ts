

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
    | 'cameraEffects';

export type TypesHierarchyChangeEvents = 'parent_set'
    | 'parent_removed'
    | 'child_added'
    | 'child_removed';

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

export interface Vector2D {
    x: number;
    y: number;
}

export interface Vector3D extends Vector2D {
    z: number;
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