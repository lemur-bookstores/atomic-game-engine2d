import { SilenceConfig, TimeRegion } from "./domain";

export class SilenceDetectionAlgorithm {
    detectSilenceRegions(
        audioData: Float32Array,
        sampleRate: number,
        config: SilenceConfig
    ): TimeRegion[] {
        const { silenceThreshold, minSilenceDuration } = config;
        const silenceRegions: TimeRegion[] = [];

        let silenceStart = -1;
        const windowSize = Math.floor(sampleRate * 0.01); // 10ms windows

        for (let i = 0; i < audioData.length; i += windowSize) {
            const window = audioData.slice(i, Math.min(i + windowSize, audioData.length));
            const rms = this.calculateRMS(window);
            const decibels = rms > 0 ? 20 * Math.log10(rms) : -Infinity;

            if (decibels < silenceThreshold) {
                if (silenceStart === -1) {
                    silenceStart = i / sampleRate;
                }
            } else {
                if (silenceStart !== -1) {
                    const silenceEnd = i / sampleRate;
                    const duration = silenceEnd - silenceStart;

                    if (duration >= minSilenceDuration) {
                        silenceRegions.push(new TimeRegion(silenceStart, silenceEnd));
                    }
                    silenceStart = -1;
                }
            }
        }

        // Handle silence at the end
        if (silenceStart !== -1) {
            const silenceEnd = audioData.length / sampleRate;
            const duration = silenceEnd - silenceStart;
            if (duration >= minSilenceDuration) {
                silenceRegions.push(new TimeRegion(silenceStart, silenceEnd));
            }
        }

        return silenceRegions;
    }

    private calculateRMS(samples: Float32Array): number {
        let sum = 0;
        for (let i = 0; i < samples.length; i++) {
            sum += samples[i] * samples[i];
        }
        return Math.sqrt(sum / samples.length);
    }
}

export class BeatDetectionAlgorithm {
    detectBeats(audioData: Float32Array, sampleRate: number, sensitivity: number = 0.7): number[] {
        const beats: number[] = [];
        const windowSize = Math.floor(sampleRate * 0.02); // 20ms windows
        const energyHistory: number[] = [];
        const maxHistory = 43; // ~1 second of history at 20ms windows

        for (let i = 0; i < audioData.length; i += windowSize) {
            const window = audioData.slice(i, Math.min(i + windowSize, audioData.length));
            const energy = this.calculateEnergy(window);

            energyHistory.push(energy);
            if (energyHistory.length > maxHistory) {
                energyHistory.shift();
            }

            if (energyHistory.length > 10) {
                const avgEnergy = energyHistory.reduce((a, b) => a + b) / energyHistory.length;
                const variance = energyHistory.reduce((sum, val) => sum + Math.pow(val - avgEnergy, 2), 0) / energyHistory.length;
                const threshold = avgEnergy + sensitivity * Math.sqrt(variance);

                if (energy > threshold) {
                    const timePosition = i / sampleRate;
                    beats.push(timePosition);
                }
            }
        }

        return beats;
    }

    private calculateEnergy(samples: Float32Array): number {
        let energy = 0;
        for (let i = 0; i < samples.length; i++) {
            energy += samples[i] * samples[i];
        }
        return energy;
    }
}