import { AudioExportFormat, AudioFrame, FixedTimeConfig, ProcessAudioSheetRequest, SilenceConfig } from "./domain";
import { AudioSheetProcessorFactory } from "./factory";

export class AudioSheetLibrary {
    // Segmentación por tiempo fijo
    static async separateByTime(
        audioSource: ArrayBuffer | File | string,
        segmentDuration: number,
        options: {
            overlap?: number;
            startOffset?: number;
            namingPattern?: string;
            exportFormat?: AudioExportFormat;
        } = {}
    ): Promise<AudioFrame[]> {
        const processor = AudioSheetProcessorFactory.createFixedTimeProcessor();
        const config = new FixedTimeConfig(
            segmentDuration,
            options.overlap,
            options.startOffset
        );

        const request = new ProcessAudioSheetRequest(
            audioSource,
            config,
            options.namingPattern,
            options.exportFormat
        );

        const response = await processor.processAudio(request);
        return response.audioFrames;
    }

    // Segmentación por silencio
    static async separateBySilence(
        audioSource: ArrayBuffer | File | string,
        options: {
            silenceThreshold?: number;
            minSilenceDuration?: number;
            minSegmentDuration?: number;
            fadeInOut?: number;
            namingPattern?: string;
            exportFormat?: AudioExportFormat;
        } = {}
    ): Promise<AudioFrame[]> {
        const processor = AudioSheetProcessorFactory.createSilenceBasedProcessor();
        const config = new SilenceConfig(
            options.silenceThreshold,
            options.minSilenceDuration,
            options.minSegmentDuration,
            options.fadeInOut
        );

        const request = new ProcessAudioSheetRequest(
            audioSource,
            config,
            options.namingPattern,
            options.exportFormat
        );

        const response = await processor.processAudio(request);
        return response.audioFrames;
    }
}