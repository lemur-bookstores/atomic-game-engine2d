import { ScriptComponent } from "atomic-game-engine2d-components";
import { State } from "atomic-game-engine2d-types";

export function createScriptComponent(name?: string, state?: State): ScriptComponent {
    if (name === undefined) return { type: 'script' };
    return {
        type: 'script',
        scriptName: name,
        state
    };
}
