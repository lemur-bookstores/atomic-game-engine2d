import { AnimationComponent, AudioComponent } from 'atomic-game-engine2d-components';
import { ComponentType, EntityElement } from 'atomic-game-engine2d-types';
import { FunctionalSystem } from '../ecs/FunctionalSystem';
import { AudioManager } from './AudioManager';
import { EventSystem } from '../core/EventSystem';
import { Logger } from '../core/Logger';
import { ANIMATION_EVENTS } from '../types/event-const';

export class AudioSystem extends FunctionalSystem {
    requiredComponents: Array<ComponentType> = ['audio'];
    private audioManager = AudioManager.getInstance();
    private eventSystem = EventSystem.getInstance();

    constructor() {
        super();

        // Listen for animation frame events and play audio if entity has an audio component configured
        this.eventSystem.on(ANIMATION_EVENTS.FRAME, (evt: any) => {
            try {
                const data = evt.data || {};
                const entity: EntityElement | undefined = data.entity;
                const frameIndex: number | undefined = data.frameIndex;

                if (!entity) return;

                // First, check if the entity's animation component maps this frame to a sfx
                const anim = entity.getComponent<AnimationComponent>('animation');
                if (anim && anim.frameSfx && typeof frameIndex === 'number') {
                    const animation = anim.frameSfx?.[anim.currentAnimation];
                    if (animation) {
                        const frameSfx = animation[anim.currentFrame];
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
                }

                // Then, if an audio component explicitly wants to trigger on frames, honor it
                const audio = entity.getComponent<AudioComponent>('audio');
                if (audio && audio.autoplayOnFrame) {
                    if (typeof audio.triggerFrame === 'number') {
                        if (audio.triggerFrame !== frameIndex) return;
                    }

                    // fire-and-forget play for SFX; don't store handle unless looping
                    const handle = this.audioManager.play(audio.clip, { loop: !!audio.loop, volume: audio.volume, group: audio.group });
                    if (audio.loop) audio.playingHandle = handle;
                }
            } catch (e) {
                // swallow to avoid crashing game loop
                Logger.getInstance().warn('Error in AudioSystem FRAME handler', e);
            }
        });
    }

    update(entities: EntityElement[], _deltaTime: number): void {
        const audioEntities = this.getEntitiesWithComponents(entities, this.requiredComponents);

        audioEntities.forEach(entity => {
            const audio = entity.getComponent<AudioComponent>('audio');
            if (!audio) return;

            // Autoplay behavior
            if (audio.autoplay && !audio.playingHandle && this.audioManager.has(audio.clip)) {
                const handle = this.audioManager.play(audio.clip, { loop: !!audio.loop, volume: audio.volume, group: audio.group });
                audio.playingHandle = handle;
            }

            // If clip not loaded, try to load lazily (no await here)
            if (!this.audioManager.has(audio.clip)) {
                // best-effort load (fire-and-forget)
                this.audioManager.loadAudio(audio.clip, `assets/${audio.clip}`)
                    .catch(err => Logger.getInstance().warn('Failed to load audio', audio.clip, err));
            }
        });
    }


    // Public API convenience methods
    play(entity: EntityElement): boolean {
        const audio = entity.getComponent<AudioComponent>('audio');
        if (!audio) return false;
        const handle = this.audioManager.play(audio.clip, { loop: !!audio.loop, volume: audio.volume, group: audio.group });
        audio.playingHandle = handle;
        return !!handle;
    }

    stop(entity: EntityElement): boolean {
        const audio = entity.getComponent<AudioComponent>('audio');
        if (!audio) return false;
        if (audio.playingHandle) {
            this.audioManager.stop(audio.playingHandle);
            audio.playingHandle = undefined;
            return true;
        }
        this.audioManager.stop(audio.clip);
        return true;
    }
}
