import GameObject from "./GameObject.js";

class Portal extends GameObject {

    image = new Image();
    onHit;

    constructor(ctx, x, y, width, height, imagePath, hitFunction = function () {}) {
        super(ctx, x, y, width, height);
        this.image.src = imagePath;
        this.onHit = hitFunction;
    }

    render() {
        this.ctx.translate(this.coordinates.x, this.coordinates.y);
        this.ctx.drawImage(this.image, 0, 0, this.width, this.height)
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