import Collectable from "./modules/Collectable.js";
import Monster from "./modules/Monster.js";
import Barrier from "./modules/Barrier.js";
import Boundary from "./modules/Boundary.js";
import Portal from "./modules/Portal.js";
import worldMatrix from "./modules/worldMatrix.js";
import Player from "./modules/Player.js";

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

let ctx;
let lastTickTimestamp;
let player;
let worldObjects = new Array(worldMatrix.length);
let gameBorders = [];
let currentKeys = [];
let positionX = 0;
let velocity = 0.3;
let playerStartPositionX = 200;
let playerStartWidth;
let playerStopsMoving;
let playerMovement = {
    x: 0,
    y: 0
}

let allowKey = {
    top: true,
    right: true,
    bottom: true,
    left: true
}

function setPositionX(position) {
    if(positionX < 0) positionX = 0;
    else if(positionX > CONFIG.lastColumn * CONFIG.tileSize) positionX = CONFIG.lastColumn * CONFIG.tileSize;
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
    playerStartWidth = playerStartPositionX + player.width/2;
    playerStopsMoving = CONFIG.width/2 - playerStartWidth;


    //top and bottom boundary
    gameBorders.push(new Boundary(ctx, 0, 0, CONFIG.width, CONFIG.topOffset));
    gameBorders.push(new Boundary(ctx, 0, CONFIG.height - CONFIG.bottomOffset, CONFIG.width, CONFIG.bottomOffset));

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

    updateMovement(timePassedSinceLastRender);

    allowKey.top = true;
    allowKey.right = true;
    allowKey.bottom = true;
    allowKey.left = true;

    player.update(timePassedSinceLastRender, playerMovement);

    //If the world is moving not the character, calculate the first visible column
    setCamera(calcFirstVisibleColumn(positionX));

    //only update elements in visible area

    for(let i = camera.firstRenderedColumn; i <= camera.lastRenderedColumn; i++) {
        worldObjects[i].forEach((worldObject) => {
            if(worldObject !== null) {
                worldObject.update();
                if(checkCollisionBetween(player, worldObject)){
                    if(worldObject instanceof Barrier) {
                        let playerHit = player.getHitBox();
                        let objectHit = worldObject.getHitBox();

                        //Make checks on which side the object is hit; highest distance an object can intersect is by the half of
                        let hitRight = Math.abs(playerHit.x - objectHit.x) <= playerHit.w && (playerHit.x - objectHit.x) < -(playerHit.w - objectHit.w);
                        let hitBottom = Math.abs(playerHit.y - objectHit.y) <= playerHit.h && (playerHit.y - objectHit.y) < -(playerHit.h - objectHit.h);
                        let hitLeft =  Math.abs(playerHit.x - objectHit.x) <= objectHit.w && (playerHit.x - objectHit.x) < objectHit.w;
                        let hitTop=  Math.abs(playerHit.y - objectHit.y) <= objectHit.h && (playerHit.y - objectHit.y) < objectHit.h;

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
                    if(worldObject instanceof Collectable) {
                        console.log("Collectable");
                    }
                    if(worldObject instanceof Monster) {
                        console.log("Monster");
                    }
                    if(worldObject instanceof Portal) {
                        console.log("Portal");
                    }
                }
            }
        });
    }

    gameBorders.forEach((gameBorder) => gameBorder.update());
}

function render() {
    //delete the canvas
    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);

    moveWorld(positionX);

    player.drawHitBox();
    moveWorld(positionX);
    player.render();


    //draw new frame
    //only render elements in visible area
    for(let i = camera.firstRenderedColumn; i <= camera.lastRenderedColumn; i++) {
        worldObjects[i].forEach((worldObject) => {
            if(worldObject !== null) {
                moveWorld(positionX);
                worldObject.render();
                moveWorld(positionX);
                worldObject.drawHitBox();
            }
        });
    }

    gameBorders.forEach((gameBorder) => {
        gameBorder.render();
        gameBorder.drawHitBox();
    });

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
                    newObject = new Barrier(ctx, x, y, "../../assets/barrier-horizontal.png"); break;
                case 2:
                    newObject = new Barrier(ctx, x, y, "../../assets/barrier-vertical.png"); break;
                case 3:
                    newObject = new Barrier(ctx, x, y, "../../assets/barrier-corner.png"); break;
                case 4:
                    newObject = new Monster(ctx, x, y, "../../assets/shadow-creature.png"); break;
                case 5:
                    newObject = new Collectable(ctx, x, y, "../../assets/empty-jar.png"); break;
                case 6:
                    newObject = new Collectable(ctx, x, y, "../../assets/half-jar.png"); break;
                case 7:
                    newObject = new Collectable(ctx, x, y, "../../assets/full-jar.png"); break;
                case 8:
                    newObject = new Portal(ctx, x, y, "../../assets/portal.png"); break;
                case 9:
                    newObject = new Portal(ctx, x, y, "../../assets/portal.png"); break;
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
        y: movementY
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