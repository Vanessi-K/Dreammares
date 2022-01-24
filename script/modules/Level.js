import Collectable from "./Collectable.js";
import Monster from "./Monster.js";
import Barrier from "./Barrier.js";
import Portal from "./Portal.js";
import CONFIG from "./CONFIG.js";
import Collision from "./Collision.js";

class Level {

    ctx;
    worldObjects;
    player;

    constructor(ctx, worldMatrixNumbers, player) {
        this.ctx = ctx;
        this.player = player;

        this.worldObjects = this.createLevel(worldMatrixNumbers, () => {player.end()});
        CONFIG.lastColumn = this.worldObjects.length - 1;
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

    update(start, end, ePressed) {
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

    render(camera) {
        for(let i = camera.getRenderingBoundaries().firstRenderedColumn; i <= camera.getRenderingBoundaries().lastRenderedColumn; i++) {
            this.worldObjects[i].forEach((worldObject) => {
                if(worldObject !== null) {
                    camera.moveCamera();
                    worldObject.render();
                    camera.moveCamera();
                    worldObject.drawHitBox();
                }
            });
        }
    }
}

export default Level;