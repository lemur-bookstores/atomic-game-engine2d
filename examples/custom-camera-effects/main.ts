// import { InputComponent } from '@/types';
// import {
//     Engine,
//     Scene,
//     Vector2,
//     CameraEntity,
//     CameraEffectsSystem,
//     CameraSystem,
//     RenderSystem,
//     InputSystem,
//     World,
//     Entity,
//     CustomEffect
// } from '../../src';

// class CustomCameraEffectsExample {
//     private engine!: Engine;
//     private scene!: Scene;
//     private world!: World;
//     private camera!: CameraEntity;
//     private cameraEffectsSystem!: CameraEffectsSystem;

//     async init(): Promise<void> {
//         // Inicializar el motor
//         this.engine = new Engine({
//             canvas: 'gameCanvas',
//             width: 800,
//             height: 600
//         });

//         // Crear la escena
//         this.scene = new Scene('customEffectsScene');
//         this.world = new World();
//         this.scene.world = this.world;

//         // Agregar sistemas
//         this.world.addSystem(new RenderSystem());
//         this.world.addSystem(new CameraSystem());
//         this.world.addSystem(new InputSystem());
//         this.cameraEffectsSystem = new CameraEffectsSystem();
//         this.world.addSystem(this.cameraEffectsSystem);

//         // Crear cámara con efectos
//         this.camera = new CameraEntity('mainCamera');
//         this.camera.transform.position = new Vector2(400, 300);
//         this.world.addEntity(this.camera);

//         // Crear algunos objetos para visualizar los efectos
//         this.createVisualObjects();

//         // Agregar controles
//         this.setupInput();

//         // Iniciar el motor
//         await this.engine.start();
//         this.engine.loadScene(this.scene);

//         // Exponer funciones globalmente para los botones
//         (window as any).triggerShake = () => this.triggerShake();
//         (window as any).triggerFlash = () => this.triggerFlash();
//         (window as any).triggerFade = () => this.triggerFade();
//         (window as any).triggerWaveEffect = () => this.triggerWaveEffect();
//         (window as any).triggerPulseEffect = () => this.triggerPulseEffect();
//         (window as any).triggerSpiralEffect = () => this.triggerSpiralEffect();
//     }

//     private createVisualObjects(): void {
//         // Crear un grid de objetos para visualizar los efectos
//         for (let x = 0; x < 10; x++) {
//             for (let y = 0; y < 8; y++) {
//                 const entity = new Entity(`object_${x}_${y}`);

//                 const transform: TransformComponent = {
//                     type: 'transform',
//                     position: new Vector2(x * 80 + 40, y * 75 + 40),
//                     rotation: 0,
//                     scale: new Vector2(1, 1)
//                 };

//                 const sprite: SpriteComponent = {
//                     type: 'sprite',
//                     texture: null,
//                     color: {
//                         r: Math.random() * 255,
//                         g: Math.random() * 255,
//                         b: Math.random() * 255,
//                         a: 255
//                     },
//                     width: 40,
//                     height: 40,
//                     visible: true
//                 };

//                 entity.addComponent(transform);
//                 entity.addComponent(sprite);
//                 this.world.addEntity(entity);
//             }
//         }
//     }

//     private setupInput(): void {
//         const inputEntity = new Entity('inputController');

//         const input: InputComponent = {
//             type: 'input',
//             moveSpeed: 200,
//             rotationSpeed: 0,
//             keyBindings: new Map([
//                 ['KeyW', 'up'],
//                 ['KeyS', 'down'],
//                 ['KeyA', 'left'],
//                 ['KeyD', 'right']
//             ]),
//             mouseEnabled: false,
//             touchEnabled: false
//         };

//         inputEntity.addComponent(input);
//         this.world.addEntity(inputEntity);
//     }

//     // Efectos básicos predefinidos
//     public triggerShake(): void {
//         this.cameraEffectsSystem.triggerShake(this.camera, 10, 1000, 30);
//         console.log('Shake effect triggered!');
//     }

//     public triggerFlash(): void {
//         this.cameraEffectsSystem.triggerFlash(this.camera, { r: 255, g: 255, b: 255, a: 255 }, 500, 0.8);
//         console.log('Flash effect triggered!');
//     }

//     public triggerFade(): void {
//         this.cameraEffectsSystem.triggerFade(this.camera, { r: 0, g: 0, b: 0, a: 255 }, 2000, 'out');
//         console.log('Fade effect triggered!');
//     }

//     // Efectos personalizados avanzados
//     public triggerWaveEffect(): void {
//         const waveEffect: CustomEffect = {
//             duration: 3000,
//             properties: new Map([
//                 ['amplitude', 20],
//                 ['frequency', 0.01],
//                 ['time', 0]
//             ]),
//             updateFunction: (effect: CustomEffect, deltaTime: number) => {
//                 const time = effect.properties.get('time') + deltaTime;
//                 const amplitude = effect.properties.get('amplitude');
//                 const frequency = effect.properties.get('frequency');

//                 // Crear efecto de onda en la posición de la cámara
//                 const offsetX = Math.sin(time * frequency) * amplitude;
//                 const offsetY = Math.cos(time * frequency * 0.7) * amplitude * 0.5;

//                 // Aplicar offset (esto se haría en el sistema real)
//                 if (this.camera.transform) {
//                     this.camera.transform.position.x += offsetX * 0.01;
//                     this.camera.transform.position.y += offsetY * 0.01;
//                 }

//                 effect.properties.set('time', time);

//                 // Reducir amplitude gradualmente
//                 effect.properties.set('amplitude', amplitude * 0.999);
//             }
//         };

//         this.cameraEffectsSystem.addCustomEffect(this.camera, 'wave', waveEffect);
//         console.log('Wave effect triggered!');
//     }

//     public triggerPulseEffect(): void {
//         const pulseEffect: CustomEffect = {
//             duration: 2000,
//             properties: new Map([
//                 ['pulseSpeed', 0.005],
//                 ['maxScale', 1.2],
//                 ['minScale', 0.8],
//                 ['time', 0]
//             ]),
//             updateFunction: (effect: CustomEffect, deltaTime: number) => {
//                 const time = effect.properties.get('time') + deltaTime;
//                 const pulseSpeed = effect.properties.get('pulseSpeed');
//                 const maxScale = effect.properties.get('maxScale');
//                 const minScale = effect.properties.get('minScale');

//                 // Crear efecto de pulso en el zoom
//                 const pulse = Math.sin(time * pulseSpeed);
//                 const scale = minScale + (maxScale - minScale) * (pulse + 1) * 0.5;

//                 // Aplicar scale al componente de cámara
//                 if (this.camera.camera) {
//                     this.camera.camera.zoom = scale;
//                 }

//                 effect.properties.set('time', time);
//             }
//         };

//         this.cameraEffectsSystem.addCustomEffect(this.camera, 'pulse', pulseEffect);
//         console.log('Pulse effect triggered!');
//     }

//     public triggerSpiralEffect(): void {
//         const spiralEffect: CustomEffect = {
//             duration: 4000,
//             properties: new Map([
//                 ['radius', 50],
//                 ['spiralSpeed', 0.002],
//                 ['radiusDecay', 0.999],
//                 ['time', 0],
//                 ['centerX', this.camera.transform?.position.x || 400],
//                 ['centerY', this.camera.transform?.position.y || 300]
//             ]),
//             updateFunction: (effect: CustomEffect, deltaTime: number) => {
//                 const time = effect.properties.get('time') + deltaTime;
//                 const radius = effect.properties.get('radius');
//                 const spiralSpeed = effect.properties.get('spiralSpeed');
//                 const radiusDecay = effect.properties.get('radiusDecay');
//                 const centerX = effect.properties.get('centerX');
//                 const centerY = effect.properties.get('centerY');

//                 // Crear movimiento en espiral
//                 const angle = time * spiralSpeed;
//                 const currentRadius = radius * Math.pow(radiusDecay, time * 0.001);

//                 const offsetX = Math.cos(angle) * currentRadius;
//                 const offsetY = Math.sin(angle) * currentRadius;

//                 // Aplicar posición
//                 if (this.camera.transform) {
//                     this.camera.transform.position.x = centerX + offsetX;
//                     this.camera.transform.position.y = centerY + offsetY;
//                 }

//                 effect.properties.set('time', time);
//                 effect.properties.set('radius', currentRadius);
//             }
//         };

//         this.cameraEffectsSystem.addCustomEffect(this.camera, 'spiral', spiralEffect);
//         console.log('Spiral effect triggered!');
//     }
// }

// // Inicializar el ejemplo
// const example = new CustomCameraEffectsExample();
// example.init().catch(console.error);