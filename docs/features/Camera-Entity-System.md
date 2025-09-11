# 📷 Feature Analysis: Camera Entity System

## 🎯 **PROPUESTA**

Convertir el sistema de cámara actual (`Camera2D` class) en una **entidad ECS** que extienda de la clase `Entity` y pueda recibir componentes especializados para mayor extensibilidad y flexibilidad.

---

## 🔍 **ANÁLISIS DEL SISTEMA ACTUAL**

### **Implementación Actual:**

```typescript
export class Camera2D {
  public position: Vector2 = new Vector2(0, 0);
  public zoom: number = 1;
  public rotation: number = 0;
  public viewport = { x: 0, y: 0, width: 800, height: 600 };
  private target: Target = null;
  private followOptions: CameraFollowOptions = {
    lerp: 1,
    offset: new Vector2(0, 0),
  };
  private bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null = null;
}
```

### **Uso Actual:**

- Creación en `Engine.createCamera()`
- Asignación en `Engine.setCamera()` y `RenderSystem.setCamera()`
- Follow de targets con lerp y offset
- Transformaciones world-to-screen y screen-to-world
- Bounds y shake (placeholder)

### **Limitaciones Identificadas:**

1. **📦 Funcionalidad Monolítica**: Toda la lógica en una sola clase
2. **🔒 Extensibilidad Limitada**: No permite añadir nuevas funcionalidades fácilmente
3. **❌ Sin Componentes**: No aprovecha el sistema ECS del motor
4. **🎭 Efectos Limitados**: Shake está solo como placeholder
5. **⚙️ Configuración Estática**: Opciones hardcodeadas en la clase
6. **🔄 Sin Lifecycle**: No tiene hooks de inicialización/destrucción
7. **📊 Sin Estadísticas**: No trackea métricas de rendimiento

---

## 🚀 **DISEÑO PROPUESTO: CAMERA ENTITY**

### **Arquitectura ECS para Cámara:**

```typescript
export class CameraEntity extends Entity {
  constructor(id?: EntityId) {
    super(id);
    // Componentes base requeridos
    this.addComponent<TransformComponent>({
      type: "transform",
      position: new Vector2(0, 0),
      rotation: 0,
      scale: new Vector2(1, 1),
    });

    this.addComponent<CameraComponent>({
      type: "camera",
      zoom: 1,
      viewport: { width: 800, height: 600 },
      isActive: false,
    });
  }
}
```

### **Componentes Especializados:**

#### **1. 🎯 CameraComponent (Core)**

```typescript
interface CameraComponent extends Component {
  type: "camera";
  zoom: number;
  viewport: { width: number; height: number };
  isActive: boolean;
  priority?: number; // Para múltiples cámaras
}
```

#### **2. 🎯 CameraFollowComponent**

```typescript
interface CameraFollowComponent extends Component {
  type: "cameraFollow";
  target: EntityElement | null;
  lerp: number;
  offset: Vector2;
  deadZone?: { width: number; height: number };
  leadAmount?: number; // Anticipación de movimiento
}
```

#### **3. 🎯 CameraBoundsComponent**

```typescript
interface CameraBoundsComponent extends Component {
  type: "cameraBounds";
  bounds: { x: number; y: number; width: number; height: number };
  softBounds?: boolean; // Límites suaves vs duros
  elasticity?: number; // Para rebounds
}
```

#### **4. 🎯 CameraEffectsComponent**

```typescript
interface CameraEffectsComponent extends Component {
  type: "cameraEffects";
  shake: {
    intensity: number;
    duration: number;
    frequency: number;
    decay: number;
    active: boolean;
  };
  screenEffects: {
    flash?: { color: Color; duration: number; intensity: number };
    fade?: { color: Color; duration: number; direction: "in" | "out" };
    zoom?: { targetZoom: number; duration: number; easing: string };
  };
}
```

#### **5. 🎯 CameraPostProcessComponent**

```typescript
interface CameraPostProcessComponent extends Component {
  type: "cameraPostProcess";
  filters: Array<{
    type:
      | "blur"
      | "pixelate"
      | "sepia"
      | "grayscale"
      | "contrast"
      | "brightness";
    intensity: number;
    enabled: boolean;
  }>;
  customShaders?: string[]; // Para WebGL
}
```

#### **6. 🎯 CameraViewportComponent**

```typescript
interface CameraViewportComponent extends Component {
  type: "cameraViewport";
  viewportRect: { x: number; y: number; width: number; height: number };
  splitScreen?: {
    enabled: boolean;
    division: "horizontal" | "vertical" | "quad";
    index: number;
  };
}
```

#### **7. 🎯 CameraStatsComponent**

```typescript
interface CameraStatsComponent extends Component {
  type: "cameraStats";
  renderCalls: number;
  visibleEntities: number;
  culledEntities: number;
  lastUpdateTime: number;
  averageFrameTime: number;
}
```

---

## 🏗️ **SISTEMAS ESPECIALIZADOS**

### **1. CameraSystem**

```typescript
export class CameraSystem extends FunctionalSystem {
  requiredComponents = ["camera", "transform"];

  update(entities: EntityElement[], deltaTime: number): void {
    // Gestiona múltiples cámaras
    // Actualiza transformaciones
    // Maneja prioridades
  }
}
```

### **2. CameraFollowSystem**

```typescript
export class CameraFollowSystem extends FunctionalSystem {
  requiredComponents = ["camera", "cameraFollow", "transform"];

  update(entities: EntityElement[], deltaTime: number): void {
    // Lógica de seguimiento avanzada
    // Dead zones, lead amount, smoothing
  }
}
```

### **3. CameraEffectsSystem**

```typescript
export class CameraEffectsSystem extends FunctionalSystem {
  requiredComponents = ["camera", "cameraEffects", "transform"];

  update(entities: EntityElement[], deltaTime: number): void {
    // Screen shake, flash, fade, zoom
    // Efectos temporales con timers
  }
}
```

### **4. CameraCullingSystem**

```typescript
export class CameraCullingSystem extends FunctionalSystem {
  requiredComponents = ["camera", "transform"];

  update(entities: EntityElement[], deltaTime: number): void {
    // Frustum culling
    // Occlusion culling
    // LOD management
  }
}
```

---

## ✅ **VENTAJAS DEL NUEVO SISTEMA**

### **🔧 Extensibilidad:**

- ✅ Componentes modulares y reutilizables
- ✅ Fácil añadir nuevas funcionalidades
- ✅ Sistemas especializados independientes
- ✅ Configuración flexible via componentes

### **🎮 Funcionalidades Avanzadas:**

- ✅ **Múltiples Cámaras**: Soporte nativo para split-screen
- ✅ **Efectos Avanzados**: Shake, flash, fade, post-process
- ✅ **Culling Inteligente**: Frustum y occlusion culling
- ✅ **Dead Zones**: Zonas muertas para seguimiento suave
- ✅ **Screen Effects**: Filtros y shaders personalizados

### **📊 Observabilidad:**

- ✅ **Métricas**: Estadísticas de renderizado
- ✅ **Debugging**: Info detallada por componente
- ✅ **Profiling**: Análisis de rendimiento

### **🔄 Lifecycle Management:**

- ✅ **Inicialización**: Setup automático de componentes
- ✅ **Destrucción**: Cleanup de recursos
- ✅ **Serialización**: Save/load de configuraciones

### **🎯 Casos de Uso Avanzados:**

- ✅ **Cámaras de Seguridad**: Múltiples viewports
- ✅ **Cinematics**: Secuencias cinemáticas complejas
- ✅ **Picture-in-Picture**: Minimapas, scopes
- ✅ **VR/AR Support**: Preparación para 3D futuro

---

## 🔄 **PLAN DE MIGRACIÓN**

### **Fase 1: Componentes Base**

1. Crear `CameraComponent` y `CameraEntity`
2. Implementar `CameraSystem` básico
3. Migrar funcionalidad core de `Camera2D`

### **Fase 2: Sistemas Especializados**

4. Implementar `CameraFollowSystem`
5. Crear `CameraEffectsSystem` con shake
6. Desarrollar `CameraBoundsSystem`

### **Fase 3: Funcionalidades Avanzadas**

7. Sistema de múltiples cámaras
8. Post-processing y filtros
9. Culling y optimizaciones

### **Fase 4: Retrocompatibilidad**

10. Wrapper de `Camera2D` usando nueva arquitectura
11. Deprecar gradualmente API antigua
12. Migrar ejemplos y tests

---

## 🧪 **EJEMPLO DE USO**

```typescript
// Crear cámara con efectos
const camera = new CameraEntity("mainCamera");

// Configurar seguimiento avanzado
camera.addComponent<CameraFollowComponent>({
  type: "cameraFollow",
  target: player,
  lerp: 0.08,
  offset: new Vector2(0, -50),
  deadZone: { width: 100, height: 50 },
  leadAmount: 0.3,
});

// Añadir efectos
camera.addComponent<CameraEffectsComponent>({
  type: "cameraEffects",
  shake: {
    intensity: 0,
    duration: 0,
    frequency: 60,
    decay: 0.9,
    active: false,
  },
  screenEffects: {},
});

// Configurar bounds
camera.addComponent<CameraBoundsComponent>({
  type: "cameraBounds",
  bounds: { x: 0, y: 0, width: 2000, height: 1500 },
  softBounds: true,
  elasticity: 0.1,
});

// Activar efectos
function explodeShake() {
  const effects = camera.getComponent<CameraEffectsComponent>("cameraEffects");
  effects.shake.intensity = 10;
  effects.shake.duration = 0.5;
  effects.shake.active = true;
}
```

---

## 🎯 **CONCLUSIÓN**

### **VIABILIDAD: ✅ ALTA**

**✅ Ventajas:**

- Aprovecha completamente la arquitectura ECS existente
- Extensibilidad masiva para futuras funcionalidades
- Mejor organización del código
- Facilita testing y debugging
- Soporte para casos de uso avanzados

**⚠️ Consideraciones:**

- Migración gradual necesaria
- Curva de aprendizaje inicial
- Más complejidad en casos simples

**🚀 Recomendación:**
**IMPLEMENTAR** - Esta mejora alinearía el sistema de cámara con la filosofía ECS del motor y proporcionaría una base sólida para funcionalidades avanzadas futuras.

---

**📅 Fecha de Análisis:** Septiembre 11, 2025  
**🏷️ Prioridad:** Alta  
**⏱️ Tiempo Estimado:** 2-3 sprints  
**🎯 Beneficio:** Alto impacto en extensibilidad y funcionalidades
