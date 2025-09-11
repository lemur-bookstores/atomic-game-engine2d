// Hierarchy component
export { HierarchySystem } from "./_hierarchy/HierarchySystem";
export { HierarchyOptimizations } from "./_hierarchy/HierarchyOptimizations";
export { HierarchyManager } from "./_hierarchy/HierarchyManager";
export { HierarchyDebugger } from "./_hierarchy/HierarchyDebugger";
export { createHierarchyComponent } from "./_hierarchy/HierarchyComponent";

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
export { LightingSystem, lightRegistry } from './light/LightingSystem';
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

// Camera Component
export * from './camera';
