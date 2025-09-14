import { Component } from "@/types";
import { Color } from "../../../math/Color";

/**
 * Interface base para efectos de cámara personalizados
 */
export interface CameraEffect {
    duration: number;
    intensity?: number;
    active?: boolean;
}

/**
 * Efecto de shake personalizable
 */
export interface ShakeEffect extends CameraEffect {
    intensity: number;  // Hacer obligatorio
    frequency: number;
    decay: number;
    type?: 'random' | 'sine' | 'perlin';
    axis?: 'both' | 'x' | 'y';
}

/**
 * Efecto de flash personalizable
 */
export interface FlashEffect extends CameraEffect {
    color: Color;
}

/**
 * Efecto de fade personalizable
 */
export interface FadeEffect extends CameraEffect {
    color: Color;
    direction: 'in' | 'out';
    easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * Efecto de zoom personalizable
 */
export interface ZoomEffect extends CameraEffect {
    targetZoom: number;
    easing: string;
    returnToOriginal?: boolean;
}

/**
 * Efecto personalizado genérico
 */
export interface CustomEffect extends CameraEffect {
    type: string;
    properties: Record<string, any>;
    updateFunction?: (effect: CustomEffect, deltaTime: number) => void;
}

export interface CameraEffectsComponent extends Component {
    type: 'cameraEffects';

    // Efectos específicos
    shake: ShakeEffect;

    // Efectos de pantalla con tipado fuerte
    screenEffects: {
        flash?: FlashEffect;
        fade?: FadeEffect;
        zoom?: ZoomEffect;
    };

    // Sistema de efectos personalizados extensible
    customEffects: Map<string, CustomEffect>;
}
