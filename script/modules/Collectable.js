import GameObject from "./GameObject.js";

class Collectable extends GameObject {

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