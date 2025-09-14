import { LightComponent, LightInstance } from '@/types';
import { ComponentEntry, PropertyMetadata, State } from '@/types';

export type LightConstructor = new (...args: any[]) => LightInstance;

export interface LightMetadata {
    lightType: string;
    constructor: LightConstructor;
    properties: PropertyMetadata[];
    description?: string;
    category?: 'basic' | 'advanced' | 'effect';
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