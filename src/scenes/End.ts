

export class End extends Phaser.Scene {
    constructor() {
        super("end");
    }

    create() {
        this.cameras.main.fadeIn(1000);
        this.addText('You made it to 128!', 100, 150);
        this.addText('Binary Bop', 320, 150);
        this.addText('Made by @aaaidan & @n00begon', 480, 100);
        this.addText('Original music by @aaaidan', 580, 100);
        this.addText('Made for Music Jam 2018', 800, 60);
    }

    addText(text: string, y: number, size: number): Phaser.GameObjects.DynamicBitmapText {
        let bitText = this.add.dynamicBitmapText(this.sys.canvas.width * .5, y, 'DisplayFont', text, size);
        bitText.setX(this.sys.canvas.width * .5 - bitText.width / 2);
        bitText.setDisplayCallback(this.textCallback);
        bitText.setTint(0xFFCC00)
        return bitText;
    }

    textCallback(data: DisplayCallbackConfig) {
        let offset = 0.3;

        data.x = Phaser.Math.Between(data.x - offset, data.x + offset);
        data.y = Phaser.Math.Between(data.y - offset * 2, data.y + offset * 2);

        return data;
    }
}

