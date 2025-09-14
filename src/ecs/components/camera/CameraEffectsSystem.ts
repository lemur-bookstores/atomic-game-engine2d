import { FunctionalSystem } from "@/ecs/FunctionalSystem";
import { EntityElement, ComponentType, CameraEffectsComponent, TransformComponent, CameraComponent } from "@/types";
import { Vector2 } from "@/math";

export class CameraEffectsSystem extends FunctionalSystem {
    requiredComponents: ComponentType[] = ['camera', 'cameraEffects', 'transform'];

    update(entities: EntityElement[], deltaTime: number): void {
        for (const entity of entities) {
            const cameraComponent = entity.getComponent<CameraComponent>('camera');
            const effectsComponent = entity.getComponent<CameraEffectsComponent>('cameraEffects');
            const transformComponent = entity.getComponent<TransformComponent>('transform');

            if (!cameraComponent?.isActive || !effectsComponent || !transformComponent) {
                continue;
            }

            // Procesar screen shake
            this.processScreenShake(effectsComponent, transformComponent, deltaTime);

            // Procesar efectos de pantalla
            this.processScreenEffects(effectsComponent, deltaTime);
        }
    }

    private processScreenShake(effects: CameraEffectsComponent, transform: TransformComponent, deltaTime: number): void {
        const shake = effects.shake;

        if (!shake.active || shake.intensity <= 0) {
            return;
        }

        // Calcular desplazamiento del shake
        const shakeOffset = this.calculateShakeOffset(shake.intensity, shake.frequency, deltaTime);

        // Aplicar el offset a la posición de la cámara
        transform.position.x += shakeOffset.x;
        transform.position.y += shakeOffset.y;

        // Decrementar duración y intensity
        shake.duration -= deltaTime;
        if (shake.duration <= 0) {
            shake.active = false;
            shake.intensity = 0;
            shake.duration = 0;
        } else {
            // Aplicar decay
            shake.intensity *= shake.decay;
        }
    }

    private calculateShakeOffset(intensity: number, frequency: number, _deltaTime: number): Vector2 {
        // Usar función de ruido simple para generar shake natural
        const time = Date.now() * 0.001; // Convertir a segundos

        const offsetX = Math.sin(time * frequency * 2) * intensity * (Math.random() - 0.5) * 2;
        const offsetY = Math.cos(time * frequency * 1.7) * intensity * (Math.random() - 0.5) * 2;

        return new Vector2(offsetX, offsetY);
    }

    private processScreenEffects(effects: CameraEffectsComponent, deltaTime: number): void {
        const screenEffects = effects.screenEffects;

        // Procesar flash effect
        if (screenEffects.flash) {
            screenEffects.flash.duration -= deltaTime;
            if (screenEffects.flash.duration <= 0) {
                delete screenEffects.flash;
            }
        }

        // Procesar fade effect
        if (screenEffects.fade) {
            screenEffects.fade.duration -= deltaTime;
            if (screenEffects.fade.duration <= 0) {
                delete screenEffects.fade;
            }
        }

        // Procesar zoom effect
        if (screenEffects.zoom) {
            screenEffects.zoom.duration -= deltaTime;
            if (screenEffects.zoom.duration <= 0) {
                delete screenEffects.zoom;
            }
        }
    }

    /**
     * Activa un efecto de shake en una cámara específica
     */
    public triggerShake(entity: EntityElement, intensity: number, duration: number, frequency: number = 60): void {
        const effectsComponent = entity.getComponent<CameraEffectsComponent>('cameraEffects');
        if (!effectsComponent) {
            return;
        }

        effectsComponent.shake.intensity = intensity;
        effectsComponent.shake.duration = duration;
        effectsComponent.shake.frequency = frequency;
        effectsComponent.shake.active = true;
    }

    /**
     * Activa un efecto de flash en una cámara específica
     */
    public triggerFlash(entity: EntityElement, color: any, duration: number, intensity: number = 1): void {
        const effectsComponent = entity.getComponent<CameraEffectsComponent>('cameraEffects');
        if (!effectsComponent) {
            return;
        }

        effectsComponent.screenEffects.flash = {
            color,
            duration,
            intensity
        };
    }

    /**
     * Activa un efecto de fade en una cámara específica
     */
    public triggerFade(entity: EntityElement, color: any, duration: number, direction: 'in' | 'out'): void {
        const effectsComponent = entity.getComponent<CameraEffectsComponent>('cameraEffects');
        if (!effectsComponent) {
            return;
        }

        effectsComponent.screenEffects.fade = {
            color,
            duration,
            direction
        };
    }
}