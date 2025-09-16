import { TimeSegment } from "./domain";
import { AudioNamingStrategy } from "./ports";

export class IndexBasedAudioNamingStrategy implements AudioNamingStrategy {
    generateName(index: number, pattern: string, segment: TimeSegment): string {
        return pattern
            .replace('{index}', index.toString().padStart(3, '0'))
            .replace('{start}', segment.startTime.toFixed(3))
            .replace('{end}', segment.endTime.toFixed(3))
            .replace('{duration}', segment.duration.toFixed(3));
    }
}