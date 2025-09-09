/// <reference types="vite/client" />

declare module "*.wasm?url" {
    const src: string;
    export default src;
}

declare module 'atomic-game-engine2d-types' {
    /**
     * Tipos de componentes disponibles en el sistema ECS (Entity-Component-System)
     * @typedef {'audio' | 'light' | 'input' | 'transform' | 'hierarchy' | 'animation' | 'anim-machine' | 'sprite' | 'script' | 'physics' | 'collider' | 'physicsBody' | 'particle' | 'velocity'} ComponentType
     */
    declare type ComponentType = 'audio'
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
        | 'velocity';

    declare type TypesHierarchyChangeEvents = 'parent_set'
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
    declare type PhysicsBodyType = 'static' | 'dynamic' | 'kinematic';

    /**
     * Formas geométricas disponibles para colisiones físicas
     * @typedef {'box' | 'circle' | 'polygon'} ShapeType
     */
    declare type ShapeType = 'box' | 'circle' | 'polygon';

    /**
     * Dirección de reproducción de animaciones
     * @typedef {1 | -1} AnimationDirection
     * - 1: Hacia adelante (forward)
     * - -1: Hacia atrás (backward)
     */
    declare type AnimationDirection = 1 | -1;

    /**
     * Estado genérico que puede contener cualquier propiedad
     * @typedef {Record<string, any>} State
     */
    declare type State = Record<string, any>;

    /**
     * Entrada de componente genérica que contiene estado e instancia
     * @template Instance - Tipo de la instancia del componente
     * @typedef {Object} ComponentEntry
     * @property {State} [state] - Estado del componente
     * @property {Instance} [instance] - Instancia del componente
     */
    declare interface ComponentEntry<Instance> {
        state?: State;
        instance?: Instance;
    }

    /**
     * Interfaz base para todos los componentes del sistema
     * @interface Component
     * @property {ComponentType} declare type - Tipo del componente
     */
    declare interface Component {
        type: ComponentType;
        [key: string]: any;
    }


    /**
     * Type definitions for the GameEngine 2D
     */
    declare type EntityId = string;

    declare interface PropertyMetadata {
        name: string;
        initialValue: any;
        type: string;
        isReadOnly?: boolean;
        validator?: (value: any) => boolean;
        description?: string;
    }

    declare interface PlaybackHandle {
        id: string;
        sourceNode?: AudioBufferSourceNode;
        gainNode?: GainNode;
    }

    declare interface Color {
        r: number
        g: number
        b: number
        a?: number
    }

    declare interface Vector2D {
        x: number;
        y: number;
    }

    declare interface Vector3D extends Vector2D {
        z: number;
    }

    declare interface EngineConfig {
        canvas: string | HTMLCanvasElement;
        width: number;
        height: number;
        renderer: 'webgl' | 'canvas2d' | 'auto';
        backgroundColor?: string;
        pixelRatio?: number;
        antialias?: boolean;
        debug?: boolean;
    }

    declare interface GameEvent<T = any> {
        type: AllEventTypes;
        data: T;
        timestamp: number;
    }

    declare type EventCallback<T> = (event: GameEvent<T>) => void;

    declare interface Rectangle {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    declare interface TransformData {
        position: Vector2D;
        rotation: number;
        scale: Vector2D;
    }

    declare type SystemUpdateFunction = <T>(entities: T[], deltaTime: number) => void;

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
    declare abstract class EntityElement {
        /**
         * Identificador único de la entidad
         * @readonly
         * @declare type {string}
         */
        public readonly id: EntityId;

        /**
         * Estado de activación de la entidad. Las entidades inactivas
         * no son procesadas por los sistemas
         * @declare type {boolean}
         */
        public active: boolean;

        /**
         * Mapa interno de componentes indexados por su tipo
         * @private
         * @declare type {Map<string, ComponentsSystem>}
         */
        protected components: Map<string, ComponentsSystem>;

        /**
         * Capa de renderizado o procesamiento de la entidad
         * @private
         * @declare type {string | number}
         */
        protected _layer: string | number;

        /**
         * Crea una nueva instancia de EntityElement
         * @param {string} [id] - ID personalizado para la entidad. Si no se proporciona, se genera uno automáticamente
         */
        constructor(id: string)

        getId(): string;

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
        addComponent<T extends ComponentsSystem>(component: T): void;

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
        hasComponent(type: ComponentType): boolean;

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
        getComponent<T extends ComponentsSystem>(type: T['type']): T | undefined;

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
        getComponents(): ComponentsSystem[];

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
        removeComponent(type: ComponentType): void;

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
        setLayer(layer: string | number): void;

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
        getLayer(): string | number;

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
        clone(): EntityElement;

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
        destroy(): void;

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
        toJSON(): {
            id: string;
            active: boolean;
            layer: string | number;
            components: Array<ComponentsSystem>;
        };
    }
}