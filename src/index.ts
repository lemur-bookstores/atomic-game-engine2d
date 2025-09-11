// Core exports
export * from './core';
export * from './ecs';
export * from './math';
export * from './physics';
export * from './input';
export * from './graphics';
export * from './assets';
export * from './audio';

export { SpriteSheetLibrary } from './math/libs/sprite-sheet';

// Main engine class
export { Engine as GameEngine } from './core/Engine';

// Hierarchy API
export { HierarchySystem } from "./ecs/components/hierarchy/HierarchySystem";
export { HierarchyOptimizations } from "./ecs/components/hierarchy/HierarchyOptimizations";
export { HierarchyManager } from "./ecs/components/hierarchy/HierarchyManager";
export { HierarchyDebugger } from "./ecs/components/hierarchy/HierarchyDebugger";
export { createHierarchyComponent } from "./ecs/components/hierarchy/HierarchyComponent";

// Animation API
export { AnimationState } from "./ecs/components/animation/AnimationState";
export { AnimationStateMachineSystem } from "./ecs/components/animation/AnimationStateMachine";
export { AnimationSystem } from "./ecs/components/animation/AnimationSystem";

// Script API
export { ScriptSystem } from './ecs/components/script/ScriptSystem';
export { scriptRegistry } from "./ecs/components/script/ScriptRegistry";
export type { ScriptMetadata, TypeMapper } from "./ecs/components/script/ScriptRegistry";
export { createScriptComponent } from "./ecs/components/script/ScriptComponent";

// Particle API
export { BasicEmitter } from './ecs/components/particles/BuiltInEmitters';
export { ParticleSystem } from './ecs/components/particles/ParticleSystem';
export { ParticleRegistry } from './ecs/components/particles/ParticleRegistry';
export { createDefaultParticleComponent } from './ecs/components/particles/ParticleComponent';

// Light API
export * from './ecs/components/light/LightComponent';
export { LightingSystem, lightRegistry } from './ecs/components/light/LightingSystem';
export { LightRegistry } from './ecs/components/light/LightRegistry';
export {
    PointLight,
    SpotLight,
    AnimatedLight,
    DirectionalLight,
    LightingUtils,
    LightingEffects,
    GameLightingManager
} from './ecs/components/light/lights';

// Version
export const VERSION = '0.7.0';

