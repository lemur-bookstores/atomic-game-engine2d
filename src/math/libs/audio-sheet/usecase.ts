import { ProcessAudioSheetRequest, ProcessAudioSheetResponse, AudioFrame, AudioMetadata } from "./domain";
import { AudioSheetProcessorPort, AudioReaderPort, AudioSegmentationPort, AudioExportPort, AudioNamingStrategy } from "./ports";

export class ProcessAudioSheetUseCase implements AudioSheetProcessorPort {
    constructor(
        private readonly audioReader: AudioReaderPort,
        private readonly audioSegmenter: AudioSegmentationPort,
        private readonly audioExporter: AudioExportPort,
        private readonly namingStrategy: AudioNamingStrategy
    ) { }

    async processAudio(request: ProcessAudioSheetRequest): Promise<ProcessAudioSheetResponse> {
        // Leer el audio
        const audioBuffer = await this.audioReader.readAudio(request.audioSource);

        // Segmentar el audio
        const segments = await this.audioSegmenter.segmentAudio(audioBuffer, request.segmentationConfig);

        // Exportar segmentos
        const audioFrames = await this.audioExporter.exportSegments(
            segments,
            audioBuffer,
            request.exportFormat
        );

        // Aplicar nombres personalizados
        const namedFrames = audioFrames.map((frame, index) =>
            new AudioFrame(
                this.namingStrategy.generateName(index, request.namingPattern, segments[index]),
                frame.startTime,
                frame.endTime,
                frame.duration,
                frame.fadeIn,
                frame.fadeOut
            )
        );

        const metadata = new AudioMetadata(
            audioBuffer.sampleRate,
            audioBuffer.numberOfChannels,
            audioBuffer.duration
        );

        return new ProcessAudioSheetResponse(namedFrames, metadata);
    }
}