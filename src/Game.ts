import "phaser";
import { Preloader } from './scenes/Preloader';
import { Main } from './scenes/Main';
import { End} from './scenes/End';

const config: GameConfig = {
    type: Phaser.AUTO,
    parent: "canvas",
    title: "Binary Bop",
    width: 1920,
    height: 900,
    backgroundColor: "#000000",

    scene: [
        Preloader,
        Main,
        End,
    ]
};
const game = new Phaser.Game(config);
resize();

window.addEventListener("resize", resize, false);
window.onload = () => {
    resize();
}
function resize() {
    var canvas = document.querySelector("canvas");
    if (canvas) {
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var windowRatio = windowWidth / windowHeight;
        var gameRatio = Number(game.config.width) / Number(game.config.height);
        if (windowRatio < gameRatio) {
            canvas.style.width = windowWidth + "px";
            canvas.style.height = (windowWidth / gameRatio) + "px";
        }
        else {
            canvas.style.width = (windowHeight * gameRatio) + "px";
            canvas.style.height = windowHeight + "px";
        }
    }
}