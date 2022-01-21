import CONFIG from "./CONFIG.js";

class Camera {

    ctx;
    playerStopsMoving;
    movementAmount = 0;
    renderingBoundaries;

    setMovementAmount(movement) {
       this.movementAmount = movement - this.playerStopsMoving;
    }

    getRenderingBoundaries() {
        return this.renderingBoundaries;
    }

    constructor(ctx, playerStopsMoving) {
        this.playerStopsMoving = playerStopsMoving;
        this.ctx = ctx;
    }

    //Move the canvas before to suggest movement
    moveCamera() {
        //Check if scrollPositionX is in the range where the screen is moved and not the character, if the character should be moved values are set to the boundaries
        this.ctx.translate(-Math.min((Math.max(0,this.movementAmount)),(CONFIG.lastColumn - CONFIG.columnsPerWidth) * CONFIG.tileSize), 0);
    }

    calculateFirstVisibleColumn() {
        //Check if scrollPositionX is in the range where the screen is moved and not the character, if the character should be moved values are set to the boundaries and then calculated
        return Math.floor(Math.min((Math.max(0,this.movementAmount)),(CONFIG.lastColumn - CONFIG.columnsPerWidth) * CONFIG.tileSize) / CONFIG.tileSize);
    }

    setRenderingBoundaries() {
        let firstVisibleColumnNew;
        let lastVisibleColumnNew;
        let firstRenderedColumnNew; //Rendered, but not fully in Viewport
        let lastRenderedColumnNew;  //Rendered, but not fully in Viewport

        firstVisibleColumnNew = this.calculateFirstVisibleColumn(this.movementAmount);
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

        this.renderingBoundaries = {
            firstVisibleColumn: firstVisibleColumnNew,
            lastVisibleColumn: lastVisibleColumnNew,
            firstRenderedColumn: firstRenderedColumnNew,
            lastRenderedColumn: lastRenderedColumnNew
        };
    }

}

export default Camera;