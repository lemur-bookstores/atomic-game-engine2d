# Audio Sheet Integration Example

This example demonstrates how to use the AudioSheetLibrary integration in the atomic-game-engine2d.

## Basic Usage

```typescript
import { GameEngine, Entity } from "atomic-game-engine2d";

// Create entity with audio component using audio sheet
const entity = new Entity();

entity.addComponent({
  type: "audio",
  clip: "explosion", // Clip name within the sheet
  audioSheet: "sfx-pack", // Audio sheet identifier
  volume: 0.8,
  autoplay: true,
});

// The AudioSystem will automatically resolve to: 'sfx-pack/explosion'
// and load the appropriate audio file
```

## Audio Component Properties

- **`clip`**: Name of the audio clip to play
- **`audioSheet`** (optional): Audio sheet identifier for organized audio assets
- **`volume`**: Playback volume (0-1)
- **`loop`**: Whether to loop the audio
- **`autoplay`**: Start playing automatically
- **`group`**: Audio group for mixing control

## File Organization

When using audio sheets, organize your assets like:

```
assets/
├── sfx-pack/
│   ├── explosion.mp3
│   ├── pickup.wav
│   └── jump.ogg
└── music-pack/
    ├── background.mp3
    └── victory.mp3
```

## Runtime Behavior

- **Without audioSheet**: Loads `clip` directly from `assets/clip`
- **With audioSheet**: Loads from `assets/audioSheet/clip`
- Maintains full compatibility with existing audio components
- AudioSheetLibrary provides advanced audio processing capabilities

## Next Steps

- The AudioSheetLibrary facade provides additional methods for:
  - Audio segmentation by time intervals
  - Audio segmentation by silence detection
  - Batch processing and optimization
  - Multiple export formats

See the AudioSheetLibrary documentation for advanced features.
