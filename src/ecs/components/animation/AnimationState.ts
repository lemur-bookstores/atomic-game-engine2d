import { AnimationDirection, AnimationStateBase } from '@/types';

export class AnimationState extends AnimationStateBase {
    name: string;
    frames: number[];
    duration: number;
    loop: boolean;
    pingPong: boolean;
    currentFrame: number;
    elapsedTime: number;
    playing: boolean;
    direction: AnimationDirection; // 1 = forward, -1 = backward (for ping-pong)

    constructor(
        name: string,
        frames: number[],
        duration: number,
        loop: boolean = true,
        pingPong: boolean = false
    ) {
        super();
        this.name = name;
        this.frames = frames;
        this.duration = duration;
        this.loop = loop;
        this.pingPong = pingPong;
        this.currentFrame = 0;
        this.elapsedTime = 0;
        this.playing = false;
        this.direction = 1;
    }

    play(): void {
        this.playing = true;
    }

    pause(): void {
        this.playing = false;
    }

    stop(): void {
        this.playing = false;
        this.currentFrame = 0;
        this.elapsedTime = 0;
        this.direction = 1;
    }

    restart(): void {
        this.stop();
        this.play();
    }

    update(deltaTime: number): boolean {
        if (!this.playing) return false;

        this.elapsedTime += deltaTime;

        if (this.elapsedTime >= this.duration) {
            this.elapsedTime = 0;
            return this.nextFrame();
        }

        return false;
    }

    protected nextFrame(): boolean {
        if (this.pingPong) {
            this.currentFrame += this.direction;

            if (this.currentFrame >= this.frames.length - 1) {
                this.direction = -1;
                this.currentFrame = this.frames.length - 1;
            } else if (this.currentFrame <= 0) {
                this.direction = 1;
                this.currentFrame = 0;

                if (!this.loop) {
                    this.playing = false;
                    return true; // Animation completed
                }
            }
        } else {
            this.currentFrame++;

            if (this.currentFrame >= this.frames.length) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = this.frames.length - 1;
                    this.playing = false;
                    return true; // Animation completed
                }
            }
        }

        return false;
    }

    getCurrentFrameIndex(): number {
        return this.frames[this.currentFrame];
    }

    getProgress(): number {
        return this.currentFrame / (this.frames.length - 1);
    }

    clone(): AnimationState {
        const animation = new AnimationState(
            this.name,
            [...this.frames],
            this.duration,
            this.loop,
            this.pingPong
        );

        animation.currentFrame = this.currentFrame;
        animation.elapsedTime = this.elapsedTime;
        animation.playing = this.playing;
        animation.direction = this.direction;

        return animation;
    }
}

export default AnimationState;