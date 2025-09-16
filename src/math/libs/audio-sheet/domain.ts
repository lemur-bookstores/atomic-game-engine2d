export class AudioFrame {
    constructor(
        public readonly name: string,
        public readonly startTime: number,      // En segundos
        public readonly endTime: number,        // En segundos
        public readonly duration: number,       // En segundos
        public readonly fadeIn?: number,        // Fade in en ms
        public readonly fadeOut?: number        // Fade out en ms
    ) { }
}

export class TimeSegment {
    constructor(
        public readonly startTime: number,
        public readonly endTime: number
    ) { }

    get duration(): number {
        return this.endTime - this.startTime;
    }
}

export class TimeRegion {
    constructor(
        public readonly start: number,
        public readonly end: number
    ) { }
}

// Value Objects
export class AudioMetadata {
    constructor(
        public readonly sampleRate: number,
        public readonly channels: number,
        public readonly duration: number,
        public readonly bitDepth?: number
    ) { }
}

// Domain Requests/Responses
export class ProcessAudioSheetRequest {
    constructor(
        public readonly audioSource: any,
        public readonly segmentationConfig: SegmentationConfig,
        public readonly namingPattern: string = "audio_{index}",
        public readonly exportFormat: AudioExportFormat = 'wav'
    ) { }
}

export class ProcessAudioSheetResponse {
    constructor(
        public readonly audioFrames: AudioFrame[],
        public readonly metadata: AudioMetadata
    ) { }
}

// Configuration Value Objects
export abstract class SegmentationConfig {
    abstract readonly type: 'fixed' | 'silence' | 'beat' | 'spectral';
}

export class FixedTimeConfig extends SegmentationConfig {
    readonly type = 'fixed' as const;

    constructor(
        public readonly segmentDuration: number,    // En segundos
        public readonly overlap: number = 0,        // Solapamiento en segundos
        public readonly startOffset: number = 0     // Offset inicial en segundos
    ) {
        super();
    }
}

export class SilenceConfig extends SegmentationConfig {
    readonly type = 'silence' as const;

    constructor(
        public readonly silenceThreshold: number = -40,      // Umbral en dB
        public readonly minSilenceDuration: number = 0.1,    // Duración mínima del silencio
        public readonly minSegmentDuration: number = 0.5,    // Duración mínima del segmento
        public readonly fadeInOut: number = 0.01             // Fade in/out en segundos
    ) {
        super();
    }
}

export class BeatConfig extends SegmentationConfig {
    readonly type = 'beat' as const;

    constructor(
        public readonly bpm: number | 'auto' = 'auto',
        public readonly beatsPerSegment: number = 4,
        public readonly sensitivity: number = 0.7
    ) {
        super();
    }
}

export class SpectralConfig extends SegmentationConfig {
    readonly type = 'spectral' as const;

    constructor(
        public readonly changeThreshold: number = 0.5,
        public readonly minSegmentDuration: number = 1.0,
        public readonly windowSize: number = 2048
    ) {
        super();
    }
}

export type AudioExportFormat = 'wav' | 'mp3' | 'ogg' | 'buffer';