import { FunctionalSystem } from "@/ecs/FunctionalSystem";
import { EntityElement, ComponentType, CameraComponent, CameraFiltersComponent, CameraFilter } from "@/types";
import { FILTER_PRESETS, FilterPreset } from "./CameraFiltersPreset";

/**
 * Sistema de filtros de cámara - Procesa y aplica filtros visuales
 */
export class CameraFiltersSystem extends FunctionalSystem {
    requiredComponents: ComponentType[] = ['camera', 'cameraFilters'];
    private canvas2DFiltersSupported: boolean = false;
    private webGLFiltersSupported: boolean = false;

    constructor() {
        super();
        this.detectFilterSupport();
    }

    update(entities: EntityElement[], deltaTime: number): void {
        const cameraEntities = this.getEntitiesWithComponents(entities, this.requiredComponents);

        for (const entity of cameraEntities) {
            const camera = entity.getComponent('camera') as CameraComponent;
            const filters = entity.getComponent('cameraFilters') as CameraFiltersComponent;

            if (!camera || !filters || !camera.isActive || !filters.enabled) {
                continue;
            }

            this.processFilters(entity, filters, deltaTime);
        }
    }

    /**
     * Procesa todos los filtros de una entidad de cámara
     */
    private processFilters(entity: EntityElement, filtersComponent: CameraFiltersComponent, deltaTime: number): void {
        const expiredFilters: string[] = [];

        for (const [name, filter] of filtersComponent.filters) {
            // Actualizar filtros temporales
            if (filter.duration !== undefined) {
                filter.duration -= deltaTime;
                if (filter.duration <= 0) {
                    expiredFilters.push(name);
                    continue;
                }
            }

            // Aplicar filtro según el tipo disponible
            if (this.webGLFiltersSupported) {
                this.applyWebGLFilter(entity, filter);
            } else if (this.canvas2DFiltersSupported) {
                this.applyCanvas2DFilter(entity, filter);
            } else {
                this.applySoftwareFilter(entity, filter);
            }
        }

        // Eliminar filtros expirados
        for (const name of expiredFilters) {
            filtersComponent.filters.delete(name);
        }
    }

    /**
     * Aplicar filtro usando WebGL (mejor rendimiento)
     */
    private applyWebGLFilter(entity: EntityElement, filter: CameraFilter): void {
        // Implementación de filtros WebGL con shaders
        switch (filter.type) {
            case 'sepia':
                this.applyWebGLSepia(entity, filter);
                break;
            case 'grayscale':
                this.applyWebGLGrayscale(entity, filter);
                break;
            case 'blur':
                this.applyWebGLBlur(entity, filter);
                break;
            case 'brightness':
            case 'contrast':
            case 'saturation':
                this.applyWebGLColorAdjustment(entity, filter);
                break;
            default:
                console.warn(`WebGL filter not implemented: ${filter.type}`);
        }
    }

    /**
     * Aplicar filtro usando Canvas 2D filter API
     */
    private applyCanvas2DFilter(entity: EntityElement, filter: CameraFilter): void {
        const canvas = this.getEntityCanvas(entity);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Construir string de filtro CSS
        const filterString = this.buildCanvas2DFilterString(filter);
        if (filterString) {
            ctx.filter = filterString;
        }
    }

    /**
     * Aplicar filtro por software usando manipulación de ImageData (fallback)
     */
    private applySoftwareFilter(entity: EntityElement, filter: CameraFilter): void {
        const canvas = this.getEntityCanvas(entity);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        try {
            // Obtener ImageData del canvas completo
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Aplicar filtro según el tipo
            switch (filter.type) {
                case 'sepia':
                    this.applySoftwareSepia(data, filter.intensity);
                    break;
                case 'grayscale':
                    this.applySoftwareGrayscale(data, filter.intensity);
                    break;
                case 'invert':
                    this.applySoftwareInvert(data, filter.intensity);
                    break;
                case 'brightness':
                    const brightnessFilter = filter as any;
                    this.applySoftwareBrightness(data, brightnessFilter.level || 0);
                    break;
                case 'contrast':
                    const contrastFilter = filter as any;
                    this.applySoftwareContrast(data, contrastFilter.level || 1);
                    break;
                case 'saturation':
                    const saturationFilter = filter as any;
                    this.applySoftwareSaturation(data, saturationFilter.level || 1);
                    break;
                case 'blur':
                    const blurFilter = filter as any;
                    this.applySoftwareBlur(imageData, blurFilter.radius || 1);
                    break;
                case 'sin-city':
                    this.applySoftwareSinCity(data, filter.intensity);
                    break;
                default:
                    console.warn(`Software filter not implemented: ${filter.type}`);
                    return;
            }

            // Aplicar los cambios de vuelta al canvas
            ctx.putImageData(imageData, 0, 0);

        } catch (error) {
            console.warn('Error applying software filter:', error);
        }
    }

    /**
     * Implementaciones específicas de filtros por software
     */

    private applySoftwareSepia(data: Uint8ClampedArray, intensity: number): void {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Fórmula sepia estándar
            const tr = (r * 0.393 + g * 0.769 + b * 0.189);
            const tg = (r * 0.349 + g * 0.686 + b * 0.168);
            const tb = (r * 0.272 + g * 0.534 + b * 0.131);

            // Mezclar con color original según intensidad
            data[i] = Math.min(255, r + (tr - r) * intensity);
            data[i + 1] = Math.min(255, g + (tg - g) * intensity);
            data[i + 2] = Math.min(255, b + (tb - b) * intensity);
        }
    }

    private applySoftwareGrayscale(data: Uint8ClampedArray, intensity: number): void {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Conversión a escala de grises usando luminancia
            const gray = r * 0.299 + g * 0.587 + b * 0.114;

            // Mezclar con color original según intensidad
            data[i] = r + (gray - r) * intensity;
            data[i + 1] = g + (gray - g) * intensity;
            data[i + 2] = b + (gray - b) * intensity;
        }
    }

    private applySoftwareInvert(data: Uint8ClampedArray, intensity: number): void {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Invertir colores
            const invR = 255 - r;
            const invG = 255 - g;
            const invB = 255 - b;

            // Mezclar según intensidad
            data[i] = r + (invR - r) * intensity;
            data[i + 1] = g + (invG - g) * intensity;
            data[i + 2] = b + (invB - b) * intensity;
        }
    }

    private applySoftwareBrightness(data: Uint8ClampedArray, level: number): void {
        const adjustment = level * 255;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, Math.min(255, data[i] + adjustment));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment));
        }
    }

    private applySoftwareContrast(data: Uint8ClampedArray, level: number): void {
        const factor = (259 * (level * 255 + 255)) / (255 * (259 - level * 255));
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
            data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
            data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
        }
    }

    private applySoftwareSaturation(data: Uint8ClampedArray, level: number): void {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Convertir a escala de grises para calcular saturación
            const gray = r * 0.299 + g * 0.587 + b * 0.114;

            // Ajustar saturación
            data[i] = Math.max(0, Math.min(255, gray + (r - gray) * level));
            data[i + 1] = Math.max(0, Math.min(255, gray + (g - gray) * level));
            data[i + 2] = Math.max(0, Math.min(255, gray + (b - gray) * level));
        }
    }

    private applySoftwareBlur(imageData: ImageData, radius: number): void {
        // Implementación simple de blur gaussiano
        const { data, width, height } = imageData;
        const copy = new Uint8ClampedArray(data);

        const sigma = radius / 3;
        const kernel = this.generateGaussianKernel(radius, sigma);
        const kernelSize = kernel.length;
        const half = Math.floor(kernelSize / 2);

        // Aplicar blur horizontal y vertical
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0;
                let totalWeight = 0;

                for (let ky = -half; ky <= half; ky++) {
                    for (let kx = -half; kx <= half; kx++) {
                        const pixelY = Math.max(0, Math.min(height - 1, y + ky));
                        const pixelX = Math.max(0, Math.min(width - 1, x + kx));
                        const pixelIndex = (pixelY * width + pixelX) * 4;
                        const weight = kernel[ky + half] * kernel[kx + half];

                        r += copy[pixelIndex] * weight;
                        g += copy[pixelIndex + 1] * weight;
                        b += copy[pixelIndex + 2] * weight;
                        a += copy[pixelIndex + 3] * weight;
                        totalWeight += weight;
                    }
                }

                const index = (y * width + x) * 4;
                data[index] = r / totalWeight;
                data[index + 1] = g / totalWeight;
                data[index + 2] = b / totalWeight;
                data[index + 3] = a / totalWeight;
            }
        }
    }

    private applySoftwareSinCity(data: Uint8ClampedArray, intensity: number): void {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Convertir a escala de grises
            const gray = r * 0.299 + g * 0.587 + b * 0.114;

            // Detectar colores "calientes" (rojos, amarillos)
            const isWarm = (r > g + 30 && r > b + 30) || (r > 150 && g > 100 && b < 100);

            if (isWarm && intensity > 0.5) {
                // Mantener color original para elementos "calientes"
                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;
            } else {
                // Aplicar escala de grises con tinte azul frío
                data[i] = Math.max(0, gray - 20);
                data[i + 1] = Math.max(0, gray - 10);
                data[i + 2] = Math.min(255, gray + 20);
            }
        }
    }

    private generateGaussianKernel(radius: number, sigma: number): number[] {
        const size = radius * 2 + 1;
        const kernel = new Array(size);
        let sum = 0;

        for (let i = 0; i < size; i++) {
            const x = i - radius;
            kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
            sum += kernel[i];
        }

        // Normalizar kernel
        for (let i = 0; i < size; i++) {
            kernel[i] /= sum;
        }

        return kernel;
    }

    /**
     * Métodos auxiliares para WebGL
     */

    private createShaderProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram | null {
        // Compilar shader de vértices
        const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vertexSource);
        if (!vertexShader) return null;

        // Compilar shader de fragmentos
        const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
        if (!fragmentShader) return null;

        // Crear programa
        const program = gl.createProgram();
        if (!program) return null;

        // Enlazar shaders
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        // Verificar enlace
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Error linking shader program:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }

        // Usar programa
        gl.useProgram(program);

        return program;
    }

    private compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
        const shader = gl.createShader(type);
        if (!shader) return null;

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    private setupFullScreenQuad(gl: WebGLRenderingContext, program: WebGLProgram): void {
        // Definir vértices para un quad que cubra toda la pantalla
        const vertices = new Float32Array([
            // Posición    // Coordenadas de textura
            -1.0, -1.0, 0.0, 0.0,  // Inferior izquierda
            1.0, -1.0, 1.0, 0.0,  // Inferior derecha
            -1.0, 1.0, 0.0, 1.0,  // Superior izquierda

            -1.0, 1.0, 0.0, 1.0,  // Superior izquierda
            1.0, -1.0, 1.0, 0.0,  // Inferior derecha
            1.0, 1.0, 1.0, 1.0   // Superior derecha
        ]);

        // Crear buffer
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Configurar atributos
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

        // Posición
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);

        // Coordenadas de textura
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);
    }

    /**
     * API pública para gestión de filtros
     */

    /**
     * Agregar filtro a una cámara
     */
    public addFilter(entity: EntityElement, name: string, filter: CameraFilter): void {
        const filtersComponent = entity.getComponent('cameraFilters') as CameraFiltersComponent;
        if (!filtersComponent) {
            console.warn('Entity does not have cameraFilters component');
            return;
        }

        filtersComponent.filters.set(name, filter);
    }

    /**
     * Remover filtro de una cámara
     */
    public removeFilter(entity: EntityElement, name: string): void {
        const filtersComponent = entity.getComponent('cameraFilters') as CameraFiltersComponent;
        if (!filtersComponent) return;

        filtersComponent.filters.delete(name);
    }

    /**
     * Obtener filtro por nombre
     */
    public getFilter(entity: EntityElement, name: string): CameraFilter | undefined {
        const filtersComponent = entity.getComponent('cameraFilters') as CameraFiltersComponent;
        if (!filtersComponent) return undefined;

        return filtersComponent.filters.get(name);
    }

    /**
     * Aplicar preset de filtros
     */
    public applyPreset(entity: EntityElement, presetName: string): void {
        const preset = FILTER_PRESETS.find(p => p.name === presetName);
        if (!preset) {
            console.warn(`Filter preset not found: ${presetName}`);
            return;
        }

        this.clearAllFilters(entity);

        preset.filters.forEach((filter, index) => {
            this.addFilter(entity, `${presetName}_${index}`, filter);
        });
    }

    /**
     * Limpiar todos los filtros
     */
    public clearAllFilters(entity: EntityElement): void {
        const filtersComponent = entity.getComponent('cameraFilters') as CameraFiltersComponent;
        if (!filtersComponent) return;

        filtersComponent.filters.clear();
    }

    /**
     * Activar/desactivar filtros
     */
    public setFiltersEnabled(entity: EntityElement, enabled: boolean): void {
        const filtersComponent = entity.getComponent('cameraFilters') as CameraFiltersComponent;
        if (!filtersComponent) return;

        filtersComponent.enabled = enabled;
    }

    /**
     * Métodos de implementación específicos
     */

    private detectFilterSupport(): void {
        // Detectar soporte para Canvas 2D filters
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx && 'filter' in ctx) {
            this.canvas2DFiltersSupported = true;
        }

        // Detectar soporte para WebGL
        const webglCanvas = document.createElement('canvas');
        const gl = webglCanvas.getContext('webgl') || webglCanvas.getContext('experimental-webgl');
        if (gl) {
            this.webGLFiltersSupported = true;
        }
    }

    private getEntityCanvas(entity: EntityElement): HTMLCanvasElement | null {
        try {
            // Opción 1: Obtener canvas desde el componente de cámara
            const camera = entity.getComponent('camera') as CameraComponent;
            if (camera && camera.canvas) {
                return camera.canvas;
            }

            // Opción 2: Buscar canvas en el DOM por ID de la entidad
            const canvasId = `camera-canvas-${entity.id}`;
            const canvasElement = document.getElementById(canvasId) as HTMLCanvasElement;
            if (canvasElement && canvasElement.tagName === 'CANVAS') {
                return canvasElement;
            }

            // Opción 3: Obtener canvas principal del engine
            const mainCanvas = document.querySelector('canvas#game-canvas') as HTMLCanvasElement;
            if (mainCanvas) {
                return mainCanvas;
            }

            // Opción 4: Buscar cualquier canvas disponible
            const anyCanvas = document.querySelector('canvas') as HTMLCanvasElement;
            if (anyCanvas) {
                console.warn('Using fallback canvas for camera filters');
                return anyCanvas;
            }

            // Opción 5: Crear canvas temporal si no existe ninguno
            console.warn('No canvas found, creating temporary canvas for filters');
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 800;
            tempCanvas.height = 600;
            return tempCanvas;

        } catch (error) {
            console.error('Error getting entity canvas:', error);
            return null;
        }
    }

    private buildCanvas2DFilterString(filter: CameraFilter): string {
        switch (filter.type) {
            case 'sepia':
                return `sepia(${filter.intensity * 100}%)`;
            case 'grayscale':
                return `grayscale(${filter.intensity * 100}%)`;
            case 'blur':
                const blurFilter = filter as any;
                return `blur(${blurFilter.radius || 1}px)`;
            case 'brightness':
                const brightnessFilter = filter as any;
                const brightness = 100 + (brightnessFilter.level || 0) * 100;
                return `brightness(${brightness}%)`;
            case 'contrast':
                const contrastFilter = filter as any;
                const contrast = (contrastFilter.level || 1) * 100;
                return `contrast(${contrast}%)`;
            case 'saturation':
                const saturationFilter = filter as any;
                const saturation = (saturationFilter.level || 1) * 100;
                return `saturate(${saturation}%)`;
            case 'hue-rotate':
                const hueFilter = filter as any;
                return `hue-rotate(${hueFilter.degrees || 0}deg)`;
            case 'invert':
                return `invert(${filter.intensity * 100}%)`;
            default:
                return '';
        }
    }

    // Implementaciones WebGL con shaders
    private applyWebGLSepia(entity: EntityElement, filter: CameraFilter): void {
        const canvas = this.getEntityCanvas(entity);
        if (!canvas) return;

        const gl = canvas.getContext('webgl') as WebGLRenderingContext;
        if (!gl) {
            console.warn('WebGL not available, falling back to Canvas2D');
            this.applyCanvas2DFilter(entity, filter);
            return;
        }

        try {
            // Shader de vértices (simple passthrough)
            const vertexShaderSource = `
                attribute vec2 a_position;
                attribute vec2 a_texCoord;
                varying vec2 v_texCoord;
                void main() {
                    gl_Position = vec4(a_position, 0.0, 1.0);
                    v_texCoord = a_texCoord;
                }
            `;

            // Shader de fragmentos para efecto sepia
            const fragmentShaderSource = `
                precision mediump float;
                uniform sampler2D u_texture;
                uniform float u_intensity;
                varying vec2 v_texCoord;

                void main() {
                    vec4 color = texture2D(u_texture, v_texCoord);

                    // Matriz de transformación sepia
                    vec3 sepia;
                    sepia.r = dot(color.rgb, vec3(0.393, 0.769, 0.189));
                    sepia.g = dot(color.rgb, vec3(0.349, 0.686, 0.168));
                    sepia.b = dot(color.rgb, vec3(0.272, 0.534, 0.131));

                    // Mezclar con color original según intensidad
                    vec3 result = mix(color.rgb, sepia, u_intensity);

                    gl_FragColor = vec4(result, color.a);
                }
            `;

            // Compilar y usar el programa de shader
            const program = this.createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
            if (!program) return;

            // Configurar geometría para cubrir toda la pantalla
            this.setupFullScreenQuad(gl, program);

            // Establecer uniforms
            const intensityLocation = gl.getUniformLocation(program, 'u_intensity');
            gl.uniform1f(intensityLocation, filter.intensity);

            // Renderizar
            gl.drawArrays(gl.TRIANGLES, 0, 6);

        } catch (error) {
            console.error('Error applying WebGL sepia filter:', error);
            // Fallback a Canvas2D
            this.applyCanvas2DFilter(entity, filter);
        }
    }

    private applyWebGLGrayscale(entity: EntityElement, filter: CameraFilter): void {
        const canvas = this.getEntityCanvas(entity);
        if (!canvas) return;

        const gl = canvas.getContext('webgl') as WebGLRenderingContext;
        if (!gl) {
            console.warn('WebGL not available, falling back to Canvas2D');
            this.applyCanvas2DFilter(entity, filter);
            return;
        }

        try {
            // Shader de vértices (simple passthrough)
            const vertexShaderSource = `
                attribute vec2 a_position;
                attribute vec2 a_texCoord;
                varying vec2 v_texCoord;

                void main() {
                    gl_Position = vec4(a_position, 0.0, 1.0);
                    v_texCoord = a_texCoord;
                }
            `;

            // Shader de fragmentos para efecto grayscale
            const fragmentShaderSource = `
                precision mediump float;
                uniform sampler2D u_texture;
                uniform float u_intensity;
                varying vec2 v_texCoord;

                void main() {
                    vec4 color = texture2D(u_texture, v_texCoord);

                    // Conversión a escala de grises usando luminancia (método estándar)
                    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    vec3 grayscale = vec3(gray);

                    // Mezclar con color original según intensidad
                    vec3 result = mix(color.rgb, grayscale, u_intensity);

                    gl_FragColor = vec4(result, color.a);
                }
            `;

            // Compilar y usar el programa de shader
            const program = this.createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
            if (!program) return;

            // Configurar geometría para cubrir toda la pantalla
            this.setupFullScreenQuad(gl, program);

            // Establecer uniforms
            const intensityLocation = gl.getUniformLocation(program, 'u_intensity');
            gl.uniform1f(intensityLocation, filter.intensity);

            // Renderizar
            gl.drawArrays(gl.TRIANGLES, 0, 6);

        } catch (error) {
            console.error('Error applying WebGL grayscale filter:', error);
            // Fallback a Canvas2D
            this.applyCanvas2DFilter(entity, filter);
        }
    }

    private applyWebGLBlur(entity: EntityElement, filter: CameraFilter): void {
        const canvas = this.getEntityCanvas(entity);
        if (!canvas) return;

        const gl = canvas.getContext('webgl') as WebGLRenderingContext;
        if (!gl) {
            console.warn('WebGL not available, falling back to Canvas2D');
            this.applyCanvas2DFilter(entity, filter);
            return;
        }

        const blurFilter = filter as any;
        const radius = blurFilter.radius || 1;

        try {
            // Shader de vértices (simple passthrough)
            const vertexShaderSource = `
                attribute vec2 a_position;
                attribute vec2 a_texCoord;
                varying vec2 v_texCoord;

                void main() {
                    gl_Position = vec4(a_position, 0.0, 1.0);
                    v_texCoord = a_texCoord;
                }
            `;

            // Shader de fragmentos para blur gaussiano
            const fragmentShaderSource = `
                precision mediump float;
                uniform sampler2D u_texture;
                uniform vec2 u_textureSize;
                uniform vec2 u_direction;
                uniform float u_radius;
                varying vec2 v_texCoord;

                // Función para generar peso gaussiano
                float gaussian(float x, float sigma) {
                    return exp(-(x * x) / (2.0 * sigma * sigma));
                }

                void main() {
                    vec2 texelSize = 1.0 / u_textureSize;
                    vec4 result = vec4(0.0);
                    float totalWeight = 0.0;

                    // Sigma basado en el radio
                    float sigma = u_radius / 3.0;

                    // Aplicar blur en una dirección (horizontal o vertical)
                    for (float i = -u_radius; i <= u_radius; i += 1.0) {
                        vec2 offset = u_direction * i * texelSize;
                        vec2 sampleCoord = v_texCoord + offset;

                        // Verificar límites
                        if (sampleCoord.x >= 0.0 && sampleCoord.x <= 1.0 &&
                            sampleCoord.y >= 0.0 && sampleCoord.y <= 1.0) {

                            float weight = gaussian(i, sigma);
                            result += texture2D(u_texture, sampleCoord) * weight;
                            totalWeight += weight;
                        }
                    }

                    gl_FragColor = result / totalWeight;
                }
            `;

            // Crear programa de shader
            const program = this.createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
            if (!program) return;

            // Obtener ubicaciones de uniforms
            const textureSizeLocation = gl.getUniformLocation(program, 'u_textureSize');
            const directionLocation = gl.getUniformLocation(program, 'u_direction');
            const radiusLocation = gl.getUniformLocation(program, 'u_radius');

            // Configurar tamaño de textura
            gl.uniform2f(textureSizeLocation, canvas.width, canvas.height);
            gl.uniform1f(radiusLocation, radius);

            // Configurar geometría
            this.setupFullScreenQuad(gl, program);

            // Para un blur real necesitamos dos pasadas: horizontal y vertical
            // Pasada 1: Blur horizontal
            gl.uniform2f(directionLocation, 1.0, 0.0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            // Pasada 2: Blur vertical
            // En una implementación completa, necesitaríamos un framebuffer intermedio
            // Para simplicidad, aplicamos solo una pasada por ahora
            gl.uniform2f(directionLocation, 0.0, 1.0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

        } catch (error) {
            console.error('Error applying WebGL blur filter:', error);
            // Fallback a Canvas2D
            this.applyCanvas2DFilter(entity, filter);
        }
    }

    private applyWebGLColorAdjustment(entity: EntityElement, filter: CameraFilter): void {
        const canvas = this.getEntityCanvas(entity);
        if (!canvas) return;

        const gl = canvas.getContext('webgl') as WebGLRenderingContext;
        if (!gl) {
            console.warn('WebGL not available, falling back to Canvas2D');
            this.applyCanvas2DFilter(entity, filter);
            return;
        }

        try {
            // Shader de vértices (simple passthrough)
            const vertexShaderSource = `
                attribute vec2 a_position;
                attribute vec2 a_texCoord;
                varying vec2 v_texCoord;

                void main() {
                    gl_Position = vec4(a_position, 0.0, 1.0);
                    v_texCoord = a_texCoord;
                }
            `;

            // Shader de fragmentos universal para ajustes de color
            const fragmentShaderSource = `
                precision mediump float;
                uniform sampler2D u_texture;
                uniform float u_brightness;
                uniform float u_contrast;
                uniform float u_saturation;
                uniform int u_filterType;
                varying vec2 v_texCoord;

                void main() {
                    vec4 color = texture2D(u_texture, v_texCoord);
                    vec3 result = color.rgb;

                    // Aplicar brightness
                    if (u_filterType == 1) { // brightness
                        result = result + vec3(u_brightness);
                    }

                    // Aplicar contrast
                    else if (u_filterType == 2) { // contrast
                        result = (result - 0.5) * u_contrast + 0.5;
                    }

                    // Aplicar saturation
                    else if (u_filterType == 3) { // saturation
                        float gray = dot(result, vec3(0.299, 0.587, 0.114));
                        result = mix(vec3(gray), result, u_saturation);
                    }

                    // Clamp resultado entre 0 y 1
                    result = clamp(result, 0.0, 1.0);

                    gl_FragColor = vec4(result, color.a);
                }
            `;

            // Compilar y usar el programa de shader
            const program = this.createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
            if (!program) return;

            // Configurar geometría para cubrir toda la pantalla
            this.setupFullScreenQuad(gl, program);

            // Obtener ubicaciones de uniforms
            const brightnessLocation = gl.getUniformLocation(program, 'u_brightness');
            const contrastLocation = gl.getUniformLocation(program, 'u_contrast');
            const saturationLocation = gl.getUniformLocation(program, 'u_saturation');
            const filterTypeLocation = gl.getUniformLocation(program, 'u_filterType');

            // Configurar valores según el tipo de filtro
            let filterType = 0;
            let brightness = 0.0;
            let contrast = 1.0;
            let saturation = 1.0;

            switch (filter.type) {
                case 'brightness':
                    filterType = 1;
                    const brightnessFilter = filter as any;
                    brightness = brightnessFilter.level || 0;
                    break;

                case 'contrast':
                    filterType = 2;
                    const contrastFilter = filter as any;
                    contrast = contrastFilter.level || 1;
                    break;

                case 'saturation':
                    filterType = 3;
                    const saturationFilter = filter as any;
                    saturation = saturationFilter.level || 1;
                    break;

                default:
                    console.warn(`Unknown color adjustment filter: ${filter.type}`);
                    return;
            }

            // Establecer uniforms
            gl.uniform1f(brightnessLocation, brightness);
            gl.uniform1f(contrastLocation, contrast);
            gl.uniform1f(saturationLocation, saturation);
            gl.uniform1i(filterTypeLocation, filterType);

            // Renderizar
            gl.drawArrays(gl.TRIANGLES, 0, 6);

        } catch (error) {
            console.error('Error applying WebGL color adjustment filter:', error);
            // Fallback a Canvas2D
            this.applyCanvas2DFilter(entity, filter);
        }
    }

    /**
     * Obtener información del sistema
     */
    public getFilterSupport(): { webgl: boolean; canvas2d: boolean } {
        return {
            webgl: this.webGLFiltersSupported,
            canvas2d: this.canvas2DFiltersSupported
        };
    }

    /**
     * Obtener lista de presets disponibles
     */
    public getAvailablePresets(): FilterPreset[] {
        return [...FILTER_PRESETS];
    }
}