import Collectable from "./modules/Collectable.js";
import Monster from "./modules/Monster.js";
import Barrier from "./modules/Barrier.js";
import Boundary from "./modules/Boundary.js";
import Portal from "./modules/Portal.js";

const CONFIG = {
    width: 1920,
    height: 1080,
    tileSize: 30,
    topOffset: 90,
    bottomOffset: 30
}

let ctx;
let lastTickTimestamp;
let gameObjects = [];

window.onload = () => {
    init();
}

function init() {
    let canvas = document.querySelector("#game-area");
    ctx = canvas.getContext("2d");


    canvas.setAttribute("width", CONFIG.width);
    canvas.setAttribute("height", CONFIG.height);
    gameObjects.push(new Boundary(ctx, 0, 0, CONFIG.width, CONFIG.topOffset));
    gameObjects.push(new Boundary(ctx, 0, CONFIG.height - CONFIG.bottomOffset, CONFIG.width, CONFIG.bottomOffset));


    gameObjects.push(new Collectable(ctx, 100, 600, "../../assets/full-jar.png"));
    gameObjects.push(new Collectable(ctx, 800, 200, "../../assets/half-jar.png"));
    gameObjects.push(new Collectable(ctx, 900, 900, "../../assets/empty-jar.png"));

    gameObjects.push(new Monster(ctx, 1300, 400, "../../assets/shadow-creature.png"));

    gameObjects.push(new Barrier(ctx, 900, 500, "../../assets/barrier-horizontal.png"));
    gameObjects.push(new Barrier(ctx, 930, 500, "../../assets/barrier-corner.png"));
    gameObjects.push(new Barrier(ctx, 930, 530, "../../assets/barrier-vertical.png"));

    gameObjects.push(new Portal(ctx, 400, 300, "../../assets/portal.png"));


    lastTickTimestamp = performance.now();
    gameLoop();
}

function gameLoop() {
    //Calculate time past since last render / last tick and pass it
    update(performance.now() - lastTickTimestamp);

    render();

    lastTickTimestamp = performance.now();

    requestAnimationFrame(gameLoop);
}

function update(timePassedSinceLastRender) {
    gameObjects.forEach((gameObject) => gameObject.update());
}

function render() {
    //delete the canvas
    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);

    //draw new frame
    gameObjects.forEach((gameObject) => gameObject.render());
}

