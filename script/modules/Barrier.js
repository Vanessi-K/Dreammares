import GameObject from "./GameObject.js";

class Barrier extends GameObject {

    image = new Image();

    constructor(ctx, x, y, imagePath) {
        super(ctx, x, y, 0, 0);
        this.image.src = imagePath;
        this.width = this.image.width;
        this.height = this.image.height;
    }

    render() {
        this.ctx.translate(this.x, this.y);
        this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height)
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