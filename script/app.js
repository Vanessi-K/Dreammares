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
let gameObjects = [];
let movementX = 0;
let movementY = 0;
let currentKeys = [];
let positionX = -CONFIG.width/2;
let velocity = 1;

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
        switch (e.key) {
            case "i": document.body.requestFullscreen(); break;
            case "o": document.exitFullscreen(); break;
        }
    });

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
    player = new Player(ctx, 200, 770);
    gameObjects.push(player);

    //top and bottom boundary
    gameObjects.push(new Boundary(ctx, 0, 0, CONFIG.width, CONFIG.topOffset));
    gameObjects.push(new Boundary(ctx, 0, CONFIG.height - CONFIG.bottomOffset, CONFIG.width, CONFIG.bottomOffset));

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

    //If the world is moving not the character, calculate the first visible column
    setCamera(calcFirstVisibleColumn(positionX));

    //only update elements in visible area
    for(let i = camera.firstRenderedColumn; i <= camera.lastRenderedColumn; i++) {
        worldObjects[i].forEach((worldObject) => {
            if(worldObject !== null) {
                worldObject.update();
            }
        });
    }

    gameObjects.forEach((gameObject) => gameObject.update());
}

function render() {
    //delete the canvas
    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);

    gameObjects.forEach((gameObject) => gameObject.render());

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
    //set directions x
    if(currentKeys["ArrowRight"]) {movementX = 1;}
    else if(currentKeys["ArrowLeft"]) {movementX = -1;}
    else {movementX = 0;}

    //set directions y
    if(currentKeys["ArrowUp"]) {movementY = -1; }
    else if(currentKeys["ArrowDown"]) {movementY = 1 ;}
    else {movementY = 0;}

    //Change diagonal speed
    if(movementX !== 0 && movementY !== 0) {
        movementX /= Math.hypot(movementX, movementY);
        movementY /= Math.hypot(movementX, movementY);
    }

    //movement of the map
    setPositionX(positionX + timePassedSinceLastRender * movementX * velocity);

}

//Move the canvas before to suggest movement
function moveWorld(scrollPositionX) {
    //Check if scrollPositionX is in the range where the screen is moved and not the character, if the character should be moved values are set to the boundaries
    scrollPositionX -= CONFIG.width/2;
    ctx.translate(-Math.min((Math.max(0,scrollPositionX)),(CONFIG.lastColumn - CONFIG.columnsPerWidth) * CONFIG.tileSize), 0);
}

//calculate the first visible column index based on the current position of the screen
function calcFirstVisibleColumn(scrollPositionX) {
    scrollPositionX -= CONFIG.width/2;
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
    if(firstVisibleColumnNew < 0) {
        firstVisibleColumnNew = 0;
        firstRenderedColumnNew = 0;
    } else if(firstVisibleColumnNew < CONFIG.columnOffset) {
        firstRenderedColumnNew = 0;
    }

    //set the screens before the last
    if(lastVisibleColumnNew > CONFIG.lastColumn - CONFIG.columnOffset) {
        lastVisibleColumnNew = CONFIG.lastColumn;
        lastRenderedColumnNew = CONFIG.lastColumn;
    }

    //Set the last screen which is rendered
    if (firstVisibleColumnNew - CONFIG.columnOffset > CONFIG.lastColumn - CONFIG.columnOffset) {
        firstVisibleColumnNew = CONFIG.lastColumn - CONFIG.columnsPerWidth;
        lastVisibleColumnNew = CONFIG.lastColumn;
        firstRenderedColumnNew = firstVisibleColumnNew - CONFIG.columnOffset;
        lastRenderedColumnNew = CONFIG.lastColumn;
    }

    camera = {
        firstVisibleColumn: firstVisibleColumnNew,
        lastVisibleColumn: lastVisibleColumnNew,
        firstRenderedColumn: firstRenderedColumnNew,
        lastRenderedColumn: lastRenderedColumnNew
    };
}