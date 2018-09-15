/**
 * MP3 and OGG-Vorbis are the most heavily supported
 * audio formats for modern browsers
 * 
 * OGG-Vorbis is optionally set as the fallback audio
 */
export class AudioFile {
    constructor(key: string, mp3: string) {
        this.key = key;
        this.mp3 = mp3;
    }

    key: string;
    mp3: string;
}

export class FontFile {
    constructor(key: string, png: string, xml: string) {
        this.key = key;
        this.png = png;
        this.xml = xml;
    }

    key: string;
    png: string;
    xml: string;
}


const assetDir = "./assets"; // relative to build dir

export const config = {
    // spritesheets
    ssPath: `${assetDir}/spritesheets/`,
    sheets: [
        "letters"
    ],

    // audio
    audioPath: `${assetDir}/audio/`,
    audioFiles: [
        new AudioFile('bitbop', 'bitbop.mp3')
    ],

    // fonts
    fontPath: `${assetDir}/font/`,
    fontFiles: [
        new FontFile('DisplayFont', 'Fredoka.png', 'Fredoka.xml')
    ]
}