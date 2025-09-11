import { Component } from "@/types";

export interface CameraComponent extends Component {
    type: 'camera';
    zoom: number;
    viewport: { width: number, height: number };
    isActive: boolean;
    priority?: number;
}
