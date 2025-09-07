export function createScriptComponent(name?: string, state?: State): ScriptComponent {
    if (name === undefined) return { type: 'script' };
    return {
        type: 'script',
        scriptName: name,
        state
    };
}
