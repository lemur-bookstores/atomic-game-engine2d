import { AnimationComponent, SpriteComponent, SpriteAnimation } from '@/types';
import { ComponentType, EntityElement } from '@/types';
import { FunctionalSystem } from '../../FunctionalSystem';
import { SpriteSheet } from '../../../graphics/SpriteSheet';
import { AssetManager } from '../../../assets/AssetManager';
import { EventSystem } from '../../../core/EventSystem';
import { ANIMATION_EVENTS } from '../../../types/event-const';
import { AudioManager } from '@/audio/AudioManager';

export interface AnimationFrameEventData {
    entity: EntityElement;
    animationName: string;
    frameIndex: number;
    spriteFrameIndex: number;
    progress: number;
    isLastFrame: boolean;
}

export class AnimationSystem extends FunctionalSystem {
    requiredComponents: Array<ComponentType> = ['animation', 'sprite'];
    private spriteSheets = new Map<string, SpriteSheet>();
    private assetManager: AssetManager | null = null;
    private eventSystem: EventSystem;
    private audioManager: AudioManager;

    constructor(assetManager?: AssetManager) {
        super();
        if (assetManager) this.assetManager = assetManager;
        this.eventSystem = EventSystem.getInstance();
        this.audioManager = AudioManager.getInstance();
    }

    registerSpriteSheet(name: string, spriteSheet: SpriteSheet): void {
        this.spriteSheets.set(name, spriteSheet);
    }

    unregisterSpriteSheet(name: string): void {
        this.spriteSheets.delete(name);
    }

    getSpriteSheet(name: string): SpriteSheet | undefined {
        return this.spriteSheets.get(name);
    }

    update(entities: EntityElement[], deltaTime: number): void {
        const animatedEntities = this.getEntitiesWithComponents(
            entities,
            this.requiredComponents
        );

        for (const entity of animatedEntities) {
            this.updateAnimation(entity, deltaTime);
        }
    }

    private updateAnimation(entity: EntityElement, deltaTime: number): void {
        const animComponent = entity.getComponent<AnimationComponent>('animation');
        const spriteComponent = entity.getComponent<SpriteComponent>('sprite');

        if (!animComponent || !spriteComponent || !animComponent.playing) return;

        let spriteSheet = this.spriteSheets.get(animComponent.spriteSheet);

        // Si no está registrado manualmente, intentar resolver vía AssetManager
        if (!spriteSheet && this.assetManager) {
            const ss = this.assetManager.getSpriteSheet(animComponent.spriteSheet);
            if (ss) {
                this.registerSpriteSheet(animComponent.spriteSheet, ss);
                spriteSheet = ss;
            }
        }

        if (!spriteSheet) return;

        // Obtener animación del componente, no del spriteSheet
        let currentAnim = animComponent.animations.get(animComponent.currentAnimation);
        if (!currentAnim) {
            // Fallback: permitir usar animaciones definidas directamente en el SpriteSheet
            const sheetAnim = spriteSheet.getAnimation(animComponent.currentAnimation);
            if (sheetAnim) {
                currentAnim = sheetAnim;
                // Opcionalmente cachear en el mapa del componente para lookups más rápidos
                animComponent.animations.set(sheetAnim.name, sheetAnim);
            } else {
                return; // No se encontró animación
            }
        }

        // Aplicar multiplicador de velocidad si existe
        const speed = animComponent.speed || 1.0;
        const effectiveDeltaTime = deltaTime * speed;

        // Si la animación define una duración, interpretarla como tiempo por frame
        // (comportamiento legacy). Respetar un frameTime explícito ya establecido en el componente
        if (currentAnim.duration && currentAnim.duration > 0 && (!animComponent.frameTime || animComponent.frameTime <= 0)) {
            animComponent.frameTime = currentAnim.duration;
        }

        // Actualizar tiempo transcurrido
        animComponent.elapsedTime += effectiveDeltaTime;

        // Cambiar frame si es necesario
        let frameChanged = false;
        if (animComponent.elapsedTime >= animComponent.frameTime) {
            const prevFrame = animComponent.currentFrame;
            const animationComplete = this.nextFrame(animComponent, currentAnim);
            animComponent.elapsedTime = 0;

            if (animationComplete) {
                this.onAnimationComplete(entity, currentAnim.name);
            }

            frameChanged = animComponent.currentFrame !== prevFrame;
        }

        // Procesar eventos por frame si el frame cambió
        if (frameChanged) {
            this.processFrameEvents(entity, animComponent);
        }

        // Actualizar UV coordinates del sprite
        this.updateSpriteUV(spriteComponent, spriteSheet, animComponent, currentAnim);

        // Emitir evento FRAME si el frame cambió
        if (frameChanged && this.eventSystem) {
            const frameIndex = currentAnim.frames[animComponent.currentFrame];
            const eventData: AnimationFrameEventData = {
                entity,
                animationName: animComponent.currentAnimation,
                frameIndex: animComponent.currentFrame,
                spriteFrameIndex: frameIndex,
                progress: animComponent.currentFrame / (currentAnim.frames.length - 1),
                isLastFrame: animComponent.currentFrame === currentAnim.frames.length - 1
            };

            this.eventSystem.emit(ANIMATION_EVENTS.FRAME, eventData);
        }
    }

    private processFrameEvents(
        entity: EntityElement,
        animComponent: AnimationComponent
    ): void {
        // Procesar efectos de sonido por frame usando la estructura del componente
        const animation = animComponent.frameSfx?.[animComponent.currentAnimation];
        if (animation) {
            const frameSfx = animation[animComponent.currentFrame];
            if (typeof frameSfx === 'string') {
                this.audioManager.play(frameSfx, {});
            } else {

                this.audioManager.play(frameSfx.soundName, {
                    volume: frameSfx.volume,
                    loop: frameSfx.loop,
                    group: frameSfx.group
                });
            }
        }

        // Procesar eventos personalizados por frame si existen
        const frameEvents = animComponent.frameEvents?.[animComponent.currentAnimation]?.[animComponent.currentFrame];
        if (frameEvents) {
            if (Array.isArray(frameEvents)) {
                // Múltiples eventos
                for (const eventData of frameEvents) {
                    this.eventSystem.emit(eventData.eventName as any, {
                        entity,
                        animationName: animComponent.currentAnimation,
                        frameIndex: animComponent.currentFrame,
                        data: eventData.data
                    });

                }
            } else if (typeof frameEvents === 'string') {
                // Evento simple (string)
                this.eventSystem.emit(frameEvents as any, {
                    entity,
                    animationName: animComponent.currentAnimation,
                    frameIndex: animComponent.currentFrame
                });
            }
        }
    }

    private nextFrame(animComponent: AnimationComponent, animation: SpriteAnimation): boolean {
        if (animation.pingPong) {
            return this.updatePingPongFrame(animComponent, animation);
        } else {
            return this.updateNormalFrame(animComponent, animation);
        }
    }

    private updateNormalFrame(animComponent: AnimationComponent, animation: SpriteAnimation): boolean {
        animComponent.currentFrame++;

        if (animComponent.currentFrame >= animation.frames.length) {
            if (animation.loop) {
                animComponent.currentFrame = 0;
            } else {
                animComponent.currentFrame = animation.frames.length - 1;
                animComponent.playing = false;
                return true; // SpriteAnimation completed
            }
        }

        return false;
    }

    private updatePingPongFrame(animComponent: AnimationComponent, animation: SpriteAnimation): boolean {
        // Usar la dirección runtime tipada en el AnimationComponent
        if (typeof animComponent.direction !== 'number') {
            animComponent.direction = 1; // 1 = forward, -1 = backward
        }

        const direction = animComponent.direction!;
        animComponent.currentFrame += direction;

        if (animComponent.currentFrame >= animation.frames.length - 1) {
            animComponent.direction = -1;
            animComponent.currentFrame = animation.frames.length - 1;
        } else if (animComponent.currentFrame <= 0) {
            animComponent.direction = 1;
            animComponent.currentFrame = 0;

            if (!animation.loop) {
                animComponent.playing = false;
                return true; // SpriteAnimation completed
            }
        }

        return false;
    }

    private updateSpriteUV(
        sprite: SpriteComponent,
        spriteSheet: SpriteSheet,
        animComponent: AnimationComponent,
        animation: SpriteAnimation
    ): void {
        const frameIndex = animation.frames[animComponent.currentFrame];
        const frame = spriteSheet?.getSpriteFrameUV(frameIndex);

        if (frame) {
            const { size, uv } = frame;
            // algunos tests esperan coordenadas de pixel aquí
            sprite.uvX = uv.uvX;
            sprite.uvY = uv.uvY;
            sprite.uvWidth = uv.uvWidth;
            sprite.uvHeight = uv.uvHeight;
            sprite.width = size.width;
            sprite.height = size.height;
        }
    }

    private onAnimationComplete(entity: EntityElement, animationName: string): void {
        // Emitir evento de animación completa
        if (this.eventSystem) {
            this.eventSystem.emit(ANIMATION_EVENTS.COMPLETE, { entity, animationName });
        }
    }

    // Métodos públicos para control de animación
    playAnimation(entity: EntityElement, animationName: string): boolean {
        const animComponent = entity.getComponent<AnimationComponent>('animation');
        if (!animComponent) return false;

        // Verificar que la animación existe en el componente, no en el spriteSheet
        if (!animComponent.animations.has(animationName)) return false;

        animComponent.currentAnimation = animationName;
        animComponent.currentFrame = 0;
        animComponent.elapsedTime = 0;
        animComponent.playing = true;

        // Resetear dirección ping-pong
        (animComponent as any).direction = 1;

        // Si la animación define duración, computar y establecer frameTime inmediatamente
        const animation = animComponent.animations.get(animationName);
        if (animation && animation.duration && animation.duration > 0) {
            const n = Math.max(1, animation.frames.length);
            const steps = animation.pingPong ? Math.max(1, n * 2 - 2) : n;
            animComponent.frameTime = animation.duration / steps;
        }

        return true;
    }

    pauseAnimation(entity: EntityElement): boolean {
        const animComponent = entity.getComponent<AnimationComponent>('animation');
        if (!animComponent) return false;

        animComponent.playing = false;
        return true;
    }

    resumeAnimation(entity: EntityElement): boolean {
        const animComponent = entity.getComponent<AnimationComponent>('animation');
        if (!animComponent) return false;

        animComponent.playing = true;
        return true;
    }

    stopAnimation(entity: EntityElement): boolean {
        const animComponent = entity.getComponent<AnimationComponent>('animation');
        if (!animComponent) return false;

        animComponent.playing = false;
        animComponent.currentFrame = 0;
        animComponent.elapsedTime = 0;
        (animComponent as any).direction = 1;

        return true;
    }

    setAnimationSpeed(entity: EntityElement, speed: number): boolean {
        const animComponent = entity.getComponent<AnimationComponent>('animation');
        if (!animComponent) return false;

        // Establecer multiplicador de velocidad en lugar de frameTime directo
        (animComponent as any).speed = Math.max(0, speed);
        return true;
    }

    getCurrentAnimationName(entity: EntityElement): string | null {
        const animComponent = entity.getComponent<AnimationComponent>('animation');
        return animComponent ? animComponent.currentAnimation : null;
    }

    isAnimationPlaying(entity: EntityElement): boolean {
        const animComponent = entity.getComponent<AnimationComponent>('animation');
        return animComponent ? animComponent.playing : false;
    }

    getAnimationProgress(entity: EntityElement): number {
        const animComponent = entity.getComponent<AnimationComponent>('animation');
        if (!animComponent) return 0;

        const animation = animComponent.animations.get(animComponent.currentAnimation);
        if (!animation) return 0;

        return animComponent.currentFrame / (animation.frames.length - 1);
    }
}

export default AnimationSystem;