import { GameObjects, Scene } from "phaser";

class BeatManager {
    static bpmToBeatDurationMillis(bpm:number):number {
        const beatsPerSecond = bpm / 60;
        const beatsPerMillisecond = beatsPerSecond / 1000;
        const millisecondsPerBeat = 1 / beatsPerMillisecond;
        return millisecondsPerBeat;
    }

    currentTime:number = 0 // milliseconds
    millisecondsPerBeat:number = BeatManager.bpmToBeatDurationMillis(120)
    offsetBeats:number = 0; // number of beats before the start of the song

    start() {
        this.currentTime = 0;
    }
    setBpm(bpm:number) {
        this.millisecondsPerBeat = BeatManager.bpmToBeatDurationMillis(bpm);
    }
    update(delta:number) {
        this.currentTime += delta;
    }
    /**
     * @returns Floating point number of beats elapsed since start, 0-indexed.
     */
    getBeatsElapsed():number {
        return (this.currentTime) / this.millisecondsPerBeat - this.offsetBeats;
    }

    /**
     * @returns Detailed information about the current time as it relates to the beat.
     */
    getBeatInfo():BeatInfo {
        const beatTime = this.getBeatsElapsed();
        const nearestBeat = Math.round(beatTime);
        const error = beatTime - nearestBeat;
        
        let assessment = error > 0 ? "late" : "early";
        if (Math.abs(error) < 0.02) {
            assessment = "perfect";
        } else if (Math.abs(error) < 0.04) {
            assessment = "great";
        } else  if (Math.abs(error) < 0.06) {
            assessment = "good";
        } 

        return {
            beatTime,
            nearestBeat,
            error,
            assessment
        }
    }
}

interface BeatInfo {
    beatTime:number
    nearestBeat:integer
    
    /** How far "off the mark" this time is compared to the nearest beat, as a proportion of a beat.
      * Negative for early, positive for late.
      */
    error:number

    /**
     * An machine value for feedback that can be delivered to the player.
     */
    assessment: string
}

const maxBeat = 20;
export class Main extends Phaser.Scene {
    beat = 0;
    keys!: Array<Phaser.Input.Keyboard.Key>;
    letterCharacters = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'A']; // change this to K when it's in spritesheet
    states = [State.Next, State.Wait, State.Wait, State.Wait, State.Wait, State.Wait, State.Wait]
    music!: Phaser.Sound.BaseSound;

    letterSprites!: Array<Phaser.GameObjects.Sprite>
    count = 0;
    constructor() {
        super("main");
    }

    beatwatcher:BeatManager = new BeatManager();

    create() {
        this.sound.pauseOnBlur = false;
        
        this.music = this.sound.add('bitbop');
        this.beatwatcher.setBpm(110);
        this.beatwatcher.offsetBeats = 8;

        // init music
        this.music.play();
        this.beatwatcher.start();

        this.keys = [];
        this.keys[0] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys[1] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keys[2] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keys[3] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.keys[4] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
        this.keys[5] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
        this.keys[6] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.keys[7] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this.createAnimations();
        this.letterSprites = [];
        let x = 100;
        this.letterCharacters.forEach((character) => {
            let sprite = this.add.sprite(x, 100, 'letters');
            sprite.setScale(0.5, 0.5);
            sprite.setFrame('Y' + character + '.png');
            this.letterSprites.push(sprite);
            x += 150;
        });

        for (let i = 0; i < 8; ++i) {
            console.log(this.toString(i));
        }
    };

    toString(i: number): Array<string> {
        return (i >>> 0).toString(2).split('').reverse();
    }

    update(time: number, delta: number) {
        if (this.beat === 0) {
            for (let i = 0; i < this.keys.length; ++i) {
                if (this.keys[i].isDown) {
                    if (this.states[i] === State.Next) {
                        this.increase();
                        const info = this.beatwatcher.getBeatInfo();
                        console.log(info.assessment, info.nearestBeat, (info.error*100).toFixed(1));
                    } else {
                        this.reset();
                    }
                }
            }
            for (let i = 0; i < this.letterCharacters.length; ++i) {
                let character = this.letterCharacters[i];
                let frame = this.getFrame(this.states[i], character);
                this.letterSprites[i].setFrame(frame);
            }
        } else {
            this.beat--;
        }

        this.beatwatcher.update(delta);
        
    }

    reset() {
        this.count = 0;
        this.music.stop();
        this.music.play();
        this.beatwatcher.start();
        for (let i = 0; i < this.states.length; ++i) {
            this.states[i] = State.Wait;
        }

        this.updateState();
    }

    increase() {
        this.count++;
        this.updateState();
    }

    updateState() {
        this.beat = maxBeat;
        let positions = this.toString(this.count);
        for (let i = 0; i < positions.length; ++i) {
            if (positions[i] === '0') {
                this.states[i] = State.Down;
            } else {
                this.states[i] = State.Up;
            }
        }
        let i = 0;
        while (this.states[i] === State.Up) {
            ++i;
        }
        this.states[i] = State.Next;
    }

    createAnimations() {
        this.letterCharacters.forEach((character) => {
            this.anims.create({
                key: character,
                frames: [
                    { key: 'letters', frame: 'B' + character + '.png' },
                    { key: 'letters', frame: 'Y' + character + '.png' },
                    { key: 'letters', frame: 'H' + character + '.png' },
                    { key: 'letters', frame: 'D' + character + '.png' },
                ]
            });

        });
    }

    getFrame(state: State, character: string): string {
        switch (state) {
            case State.Up: return 'H' + character + '.png'
            case State.Down: return 'B' + character + '.png'
            case State.Next: return 'Y' + character + '.png'
            default: return 'D' + character + '.png'
        }
    }
}

enum State {
    Up,
    Down,
    Wait,
    Next
}