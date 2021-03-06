import { GameObjects, Scene } from "phaser";

import { BeatManager } from '../BeatManager';

const DEBOUNCE_TIMEOUT_MAX = 20;
let count = 0;
let best = 0;
let ending = false;
export class Main extends Phaser.Scene {
    debounceTimeout = 0;
    waitCount = 0;
    keys!: Array<Phaser.Input.Keyboard.Key>;
    letterCharacters = ['K', 'J', 'H', 'G', 'F', 'D', 'S', 'A']
    states = [State.Next, State.Wait, State.Wait, State.Wait, State.Wait, State.Wait, State.Wait, State.Wait]
    music!: Phaser.Sound.BaseSound;
    messageText!: GameObjects.DynamicBitmapText;
    scoreText!: GameObjects.DynamicBitmapText;
    bestText!: GameObjects.DynamicBitmapText;
    letterSprites!: Array<Phaser.GameObjects.Sprite>
    constructor() {
        super("main");
    }

    beatwatcher: BeatManager = new BeatManager();

    create() {
        count = 0;
        best = 0;
        ending = false;
        this.sound.pauseOnBlur = false;

        this.messageText = this.addText('get ready!', 180, 128);
        this.scoreText = this.addText('' + count, 600, 200);
        this.bestText = this.addBestText('give it a try', this.sys.canvas.height - 100, 100)

        

        this.music = this.sound.add('bitbop');
        this.sound.volume = 1;
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
        let centerX = this.sys.canvas.width * .5 - letterGap / 2;
        let centerY = this.sys.canvas.height * .5;

        for (let i = 0; i < this.letterCharacters.length; ++i) {
            let character = this.letterCharacters[i];
            let x = (i - this.letterCharacters.length / 2)
            let sprite = this.add.sprite(centerX - x * letterGap, centerY, 'letters');
            sprite.setScale(0.8, 0.8);
            sprite.setFrame('Y' + character + '.png');
            this.letterSprites.push(sprite);
        };

        this.cameras.main.on('camerafadeoutcomplete', () => {
            this.music.stop();
            this.scene.start('end');
        });

    };

    textCallback(data: DisplayCallbackConfig) {
        let offset = count / 80;

        data.x = Phaser.Math.Between(data.x - offset, data.x + offset);
        data.y = Phaser.Math.Between(data.y - offset * 2, data.y + offset * 2);

        return data;
    }

    bestCallback(data: DisplayCallbackConfig) {
        let offset = best / 80;

        data.x = Phaser.Math.Between(data.x - offset, data.x + offset);
        data.y = Phaser.Math.Between(data.y - offset * 2, data.y + offset * 2);

        return data;
    }

    toString(i: number): Array<string> {
        return (i >>> 0).toString(2).split('').reverse();
    }

    update(time: number, delta: number) {
        if (ending) {
            if (this && this.sound) {
                //this.sound.volume = this.sound.volume * 0.99;
            }
        } else if (count >= 128) {
            ending = true;
            this.cameras.main.fade(10000, 0, 0, 0);
        } else if (this.waitCount > 0) {
            this.waitCount--;
            if (this.waitCount <= 0) {
                this.restart();
            }
        } else {
            if (this.debounceTimeout === 0) {
                this.processBeat();
            } else {
                this.debounceTimeout--;
            }

            this.beatwatcher.update(delta);
        }
    }
    processBeat() {
        const info = this.beatwatcher.getBeatInfo();

        // check for missed beat
        const expectedBeat = count;
        if (info.nearestBeat > expectedBeat) {
            this.reset("missed beat!");
        }

        if (info.beatTime < 0 && info.beatTime > -4) {
            this.updateMessageText( (5 + Math.floor(info.beatTime)).toString() );
        }

        // process keypresses
        for (let i = 0; i < this.keys.length; ++i) {
            if (this.keys[i].isDown) {

                if (this.states[i] === State.Next) {
                    this.updateMessageText(info.assessment);
                    if (info.success) {
                        this.increase();
                    } else {
                        this.reset(info.assessment);
                    }
                } else {
                    this.reset("wrong key!");
                }

                // check for early beat
                if (info.nearestBeat < expectedBeat) {
                    if (info.nearestBeat < 0) {
                        this.reset("wait for intro");
                        return;
                    } else {
                        this.reset("skipped beat!");
                        return;
                    }
                }

            }
        }

        for (let i = 0; i < this.letterCharacters.length; ++i) {
            let character = this.letterCharacters[i];
            let frame = this.getFrame(this.states[i], character);
            this.letterSprites[i].setFrame(frame);
        }
    }


    updateMessageText(text: string) {
        this.updateText(text, this.messageText);
    }

    updateScoreText() {
        this.updateText('' + count, this.scoreText);
        if (best < count) {
            best = count;
        }
        this.updateText('best ' + best, this.bestText);
    }

    updateText(text: string, object: GameObjects.DynamicBitmapText) {
        object.setText(text);
        object.setX(this.sys.canvas.width * .5 - object.width / 2);
    }

    reset(reason: string) {
        this.cameras.main.shake(300, 0.0055);
        count = 0;
        this.music.stop();
        for (let i = 0; i < this.states.length; ++i) {
            this.states[i] = State.Wait;
        }
        this.updateMessageText(reason);
        this.updateState();
        this.waitCount = 50;
    }

    restart() {
        this.updateMessageText('get ready!');
        this.updateState();
        this.music.play();
        this.beatwatcher.start();
    }

    increase() {
        this.cameras.main.shake(150, 0.0014);
        count++;
        this.updateState();
    }

    updateState() {
        this.updateScoreText();
        this.debounceTimeout = DEBOUNCE_TIMEOUT_MAX;
        let positions = this.toString(count);
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

    addText(text: string, y: number, size: number): Phaser.GameObjects.DynamicBitmapText {
        let bitText = this.add.dynamicBitmapText(this.sys.canvas.width * .5, y, 'DisplayFont', text, size);
        bitText.setX(this.sys.canvas.width * .5 - bitText.width / 2);
        bitText.setDisplayCallback(this.textCallback);
        return bitText;
    }

    addBestText(text: string, y: number, size: number): Phaser.GameObjects.DynamicBitmapText {
        let bitText = this.add.dynamicBitmapText(this.sys.canvas.width * .5, y, 'DisplayFont', text, size);
        bitText.setX(this.sys.canvas.width * .5 - bitText.width / 2);
        bitText.setDisplayCallback(this.bestCallback);
        bitText.setTint(0xFFCC00)
        return bitText;
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