export interface AnimationState {
    name: string;
    animation: string;
    onEnter?: { reset?: boolean; events?: string[] };
    onExit?: { events?: string[] };
}

export interface AnimationTransition {
    from: string | '*';
    to: string;
    condition?: (entity: EntityElement) => boolean;
    trigger?: string;
    priority?: number;
}

export interface StateMachineDefinition {
    states: AnimationState[];
    transitions: AnimationTransition[];
    initial: string;
}

