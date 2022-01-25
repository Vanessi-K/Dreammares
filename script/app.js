import Level from "./modules/Level.js";
import worldMatrix from "./modules/worldMatrix.js";
import Player from "./modules/Player.js";
import Bixi from "./modules/Bixi.js";
import CONFIG from "./modules/CONFIG.js";
import Borders from "./modules/Borders.js";

let ctx;
let bixi;
let lastTickTimestamp;
let player;
let borders;
let currentKeys = [];
let positionX = 0;
let playerStartPositionX = 200;
let playerStartWidthCenter;
let playerStopsMoving;
let playerMovement = {
    x: 0,
    y: 0,
    clickUp: false
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
    player = new Player(ctx, 200, 770, 160, 290);

    // create level
    level = new Level(ctx, worldMatrix, player);

    playerStartWidthCenter = player.coordinates.x + player.width/2;
    playerStopsMoving = CONFIG.width/2 - playerStartWidthCenter;

    bixi = new Bixi(ctx, 30, 0, 160, 130);



    //top and bottom boundary
    borders = new Borders(ctx);

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

    borders.update(player);

    level.update(currentKeys["KeyE"])


}

function render() {
    //delete the canvas
    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);

    borders.render();

    level.camera.moveCamera();
    player.render();

    level.render();

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
    else {
        movementY = 0;
    }

    //movement of the map
    setPositionX(positionX + timePassedSinceLastRender * movementX * CONFIG.velocity);
    level.camera.setMovementAmount(positionX);

    //set the movement for the player
    playerMovement = {
        x: movementX,
        y: movementY,
        clickUp: ((currentKeys["ArrowUp"] || currentKeys["KeyW"]) && !CONFIG.allowKey.top)
    }
}

