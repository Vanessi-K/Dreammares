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

window.onload = () => {
    init();
}

function init() {
    let canvas = document.querySelector("#game-area");
    ctx = canvas.getContext("2d");

    canvas.setAttribute("width", CONFIG.width);
    canvas.setAttribute("height", CONFIG.height);

    createWorld();

    //Player
    player = new Player(ctx, 200, 770);
    gameObjects.push(player);

    //top and bottom boundary
    gameObjects.push(new Boundary(ctx, 0, 0, CONFIG.width, CONFIG.topOffset));
    gameObjects.push(new Boundary(ctx, 0, CONFIG.height - CONFIG.bottomOffset, CONFIG.width, CONFIG.bottomOffset));

    lastTickTimestamp = performance.now();

    console.log(camera);

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

    //draw new frame
    //only render elements in visible area
    for(let i = camera.firstRenderedColumn; i <= camera.lastRenderedColumn; i++) {
        worldObjects[i].forEach((worldObject) => {
            if(worldObject !== null) {
                worldObject.render();
            }
        });
    }

    gameObjects.forEach((gameObject) => gameObject.render());
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

//Calculate the boundaries for the camera, which elements are drawn on the canvas
function setCamera(firstColumn) {
    let firstVisibleColumnNew;
    let lastVisibleColumnNew;
    let firstRenderedColumnNew; //Rendered, but not fully in Viewport
    let lastRenderedColumnNew;  //Rendered, but not fully in Viewport

    firstVisibleColumnNew = firstColumn;
    lastVisibleColumnNew = firstVisibleColumnNew + CONFIG.columnOffset;
    firstRenderedColumnNew = firstVisibleColumnNew - CONFIG.columnOffset;
    lastRenderedColumnNew = lastVisibleColumnNew + CONFIG.columnOffset;

    if(firstVisibleColumnNew < 0) {
        firstVisibleColumnNew = 0;
        firstRenderedColumnNew = 0;
    } else if(firstVisibleColumnNew < CONFIG.columnOffset) {
        firstRenderedColumnNew = 0;
    }

    if (lastVisibleColumnNew > CONFIG.lastColumn - CONFIG.columnOffset) {
        lastVisibleColumnNew = CONFIG.lastColumn - CONFIG.columnOffset;
        lastRenderedColumnNew = lastVisibleColumnNew + CONFIG.columnOffset
    }

    camera = {
        firstVisibleColumn: firstVisibleColumnNew,
        lastVisibleColumn: lastVisibleColumnNew,
        firstRenderedColumn: firstRenderedColumnNew,
        lastRenderedColumn: lastRenderedColumnNew
    };
}


