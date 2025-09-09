import { ParticleComponent } from '@/types';

export const createDefaultParticleComponent = (): ParticleComponent => ({
    type: 'point' as ParticleComponent['type'],
    color: { r: 255, g: 255, b: 255, a: 1 },
    lifetime: 1.0,
    emissionRate: 10,
    speed: 50,
    spread: Math.PI / 4,
    size: 4,
    gravity: { x: 0, y: 0 },
    layer: 'default',
    layerMask: 0,
    visible: true,
    texture: undefined,
});
