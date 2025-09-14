# Sistema de Efectos de Cámara Personalizados

## Descripción

El Sistema de Efectos de Cámara permite crear efectos visuales avanzados tanto predefinidos como completamente personalizados. Este sistema es parte del patrón ECS (Entity-Component-System) y proporciona una interfaz extensible para crear efectos cinematográficos únicos.

## Características

### Efectos Predefinidos

- **Shake (Sacudida)**: Vibración de la cámara con intensidad, duración y frecuencia configurables
- **Flash**: Destello de pantalla con color, duración e intensidad personalizables
- **Fade**: Desvanecimiento de entrada o salida con transiciones suaves

### Efectos Personalizados

- **Sistema Extensible**: Crea efectos únicos con funciones de actualización personalizadas
- **Propiedades Dinámicas**: Almacena y manipula propiedades específicas del efecto
- **Gestión de Ciclo de Vida**: Limpieza automática cuando los efectos expiran

## Uso Básico

### 1. Configurar el Sistema

```typescript
import { CameraEffectsSystem, CameraEntity } from "@atomic-engine/core";

// Crear y agregar el sistema al mundo
const effectsSystem = new CameraEffectsSystem();
world.addSystem(effectsSystem);

// Crear una cámara con componente de efectos
const camera = new CameraEntity("mainCamera");
world.addEntity(camera);
```

### 2. Usar Efectos Predefinidos

```typescript
// Activar shake con intensidad 15, duración 800ms, frecuencia 45Hz
effectsSystem.triggerShake(camera, 15, 800, 45);

// Activar flash blanco con duración 300ms e intensidad 0.9
effectsSystem.triggerFlash(
  camera,
  { r: 255, g: 255, b: 255, a: 255 },
  300,
  0.9
);

// Activar fade negro de salida por 1.5 segundos
effectsSystem.triggerFade(camera, { r: 0, g: 0, b: 0, a: 255 }, 1500, "out");
```

### 3. Crear Efectos Personalizados

```typescript
// Efecto de onda senoidal
const waveEffect: CustomEffect = {
  duration: 3000, // 3 segundos
  properties: new Map([
    ["amplitude", 25], // Amplitud inicial
    ["frequency", 0.008], // Frecuencia de oscilación
    ["time", 0], // Tiempo acumulado
  ]),
  updateFunction: (effect: CustomEffect, deltaTime: number) => {
    const time = effect.properties.get("time") + deltaTime;
    const amplitude = effect.properties.get("amplitude");
    const frequency = effect.properties.get("frequency");

    // Calcular offset basado en función senoidal
    const offsetX = Math.sin(time * frequency) * amplitude;
    const offsetY = Math.cos(time * frequency * 0.7) * amplitude * 0.5;

    // Aplicar transformación (implementar según tu sistema de rendering)
    applyOffset(offsetX, offsetY);

    // Actualizar propiedades
    effect.properties.set("time", time);
    effect.properties.set("amplitude", amplitude * 0.998); // Decay gradual
  },
};

// Agregar el efecto personalizado
effectsSystem.addCustomEffect(camera, "wave", waveEffect);
```

## Ejemplos Avanzados

### Efecto Pulso de Zoom

```typescript
const pulseEffect: CustomEffect = {
  duration: 2500,
  properties: new Map([
    ["baseZoom", 1.0],
    ["pulseIntensity", 0.3],
    ["pulseSpeed", 0.004],
    ["time", 0],
  ]),
  updateFunction: (effect, deltaTime) => {
    const time = effect.properties.get("time") + deltaTime;
    const baseZoom = effect.properties.get("baseZoom");
    const intensity = effect.properties.get("pulseIntensity");
    const speed = effect.properties.get("pulseSpeed");

    // Crear pulso suave
    const pulse = Math.sin(time * speed) * intensity;
    const currentZoom = baseZoom + pulse;

    // Aplicar zoom (implementar según tu componente de cámara)
    setCameraZoom(currentZoom);

    effect.properties.set("time", time);
  },
};

effectsSystem.addCustomEffect(camera, "pulse", pulseEffect);
```

### Efecto Espiral Cinematográfico

```typescript
const spiralEffect: CustomEffect = {
  duration: 5000,
  properties: new Map([
    ["centerX", camera.transform.position.x],
    ["centerY", camera.transform.position.y],
    ["radius", 100],
    ["spiralSpeed", 0.001],
    ["radiusDecay", 0.9985],
    ["time", 0],
  ]),
  updateFunction: (effect, deltaTime) => {
    const time = effect.properties.get("time") + deltaTime;
    const centerX = effect.properties.get("centerX");
    const centerY = effect.properties.get("centerY");
    const radius = effect.properties.get("radius");
    const speed = effect.properties.get("spiralSpeed");
    const decay = effect.properties.get("radiusDecay");

    // Calcular posición en espiral
    const angle = time * speed;
    const currentRadius = radius * Math.pow(decay, time * 0.001);

    const newX = centerX + Math.cos(angle) * currentRadius;
    const newY = centerY + Math.sin(angle) * currentRadius;

    // Aplicar nueva posición
    setCameraPosition(newX, newY);

    effect.properties.set("time", time);
    effect.properties.set("radius", currentRadius);
  },
};

effectsSystem.addCustomEffect(camera, "cinematicSpiral", spiralEffect);
```

## Gestión de Efectos

### Verificar Estado de Efectos

```typescript
// Verificar si un efecto existe
const hasWave = effectsSystem.getCustomEffect(camera, "wave") !== undefined;

// Obtener efecto para modificar propiedades dinámicamente
const waveEffect = effectsSystem.getCustomEffect(camera, "wave");
if (waveEffect) {
  // Modificar intensidad en tiempo real
  waveEffect.properties.set("amplitude", 50);
}
```

### Remover Efectos

```typescript
// Remover efecto específico
effectsSystem.removeCustomEffect(camera, "wave");

// Los efectos también se remueven automáticamente cuando expiran
```

## Consideraciones de Rendimiento

1. **Limitar Efectos Simultáneos**: Evita ejecutar demasiados efectos complejos al mismo tiempo
2. **Optimizar Funciones de Actualización**: Usa cálculos eficientes en las funciones updateFunction
3. **Gestión de Memoria**: Los efectos se limpian automáticamente, pero puedes remover manualmente si es necesario

## API Completa

### CameraEffectsSystem

#### Métodos Predefinidos

- `triggerShake(entity, intensity, duration, frequency?)`: Activa efecto de sacudida
- `triggerFlash(entity, color, duration, intensity?)`: Activa efecto de destello
- `triggerFade(entity, color, duration, direction)`: Activa efecto de desvanecimiento

#### Métodos de Efectos Personalizados

- `addCustomEffect(entity, name, effect)`: Añade un efecto personalizado
- `removeCustomEffect(entity, name)`: Remueve un efecto específico
- `getCustomEffect(entity, name)`: Obtiene referencia a un efecto existente

### Interfaz CustomEffect

```typescript
interface CustomEffect {
  duration: number; // Duración en milisegundos
  properties: Map<string, any>; // Propiedades personalizadas
  updateFunction?: (effect: CustomEffect, deltaTime: number) => void;
}
```

## Ejemplo Completo

Consulta el ejemplo interactivo en `examples/custom-camera-effects/` para ver una implementación completa con múltiples efectos y controles en tiempo real.

---

Este sistema te permite crear experiencias visuales únicas y cinematográficas en tu juego, desde simples efectos de impact hasta complejas secuencias de cámara personalizadas.
