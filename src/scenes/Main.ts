import { GameObjects, Scene } from "phaser";

import { BeatManager } from '../BeatManager';

const maxBeat = 20;
export class Main extends Phaser.Scene {
    beat = 0;
    keys!: Array<Phaser.Input.Keyboard.Key>;
    letterCharacters = ['K', 'J', 'H', 'G', 'F', 'D', 'S', 'A']
    states = [State.Next, State.Wait, State.Wait, State.Wait, State.Wait, State.Wait, State.Wait, State.Wait]
    music!: Phaser.Sound.BaseSound;
    messageText!: GameObjects.DynamicBitmapText;
    letterSprites!: Array<Phaser.GameObjects.Sprite>
    count = 0;
    constructor() {
        super("main");
    }

    beatwatcher: BeatManager = new BeatManager();

    create() {
        this.sound.pauseOnBlur = false;
        this.messageText = this.add.dynamicBitmapText(60, 180, 'Courier', 'Get Ready!', 128);
        this.messageText.setDisplayCallback(this.textCallback);

        // this.tweens.add({
        //     targets:  this.messageText,
        //     duration: 2000,
        //     delay: 2000,
        //     scaleX: 2,
        //     scaleY: 2,
        //     ease: 'Sine.easeInOut',
        //     repeat: -1,
        //     yoyo: true
        // });

        this.music = this.sound.add('bitbop');
        this.beatwatcher.setBpm(110);
        this.beatwatcher.offsetBeats = 8;

        // init music
        this.music.play();
        this.beatwatcher.start();

        this.keys = [];
        this.keys[0] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this.keys[1] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.keys[2] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
        this.keys[3] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
        this.keys[4] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.keys[5] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keys[6] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keys[7] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.createAnimations();
        this.letterSprites = [];
        let letterGap = 230;
        let centerX = this.sys.canvas.width * .5 - letterGap/2;
        let centerY = this.sys.canvas.height * .5;

        for (let i = 0; i < this.letterCharacters.length; ++i) {
            let character = this.letterCharacters[i];
            let x = (i - this.letterCharacters.length/2) 
            let sprite = this.add.sprite(centerX - x * letterGap, centerY, 'letters');
            sprite.setScale(0.8, 0.8);
            sprite.setFrame('Y' + character + '.png');
            this.letterSprites.push(sprite);
        };

        for (let i = 0; i < 8; ++i) {
            console.log(this.toString(i));
        }
    };

    textCallback (data: DisplayCallbackConfig)
    {
        data.x = Phaser.Math.Between(data.x - 1, data.x + 1);
        data.y = Phaser.Math.Between(data.y - 2, data.y + 2);
    
        return data;
    }

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
                        this.messageText.setText(info.assessment);
                        console.log(info.assessment, info.nearestBeat, (info.error * 100).toFixed(1));
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
        this.messageText.setText("Get Ready!");
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