import GameObject from "./GameObject.js";

class Collectable extends GameObject {

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
        let minusX = 65;
        let minusY = 65;
        let hitBox = super.getHitBox()

        hitBox.x += minusX;
        hitBox.y += minusY;
        hitBox.w -= (2 * minusX);
        hitBox.h -= (2 * minusY);

        return hitBox;
    }
}

export default Collectable;