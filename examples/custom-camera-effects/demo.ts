import { Vector2 } from '../../src';

// Simulador básico para demostrar el concepto de efectos personalizados
class CustomCameraEffectsDemo {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private camera: {
        position: Vector2;
        zoom: number;
        effects: Map<string, any>;
    };
    private objects: Array<{
        position: Vector2;
        color: string;
        size: number;
    }>;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;

        this.camera = {
            position: new Vector2(400, 300),
            zoom: 1,
            effects: new Map()
        };

        this.objects = [];
        this.createVisualObjects();
        this.setupInput();
        this.gameLoop();

        // Exponer funciones globalmente para los botones
        (window as any).triggerShake = () => this.triggerShake();
        (window as any).triggerFlash = () => this.triggerFlash();
        (window as any).triggerFade = () => this.triggerFade();
        (window as any).triggerWaveEffect = () => this.triggerWaveEffect();
        (window as any).triggerPulseEffect = () => this.triggerPulseEffect();
        (window as any).triggerSpiralEffect = () => this.triggerSpiralEffect();
    }

    private createVisualObjects(): void {
        // Crear un grid de objetos para visualizar los efectos
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 8; y++) {
                this.objects.push({
                    position: new Vector2(x * 80 + 40, y * 75 + 40),
                    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                    size: 40
                });
            }
        }
    }

    private setupInput(): void {
        document.addEventListener('keydown', (event) => {
            const speed = 5;
            switch (event.code) {
                case 'KeyW':
                    this.camera.position.y -= speed;
                    break;
                case 'KeyS':
                    this.camera.position.y += speed;
                    break;
                case 'KeyA':
                    this.camera.position.x -= speed;
                    break;
                case 'KeyD':
                    this.camera.position.x += speed;
                    break;
            }
        });
    }

    private gameLoop = (): void => {
        this.update();
        this.render();
        requestAnimationFrame(this.gameLoop);
    }

    private update(): void {
        const deltaTime = 16; // Aproximadamente 60 FPS

        // Procesar efectos personalizados
        const expiredEffects: string[] = [];

        for (const [name, effect] of this.camera.effects) {
            if (effect.updateFunction) {
                effect.updateFunction(effect, deltaTime);
            }

            effect.duration -= deltaTime;

            if (effect.duration <= 0) {
                expiredEffects.push(name);
            }
        }

        // Eliminar efectos expirados
        for (const name of expiredEffects) {
            this.camera.effects.delete(name);
            console.log(`Efecto '${name}' completado`);
        }
    }

    private render(): void {
        // Limpiar canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Aplicar transformación de cámara
        this.ctx.save();
        this.ctx.translate(
            this.canvas.width / 2 - this.camera.position.x * this.camera.zoom,
            this.canvas.height / 2 - this.camera.position.y * this.camera.zoom
        );
        this.ctx.scale(this.camera.zoom, this.camera.zoom);

        // Renderizar objetos
        for (const obj of this.objects) {
            this.ctx.fillStyle = obj.color;
            this.ctx.fillRect(
                obj.position.x - obj.size / 2,
                obj.position.y - obj.size / 2,
                obj.size,
                obj.size
            );
        }

        this.ctx.restore();

        // Renderizar efectos de pantalla
        this.renderScreenEffects();
    }

    private renderScreenEffects(): void {
        // Aquí se renderizarían efectos como flash y fade
        // Por simplicidad, solo mostramos un ejemplo básico
        if (this.camera.effects.has('flash')) {
            const flash = this.camera.effects.get('flash');
            this.ctx.fillStyle = `rgba(255, 255, 255, ${flash.intensity})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    // Efectos básicos predefinidos
    public triggerShake(): void {
        const originalPosition = { ...this.camera.position };

        const shakeEffect = {
            duration: 1000,
            intensity: 10,
            frequency: 30,
            updateFunction: (effect: any, _deltaTime: number) => {
                const shakeX = (Math.random() - 0.5) * effect.intensity;
                const shakeY = (Math.random() - 0.5) * effect.intensity;

                this.camera.position.x = originalPosition.x + shakeX;
                this.camera.position.y = originalPosition.y + shakeY;

                // Decrementar intensidad
                effect.intensity *= 0.99;
            }
        };

        this.camera.effects.set('shake', shakeEffect);
        console.log('¡Efecto Shake activado!');
    }

    public triggerFlash(): void {
        const flashEffect = {
            duration: 500,
            intensity: 0.8,
            updateFunction: (effect: any, deltaTime: number) => {
                // La intensidad se reduce gradualmente
                effect.intensity = Math.max(0, effect.intensity - deltaTime / 500);
            }
        };

        this.camera.effects.set('flash', flashEffect);
        console.log('¡Efecto Flash activado!');
    }

    public triggerFade(): void {
        console.log('¡Efecto Fade activado! (implementación básica)');
    }

    // Efectos personalizados avanzados
    public triggerWaveEffect(): void {
        const originalPosition = { ...this.camera.position };

        const waveEffect = {
            duration: 3000,
            amplitude: 20,
            frequency: 0.01,
            time: 0,
            updateFunction: (effect: any, deltaTime: number) => {
                effect.time += deltaTime;

                const offsetX = Math.sin(effect.time * effect.frequency) * effect.amplitude;
                const offsetY = Math.cos(effect.time * effect.frequency * 0.7) * effect.amplitude * 0.5;

                this.camera.position.x = originalPosition.x + offsetX;
                this.camera.position.y = originalPosition.y + offsetY;

                // Reducir amplitude gradualmente
                effect.amplitude *= 0.999;
            }
        };

        this.camera.effects.set('wave', waveEffect);
        console.log('¡Efecto Onda personalizado activado!');
    }

    public triggerPulseEffect(): void {
        const originalZoom = this.camera.zoom;

        const pulseEffect = {
            duration: 2000,
            pulseSpeed: 0.005,
            maxScale: 1.2,
            minScale: 0.8,
            time: 0,
            updateFunction: (effect: any, deltaTime: number) => {
                effect.time += deltaTime;

                const pulse = Math.sin(effect.time * effect.pulseSpeed);
                const scale = effect.minScale + (effect.maxScale - effect.minScale) * (pulse + 1) * 0.5;

                this.camera.zoom = originalZoom * scale;
            }
        };

        this.camera.effects.set('pulse', pulseEffect);
        console.log('¡Efecto Pulso personalizado activado!');
    }

    public triggerSpiralEffect(): void {
        const centerX = this.camera.position.x;
        const centerY = this.camera.position.y;

        const spiralEffect = {
            duration: 4000,
            radius: 50,
            spiralSpeed: 0.002,
            radiusDecay: 0.999,
            time: 0,
            updateFunction: (effect: any, deltaTime: number) => {
                effect.time += deltaTime;

                const angle = effect.time * effect.spiralSpeed;
                const currentRadius = effect.radius * Math.pow(effect.radiusDecay, effect.time * 0.001);

                const offsetX = Math.cos(angle) * currentRadius;
                const offsetY = Math.sin(angle) * currentRadius;

                this.camera.position.x = centerX + offsetX;
                this.camera.position.y = centerY + offsetY;

                effect.radius = currentRadius;
            }
        };

        this.camera.effects.set('spiral', spiralEffect);
        console.log('¡Efecto Espiral personalizado activado!');
    }
}

// Inicializar el demo
new CustomCameraEffectsDemo();