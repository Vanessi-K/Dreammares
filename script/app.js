import Collectable from "./modules/Collectable.js";
import Monster from "./modules/Monster.js";
import Barrier from "./modules/Barrier.js";
import Boundary from "./modules/Boundary.js";
import Portal from "./modules/Portal.js";
import worldMatrix from "./modules/worldMatrix.js";
import Player from "./modules/Player.js";
import Bixi from "./modules/Bixi.js";

const CONFIG = {
    width: 1920,
    height: 1080,
    tileSize: 30,
    topOffset: 90,
    bottomOffset: 30,
    columnsPerWidth: 64, //1920:30
    columnOffset: 6,
    lastColumn: 299
}

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
let worldObjects = new Array(worldMatrix.length);
let gameBorders = [];
let currentKeys = [];
let positionX = 0;
let velocity = 0.5;
let playerStartPositionX = 200;
let playerStartWidthCenter;
let playerStopsMoving;
let playerMovement = {
    x: 0,
    y: 0,
    goDown: true
}

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

    createWorld();

    //Player
    player = new Player(ctx, playerStartPositionX, 770, 160, 290, velocity);
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
                if(checkCollisionBetween(player, worldObject)){
                    if(worldObject instanceof Barrier) {
                        checkCollisionDirection(player.getHitBox(), worldObject.getHitBox());
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
        if (checkCollisionBetween(player, gameBorder)) {
            checkCollisionDirection(player.getHitBox(), gameBorder.getHitBox());
        }
    });

}

function render() {
    //delete the canvas
    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);

    gameBorders.forEach((gameBorder) => {
        gameBorder.render();
    });

    moveWorld(positionX);
    player.render();


    //draw new frame
    //only render elements in visible area
    for(let i = camera.firstRenderedColumn; i <= camera.lastRenderedColumn; i++) {
        worldObjects[i].forEach((worldObject) => {
            if(worldObject !== null) {
                moveWorld(positionX);
                worldObject.render();
            }
        });
    }

    //Set boundaries
    setBoundaries(positionX);

    bixi.render();

    ctx.resetTransform();
}

//read numbers from array and change them into objects
function createWorld() {
    //1 horizontal barrier
    //2 vertical barrier
    //3 horizontal and vertical barrier
    //4 shadow monster
    //5 jar 2 (empty)
    //6 jar 4 (half)
    //7 jar 6 (full)
    //8 portal
    //9 end-portal

    worldMatrix.forEach((objectMatrixColumn, indexColumn) => {
        worldObjects[indexColumn] = new Array(objectMatrixColumn.length);

        objectMatrixColumn.forEach((objectMatrixRowItem, indexRow) => {
            let newObject = null;
            let x = indexColumn * CONFIG.tileSize;
            let y = indexRow * CONFIG.tileSize + CONFIG.topOffset;

            switch (objectMatrixRowItem) {
                case 1:
                    newObject = new Barrier(ctx, x, y, 31, 31, "../../assets/barrier-horizontal.png"); break;
                case 2:
                    newObject = new Barrier(ctx, x, y, 31, 31, "../../assets/barrier-vertical.png"); break;
                case 3:
                    newObject = new Barrier(ctx, x, y, 31, 31, "../../assets/barrier-corner.png"); break;
                case 4:
                    newObject = new Monster(ctx, x, y, 177, 177, "../../assets/shadow-creature.png"); break;
                case 5:
                    newObject = new Collectable(ctx, x, y, 161, 156, "../../assets/empty-jar.png"); break;
                case 6:
                    newObject = new Collectable(ctx, x, y, 161, 156, "../../assets/half-jar.png"); break;
                case 7:
                    newObject = new Collectable(ctx, x, y, 161, 156, "../../assets/full-jar.png"); break;
                case 8:
                    newObject = new Portal(ctx, x, y, 171, 321, "../../assets/portal.png"); break;
                case 9:
                    newObject = new Portal(ctx, x, y, 171, 321, "../../assets/portal.png", endByCompletion); break;
            }

            worldObjects[indexColumn][indexRow] = newObject;
        });
    });
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
    setPositionX(positionX + timePassedSinceLastRender * movementX * velocity);

    //set the movement for the player
    playerMovement = {
        x: movementX,
        y: movementY,
        goDown: allowKey.bottom
    }
}

//Move the canvas before to suggest movement
function moveWorld(scrollPositionX) {
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

function checkCollisionBetween (gameObjectA, gameObjectB) {
    let hbA = gameObjectA.getHitBox();
    let hbB = gameObjectB.getHitBox();

    //return if objects hit each other or not
    return hbA.x < hbB.x + hbB.w &&
        hbA.x + hbA.w > hbB.x &&
        hbA.y < hbB.y + hbB.h &&
        hbA.y + hbA.h > hbB.y;
}

function checkCollisionDirection (playerHit, objectHit) {
    //Make checks on which side the object is hit; highest distance an object can intersect is by the half of
    let hitRight = Math.abs(playerHit.x - objectHit.x) <= playerHit.w && (playerHit.x - objectHit.x) < -(playerHit.w - objectHit.w);
    let hitBottom = Math.abs(playerHit.y - objectHit.y) <= playerHit.h && (playerHit.y - objectHit.y) < -(playerHit.h - objectHit.h);
    let hitLeft =  Math.abs(playerHit.x - objectHit.x) <= objectHit.w && (playerHit.x - objectHit.x) < CONFIG.tileSize/2;
    let hitTop =  Math.abs(playerHit.y - objectHit.y) <= objectHit.h;

    //Check if object is intersecting with the player on a corner, that means two expressions are true
    if(!((hitLeft && hitTop) || (hitTop && hitRight) || (hitRight && hitBottom) || (hitBottom && hitLeft))) {
        //Object is hit on the right side
        if(hitRight) { allowKey.right = false; }

        //Object is hit on the bottom
        if(hitBottom) { allowKey.bottom = false; }

        //Object is hit on the left side
        if(hitLeft) { allowKey.left = false; }

        //Object is hit on the top
        if(hitTop) { allowKey.top = false; }
    }
}

function removeObject(indexColumn, indexRow) {
    worldObjects[indexColumn][indexRow] = null;
}

function endByCompletion () {
    player.end();
}