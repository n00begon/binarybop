/**
 * Tracks game time and turns it into beat information.
 */
export class BeatManager {
    static bpmToBeatDurationMillis(bpm: number): number {
        const beatsPerSecond = bpm / 60;
        const beatsPerMillisecond = beatsPerSecond / 1000;
        const millisecondsPerBeat = 1 / beatsPerMillisecond;
        return millisecondsPerBeat;
    }

    currentTime: number = 0 // milliseconds
    millisecondsPerBeat: number = BeatManager.bpmToBeatDurationMillis(120)
    offsetBeats: number = 0; // number of beats before the start of the song

    start() {
        this.currentTime = 0;
    }
    setBpm(bpm: number) {
        this.millisecondsPerBeat = BeatManager.bpmToBeatDurationMillis(bpm);
    }
    update(delta: number) {
        this.currentTime += delta;
    }
    /**
     * @returns Floating point number of beats elapsed since start, 0-indexed.
     */
    getBeatsElapsed(): number {
        return (this.currentTime) / this.millisecondsPerBeat - this.offsetBeats;
    }

    /**
     * @returns Detailed information about the current time as it relates to the beat.
     */
    getBeatInfo(): BeatInfo {
        const beatTime = this.getBeatsElapsed();
        const nearestBeat = Math.round(beatTime);
        const error = beatTime - nearestBeat;
        let success = false;
        let assessment = error > 0 ? "too late" : "too early";
        if (Math.abs(error) < 0.02) {
            assessment = "perfect";
            success = true;
        } else if (Math.abs(error) < 0.04) {
            assessment = "wow";
            success = true;
        } else if (Math.abs(error) < 0.06) {
            assessment = "terrific";
            success = true;
        } else if (Math.abs(error) < 0.08) {
            assessment = "amazing";
            success = true;
        } else if (Math.abs(error) < 0.10) {
            assessment = "stunning";
            success = true;
        } else if (Math.abs(error) < 0.12) {
            assessment = "awesome";
            success = true;
        } else if (Math.abs(error) < 0.16) {
            assessment = "super";
            success = true;
        } else if (Math.abs(error) < 0.2) {
            assessment = "great";
            success = true;
        } else if (Math.abs(error) < 0.24) {
            assessment = "nice";
            success = true;
        } else if (Math.abs(error) < 0.28) {
            assessment = "cool";
            success = true;
        } else if (Math.abs(error) < 0.32) {
            assessment = "good";
            success = true;
        }

        return {
            beatTime,
            nearestBeat,
            error,
            assessment,
            success
        }
    }
}

export interface BeatInfo {
    beatTime: number
    nearestBeat: integer

    /** How far "off the mark" this time is compared to the nearest beat, as a proportion of a beat.
      * Negative for early, positive for late.
      */
    error: number

    /**
     * An machine value for feedback that can be delivered to the player.
     */
    assessment: string

    /**
     * Whether the press was successful
     */
    success: boolean
}