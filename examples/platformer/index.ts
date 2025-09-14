import { AnimationComponent, AnimationStateBase, SpriteComponent, TransformComponent, VelocityComponent } from '@/types';
import { AnimationState, AnimationSystem, GameEngine } from '../../src';
import { AssetManager } from '../../src/assets/AssetManager';
import { AudioManager } from '../../src/audio/AudioManager';
import { AudioSystem } from '../../src/audio/AudioSystem';
import { Scene } from '../../src/core/Scene';
import { Entity } from '../../src/ecs/Entity';
import { MovementSystem } from '../../src/ecs/MovementSystem';
import { RenderSystem } from '../../src/graphics';
import { InputManager, InputSystem } from '../../src/input';

let tint = { r: 255, g: 255, b: 255, a: 1 };

// Player class
class Player {
    entity: Entity;
    constructor(scene: Scene) {
        this.entity = new Entity();
        this.entity.addComponent({
            type: 'transform',
            position: { x: 100, y: 500 },
            rotation: 0,
            scale: { x: 1, y: 1 }
        });

        this.entity.addComponent<VelocityComponent>({
            type: 'velocity',
            x: 0,
            y: 0,
            maxSpeed: 150
        });

        // Get the automatically generated frames from ninja sprite sheet
        const ninjaSpriteSheet = AssetManager.getInstance().getSpriteSheet('ninja');

        const frame = ninjaSpriteSheet?.getSpriteFrameUV(0);
        if (frame) {
            const { size, uv } = frame;
            this.entity.addComponent({
                type: 'sprite',
                texture: 'ninja',
                width: size.width,
                height: size.height,
                uvX: uv.uvX,
                uvY: uv.uvY,
                uvWidth: uv.uvWidth,
                uvHeight: uv.uvHeight,
                flipX: false,
                flipY: false,
                tint,
                visible: true
            });
        } else {
            // Fallback sprite component
            this.entity.addComponent({
                type: 'sprite',
                texture: 'ninja',
                width: 45,
                height: 64,
                uvX: 0.05,
                uvY: 0.05,
                uvWidth: 45 / 600,
                uvHeight: 64 / 371,
                flipX: false,
                flipY: false,
                tint,
                visible: true
            });
        }

        // Define animations using the automatically detected frames
        const animations = new Map<string, AnimationStateBase>();
        const createAnimation = (config: { name: string, frames: number[], duration: number, loop: boolean, pingPong: boolean }) => {
            return new AnimationState(config.name, config.frames, config.duration, config.loop, config.pingPong);
        }
        // Idle (frames 0-3)
        animations.set('idle', createAnimation({
            name: 'idle',
            frames: [0, 1, 2, 3],
            duration: 0.4,
            loop: true,
            pingPong: false
        }));
        // Walk (frames 4-9)
        animations.set('walk', createAnimation({
            name: 'walk',
            frames: [12, 13, 14, 15],
            duration: 8.3,
            loop: true,
            pingPong: false
        }));
        // Jump (frames 10-13)
        animations.set('jump', createAnimation({
            name: 'jump',
            frames: [10, 11, 12, 13],
            duration: 0.25,
            loop: false,
            pingPong: false
        }));
        // Attack (frames 14-19)
        animations.set('attack', createAnimation({
            name: 'attack',
            frames: [14, 15, 16, 17, 18, 19],
            duration: 0.2,
            loop: false,
            pingPong: false
        }));
        // Hurt (frames 20-22)
        animations.set('hurt', createAnimation({
            name: 'hurt',
            frames: [20, 21, 22],
            duration: 0.3,
            loop: false,
            pingPong: false
        }));
        // Fall (frames 23-26)
        animations.set('fall', createAnimation({
            name: 'fall',
            frames: [23, 24, 25, 26],
            duration: 0.25,
            loop: false,
            pingPong: false
        }));
        // Land (frames 27-29)
        animations.set('land', createAnimation({
            name: 'land',
            frames: [27, 28, 29],
            duration: 0.2,
            loop: false,
            pingPong: false
        }));
        // Dead (frames 30-33)
        animations.set('dead', createAnimation({
            name: 'dead',
            frames: [30, 31, 32, 33],
            duration: 0.4,
            loop: false,
            pingPong: false
        }));

        this.entity.addComponent({
            type: 'animation',
            spriteSheet: 'ninja',
            currentAnimation: 'idle', // 'idle' | 'walk', | 'jump' | 'attack' | 'hurt' | 'fall' | 'land' | 'dead'
            currentFrame: 0,
            frameTime: 0.1,
            elapsedTime: 0,
            loop: true,
            playing: true,
            animations,
            frameSfx: {}
        });
        scene.addEntity(this.entity);
    }
}

// Main game class
class PlatformerGame {
    engine: GameEngine;
    assetManager: AssetManager;
    inputManager: InputManager;
    inputSystem: InputSystem;
    audioManager: AudioManager;
    scene: Scene;
    player!: Player;
    world!: PlatformWorld;

    constructor(canvas: HTMLCanvasElement) {
        this.assetManager = AssetManager.getInstance();
        this.audioManager = AudioManager.getInstance();
        this.inputManager = InputManager.getInstance();
        this.inputSystem = new InputSystem();

        this.engine = new GameEngine({
            canvas,
            width: 800,
            height: 600,
            renderer: 'canvas2d',
            debug: false
        });
        this.scene = new Scene('platformer');
        this.engine.addScene(this.scene);
    }

    async initialize() {
        // Initialize the game engine (now with automatic renderer fallback)
        await this.engine.initialize();

        // Verificar que el engine está listo
        if (!this.engine.isInitialized) {
            throw new Error('Engine failed to initialize properly');
        }

        await this.loadAssets();

        // Registrar texturas después de cargar assets y antes de crear entidades
        this.registerTextures();

        // Add systems
        this.engine.addSystem(new MovementSystem());
        this.engine.addSystem(this.inputManager);
        this.engine.addSystem(new AnimationSystem(this.assetManager));
        this.engine.addSystem(new AudioSystem());

        // Create world and player
        this.world = new PlatformWorld(this.scene);
        this.player = new Player(this.scene);

        this.engine.setActiveScene(this.scene);

        // Input y animación
        window.addEventListener('keydown', (e) => {
            const anim = this.player.entity.getComponent<AnimationComponent>('animation');
            const transform = this.player.entity.getComponent<TransformComponent>('transform');
            if (!anim || !transform) return;
            switch (e.code) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    anim.currentAnimation = 'walk';
                    anim.loop = true;
                    // Flip sprite según dirección
                    const sprite = this.player.entity.getComponent<SpriteComponent>('sprite');
                    if (sprite) sprite.flipX = (e.code === 'ArrowLeft');
                    // Mover
                    transform.position.x += (e.code === 'ArrowLeft' ? -16 : 16);
                    break;
                case 'ArrowUp':
                case 'Space':
                    anim.currentAnimation = 'jump';
                    anim.loop = false;
                    // Saltar (simulado)
                    transform.position.y -= 48;
                    break;
                case 'KeyZ':
                    anim.currentAnimation = 'attack';
                    anim.loop = false;
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            const anim = this.player.entity.getComponent<AnimationComponent>('animation');
            if (!anim) return;
            // Volver a idle si no se está moviendo/saltando/atacando
            if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "KeyZ"].includes(e.code)) {
                anim.currentAnimation = 'idle';
                anim.loop = true;
            }
        });
    }

    async loadAssets() {
        // Load spritesheets using the new sprite-sheet library for automatic frame detection
        await this.assetManager.loadSpriteSheet(
            'ninja',
            'assets/sprite-sheet-ninja.png',
            undefined,
            undefined,
            undefined,
            {
                useSpriteSheetLib: true,
                libraryMode: 'dynamic',
                dynamic: {
                    // alphaThreshold: 128,
                    minFrameSize: 11,
                    padding: 0.5
                },
                namingPattern: 'frame_{index}'
            }
        );
        await this.assetManager.loadSpriteSheet(
            'platform',
            'assets/sprite-sheet-plataforma.png',
            undefined,
            undefined,
            undefined,
            {
                useSpriteSheetLib: true,
                libraryMode: 'dynamic',
                dynamic: {
                    // alphaThreshold: 128,
                    // minFrameSize: 40,
                    // padding: 2
                },
                namingPattern: 'tile_{index}'
            }
        );
        // Optionally load audio assets here
        // await this.audioManager.loadAudio('jump', 'assets/jump.mp3');
    }

    registerTextures() {
        const renderSystems = this.engine.getGameLoop().getSystems().filter(system =>
            system.constructor.name === 'RenderSystem'
        ) as Array<RenderSystem>;
        ['ninja', 'platform'].forEach(name => {
            const ss = this.assetManager.getSpriteSheet(name);
            if (ss) {
                renderSystems.forEach(rs => rs.registerTexture(name, ss.getTexture()));
            }
        });
    }

    start() {
        this.engine.start();
    }

    stop() {
        this.engine.stop();
    }
}

// World/platform class
class PlatformWorld {
    constructor(scene: Scene) {
        // Add ground/platform entities using platform spritesheet with automatic frame detection
        for (let i = 0; i < 25; i++) {
            const ground = new Entity();
            ground.addComponent({
                type: 'transform',
                position: { x: i * 48, y: 568 },
                rotation: 0,
                scale: { x: 1, y: 1 }
            });

            // Use a specific tile frame from the automatically detected frames
            const platformSpriteSheet = AssetManager.getInstance().getSpriteSheet('platform');
            const frame = platformSpriteSheet?.getSpriteFrameUV(2);


            if (frame) {
                const { size, uv } = frame;
                ground.addComponent({
                    type: 'sprite',
                    texture: 'platform',
                    width: size.width,
                    height: size.height,
                    uvX: uv.uvX,
                    uvY: uv.uvY,
                    uvWidth: uv.uvWidth,
                    uvHeight: uv.uvHeight,
                    flipX: false,
                    flipY: false,
                    tint
                });
            } else {
                // Fallback to manual UV coordinates
                ground.addComponent({
                    type: 'sprite',
                    texture: 'platform',
                    width: 53,
                    height: 53,
                    uvX: 0.4,
                    uvY: 0.3,
                    uvWidth: 53 / 321,
                    uvHeight: 53 / 258,
                    flipX: false,
                    flipY: false,
                    tint
                });
            }
            scene.addEntity(ground);
        }
    }
}


// Start the game when the page loads
window.addEventListener('load', async () => {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvas) {
        throw new Error('Canvas element not found');
    }

    const game = new PlatformerGame(canvas);
    await game.initialize();
    game.start();

    const ninjaSpriteSheet = AssetManager.getInstance().getSpriteSheet('ninja');

    console.log(game.scene.getActiveEntities());
    // 1. Obtener el contenedor donde se añadirá la imagen
    const contenedor = document.getElementById('frames'); // Asegúrate de tener un <div id="miContenedor"></div> en tu HTML

    // 2. Crear el elemento de imagen
    const nuevaImagen = document.createElement('img');

    // 3. Establecer los atributos de la imagen
    nuevaImagen.src = 'ruta/a/tu/imagen.jpg'; // Reemplaza con la URL o ruta real de tu imagen
    nuevaImagen.alt = 'Descripción de la imagen'; // Texto alternativo para accesibilidad
    nuevaImagen.classList.add('mi-clase-imagen'); // Opcional: para aplicar estilos CSS

    // 4. Añadir la imagen al contenedor
    if (contenedor) { // Verifica que el contenedor exista para evitar errores
        contenedor.appendChild(ninjaSpriteSheet?.getTexture()?.getImage() || nuevaImagen);
    } else {
        console.error('No se encontró el elemento contenedor con el ID "miContenedor"');
    }

});