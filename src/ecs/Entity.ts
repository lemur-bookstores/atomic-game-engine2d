import { ComponentsSystem } from 'atomic-game-engine2d-components';
import { EntityElement, ComponentType, EntityId } from 'atomic-game-engine2d-types';
import { v4 as uuidv4 } from 'uuid';

export class Entity extends EntityElement {
    public active: boolean;
    protected components: Map<string, ComponentsSystem>;
    protected _layer: string | number = 'default';

    constructor(public readonly id: EntityId = uuidv4()) {
        super(id);
        this.active = true;
        this.components = new Map();
    }

    addComponent<T extends ComponentsSystem>(component: T): void {
        this.components.set(component.type, component);
    }


    getId(): string {
        return this.id;
    }

    setLayer(layer: string | number): void {
        this._layer = layer;
    }

    getLayer(): string | number {
        return this._layer;
    }

    removeComponent(type: ComponentType): void {
        this.components.delete(type);
    }

    getComponent<T extends ComponentsSystem>(type: T['type']): T | undefined {
        return this.components.get(type) as T;
    }

    hasComponent(type: ComponentType): boolean {
        return this.components.has(type);
    }

    getComponents(): ComponentsSystem[] {
        return Array.from(this.components.values());
    }

    clone(): Entity {
        const cloned = new Entity();

        this.getComponents().forEach((component) => {
            cloned.addComponent({ ...component });
        });

        cloned.active = this.active;
        cloned.setLayer(this.getLayer());

        return cloned;
    }

    destroy(): void {
        this.active = false;
        this.components.clear();
    }

    toJSON() {
        return {
            id: this.id,
            active: this.active,
            layer: this._layer,
            components: this.getComponents().map(c => ({ ...c }))
        };
    }
}