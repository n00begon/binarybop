import { GameObjects, Scene } from "phaser";

import { BeatManager } from '../BeatManager';

const maxBeat = 20;
let count = 0;
let best = 0;
let ending = false;
export class Main extends Phaser.Scene {
    beat = 0;
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
        this.messageText = this.add.dynamicBitmapText(this.sys.canvas.width * .5, 180, 'Courier', 'get ready!', 128);
        this.messageText.setX(this.sys.canvas.width * .5 - this.messageText.width / 2);
        this.messageText.setDisplayCallback(this.textCallback);

        this.scoreText = this.add.dynamicBitmapText(this.sys.canvas.width * .5, 600, 'Courier', '' + count, 200);
        this.scoreText.setX(this.sys.canvas.width * .5 - this.scoreText.width / 2);
        this.scoreText.setDisplayCallback(this.textCallback);

        this.bestText = this.add.dynamicBitmapText(this.sys.canvas.width * .5, this.sys.canvas.height - 100, 'Courier', 'best ' + best, 100);
        this.bestText.setX(this.sys.canvas.width * .5 - this.bestText.width / 2);
        this.bestText.setDisplayCallback(this.bestCallback);
        this.bestText.setTint(0xFFCC00)

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
            if (this.beat === 0) {
                this.processBeat();
            } else {
                this.beat--;
            }

            this.beatwatcher.update(delta);
        }
    }
    processBeat() {
        for (let i = 0; i < this.keys.length; ++i) {
            if (this.keys[i].isDown) {
                if (this.states[i] === State.Next) {
                    const info = this.beatwatcher.getBeatInfo();
                    this.updateMessageText(info.assessment);
                    if (info.success) {
                        this.increase();
                    } else {
                        this.reset(info.assessment);
                    }
                } else {
                    this.reset("wrong key!");
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
        this.beat = maxBeat;
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