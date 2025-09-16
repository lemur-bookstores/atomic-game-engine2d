import { WebAudioReaderAdapter, FixedTimeSegmentationAdapter, WebAudioExportAdapter, SilenceBasedSegmentationAdapter } from "./adapters";
import { AudioSheetProcessorPort, AudioReaderPort, AudioSegmentationPort, AudioExportPort, AudioNamingStrategy } from "./ports";
import { IndexBasedAudioNamingStrategy } from "./services";
import { ProcessAudioSheetUseCase } from "./usecase";

export class AudioSheetProcessorFactory {
    static createFixedTimeProcessor(): AudioSheetProcessorPort {
        return new ProcessAudioSheetUseCase(
            new WebAudioReaderAdapter(),
            new FixedTimeSegmentationAdapter(),
            new WebAudioExportAdapter(),
            new IndexBasedAudioNamingStrategy()
        );
    }

    static createSilenceBasedProcessor(): AudioSheetProcessorPort {
        return new ProcessAudioSheetUseCase(
            new WebAudioReaderAdapter(),
            new SilenceBasedSegmentationAdapter(),
            new WebAudioExportAdapter(),
            new IndexBasedAudioNamingStrategy()
        );
    }

    static createCustomProcessor(
        audioReader: AudioReaderPort,
        audioSegmenter: AudioSegmentationPort,
        audioExporter: AudioExportPort,
        namingStrategy: AudioNamingStrategy
    ): AudioSheetProcessorPort {
        return new ProcessAudioSheetUseCase(
            audioReader,
            audioSegmenter,
            audioExporter,
            namingStrategy
        );
    }
}