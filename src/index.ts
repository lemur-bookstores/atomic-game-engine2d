// Core exports
export * from './core';
export * from './math';

// Main engine class
export { Engine as GameEngine } from './core/Engine';

// Script API
export { scriptRegistry } from './ecs/components/script/ScriptRegistry';

// Version
export const VERSION = '0.7.0';

