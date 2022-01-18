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
    bottomOffset: 30
}

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

    player = new Player(ctx, 200, 750);
    gameObjects.push(player);

    canvas.setAttribute("width", CONFIG.width);
    canvas.setAttribute("height", CONFIG.height);

    createWorld();

    gameObjects.push(new Boundary(ctx, 0, 0, CONFIG.width, CONFIG.topOffset));
    gameObjects.push(new Boundary(ctx, 0, CONFIG.height - CONFIG.bottomOffset, CONFIG.width, CONFIG.bottomOffset));


    /*gameObjects.push(new Collectable(ctx, 100, 600, "../../assets/full-jar.png"));
    gameObjects.push(new Collectable(ctx, 800, 200, "../../assets/half-jar.png"));
    gameObjects.push(new Collectable(ctx, 900, 900, "../../assets/empty-jar.png"));

    gameObjects.push(new Monster(ctx, 1300, 400, "../../assets/shadow-creature.png"));

    gameObjects.push(new Barrier(ctx, 900, 500, "../../assets/barrier-horizontal.png"));
    gameObjects.push(new Barrier(ctx, 930, 500, "../../assets/barrier-corner.png"));
    gameObjects.push(new Barrier(ctx, 930, 530, "../../assets/barrier-vertical.png"));

    gameObjects.push(new Portal(ctx, 400, 300, "../../assets/portal.png"));*/


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
    worldObjects.forEach((worldObjectsColumn) => {
        worldObjectsColumn.forEach((worldObject) => {
            if(worldObject !== null) {
                worldObject.update();
            }
        });
    });

    gameObjects.forEach((gameObject) => gameObject.update());
}

function render() {
    //delete the canvas
    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);

    //draw new frame
    worldObjects.forEach((worldObjectsColumn) => {
        worldObjectsColumn.forEach((worldObject) => {
            if(worldObject !== null) {
                worldObject.render();
            }
        });
    });
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

            //console.log(objectMatrixRowItem);
            switch (objectMatrixRowItem) {
                case 1: //console.log(1);
                newObject = new Barrier(ctx, x, y, "../../assets/barrier-horizontal.png"); break;
                case 2: //console.log(2);
                newObject = new Barrier(ctx, x, y, "../../assets/barrier-vertical.png");
                console.log(indexRow + ":" + y); break;
                case 3: //console.log(3);
                newObject = new Barrier(ctx, x, y, "../../assets/barrier-corner.png"); break;
                case 4: //console.log(4);
                newObject = new Monster(ctx, x, y, "../../assets/shadow-creature.png"); break;
                case 5: //console.log(5);
                newObject = new Collectable(ctx, x, y, "../../assets/empty-jar.png"); break;
                case 6: //console.log(6);
                newObject = new Collectable(ctx, x, y, "../../assets/half-jar.png"); break;
                case 7: //console.log(7);
                newObject = new Collectable(ctx, x, y, "../../assets/full-jar.png"); break;
                case 8: //console.log(8);
                newObject = new Portal(ctx, x, y, "../../assets/portal.png"); break;
                case 9: //console.log(9);
                newObject = new Portal(ctx, x, y, "../../assets/portal.png"); break;
                default: //console.log(objectMatrixRowItem);
            }

            worldObjects[indexColumn][objectMatrixRowItem] = newObject;
            newObject = null;
        });
    });
}

