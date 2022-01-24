import Coordinates from "./Coordinates.js";

class GameObject {
    ctx;
    coordinates;
    width;
    height;

    constructor(ctx, x, y, width, height) {
        this.ctx = ctx;
        this.coordinates = new Coordinates(x, y);
        this.width = width;
        this.height = height;
    }

    setY(y) {
        this.coordinates.y = y;
    }

    setX(x) {
        this.coordinates.x = x;
    }

    init() {}

    update() {}

    render() {

    }

    getHitBox() {
        return {
            x: this.coordinates.x,
            y: this.coordinates.y,
            w: this.width,
            h: this.height
        }
    }

    drawHitBox() {
        //debug bounding box
        let hitBox = this.getHitBox();
        this.ctx.translate(hitBox.x, hitBox.y);
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(0, 0, hitBox.w, hitBox.h);
        this.ctx.resetTransform();
    }
}

export default GameObject;