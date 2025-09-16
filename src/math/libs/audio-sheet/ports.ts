import { AudioExportFormat, AudioFrame, ProcessAudioSheetRequest, ProcessAudioSheetResponse, SegmentationConfig, TimeSegment } from "./domain";

// Puerto Primario (Driving Port)
export interface AudioSheetProcessorPort {
    processAudio(request: ProcessAudioSheetRequest): Promise<ProcessAudioSheetResponse>;
}

// Puertos Secundarios (Driven Ports)
export interface AudioReaderPort {
    readAudio(source: any): Promise<AudioBuffer>;
}

export interface AudioSegmentationPort {
    segmentAudio(audioBuffer: AudioBuffer, config: SegmentationConfig): Promise<TimeSegment[]>;
}

export interface AudioExportPort {
    exportSegments(
        segments: TimeSegment[],
        audioBuffer?: AudioBuffer,
        format?: AudioExportFormat
    ): Promise<AudioFrame[]>;
}

export interface AudioNamingStrategy {
    generateName(index: number, pattern: string, segment: TimeSegment): string;
}