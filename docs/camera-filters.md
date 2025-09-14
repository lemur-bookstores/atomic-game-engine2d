# Sistema de Filtros de Cámara

## 🎨 **Descripción**

El Sistema de Filtros de Cámara permite aplicar efectos visuales avanzados en tiempo real a las cámaras del juego. Incluye filtros predefinidos, ajustes de color personalizables y presets listos para usar.

## ✨ **Características**

### Filtros Disponibles

- **🎞️ Sepia**: Efecto de fotografía vintage
- **⚫ Escala de Grises**: Conversión a blanco y negro
- **🔄 Inversión**: Colores invertidos
- **🌀 Blur**: Desenfoque configurable
- **☀️ Brillo**: Ajuste de luminosidad
- **⚡ Contraste**: Ajuste de contraste
- **🌈 Saturación**: Control de intensidad de colores
- **🎨 Rotación de Tono**: Cambio del matiz de colores
- **🎭 Viñeta**: Oscurecimiento en los bordes
- **🔲 Pixelado**: Efecto de arte pixelado
- **👁️ Aberración Cromática**: Separación de canales RGB
- **🎬 Sin City**: Blanco y negro con acentos de color

### Presets Incluidos

- **🎭 Film Noir**: Clásico blanco y negro cinematográfico
- **📸 Vintage**: Fotografía retro con tintes cálidos
- **🔴 Sin City**: Estilo cómic con acentos rojos
- **🤖 Cyberpunk**: Efecto futurista con aberración
- **👾 Retro Game**: Pixelado estilo videojuegos clásicos
- **👻 Horror**: Ambiente terrorífico desaturado

## 🚀 **Uso Básico**

### 1. Configurar el Sistema

```typescript
import { CameraFiltersSystem, CameraEntity } from "@atomic-engine/camera";

// Crear y agregar el sistema
const filtersSystem = new CameraFiltersSystem();
world.addSystem(filtersSystem);

// Crear cámara con componente de filtros
const camera = new CameraEntity("mainCamera");
camera.addComponent({
  type: "cameraFilters",
  filters: new Map(),
  enabled: true,
  blendMode: "normal",
});
```

### 2. Aplicar Filtros Individuales

```typescript
// Filtro sepia básico
filtersSystem.addFilter(camera, "sepia", {
  type: "sepia",
  intensity: 0.8,
  enabled: true,
  warmth: 0.9,
});

// Filtro de brillo temporal (se elimina automáticamente)
filtersSystem.addFilter(camera, "flash", {
  type: "brightness",
  intensity: 1.0,
  level: 0.5,
  duration: 1000, // 1 segundo
  enabled: true,
});

// Filtro de blur configurable
filtersSystem.addFilter(camera, "dreamBlur", {
  type: "blur",
  intensity: 0.7,
  radius: 5,
  enabled: true,
});
```

### 3. Usar Presets

```typescript
// Aplicar preset completo
filtersSystem.applyPreset(camera, "Noir");

// Ver presets disponibles
const presets = filtersSystem.getAvailablePresets();
console.log(presets.map((p) => p.name)); // ['Noir', 'Vintage', 'Sin City', ...]
```

### 4. Gestión Dinámica

```typescript
// Activar/desactivar filtros
filtersSystem.setFiltersEnabled(camera, false);

// Remover filtro específico
filtersSystem.removeFilter(camera, "sepia");

// Limpiar todos los filtros
filtersSystem.clearAllFilters(camera);

// Obtener filtro para modificación
const blurFilter = filtersSystem.getFilter(camera, "dreamBlur");
if (blurFilter && blurFilter.type === "blur") {
  blurFilter.radius = 10; // Aumentar el blur
}
```

## 📋 **Ejemplos Avanzados**

### Efecto Sin City Personalizado

```typescript
const sinCityFilter = {
  type: "sin-city" as const,
  intensity: 1.0,
  enabled: true,
  accentColor: { r: 255, g: 0, b: 0 }, // Mantener rojos
  threshold: 0.8, // Sensibilidad de detección
};

filtersSystem.addFilter(camera, "sinCity", sinCityFilter);
```

### Transición de Filtros Animada

```typescript
// Crear efecto de fade temporal
const fadeEffect = {
  type: "brightness" as const,
  intensity: 1.0,
  level: -1.0, // Completamente negro
  duration: 2000, // 2 segundos
  easing: "ease-out" as const,
  enabled: true,
};

filtersSystem.addFilter(camera, "fadeTransition", fadeEffect);
```

### Efecto Vintage Completo

```typescript
const vintagePreset = [
  {
    type: "sepia" as const,
    intensity: 0.7,
    enabled: true,
    warmth: 0.8,
  },
  {
    type: "vignette" as const,
    intensity: 0.6,
    radius: 0.8,
    softness: 0.7,
    opacity: 0.5,
    enabled: true,
  },
  {
    type: "saturation" as const,
    intensity: 0.8,
    level: 0.9,
    enabled: true,
  },
];

vintagePreset.forEach((filter, index) => {
  filtersSystem.addFilter(camera, `vintage_${index}`, filter);
});
```

### Efectos Dinámicos en el Gameplay

```typescript
// Efecto de daño con flash rojo
function takeDamage() {
  filtersSystem.addFilter(camera, "damageFlash", {
    type: "hue-rotate",
    intensity: 0.8,
    degrees: 0, // Hacia rojo
    duration: 300,
    enabled: true,
  });
}

// Efecto de poder especial
function activateSlowMotion() {
  filtersSystem.addFilter(camera, "timeEffect", {
    type: "saturation",
    intensity: 0.9,
    level: 0.3, // Desaturar
    duration: 5000,
    enabled: true,
  });
}

// Ambiente nocturno dinámico
function setNightMode(enabled: boolean) {
  if (enabled) {
    filtersSystem.addFilter(camera, "night", {
      type: "brightness",
      intensity: 0.7,
      level: -0.4,
      enabled: true,
    });
  } else {
    filtersSystem.removeFilter(camera, "night");
  }
}
```

## 🔧 **Configuración Avanzada**

### Modos de Mezcla

```typescript
const filtersComponent = camera.getComponent("cameraFilters");
filtersComponent.blendMode = "multiply"; // 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light'
```

### Renderizado a Textura

```typescript
// Para post-processing avanzado (requiere WebGL)
filtersComponent.renderTarget = createRenderTexture(800, 600);
```

### Detección de Capacidades

```typescript
const support = filtersSystem.getFilterSupport();
console.log(`WebGL: ${support.webgl}, Canvas2D: ${support.canvas2d}`);

if (support.webgl) {
  // Usar filtros WebGL de alto rendimiento
} else if (support.canvas2d) {
  // Usar filtros Canvas 2D
} else {
  // Fallback a implementación por software
}
```

## 🎮 **Ejemplo Interactivo**

Consulta el ejemplo completo en `examples/camera-filters/` que incluye:

- Interfaz de control en tiempo real
- Presets predefinidos
- Sliders para ajustes finos
- Combinación de múltiples filtros
- Demostración de efectos especiales

## ⚡ **Consideraciones de Rendimiento**

1. **Limitar Filtros Simultáneos**: Evita aplicar demasiados filtros complejos al mismo tiempo
2. **Usar Presets**: Los presets están optimizados para mejor rendimiento
3. **WebGL vs Canvas2D**: WebGL ofrece mejor rendimiento para filtros complejos
4. **Filtros Temporales**: Usa `duration` para filtros que deben desaparecer automáticamente
5. **Pooling de Filtros**: Reutiliza objetos de filtro cuando sea posible

## 🎯 **Casos de Uso Comunes**

- **Cinematografía**: Crear atmósferas específicas según la escena
- **Feedback Visual**: Indicar estados del juego (daño, poder, etc.)
- **Estilo Artístico**: Aplicar estética única al juego
- **Transiciones**: Efectos suaves entre escenas
- **Ambientación**: Cambios dinámicos según hora del día o ubicación

---

**¡Los filtros de cámara te permiten crear experiencias visuales únicas y cinematográficas en tu juego!** 🎬✨
