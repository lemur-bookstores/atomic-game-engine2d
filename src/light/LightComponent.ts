export type LightConstructor = new (...args: any[]) => LightInstance;

export interface LightMetadata {
    lightType: string;
    constructor: LightConstructor;
    properties: PropertyMetadata[];
    description?: string;
    category?: 'basic' | 'advanced' | 'effect';
}

export interface PropertyMetadata {
    name: string;
    initialValue: any;
    type: string;
    description?: string;
    min?: number;
    max?: number;
}

export interface LightEntry extends ComponentEntry<LightInstance> { lightType?: string; };

export function createLightComponent(lightType?: string, state?: State): LightComponent {
    if (!lightType) return { type: 'light' };
    return {
        type: 'light',
        lightType,
        state,
        castShadows: true,
        affectedByAmbient: true
    };
}