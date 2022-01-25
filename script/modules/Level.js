import Collectable from "./Collectable.js";
import Monster from "./Monster.js";
import Barrier from "./Barrier.js";
import Portal from "./Portal.js";
import CONFIG from "./CONFIG.js";
import Collision from "./Collision.js";
import Camera from "./Camera.js";

class Level {

    ctx;
    worldObjects;
    player;
    camera;
    playerStartPositionX;

    constructor(ctx, worldMatrixNumbers, player) {
        this.ctx = ctx;
        this.player = player;

        this.worldObjects = this.createLevel(worldMatrixNumbers, () => {player.end()});
        CONFIG.lastColumn = this.worldObjects.length - 1;
        this.playerStartPositionX = player.coordinates.x;

        this.camera = new Camera(ctx, CONFIG.width/2 - (player.coordinates.x + player.width/2));
    }

    //Do not allow certain keys based on position (right and left borders)
     setBoundaries() {
        let position = this.camera.movementAmount;

        if(position <= -this.playerStartPositionX) CONFIG.allowKey.left = false; //leftBorder
        else if(position >= CONFIG.lastColumn * CONFIG.tileSize -(this.playerStartPositionX + this.player.width/2) - this.player.width/2) CONFIG.allowKey.right = false; //rightBorder
    }

    addPositionX(position) {
        let positionX = this.camera.movementAmount;

        if(position < -this.playerStartPositionX) {
            positionX += -this.playerStartPositionX;
        }
        else if(position > CONFIG.lastColumn * CONFIG.tileSize - (this.playerStartPositionX + this.player.width/2) - this.player.width/2) {
            positionX += CONFIG.lastColumn * CONFIG.tileSize - (this.playerStartPositionX + this.player.width/2) - this.player.width/2;
        }
        else positionX += position;

        //set the movement of the camera
        this.camera.setMovementAmount(positionX);
    }

    createLevel(worldMatrixNumbers, endFunction) {
        let worldObjectsArray = new Array(worldMatrixNumbers.length);

        worldMatrixNumbers.forEach((objectMatrixColumn, indexColumn) => {
            worldObjectsArray[indexColumn] = new Array(objectMatrixColumn.length);

            objectMatrixColumn.forEach((objectMatrixRowItem, indexRow) => {
                let newObject = null;
                let x = indexColumn * CONFIG.tileSize;
                let y = indexRow * CONFIG.tileSize + CONFIG.topOffset;

                switch (objectMatrixRowItem) {
                    case 1:
                        newObject = new Barrier(this.ctx, x, y, 31, 31, "../assets/barrier-horizontal.png"); break;
                    case 2:
                        newObject = new Barrier(this.ctx, x, y, 31, 31, "../assets/barrier-vertical.png"); break;
                    case 3:
                        newObject = new Barrier(this.ctx, x, y, 31, 31, "../assets/barrier-corner.png"); break;
                    case 4:
                        newObject = new Monster(this.ctx, x, y, 177, 177, "../assets/shadow-creature.png"); break;
                    case 5:
                        newObject = new Collectable(this.ctx, x, y, 161, 156, "../assets/empty-jar.png"); break;
                    case 6:
                        newObject = new Collectable(this.ctx, x, y, 161, 156, "../assets/half-jar.png"); break;
                    case 7:
                        newObject = new Collectable(this.ctx, x, y, 161, 156, "../assets/full-jar.png"); break;
                    case 8:
                        newObject = new Portal(this.ctx, x, y, 171, 321, "../assets/portal.png", () => {}); break;
                    case 9:
                        newObject = new Portal(this.ctx, x, y, 171, 321, "../assets/portal.png", endFunction); break;
                }

                worldObjectsArray[indexColumn][indexRow] = newObject;
            });
        });

        return worldObjectsArray;
    }

    removeObject(indexColumn, worldObject) {
        this.worldObjects[indexColumn][this.objectRowIndex(indexColumn, worldObject)] = null;
    }

    objectRowIndex(indexColumn, worldObject) {
        return this.worldObjects[indexColumn].indexOf(worldObject)
    }

    update( ePressed) {
        //If the world is moving not the character, calculate the first visible column
        this.camera.setRenderingBoundaries();

        let start = this.camera.getRenderingBoundaries().firstRenderedColumn;
        let end = this.camera.getRenderingBoundaries().lastRenderedColumn;

        //only update elements in visible area
        for(let i = start; i <= end; i++) {
            this.worldObjects[i].forEach((worldObject) => {
                if(worldObject !== null) {
                    worldObject.update();

                    let collision = new Collision(this.player, worldObject);

                    if(collision.isColliding()){
                        if(worldObject instanceof Barrier) {
                            collision.getCollisionDirection();
                        }
                        if(worldObject instanceof Collectable) {
                            //remove jar if E is pressed
                            if(ePressed) {
                                this.player.increasePower();
                                this.removeObject(i, worldObject);
                            }
                        }
                        if(worldObject instanceof Monster) {
                            this.player.decreaseHealth();
                            this.removeObject(i, worldObject);
                        }
                        if(worldObject instanceof Portal) {
                            worldObject.onHit();
                        }
                    }
                }
            });
        }
    }

    render() {
        let start = this.camera.getRenderingBoundaries().firstRenderedColumn;
        let end = this.camera.getRenderingBoundaries().lastRenderedColumn;

        for(let i = start; i <= end; i++) {
            this.worldObjects[i].forEach((worldObject) => {
                if(worldObject !== null) {
                    this.camera.moveCamera();
                    worldObject.render();
                }
            });
        }
    }
}

export default Level;