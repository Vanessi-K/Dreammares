import Collectable from "./modules/Collectable.js";
import Monster from "./modules/Monster.js";
import Barrier from "./modules/Barrier.js";
import Boundary from "./modules/Boundary.js";
import Portal from "./modules/Portal.js";
import Level from "./modules/Level.js";
import worldMatrix from "./modules/worldMatrix.js";
import Player from "./modules/Player.js";
import Bixi from "./modules/Bixi.js";
import Collision from "./modules/Collision.js";
import CONFIG from "./modules/CONFIG.js";


let camera = {
    firstVisibleColumn: 0,
    lastVisibleColumn: CONFIG.columnsPerWidth,
    firstRenderedColumn: 0,
    lastRenderedColumn: CONFIG.columnsPerWidth + CONFIG.columnOffset
};

let gameRunning = true;
let ctx;
let bixi;
let lastTickTimestamp;
let player;
let worldObjects;
let gameBorders = [];
let currentKeys = [];
let positionX = 0;
let playerStartPositionX = 200;
let playerStartWidthCenter;
let playerStopsMoving;
let playerMovement = {
    x: 0,
    y: 0,
    goDown: true
}
let level;

let allowKey = {
    top: true,
    right: true,
    bottom: true,
    left: true
}

//Do not allow certain keys based on position
function setBoundaries(position) {
    if(position === -playerStartPositionX) allowKey.left = false;
    else if(position === CONFIG.lastColumn * CONFIG.tileSize - playerStartWidthCenter  - player.width/2) allowKey.right = false;
}

function setPositionX(position) {
    if(positionX < -playerStartPositionX) {
        positionX = -playerStartPositionX;
        allowKey.left = false;
    }
    else if(positionX > CONFIG.lastColumn * CONFIG.tileSize - playerStartWidthCenter - player.width/2) positionX = CONFIG.lastColumn * CONFIG.tileSize - playerStartWidthCenter - player.width/2;
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
        if(key.code.substring(0,5) === "Arrow" || key.code === "Space" || key.code === "KeyR") {
            key.preventDefault();
        }
        currentKeys[key.code] = true;
    });

    document.addEventListener('keyup', (key) => {
        currentKeys[key.code] = false;
    });

    // create level
    level = new Level(ctx, worldMatrix, endByCompletion);
    worldObjects = level.getLevel();

    //Player
    player = new Player(ctx, playerStartPositionX, 770, 160, 290);
    playerStartWidthCenter = playerStartPositionX + player.width/2;
    playerStopsMoving = CONFIG.width/2 - playerStartWidthCenter;

    //top and bottom boundary
    gameBorders.push(new Boundary(ctx, -playerStartPositionX, 0, CONFIG.lastColumn * CONFIG.tileSize + 2 * playerStartPositionX, CONFIG.topOffset));
    gameBorders.push(new Boundary(ctx, -playerStartPositionX, CONFIG.height - CONFIG.bottomOffset, CONFIG.lastColumn * CONFIG.tileSize + 2 * playerStartPositionX, CONFIG.bottomOffset));

    bixi = new Bixi(ctx, 30, 0, 160, 130);

    lastTickTimestamp = performance.now();

    gameLoop();
}

function gameLoop() {
    //Calculate time past since last render / last tick and pass it
    update(performance.now() - lastTickTimestamp);

    render();

    lastTickTimestamp = performance.now();

    if(gameRunning) requestAnimationFrame(gameLoop);
}

function update(timePassedSinceLastRender) {

    updateMovement(timePassedSinceLastRender);

    player.update(timePassedSinceLastRender, playerMovement);

    //Set all key back to being allowed
    for(let side in allowKey) {
        allowKey[side] = true;
    }

    bixi.update();

    //If the world is moving not the character, calculate the first visible column
    setCamera(calcFirstVisibleColumn(positionX));

    //only update elements in visible area
    for(let i = camera.firstRenderedColumn; i <= camera.lastRenderedColumn; i++) {
        worldObjects[i].forEach((worldObject) => {
            if(worldObject !== null) {
                worldObject.update();

                let collision = new Collision(player, worldObject);

                if(collision.isColliding()){
                    if(worldObject instanceof Barrier) {
                        disableKey(collision.getCollisionDirection());
                    }
                    if(worldObject instanceof Collectable) {
                        //remove jar if E is pressed
                        if(currentKeys["KeyE"]) {
                            player.increasePower();
                            removeObject(i, worldObjects[i].indexOf(worldObject));
                        }
                    }
                    if(worldObject instanceof Monster) {
                        player.decreaseHealth();
                        removeObject(i, worldObjects[i].indexOf(worldObject));
                    }
                    if(worldObject instanceof Portal) {
                        gameRunning = false;
                        worldObject.onHit();
                    }
                }
            }
        });
    }

    gameBorders.forEach((gameBorder) => {
        gameBorder.update();
        let collision = new Collision(player, gameBorder)
        if (collision.isColliding()) {
            disableKey(collision.getCollisionDirection());
        }
    });

}

function render() {
    //delete the canvas
    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);

    gameBorders.forEach((gameBorder) => {
        gameBorder.render();
    });

    moveCanvas(positionX);
    player.render();


    //draw new frame
    //only render elements in visible area
    for(let i = camera.firstRenderedColumn; i <= camera.lastRenderedColumn; i++) {
        worldObjects[i].forEach((worldObject) => {
            if(worldObject !== null) {
                moveCanvas(positionX);
                worldObject.render();
            }
        });
    }

    //Set boundaries
    setBoundaries(positionX);

    bixi.render();

    ctx.resetTransform();
}


function updateMovement(timePassedSinceLastRender) {
    let movementX;
    let movementY;

    //set directions x
    if((currentKeys["ArrowRight"] || currentKeys["KeyD"]) && allowKey.right ) {movementX = 1;}
    else if((currentKeys["ArrowLeft"] || currentKeys["KeyA"]) && allowKey.left) {movementX = -1;}
    else {movementX = 0;}

    //set directions y
    if((currentKeys["ArrowUp"] || currentKeys["KeyW"]) && allowKey.top) {movementY = -1; }
    else if((currentKeys["ArrowDown"] || currentKeys["KeyS"])  && allowKey.bottom) {movementY = 1 ;}
    else {movementY = 0;}

    //movement of the map
    setPositionX(positionX + timePassedSinceLastRender * movementX * CONFIG.velocity);

    //set the movement for the player
    playerMovement = {
        x: movementX,
        y: movementY,
        goDown: allowKey.bottom
    }
}

//Move the canvas before to suggest movement
function moveCanvas(scrollPositionX) {
    //Check if scrollPositionX is in the range where the screen is moved and not the character, if the character should be moved values are set to the boundaries
    scrollPositionX -= playerStopsMoving;
    ctx.translate(-Math.min((Math.max(0,scrollPositionX)),(CONFIG.lastColumn - CONFIG.columnsPerWidth) * CONFIG.tileSize), 0);
}

//calculate the first visible column index based on the current position of the screen
function calcFirstVisibleColumn(scrollPositionX) {
    scrollPositionX -= playerStopsMoving;
    //Check if scrollPositionX is in the range where the screen is moved and not the character, if the character should be moved values are set to the boundaries and then calculated
    return Math.floor(Math.min((Math.max(0,scrollPositionX)),(CONFIG.lastColumn - CONFIG.columnsPerWidth) * CONFIG.tileSize) / CONFIG.tileSize);
}

//Calculate the boundaries for the camera, which elements are drawn on the canvas
function setCamera(firstColumn) {
    let firstVisibleColumnNew;
    let lastVisibleColumnNew;
    let firstRenderedColumnNew; //Rendered, but not fully in Viewport
    let lastRenderedColumnNew;  //Rendered, but not fully in Viewport

    firstVisibleColumnNew = firstColumn;
    lastVisibleColumnNew = firstVisibleColumnNew + CONFIG.columnsPerWidth;
    firstRenderedColumnNew = firstVisibleColumnNew - CONFIG.columnOffset;
    lastRenderedColumnNew = lastVisibleColumnNew + CONFIG.columnOffset;

    //set the first screen which is rendered
    if(firstVisibleColumnNew < 0 || firstVisibleColumnNew < CONFIG.columnOffset) {
        firstVisibleColumnNew = 0;
        firstRenderedColumnNew = 0;
        lastVisibleColumnNew = firstVisibleColumnNew + CONFIG.columnsPerWidth;
        lastRenderedColumnNew = lastVisibleColumnNew + CONFIG.columnOffset;
    }

    //set the screens before the last
    if(lastVisibleColumnNew > CONFIG.lastColumn - CONFIG.columnOffset) {
        lastVisibleColumnNew = CONFIG.lastColumn;
        lastRenderedColumnNew = CONFIG.lastColumn;
        firstVisibleColumnNew = lastVisibleColumnNew - CONFIG.columnsPerWidth;
        firstRenderedColumnNew = firstVisibleColumnNew - CONFIG.columnOffset;
    }

    camera = {
        firstVisibleColumn: firstVisibleColumnNew,
        lastVisibleColumn: lastVisibleColumnNew,
        firstRenderedColumn: firstRenderedColumnNew,
        lastRenderedColumn: lastRenderedColumnNew
    };
}

function removeObject(indexColumn, indexRow) {
    worldObjects[indexColumn][indexRow] = null;
}

function endByCompletion () {
    player.end();
}

function disableKey(keyDirection) {
    //set key for direction to not be usable anymore
    if(keyDirection !== null) allowKey[keyDirection] = false;
}
