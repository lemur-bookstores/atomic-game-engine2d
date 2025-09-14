import { EntityElement } from "./types";

export interface AnimationStateStateMachine {
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
    states: AnimationStateStateMachine[];
    transitions: AnimationTransition[];
    initial: string;
}

