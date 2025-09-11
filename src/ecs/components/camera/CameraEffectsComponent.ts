import { Component } from "@/types";
import { Color } from "../../../math/Color";

export interface CameraEffectsComponent extends Component {
    type: 'cameraEffects';
    shake: {
        intensity: number;
        duration: number;
        frequency: number;
        decay: number;
        active: boolean;
    };
    screenEffects: {
        flash?: { color: Color, duration: number, intensity: number };
        fade?: { color: Color, duration: number, direction: 'in' | 'out' };
        zoom?: { targetZoom: number, duration: number, easing: string };
    };
}
