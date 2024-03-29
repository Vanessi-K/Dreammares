import GameObject from "./GameObject.js";

class Boundary extends GameObject {

    width;
    height;

    constructor(ctx, x, y, width, height) {
        super(ctx, x, y);
        this.width = width;
        this.height = height;
    }

    render() {
        this.ctx.translate(this.coordinates.x, this.coordinates.y);
        this.ctx.fillStyle = "#18073a";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.resetTransform();
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

export default Boundary;