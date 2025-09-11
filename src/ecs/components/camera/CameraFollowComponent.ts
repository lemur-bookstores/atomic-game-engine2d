import { Component } from "@/types";
import { EntityElement } from "@/types";
import { Vector2 } from "@/math";

export interface CameraFollowComponent extends Component {
    type: 'cameraFollow';
    target: EntityElement | null;
    lerp: number;
    offset: Vector2;
    deadZone?: { width: number, height: number };
    leadAmount?: number;
}
