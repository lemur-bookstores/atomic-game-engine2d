import { Component } from "@/types";

/**
 * Componente básico de cámara para renderizado 2D
 * @interface CameraComponent
 * @extends Component
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
