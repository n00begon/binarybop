import { config } from '../config/preload';

export class Preloader extends Phaser.Scene {

    key!: Phaser.Input.Keyboard.Key

    constructor() {
        super({
            key: 'preloader',
            pack: {
                files: [
                    { type: 'image', key: 'bar', url: './assets/images/loadBar.png' },
                    { type: 'image', key: 'barBg', url: './assets/images/barBg.png' }
                ]
            }
        });
    }

    preload() {
        // add the loading bar to use as a display for the loading progress of the remainder of the assets
        const barBg = this.add.image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'barBg');
        const bar = this.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'bar');

        const mask = this.make.graphics({
            x: bar.x - (bar.width / 2),
            y: bar.y - (bar.height / 2),
            add: false
        });
        mask.fillRect(0, 0, 0, bar.height);

        bar.mask = new Phaser.Display.Masks.GeometryMask(this, mask);

        this.load.on('progress', (progress: number) => {
            mask.clear();
            mask.fillRect(0, 0, bar.width * progress, bar.height);
        });

        // load assets declared in the preload config
        this.loadAtlas();
        this.loadAudio();
        this.loadFont();
    }

    create() {
        this.key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.addText('hit space to start!', this.sys.canvas.height - 128, 128);
    }

    update() {
        if (this.key.isDown) {
            this.scene.start('main');
        }
    }

    loadAtlas() {
        const sheetPath = config.ssPath;
        const sheets = config.sheets;

        this.load.setPath(sheetPath);

        for (let i = 0; i < sheets.length; i++) {
            this.load.atlas(sheets[i], `${sheets[i]}.png`, `${sheets[i]}.json`);
        }
    }

    loadAudio() {
        const audioPath = config.audioPath;
        const audioFiles = config.audioFiles;

        this.load.setPath(audioPath);

        for (let i = 0; i < audioFiles.length; i++) {
            this.load.audio(audioFiles[i].key, audioFiles[i].mp3);
        }
    }

    loadFont() {
        const fontPath = config.fontPath;
        const fontFiles = config.fontFiles;

        this.load.setPath(fontPath);

        for (let i = 0; i < fontFiles.length; i++) {
            this.load.bitmapFont(fontFiles[i].key, fontFiles[i].png, fontFiles[i].xml);
        }
    }

    textCallback(data: DisplayCallbackConfig) {
        let offset = 0.3;

        data.x = Phaser.Math.Between(data.x - offset, data.x + offset);
        data.y = Phaser.Math.Between(data.y - offset * 2, data.y + offset * 2);

        return data;
    }

    addText(text: string, y: number, size: number): Phaser.GameObjects.DynamicBitmapText {
        let bitText = this.add.dynamicBitmapText(this.sys.canvas.width * .5, y, 'DisplayFont', text, size);
        bitText.setX(this.sys.canvas.width * .5 - bitText.width / 2);
        bitText.setDisplayCallback(this.textCallback);
        bitText.setTint(0xFFCC00)
        return bitText;
    }
}