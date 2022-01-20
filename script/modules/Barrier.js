import GameObject from "./GameObject.js";

class Barrier extends GameObject {

    image = new Image();

    constructor(ctx, x, y, width, height, imagePath) {
        super(ctx, x, y, width, height);
        this.image.src = imagePath;
    }

    render() {
        this.ctx.translate(this.x, this.y);
        this.ctx.drawImage(this.image, 0, 0, this.width, this.height)
        this.ctx.resetTransform();
    }

    getHitBox() {
        return {
            x: this.x,
            y: this.y,
            w: this.width,
            h: this.height
        }
    }
}

export default Barrier;