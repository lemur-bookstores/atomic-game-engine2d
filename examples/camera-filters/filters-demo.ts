import { Vector2 } from '../../src/math/Vector2';

// Simulador de filtros de cámara para demostrar el concepto
class CameraFiltersDemo {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private camera: {
        position: Vector2;
        zoom: number;
        filters: Map<string, any>;
    };
    private objects: Array<{
        position: Vector2;
        color: string;
        size: number;
        type: 'rect' | 'circle';
    }>;
    private activeFilters: Set<string> = new Set();

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;

        this.camera = {
            position: new Vector2(400, 300),
            zoom: 1,
            filters: new Map()
        };

        this.objects = [];
        this.createVisualObjects();
        this.setupInput();
        this.gameLoop();

        // Exponer funciones globalmente para los botones
        (window as any).applyPreset = (presetName: string) => this.applyPreset(presetName);
        (window as any).toggleFilter = (filterName: string) => this.toggleFilter(filterName);
        (window as any).clearAllFilters = () => this.clearAllFilters();
        (window as any).updateBrightness = (value: string) => this.updateBrightness(parseInt(value));
        (window as any).updateContrast = (value: string) => this.updateContrast(parseInt(value));
        (window as any).updateSaturation = (value: string) => this.updateSaturation(parseInt(value));
        (window as any).updateHue = (value: string) => this.updateHue(parseInt(value));
        (window as any).createSinCityEffect = () => this.createSinCityEffect();
    }

    private createVisualObjects(): void {
        // Crear objetos variados para mostrar el efecto de los filtros
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

        for (let i = 0; i < 50; i++) {
            this.objects.push({
                position: new Vector2(
                    Math.random() * 1600 + 100,
                    Math.random() * 1200 + 100
                ),
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 40 + 20,
                type: Math.random() > 0.5 ? 'rect' : 'circle'
            });
        }

        // Agregar algunos objetos específicos para mostrar efectos
        this.objects.push(
            // Objetos rojos para el efecto Sin City
            { position: new Vector2(200, 200), color: '#FF0000', size: 60, type: 'circle' },
            { position: new Vector2(600, 300), color: '#FF0000', size: 50, type: 'rect' },
            { position: new Vector2(1000, 400), color: '#FF0000', size: 70, type: 'circle' },
        );
    }

    private setupInput(): void {
        document.addEventListener('keydown', (event) => {
            const speed = 10;
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
        this.render();
        requestAnimationFrame(this.gameLoop);
    }

    private render(): void {
        // Aplicar filtros antes del render
        this.applyFilters();

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

            if (obj.type === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(obj.position.x, obj.position.y, obj.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(
                    obj.position.x - obj.size / 2,
                    obj.position.y - obj.size / 2,
                    obj.size,
                    obj.size
                );
            }
        }

        // Renderizar grid de referencia
        this.renderGrid();

        this.ctx.restore();
    }

    private renderGrid(): void {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        // Líneas verticales
        for (let x = 0; x <= 1600; x += 100) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, 1200);
        }

        // Líneas horizontales
        for (let y = 0; y <= 1200; y += 100) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(1600, y);
        }

        this.ctx.stroke();
    }

    private applyFilters(): void {
        // Construir string de filtro CSS combinando todos los filtros activos
        let filterString = '';
        const filters: string[] = [];

        if (this.activeFilters.has('sepia')) {
            filters.push('sepia(80%)');
        }
        if (this.activeFilters.has('grayscale')) {
            filters.push('grayscale(100%)');
        }
        if (this.activeFilters.has('invert')) {
            filters.push('invert(100%)');
        }
        if (this.activeFilters.has('blur')) {
            filters.push('blur(2px)');
        }
        if (this.activeFilters.has('vignette')) {
            // Simular viñeta con un gradiente radial
            this.applyVignetteEffect();
        }

        // Aplicar filtros de sliders
        const brightness = this.getSliderValue('brightnessSlider');
        const contrast = this.getSliderValue('contrastSlider');
        const saturation = this.getSliderValue('saturationSlider');
        const hue = this.getSliderValue('hueSlider');

        if (brightness !== 0) {
            filters.push(`brightness(${100 + brightness}%)`);
        }
        if (contrast !== 100) {
            filters.push(`contrast(${contrast}%)`);
        }
        if (saturation !== 100) {
            filters.push(`saturate(${saturation}%)`);
        }
        if (hue !== 0) {
            filters.push(`hue-rotate(${hue}deg)`);
        }

        // Aplicar filtros al contexto
        this.ctx.filter = filters.length > 0 ? filters.join(' ') : 'none';
    }

    private applyVignetteEffect(): void {
        // Crear gradiente radial para simular viñeta
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.max(this.canvas.width, this.canvas.height) * 0.8;

        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );

        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');

        this.ctx.save();
        this.ctx.globalCompositeOperation = 'multiply';
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    private getSliderValue(sliderId: string): number {
        const slider = document.getElementById(sliderId) as HTMLInputElement;
        return slider ? parseInt(slider.value) : 0;
    }

    // Métodos de control público
    public applyPreset(presetName: string): void {
        console.log(`Aplicando preset: ${presetName}`);

        // Limpiar filtros actuales
        this.clearAllFilters();

        switch (presetName) {
            case 'Noir':
                this.activeFilters.add('grayscale');
                this.setSliderValue('contrastSlider', 130);
                this.activeFilters.add('vignette');
                break;
            case 'Vintage':
                this.activeFilters.add('sepia');
                this.setSliderValue('saturationSlider', 80);
                this.setSliderValue('contrastSlider', 110);
                break;
            case 'Sin City':
                this.activeFilters.add('grayscale');
                this.setSliderValue('contrastSlider', 140);
                // Nota: El efecto Sin City real requeriría detección de color específico
                break;
            case 'Cyberpunk':
                this.setSliderValue('saturationSlider', 150);
                this.setSliderValue('hueSlider', 15);
                this.setSliderValue('contrastSlider', 120);
                break;
            case 'Horror':
                this.setSliderValue('saturationSlider', 30);
                this.setSliderValue('brightnessSlider', -30);
                this.setSliderValue('hueSlider', 270);
                this.activeFilters.add('vignette');
                break;
        }

        this.updateUI();
    }

    public toggleFilter(filterName: string): void {
        if (this.activeFilters.has(filterName)) {
            this.activeFilters.delete(filterName);
        } else {
            this.activeFilters.add(filterName);
        }
        this.updateUI();
        console.log(`Filtro ${filterName}: ${this.activeFilters.has(filterName) ? 'activado' : 'desactivado'}`);
    }

    public clearAllFilters(): void {
        this.activeFilters.clear();
        this.setSliderValue('brightnessSlider', 0);
        this.setSliderValue('contrastSlider', 100);
        this.setSliderValue('saturationSlider', 100);
        this.setSliderValue('hueSlider', 0);
        this.updateUI();
        console.log('Todos los filtros eliminados');
    }

    public updateBrightness(value: number): void {
        document.getElementById('brightnessValue')!.textContent = value.toString();
    }

    public updateContrast(value: number): void {
        document.getElementById('contrastValue')!.textContent = value.toString();
    }

    public updateSaturation(value: number): void {
        document.getElementById('saturationValue')!.textContent = value.toString();
    }

    public updateHue(value: number): void {
        document.getElementById('hueValue')!.textContent = value.toString();
    }

    public createSinCityEffect(): void {
        console.log('Creando efecto Sin City personalizado...');
        this.clearAllFilters();
        this.activeFilters.add('grayscale');
        this.setSliderValue('contrastSlider', 150);
        // En una implementación real, aquí detectaríamos colores específicos
        console.log('Efecto Sin City: Manteniendo objetos rojos en color, resto en B&N');
        this.updateUI();
    }

    private setSliderValue(sliderId: string, value: number): void {
        const slider = document.getElementById(sliderId) as HTMLInputElement;
        if (slider) {
            slider.value = value.toString();
            // Disparar evento change para actualizar la UI
            slider.dispatchEvent(new Event('change'));
        }
    }

    private updateUI(): void {
        // Actualizar botones activos
        const buttons = document.querySelectorAll('.controls button');
        buttons.forEach(button => {
            button.classList.remove('active');
        });

        // Marcar filtros activos
        this.activeFilters.forEach(filterName => {
            const button = Array.from(buttons).find(btn =>
                btn.textContent && btn.textContent.toLowerCase().includes(filterName.toLowerCase())
            );
            if (button) {
                button.classList.add('active');
            }
        });
    }
}

// Inicializar el demo
new CameraFiltersDemo();