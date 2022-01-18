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
        this.ctx.translate(this.x, this.y);
        this.ctx.fillStyle = "#18073a";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.resetTransform();
    }

}

export default Boundary;