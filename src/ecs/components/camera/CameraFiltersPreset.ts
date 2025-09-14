import { CameraFilter } from "@/types";

/**
 * Preset de filtros predefinidos
 */
export interface FilterPreset {
    name: string;
    description: string;
    filters: CameraFilter[];
}

/**
 * Presets comunes
 */
export const FILTER_PRESETS: FilterPreset[] = [
    {
        name: 'Noir',
        description: 'Efecto película noir clásica',
        filters: [
            { type: 'grayscale', intensity: 1.0, enabled: true },
            { type: 'contrast', intensity: 0.8, level: 1.3, enabled: true },
            { type: 'vignette', intensity: 0.6, radius: 0.8, softness: 0.7, opacity: 0.8, enabled: true }
        ]
    },
    {
        name: 'Vintage',
        description: 'Fotografía vintage con tintes cálidos',
        filters: [
            { type: 'sepia', intensity: 0.7, enabled: true, warmth: 0.8 },
            { type: 'vintage', intensity: 0.8, enabled: true, tint: { r: 1.1, g: 0.9, b: 0.7 }, vignette: 0.5, grain: 0.3 },
            { type: 'saturation', intensity: 0.6, level: 0.8, enabled: true }
        ]
    },
    {
        name: 'Sin City',
        description: 'Blanco y negro con acentos de color rojo',
        filters: [
            { type: 'sin-city', intensity: 1.0, enabled: true, accentColor: { r: 255, g: 0, b: 0 }, threshold: 0.8 },
            { type: 'contrast', intensity: 0.9, level: 1.4, enabled: true }
        ]
    },
    {
        name: 'Cyberpunk',
        description: 'Efecto futurista con aberración cromática',
        filters: [
            { type: 'chromatic-aberration', intensity: 0.7, enabled: true, offset: 3 },
            { type: 'saturation', intensity: 0.8, level: 1.5, enabled: true },
            { type: 'hue-rotate', intensity: 0.3, enabled: true, degrees: 15 }
        ]
    },
    {
        name: 'Retro Game',
        description: 'Pixelado estilo videojuegos retro',
        filters: [
            { type: 'pixelate', intensity: 1.0, enabled: true, pixelSize: 4 },
            { type: 'saturation', intensity: 0.6, level: 1.3, enabled: true },
            { type: 'contrast', intensity: 0.5, level: 1.2, enabled: true }
        ]
    },
    {
        name: 'Horror',
        description: 'Ambiente terrorífico',
        filters: [
            { type: 'saturation', intensity: 0.8, level: 0.3, enabled: true },
            { type: 'brightness', intensity: 0.6, level: -0.3, enabled: true },
            { type: 'vignette', intensity: 0.9, radius: 0.6, softness: 0.8, opacity: 0.9, enabled: true },
            { type: 'hue-rotate', intensity: 0.4, enabled: true, degrees: 270 }
        ]
    }
];