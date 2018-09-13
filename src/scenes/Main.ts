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

    create() {
        this.music = this.sound.add('bitbop');
        if (!this.music.isPlaying) {
            this.music.play();
        }
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

    update() {
        if (this.beat === 0) {
            for (let i = 0; i < this.keys.length; ++i) {
                if (this.keys[i].isDown) {
                    if (this.states[i] === State.Next) {
                        this.increase();
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
    }

    reset() {
        this.count = 0;
        this.music.stop();
        this.music.play();
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