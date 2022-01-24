import Boundary from "./modules/Boundary.js";
import Level from "./modules/Level.js";
import worldMatrix from "./modules/worldMatrix.js";
import Player from "./modules/Player.js";
import Bixi from "./modules/Bixi.js";
import Collision from "./modules/Collision.js";
import CONFIG from "./modules/CONFIG.js";
import Camera from "./modules/Camera.js";

let ctx;
let bixi;
let lastTickTimestamp;
let player;
let gameBorders = [];
let currentKeys = [];
let positionX = 0;
let playerStartPositionX = 200;
let playerStartWidthCenter;
let playerStopsMoving;
let camera;
let playerMovement = {
    x: 0,
    y: 0,
    goDown: true
}
let level;

//Do not allow certain keys based on position
function setBoundaries(position) {
    if(position <= -playerStartPositionX) CONFIG.allowKey.left = false;
    else if(position >= CONFIG.lastColumn * CONFIG.tileSize - playerStartWidthCenter  - player.width/2) CONFIG.allowKey.right = false;
}

function setPositionX(position) {
    if(position < -playerStartPositionX) {
        positionX = -playerStartPositionX;
    }
    else if(position > CONFIG.lastColumn * CONFIG.tileSize - playerStartWidthCenter - player.width/2) {
        positionX = CONFIG.lastColumn * CONFIG.tileSize - playerStartWidthCenter - player.width / 2;
    }
    else positionX = position;
}

window.onload = () => {
    init();
}

function init() {
    let canvas = document.querySelector("#game-area");
    ctx = canvas.getContext("2d");

    canvas.setAttribute("width", CONFIG.width);
    canvas.setAttribute("height", CONFIG.height);

    initListeners();

    //Player
    player = new Player(ctx, playerStartPositionX, 770, 160, 290);
    playerStartWidthCenter = playerStartPositionX + player.width/2;
    playerStopsMoving = CONFIG.width/2 - playerStartWidthCenter;

    camera = new Camera(ctx, playerStopsMoving);

    bixi = new Bixi(ctx, 30, 0, 160, 130);

    // create level
    level = new Level(ctx, worldMatrix, player);

    //top and bottom boundary
    gameBorders.push(new Boundary(ctx, -playerStartPositionX, 0, CONFIG.lastColumn * CONFIG.tileSize + 2 * playerStartPositionX, CONFIG.topOffset));
    gameBorders.push(new Boundary(ctx, -playerStartPositionX, CONFIG.height - CONFIG.bottomOffset, CONFIG.lastColumn * CONFIG.tileSize + 2 * playerStartPositionX, CONFIG.bottomOffset));

    lastTickTimestamp = performance.now();

    gameLoop();
}

function initListeners() {
    //possibility to change to fullscreen
    window.addEventListener("keypress", e => {
        switch (e.code) {
            case "KeyI": document.body.requestFullscreen(); break;
            case "KeyO": document.exitFullscreen(); break;
        }
    });

    //game relevant listeners
    document.addEventListener('keydown', (key) => {
        //check if game relevant keys are pressed an prevent default
        if(key.code.substring(0,5) === "Arrow" || key.code === "KeyW" || key.code === "KeyA" || key.code === "KeyS" ||key.code === "KeyD" || key.code === "KeyE") {
            key.preventDefault();
        }
        currentKeys[key.code] = true;
    });

    document.addEventListener('keyup', (key) => {
        currentKeys[key.code] = false;
    });
}

function gameLoop() {
    //Calculate time past since last render / last tick and pass it
    update(performance.now() - lastTickTimestamp);

    render();

    lastTickTimestamp = performance.now();

    if(CONFIG.run) requestAnimationFrame(gameLoop);
}

function update(timePassedSinceLastRender) {

    setBoundaries(positionX);

    updateMovement(timePassedSinceLastRender);

    player.update(timePassedSinceLastRender, playerMovement);

    //Set all key back to being allowed
    for(let side in CONFIG.allowKey) {
        CONFIG.allowKey[side] = true;
    }

    bixi.update();

    //If the world is moving not the character, calculate the first visible column
    camera.setRenderingBoundaries();

    level.update(camera.getRenderingBoundaries().firstRenderedColumn, camera.getRenderingBoundaries().lastRenderedColumn, currentKeys["KeyE"])

    gameBorders.forEach((gameBorder) => {
        gameBorder.update();
        let collision = new Collision(player, gameBorder)
        if (collision.isColliding()) {
            collision.getCollisionDirection();
        }
    });
}

function render() {
    //delete the canvas
    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);

    gameBorders.forEach((gameBorder) => {
        gameBorder.render();
    });

    camera.moveCamera();
    player.render();

    level.render(camera);

    bixi.render();

    ctx.resetTransform();
}

function updateMovement(timePassedSinceLastRender) {
    let movementX;
    let movementY;

    //set directions x
    if((currentKeys["ArrowRight"] || currentKeys["KeyD"]) && CONFIG.allowKey.right ) {movementX = 1;}
    else if((currentKeys["ArrowLeft"] || currentKeys["KeyA"]) && CONFIG.allowKey.left) {movementX = -1;}
    else {movementX = 0;}

    //set directions y
    if((currentKeys["ArrowUp"] || currentKeys["KeyW"]) && CONFIG.allowKey.top) {movementY = -1; }
    else if((currentKeys["ArrowDown"] || currentKeys["KeyS"])  && CONFIG.allowKey.bottom) {movementY = 1 ;}
    else {movementY = 0;}

    //movement of the map
    setPositionX(positionX + timePassedSinceLastRender * movementX * CONFIG.velocity);
    camera.setMovementAmount(positionX);

    //set the movement for the player
    playerMovement = {
        x: movementX,
        y: movementY
    }
}

