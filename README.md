# 🚀 Atomic Game Engine 2D

Imagina un motor de juegos 2D tan simple y poderoso que desaparece, dejando solo tu creatividad. Atomic Game Engine 2D redefine la experiencia de desarrollo: modularidad, velocidad y belleza en cada línea. El futuro de los juegos 2D, hoy.

---

## ✨ Características Principales

- **Arquitectura Modular:** Cada sistema es independiente y extensible.
- **ECS Real:** Entity-Component-System puro para flexibilidad total.
- **Renderizado Avanzado:** Canvas2D optimizado, preparado para WebGL.
- **Gestión de Recursos:** AssetManager inteligente para texturas, audio y más.
- **Animaciones y Audio:** Sistemas integrados para experiencias ricas.
- **Input Universal:** Teclado, mouse y touch listos para cualquier plataforma.
- **Física Opcional:** Integración con Box2D WASM, fallback seguro.
- **Documentación Clara:** Guías y referencias para cada sistema y componente.

---

## 🏗️ Arquitectura

Atomic Game Engine 2D está construido sobre un núcleo ECS (Entity-Component-System):

- **Entity:** Representa cualquier objeto del juego.
- **Component:** Define datos y propiedades (transform, sprite, audio, física, etc).
- **System:** Procesa entidades con componentes específicos (render, input, animación, física).

La arquitectura es hexagonal y desacoplada, permitiendo adaptadores y puertos para integración con librerías externas.

---

## ⚙️ Sistemas del Motor

| Sistema         | Función Principal                    |
| --------------- | ------------------------------------ |
| RenderSystem    | Dibuja entidades en pantalla         |
| InputSystem     | Procesa entrada del usuario          |
| MovementSystem  | Actualiza posiciones y física básica |
| CollisionSystem | Detecta y procesa colisiones         |
| AnimationSystem | Controla animaciones y estados       |
| AudioSystem     | Reproduce y gestiona sonidos         |
| AssetManager    | Carga y gestiona recursos            |
| SceneManager    | Organiza y cambia escenas            |
| EventSystem     | Comunicación entre sistemas          |
| ParticleSystem  | Efectos visuales y partículas        |
| LightSystem     | Iluminación y efectos de luz         |

---

## 🧩 Componentes Disponibles

### Core Components

| Componente | Propósito                  | Propiedades Clave                    |
| ---------- | -------------------------- | ------------------------------------ |
| transform  | Posición, rotación, escala | position, rotation, scale            |
| input      | Controles de usuario       | moveSpeed, keyBindings, mouseEnabled |
| script     | Lógica personalizada       | scriptName, state, instance          |
| hierarchy  | Relaciones padre-hijo      | parentId, childrenIds, inheritPos    |

### Rendering Components

| Componente | Propósito        | Propiedades Clave                    |
| ---------- | ---------------- | ------------------------------------ |
| sprite     | Imagen/textura   | texture, width, height, tint, uvX    |
| particle   | Efectos visuales | color, lifetime, emissionRate, speed |
| light      | Iluminación      | intensity, color, radius, enabled    |

### Animation & Audio Components

| Componente   | Propósito                    | Propiedades Clave                   |
| ------------ | ---------------------------- | ----------------------------------- |
| animation    | Animaciones de sprite        | spriteSheet, currentAnimation, loop |
| anim-machine | Máquina de estados animación | defKey, currentState, params        |
| audio        | Sonido y efectos             | clip, audioSheet, volume, loop      |

### Physics Components

| Componente  | Propósito              | Propiedades Clave                  |
| ----------- | ---------------------- | ---------------------------------- |
| physics     | Propiedades físicas    | velocity, acceleration, mass       |
| physicsBody | Cuerpo físico avanzado | bodyType, shape, density, friction |
| collider    | Colisiones simples     | width, height, isTrigger           |
| velocity    | Velocidad directa      | x, y, maxSpeed                     |

### Camera Components

| Componente    | Propósito               | Propiedades Clave                   |
| ------------- | ----------------------- | ----------------------------------- |
| camera        | Cámara básica           | zoom, viewport, isActive, priority  |
| cameraFollow  | Seguimiento de objetivo | target, lerp, offset, deadZone      |
| cameraBounds  | Límites de cámara       | bounds, softBounds, elasticity      |
| cameraEffects | Efectos visuales        | shake, screenEffects, customEffects |
| cameraFilters | Filtros visuales        | filters, blendMode, enabled         |

---

## 🔔 Eventos Principales

```typescript
// Eventos del motor
ENGINE_EVENTS.INITIALIZED; // Motor inicializado
ENGINE_EVENTS.STARTED; // Motor iniciado
ENGINE_EVENTS.PAUSED; // Motor pausado

// Eventos de input
INPUT_EVENTS.KEYDOWN; // Tecla presionada
INPUT_EVENTS.KEYUP; // Tecla liberada
INPUT_EVENTS.MOUSEDOWN; // Click del mouse
INPUT_EVENTS.MOUSEMOVE; // Movimiento del mouse

// Eventos de física
PHYSICS_EVENTS.COLLISION_BEGIN; // Inicio de colisión
PHYSICS_EVENTS.COLLISION_END; // Fin de colisión

// Eventos de animación
ANIMATION_EVENTS.FRAME; // Cambio de frame
ANIMATION_EVENTS.COMPLETE; // Animación completada

// Eventos de audio
AUDIO_EVENTS.PLAY; // Sonido reproducido
```

---

## 📦 Instalación

```bash
npm install atomic-game-engine2d
```

---

## ▶️ Para ejecutar los ejemplos

```bash
# Clona el repositorio
git clone https://github.com/lemur-bookstores/atomic-game-engine2d.git

# Instala dependencias
cd atomic-game-engine2d
npm install

# Inicia el servidor de desarrollo
npm run dev

# Abre tu navegador en http://localhost:5173/examples/
```

---

## 🛠️ Desarrollo

Requisitos:

- Node.js 18+
- npm 9+

Comandos principales:

```bash
# Instalación de dependencias
npm install

# Desarrollo
npm run dev

# Construcción
npm run build

# Tests
npm run test

# Verificación de tipos
npm run type-check

# Linting
npm run lint
```

---

## 📚 Documentación

La documentación completa está disponible en la carpeta `docs/`, organizada por sistema y componente. Cada documento incluye descripción, propiedades y ejemplos de uso.

---

## 🏆 Filosofía

"La verdadera innovación ocurre cuando la tecnología desaparece y solo queda la experiencia." — Atomic Game Engine 2D

---

## 📄 Licencia

MIT License. Consulta el archivo [LICENSE](LICENSE) para más detalles.
