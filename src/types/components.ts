import { Vector2D } from "@/math/Vector2D";
import {
    AnimationDirection,
    AnimationStateBase,
    BlendMode,
    CameraFilter,
    Color,
    Component,
    ComponentEntry,
    EntityElement,
    PhysicsBodyType,
    PlaybackHandle,
    ShapeType,
    State,
} from "./types";

/**
 * Componente de entrada que maneja controles de usuario
 * @interface InputComponent
 * @extends Component
 * @property {'input'} declare type - Tipo del componente
 * @property {number} moveSpeed - Velocidad de movimiento
 * @property {number} rotationSpeed - Velocidad de rotación
 * @property {Map<string, string>} keyBindings - Mapeo de teclas a acciones
 * @property {boolean} mouseEnabled - Si está habilitado el control con mouse
 * @property {boolean} touchEnabled - Si está habilitado el control táctil
 */
export interface InputComponent extends Component {
    type: 'input';
    moveSpeed: number;
    rotationSpeed: number;
    keyBindings: Map<string, string>;
    mouseEnabled: boolean;
    touchEnabled: boolean;
}

export interface LightBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Instancia de una luz individual con métodos de ciclo de vida
 * @template Entity - Tipo de la entidad asociada
 * @interface LightInstance
 * @property {string} id - Identificador único de la luz
 * @property {EntityElement} [entity] - Entidad asociada a la luz
 * @property {Vector2D} position - Posición de la luz en el mundo
 * @property {Color} color - Color de la luz
 * @property {number} intensity - Intensidad de la luz
 * @property {boolean} enabled - Si la luz está habilitada
 */
export interface LightInstance {
    id: string;
    entity?: EntityElement;
    position: Vector2D;
    color: Color;
    radius?: number;
    intensity: number;
    enabled: boolean;

    /**
     * Inicializa la instancia de luz
     */
    init?(): void;

    /**
     * Actualiza la luz cada frame
     * @param {number} dt - Tiempo delta desde el último frame
     */
    update?(dt: number): void;

    /**
     * Destruye la instancia de luz y libera recursos
     */
    destroy?(): void;

    /**
     * Renderiza la luz en el canvas
     * @param {CanvasRenderingContext2D} context - Contexto de renderizado 2D
     * @param {any} [camera] - Cámara opcional para transformaciones
     */
    render?(context: CanvasRenderingContext2D, camera?: any): void;

    /**
     * Obtiene los límites de la luz para culling y optimización
     * @returns {LightBounds} Límites de la luz
     */
    getBounds?(): LightBounds;

    /**
     * Obtiene todas las propiedades del estado actual
     * @returns {State} Estado completo de la luz
     */
    getAllProperties?(): State;

    /**
     * Establece todas las propiedades del estado
     * @param {State} state - Nuevo estado a aplicar
     */
    setAllProperties?(state: State): void;

    /**
     * Obtiene el valor de una propiedad específica
     * @param {string} name - Nombre de la propiedad
     * @returns {any} Valor de la propiedad
     */
    getProperty?(name: string): any;

    /**
     * Establece el valor de una propiedad específica
     * @param {string} name - Nombre de la propiedad
     * @param {any} value - Nuevo valor de la propiedad
     */
    setProperty?(name: string, value: any): void;
}

/**
 * Componente de iluminación que puede manejar una o múltiples luces
 * @template Entity - Tipo de la entidad asociada
 * @interface LightComponent
 * @extends Component
 * @property {'light'} declare type - Tipo del componente
 * @property {string} [lightType] - Tipo de luz (para compatibilidad con versión simple)
 * @property {State} [state] - Estado del componente
 * @property {LightInstance} [instance] - Instancia de luz única
 * @property {Array} [lights] - Array de múltiples luces
 * @property {boolean} [castShadows] - Si las luces proyectan sombras
 * @property {boolean} [affectedByAmbient] - Si las luces son afectadas por luz ambiente
 */
export interface LightComponent extends Component {
    type: 'light';
    // Soporte para luz única (legacy/simple)
    lightType?: string;
    state?: State;
    instance?: LightInstance;

    // Soporte para múltiples luces
    lights?: { lightType?: string; } & ComponentEntry<LightInstance>[];

    // Configuración global del componente
    castShadows?: boolean;
    affectedByAmbient?: boolean;
}

/**
 * Instancia de script con métodos de ciclo de vida y gestión de estado
 * @template Entity - Tipo de la entidad asociada
 * @interface ScriptInstance
 * @property {EntityElement} [entity] - Entidad asociada al script
 */
export interface ScriptInstance {
    entity?: EntityElement;

    /**
     * Inicializa el script
     */
    init?(): void;

    /**
     * Actualiza el script cada frame
     * @param {number} dt - Tiempo delta desde el último frame
     */
    update?(dt: number): void;

    /**
     * Destruye el script y libera recursos
     */
    destroy?(): void;

    /**
     * Obtiene todas las propiedades del script
     * @returns {State} Estado completo del script
     */
    getAllProperties?(): State;

    /**
     * Establece todas las propiedades del script
     * @param {State} state - Nuevo estado a aplicar
     */
    setAllProperties?(state: State): void;

    /**
     * Obtiene el valor de una propiedad específica
     * @param {string} name - Nombre de la propiedad
     * @returns {any} Valor de la propiedad
     */
    getProperty?(name: string): any;

    /**
     * Establece el valor de una propiedad específica
     * @param {string} name - Nombre de la propiedad
     * @param {any} value - Nuevo valor de la propiedad
     */
    setProperty?(name: string, value: any): void;
}

/**
 * Componente de script que puede manejar uno o múltiples scripts
 * @template Entity - Tipo de la entidad asociada
 * @interface ScriptComponent
 * @property {'script'} declare type - Tipo del componente
 * @property {string} [scriptName] - Nombre del script (para compatibilidad legacy)
 * @property {State} [state] - Estado del script único
 * @property {ScriptInstance} [instance] - Instancia del script único
 * @property {Array} [scripts] - Array de múltiples scripts
 */
export interface ScriptComponent {
    type: 'script';
    // legacy single-script fields (kept for compatibility)
    scriptName?: string;
    state?: State;
    instance?: ScriptInstance;
    // modern multi-script support
    scripts?: { scriptName?: string } & ComponentEntry<ScriptInstance>[];
}

/**
 * Componente de transformación que define posición, rotación y escala
 * @interface TransformComponent
 * @extends Component
 * @property {'transform'} declare type - Tipo del componente
 * @property {Vector2D} position - Posición en el mundo
 * @property {number} rotation - Rotación en radianes
 * @property {Vector2D} scale - Escala en X e Y
 */
export interface TransformComponent extends Component {
    type: 'transform';
    position: Vector2D;
    rotation: number;
    scale: Vector2D;
}

/**
 * Componente de sprite para renderizado de texturas 2D
 * @interface SpriteComponent
 * @extends Component
 * @property {'sprite'} declare type - Tipo del componente
 * @property {string} texture - Nombre de la textura a usar
 * @property {number} width - Ancho del sprite
 * @property {number} height - Alto del sprite
 * @property {Color} tint - Color de tinte aplicado al sprite
 * @property {number} uvX - Coordenada U inicial en la textura
 * @property {number} uvY - Coordenada V inicial en la textura
 * @property {number} uvWidth - Ancho del UV en la textura
 * @property {number} uvHeight - Alto del UV en la textura
 * @property {boolean} flipX - Si voltear horizontalmente
 * @property {boolean} flipY - Si voltear verticalmente
 */
export interface SpriteComponent extends Component {
    type: 'sprite';
    texture: string;
    width: number;
    height: number;
    tint: Color;
    uvX: number;
    uvY: number;
    uvWidth: number;
    uvHeight: number;
    flipX: boolean;
    flipY: boolean;
}

/**
 * Componente de partículas para efectos visuales
 * @interface ParticleComponent
 * @extends Component
 * @property {string} declare type - Tipo del componente
 * @property {Color} color - Color de las partículas
 * @property {number} lifetime - Tiempo de vida en segundos
 * @property {number} emissionRate - Partículas emitidas por segundo
 * @property {number} speed - Velocidad inicial de las partículas
 * @property {number} spread - Dispersión en radianes
 * @property {number} size - Tamaño de las partículas
 * @property {Vector2D} [gravity] - Gravedad aplicada a las partículas
 * @property {string | number} [layer] - Capa de renderizado
 * @property {number} [layerMask] - Máscara de capa
 * @property {boolean} [visible] - Si las partículas son visibles
 * @property {string} [texture] - Textura opcional para las partículas
 */
export interface ParticleComponent extends Component {
    type: 'particle';
    color: Color;
    lifetime: number; // seconds
    emissionRate: number; // particles per second
    speed: number;
    spread: number; // radians
    size: number;
    gravity?: Vector2D;
    layer?: string | number;
    layerMask?: number;
    visible?: boolean;
    texture?: string;
}

/**
 * Definición de una animación de sprite
 * @interface SpriteAnimation
 * @property {string} name - Nombre de la animación
 * @property {number[]} frames - Array de índices de frames
 * @property {number} duration - Duración total en segundos
 * @property {boolean} loop - Si la animación se repite
 * @property {boolean} pingPong - Si la animación va y viene
 */
export interface SpriteAnimation {
    name: string;
    frames: number[];
    duration: number;
    loop: boolean;
    pingPong: boolean;
}

export interface SfxConfig {
    soundName: string;
    volume?: number;
    loop?: boolean;
    group?: string;
}

/**
 * Componente de animación para sprites animados
 * @interface AnimationComponent
 * @extends Component
 * @property {'animation'} declare type - Tipo del componente
 * @property {string} spriteSheet - Nombre del spritesheet a usar
 * @property {string} currentAnimation - Animación actual activa
 * @property {number} currentFrame - Frame actual de la animación
 * @property {number} frameTime - Tiempo por frame
 * @property {number} elapsedTime - Tiempo transcurrido en el frame actual
 * @property {boolean} loop - Si la animación actual hace loop
 * @property {boolean} playing - Si la animación está reproduciéndose
 * @property {Map<string, SpriteAnimation>} animations - Mapa de todas las animaciones
 * @property {Object} [frameSfx] - Efectos de sonido por frame
 * @property {AnimationDirection} [direction] - Dirección de reproducción para ping-pong
 */
export interface AnimationComponent extends Component {
    type: 'animation';
    spriteSheet: string;
    currentAnimation: string;
    currentFrame: number;
    frameTime: number;
    elapsedTime: number;
    loop: boolean;
    playing: boolean;

    // Animaciones ahora usan la clase AnimationState unificada
    animations: Map<string, AnimationStateBase>;

    // Nuevas funcionalidades propuestas
    frameSfx?: Record<string, Record<number, string | SfxConfig>>;
    frameEvents?: Record<string, Record<number, FrameEventData | Array<FrameEventData>>>;
    speed?: number; // Multiplicador de velocidad global

    // Runtime state para ping-pong
    direction?: AnimationDirection;
}

export interface FrameEventData {
    eventName: string;
    data?: any;
    once?: boolean; // Si el evento solo se dispara una vez por reproducción
}

/**
 * Componente de máquina de estados de animación
 * @interface AnimationStateMachineComponent
 * @extends Component
 * @property {'anim-machine'} declare type - Tipo del componente
 * @property {string} defKey - Clave para buscar la definición compartida
 * @property {string} currentState - Estado actual de la máquina
 * @property {number} elapsed - Tiempo transcurrido en el estado actual
 * @property {Record<string, any>} [params] - Parámetros de la máquina de estados
 */
export interface AnimationStateMachineComponent extends Component {
    type: 'anim-machine';
    defKey: string; // key to lookup shared definition
    currentState: string;
    elapsed: number;
    params?: Record<string, any>;
}

/**
 * Componente de audio para reproducción de sonidos
 * @interface AudioComponent
 * @extends Component
 * @property {'audio'} declare type - Tipo del componente
 * @property {string} clip - Nombre del clip de audio
 * @property {string} [audioSheet] - Nombre del audio sheet a usar (opcional)
 * @property {boolean} [loop] - Si el audio hace loop
 * @property {number} [volume] - Volumen de reproducción (0-1)
 * @property {string} [group] - Grupo de audio para mezcla
 * @property {boolean} [autoplay] - Si se reproduce automáticamente
 * @property {PlaybackHandle | null} [playingHandle] - Handle de reproducción actual
 * @property {boolean} [autoplayOnFrame] - Si se reproduce en un frame específico
 * @property {number} [triggerFrame] - Frame específico para activar el audio
 */
export interface AudioComponent extends Component {
    type: 'audio';
    clip: string;
    audioSheet?: string;
    loop?: boolean;
    volume?: number;
    group?: string;
    autoplay?: boolean;
    playingHandle?: PlaybackHandle | null;
    // Play this clip when the entity's animation hits a frame
    autoplayOnFrame?: boolean;
    // If set, only trigger when frameIndex equals this value
    triggerFrame?: number;
}

/**
 * Componente de física básico (legacy)
 * @interface PhysicsComponent
 * @extends Component
 * @property {'physics'} declare type - Tipo del componente
 * @property {PhysicsBodyType} bodyType - Tipo de cuerpo físico
 * @property {ShapeType} shape - Forma del colisionador
 * @property {number} density - Densidad del cuerpo
 * @property {number} friction - Fricción del cuerpo
 * @property {number} restitution - Restitución (rebote) del cuerpo
 * @property {Vector2D} velocity - Velocidad actual del cuerpo
 * @property {number} angularVelocity - Velocidad angular actual
 */
export interface PhysicsComponent extends Component {
    type: 'physics';
    bodyType: PhysicsBodyType;
    shape: ShapeType;
    density: number;
    friction: number;
    restitution: number;
    velocity: Vector2D;
    angularVelocity: number;
}

/**
 * Componente de colisionador simple
 * @interface ColliderComponent
 * @extends Component
 * @property {'collider'} declare type - Tipo del componente
 * @property {number} width - Ancho del colisionador
 * @property {number} height - Alto del colisionador
 * @property {boolean} isTrigger - Si es un trigger (no colisiona físicamente)
 */
export interface ColliderComponent extends Component {
    type: 'collider';
    width: number;
    height: number;
    isTrigger: boolean;
}

/**
 * Componente de cuerpo físico avanzado
 * @declare interface PhysicsBodyComponent
 * @extends Component
 * @property {'physicsBody'} declare type - Tipo del componente
 * @property {PhysicsBodyType} bodyType - Tipo de cuerpo físico
 * @property {ShapeType} shape - Forma del cuerpo físico
 * @property {number} [width] - Ancho para formas rectangulares
 * @property {number} [height] - Alto para formas rectangulares
 * @property {number} [radius] - Radio para formas circulares
 * @property {Vector2D[]} [vertices] - Vértices para formas poligonales
 * @property {number} density - Densidad del material
 * @property {number} friction - Coeficiente de fricción
 * @property {number} restitution - Coeficiente de restitución
 * @property {boolean} [fixedRotation] - Si la rotación está bloqueada
 * @property {boolean} [isSensor] - Si es un sensor (detecta pero no colisiona)
 * @property {number} [collisionGroup] - Grupo de colisión para filtrado
 */
export interface PhysicsBodyComponent extends Component {
    type: 'physicsBody';
    bodyType: PhysicsBodyType;
    shape: ShapeType;
    width?: number;
    height?: number;
    radius?: number;
    vertices?: Vector2D[];
    density: number;
    friction: number;
    restitution: number;
    fixedRotation?: boolean;
    isSensor?: boolean;
    collisionGroup?: number;
}

/**
 * Componente de velocidad simple
 * @interface VelocityComponent
 * @property {'velocity'} declare type - Tipo del componente
 * @property {number} x - Velocidad en el eje X
 * @property {number} y - Velocidad en el eje Y
 */
export interface VelocityComponent {
    maxSpeed?: number;
    type: 'velocity';
    x: number;
    y: number;
}

export interface HierarchyComponent extends Component {
    type: "hierarchy";

    // Relaciones jerárquicas
    parentId: string | null;
    childrenIds: string[];

    // Configuración de herencia
    inheritPosition: boolean;
    inheritRotation: boolean;
    inheritScale: boolean;

    // Optimización de rendimiento
    transformDirty: boolean;
    cachedWorldTransform: {
        position: Vector2D;
        rotation: number;
        scale: Vector2D;
    } | null;

    // Configuración adicional
    useLocalCoordinates: boolean;
    preserveLocalTransform: boolean;
}

/**
 * Componente de cámara básica
 * @interface CameraComponent
 * @extends Component
 * @property {'camera'} declare type - Tipo del componente
 * @property {number} zoom - Nivel de zoom de la cámara
 * @property {{ width: number, height: number }} viewport - Dimensiones de la vista de la cámara
 * @property {boolean} isActive - Si la cámara está activa
 * @property {number} [priority] - Prioridad de la cámara (para orden de renderizado)
 */
export interface CameraComponent extends Component {
    /** Tipo del componente */
    type: 'camera';
    /** Nivel de zoom de la cámara (1.0 = zoom normal) */
    zoom: number;
    /** Dimensiones de la ventana de visualización */
    viewport: { width: number, height: number };
    /** Indica si la cámara está activa para renderizado */
    isActive: boolean;
    /** Prioridad de la cámara para el orden de renderizado (opcional) */
    priority?: number;
}

/**
 * Componente de seguimiento de cámara
 * @interface CameraFollowComponent
 * @extends Component
 * @property {'cameraFollow'} declare type - Tipo del componente
 * @property {EntityElement | null} target - Objetivo a seguir (entidad)
 * @property {number} lerp - Factor de suavizado para el seguimiento
 * @property {Vector2D} offset - Desplazamiento respecto al objetivo
 * @property {{ width: number, height: number }} [deadZone] - Zona muerta para el seguimiento
 * @property {number} [leadAmount] - Anticipación del movimiento del objetivo
 */
export interface CameraFollowComponent extends Component {
    type: 'cameraFollow';
    target: EntityElement | null;
    lerp: number;
    offset: Vector2D;
    deadZone?: { width: number, height: number };
    leadAmount?: number;
}

/**
 * Componente de límites de cámara
 * @interface CameraBoundsComponent
 * @extends Component
 * @property {'cameraBounds'} declare type - Tipo del componente
 * @property {{ x: number, y: number, width: number, height: number }} bounds - Límites de la cámara
 * @property {boolean} [softBounds] - Si los límites son suaves (con rebote)
 * @property {number} [elasticity] - Elasticidad para los límites suaves
 */
export interface CameraBoundsComponent extends Component {
    type: 'cameraBounds';
    bounds: { x: number, y: number, width: number, height: number };
    softBounds?: boolean;
    elasticity?: number;
}

/**
 * Componente de efectos de cámara
 * @interface CameraEffectsComponent
 * @extends Component
 * @property {'cameraEffects'} declare type - Tipo del componente
 * @property {Object} shake - Configuración del efecto de sacudida
 * @property {Object} screenEffects - Efectos en pantalla (destello, desvanecimiento, zoom)
 * @property {Map<string, CustomEffect>} customEffects - Efectos personalizados
 */
export interface CameraEffectsComponent extends Component {
    type: 'cameraEffects';
    shake: {
        intensity: number;
        duration: number;
        frequency: number;
        decay: number;
        active?: boolean;
    };
    screenEffects: {
        flash?: { color: Color, duration: number, intensity: number };
        fade?: { color: Color, duration: number, direction: 'in' | 'out' };
        zoom?: { targetZoom: number, duration: number, easing: string };
    };
    customEffects: Map<string, CustomEffect>;
}

/**
 * Interfaz para efectos personalizados de cámara
 */
export interface CustomEffect {
    duration: number;
    properties: Map<string, any>;
    updateFunction?: (effect: CustomEffect, deltaTime: number) => void;
}

/**
 * Componente de filtros visuales de cámara
 * @interface CameraFiltersComponent
 * @extends Component
 * @property {'cameraFilters'} declare type - Tipo del componente
 * @property {Map<string, any>} filters - Filtros aplicados a la cámara
 * @property {boolean} enabled - Si los filtros están habilitados
 * @property {string} blendMode - Modo de mezcla de filtros
 */
export interface CameraFiltersComponent extends Component {
    type: 'cameraFilters';
    filters: Map<string, CameraFilter>;
    renderTarget?: WebGLTexture | HTMLCanvasElement; // WebGLTexture | HTMLCanvasElement
    enabled: boolean;
    blendMode: BlendMode;
}

/**
 * Unión de todos los tipos de componentes disponibles en el sistema
 * @typedef {ScriptComponent | InputComponent | LightComponent | TransformComponent | SpriteComponent | AudioComponent | ParticleComponent | AnimationComponent | AnimationStateMachineComponent | PhysicsComponent | ColliderComponent | PhysicsBodyComponent | VelocityComponent} ComponentsSystem
 */
export type ComponentsSystem = ScriptComponent
    | InputComponent
    | LightComponent
    | HierarchyComponent
    | TransformComponent
    | SpriteComponent
    | AudioComponent
    | ParticleComponent
    | AnimationComponent
    | AnimationStateMachineComponent
    | PhysicsComponent
    | ColliderComponent
    | PhysicsBodyComponent
    | VelocityComponent
    | CameraComponent
    | CameraFollowComponent
    | CameraBoundsComponent
    | CameraEffectsComponent
    | CameraFiltersComponent;

