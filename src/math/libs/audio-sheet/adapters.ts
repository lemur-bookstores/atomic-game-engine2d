import { SilenceDetectionAlgorithm } from "./algorithms";
import { SegmentationConfig, TimeSegment, FixedTimeConfig, SilenceConfig, AudioExportFormat, AudioFrame } from "./domain";
import { AudioReaderPort, AudioSegmentationPort, AudioExportPort } from "./ports";

// Adaptador para Web Audio API
export class WebAudioReaderAdapter implements AudioReaderPort {
    private audioContext: AudioContext;

    constructor(audioContext?: AudioContext) {
        this.audioContext = audioContext || new AudioContext();
    }

    async readAudio(source: ArrayBuffer | File | string): Promise<AudioBuffer> {
        let audioData: ArrayBuffer;

        if (source instanceof File) {
            audioData = await source.arrayBuffer();
        } else if (typeof source === 'string') {
            const response = await fetch(source);
            audioData = await response.arrayBuffer();
        } else {
            audioData = source;
        }

        return await this.audioContext.decodeAudioData(audioData);
    }
}

// Adaptador para segmentación por tiempo fijo
export class FixedTimeSegmentationAdapter implements AudioSegmentationPort {
    async segmentAudio(audioBuffer: AudioBuffer, config: SegmentationConfig): Promise<TimeSegment[]> {
        if (config.type !== 'fixed') {
            throw new Error(`Expected fixed config, got ${config.type}`);
        }

        return this.fixedTimeSegmentation(audioBuffer, config as FixedTimeConfig);
    }

    private fixedTimeSegmentation(audioBuffer: AudioBuffer, config: FixedTimeConfig): TimeSegment[] {
        const segments: TimeSegment[] = [];
        const { segmentDuration, overlap, startOffset } = config;
        const totalDuration = audioBuffer.duration;
        const step = segmentDuration - overlap;

        for (let start = startOffset; start < totalDuration; start += step) {
            const end = Math.min(start + segmentDuration, totalDuration);

            if (end - start > 0.01) { // Minimum 10ms segment
                segments.push(new TimeSegment(start, end));
            }
        }

        return segments;
    }
}

// Adaptador para segmentación por silencio
export class SilenceBasedSegmentationAdapter implements AudioSegmentationPort {
    private silenceDetector = new SilenceDetectionAlgorithm();

    async segmentAudio(audioBuffer: AudioBuffer, config: SegmentationConfig): Promise<TimeSegment[]> {
        if (config.type !== 'silence') {
            throw new Error(`Expected silence config, got ${config.type}`);
        }

        return this.silenceBasedSegmentation(audioBuffer, config as SilenceConfig);
    }

    private silenceBasedSegmentation(audioBuffer: AudioBuffer, config: SilenceConfig): TimeSegment[] {
        // Get mono audio data for analysis
        const audioData = this.getMonoAudioData(audioBuffer);
        const silenceRegions = this.silenceDetector.detectSilenceRegions(
            audioData,
            audioBuffer.sampleRate,
            config
        );

        // Convert silence regions to audio segments
        const segments: TimeSegment[] = [];
        let lastEnd = 0;

        for (const silence of silenceRegions) {
            if (silence.start > lastEnd) {
                const segmentDuration = silence.start - lastEnd;
                if (segmentDuration >= config.minSegmentDuration) {
                    segments.push(new TimeSegment(lastEnd, silence.start));
                }
            }
            lastEnd = silence.end;
        }

        // Add final segment if there's audio after the last silence
        if (lastEnd < audioBuffer.duration) {
            const finalDuration = audioBuffer.duration - lastEnd;
            if (finalDuration >= config.minSegmentDuration) {
                segments.push(new TimeSegment(lastEnd, audioBuffer.duration));
            }
        }

        return segments;
    }

    private getMonoAudioData(audioBuffer: AudioBuffer): Float32Array {
        if (audioBuffer.numberOfChannels === 1) {
            return audioBuffer.getChannelData(0);
        }

        // Mix to mono
        const length = audioBuffer.length;
        const monoData = new Float32Array(length);

        for (let i = 0; i < length; i++) {
            let sample = 0;
            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                sample += audioBuffer.getChannelData(channel)[i];
            }
            monoData[i] = sample / audioBuffer.numberOfChannels;
        }

        return monoData;
    }
}

// Adaptador para exportación de audio
export class WebAudioExportAdapter implements AudioExportPort {
    async exportSegments(
        segments: TimeSegment[],
        audioBuffer: AudioBuffer,
        format: AudioExportFormat
    ): Promise<AudioFrame[]> {
        const audioFrames: AudioFrame[] = [];

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];

            // Generate name based on format and index
            const extension = this.getFileExtension(format);
            const frameName = `segment_${String(i).padStart(3, '0')}${extension}`;

            // Calculate fade effects based on segment duration and audio quality
            const fadeInOut = this.calculateOptimalFade(segment.duration, audioBuffer.sampleRate);

            const frame = new AudioFrame(
                frameName,
                segment.startTime,
                segment.endTime,
                segment.duration,
                fadeInOut, // fadeIn
                fadeInOut  // fadeOut
            );

            audioFrames.push(frame);
        }

        return audioFrames;
    }

    private getFileExtension(format: AudioExportFormat): string {
        switch (format) {
            case 'wav': return '.wav';
            case 'mp3': return '.mp3';
            case 'ogg': return '.ogg';
            case 'buffer': return ''; // No extension for buffer format
            default: return '.wav';
        }
    }

    private calculateOptimalFade(duration: number, sampleRate: number): number {
        // Calculate optimal fade time based on duration and sample rate
        // Shorter segments get proportionally shorter fades
        const minFade = Math.max(0.005, 1 / sampleRate * 10); // At least 10 samples or 5ms
        const maxFade = 0.05;  // 50ms maximum

        // For short segments, use shorter fade to preserve audio content
        if (duration < 0.1) return minFade;
        if (duration < 0.5) return Math.min(duration * 0.1, maxFade);

        // For longer segments, use standard fade
        return Math.min(0.01, maxFade); // 10ms standard fade
    }
}