import Collectable from "./Collectable.js";
import Monster from "./Monster.js";
import Barrier from "./Barrier.js";
import Portal from "./Portal.js";
import CONFIG from "./CONFIG.js";

class Level {

    ctx;
    CONFIG;
    worldObjects;

    getLevel() {
        return this.worldObjects;
    }

    constructor(ctx, worldMatrixNumbers, endFunction) {
        this.ctx = ctx;

        this.worldObjects = this.createLevel(worldMatrixNumbers, endFunction)
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
                        newObject = new Barrier(this.ctx, x, y, 31, 31, "../../assets/barrier-horizontal.png"); break;
                    case 2:
                        newObject = new Barrier(this.ctx, x, y, 31, 31, "../../assets/barrier-vertical.png"); break;
                    case 3:
                        newObject = new Barrier(this.ctx, x, y, 31, 31, "../../assets/barrier-corner.png"); break;
                    case 4:
                        newObject = new Monster(this.ctx, x, y, 177, 177, "../../assets/shadow-creature.png"); break;
                    case 5:
                        newObject = new Collectable(this.ctx, x, y, 161, 156, "../../assets/empty-jar.png"); break;
                    case 6:
                        newObject = new Collectable(this.ctx, x, y, 161, 156, "../../assets/half-jar.png"); break;
                    case 7:
                        newObject = new Collectable(this.ctx, x, y, 161, 156, "../../assets/full-jar.png"); break;
                    case 8:
                        newObject = new Portal(this.ctx, x, y, 171, 321, "../../assets/portal.png"); break;
                    case 9:
                        newObject = new Portal(this.ctx, x, y, 171, 321, "../../assets/portal.png", endFunction); break;
                }

                worldObjectsArray[indexColumn][indexRow] = newObject;
            });
        });

        return worldObjectsArray;
    }

    update() {

    }

    render() {
    }
}

export default Level;