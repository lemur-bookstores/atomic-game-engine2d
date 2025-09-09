// Hierarchy component
export { HierarchySystem } from "./hierarchy/HierarchySystem";
export { HierarchyOptimizations } from "./hierarchy/HierarchyOptimizations";
export { HierarchyManager } from "./hierarchy/HierarchyManager";
export { HierarchyDebugger } from "./hierarchy/HierarchyDebugger";
export { createHierarchyComponent } from "./hierarchy/HierarchyComponent";

// Animation Component
export { AnimationState } from "./animation/AnimationState";
export { AnimationStateMachineSystem } from "./animation/AnimationStateMachine";
export { AnimationSystem } from "./animation/AnimationSystem";

// Script Component
export { ScriptSystem } from './script/ScriptSystem';
export { scriptRegistry } from "./script/ScriptRegistry";
export type { ScriptMetadata, TypeMapper } from "./script/ScriptRegistry";
export { createScriptComponent } from "./script/ScriptComponent";

// Particle Component
export { BasicEmitter } from './particles/BuiltInEmitters';
export { ParticleSystem } from './particles/ParticleSystem';
export { ParticleRegistry } from './particles/ParticleRegistry';
export { createDefaultParticleComponent } from './particles/ParticleComponent';

// Light Component
export * from './light/LightComponent';
export { lightRegistry } from './light/LightingSystem';
export { LightRegistry } from './light/LightRegistry';
export {
    PointLight,
    SpotLight,
    AnimatedLight,
    DirectionalLight,
    LightingUtils,
    LightingEffects,
    GameLightingManager
} from './light/lights';
