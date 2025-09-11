import { Component } from "@/types";

export interface CameraBoundsComponent extends Component {
    type: 'cameraBounds';
    bounds: { x: number, y: number, width: number, height: number };
    softBounds?: boolean;
    elasticity?: number;
}
