/// <reference types="vite/client" />

declare module "*.wasm?url" {
    const src: string;
    export default src;
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