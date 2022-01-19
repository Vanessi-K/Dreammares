import GameObject from "./GameObject.js";

class Portal extends GameObject {

    image = new Image();

    constructor(ctx, x, y, imagePath, onHit) {
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
        let minusX = 50;
        let minusY = 50;
        let hitBox = super.getHitBox()

        hitBox.x += minusX;
        hitBox.y += minusY;
        hitBox.w -= (2 * minusX);
        hitBox.h -= (2 * minusY);

        return hitBox;
    }

}

export default Portal;