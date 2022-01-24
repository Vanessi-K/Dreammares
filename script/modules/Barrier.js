import GameObject from "./GameObject.js";

class Barrier extends GameObject {

    image = new Image();

    constructor(ctx, x, y, width, height, imagePath) {
        super(ctx, x, y, width, height);
        this.image.src = imagePath;
    }

    render() {
        this.ctx.translate(this.coordinates.x, this.coordinates.y);
        this.ctx.drawImage(this.image, 0, 0, this.width, this.height)
        this.ctx.resetTransform();
    }

}

export default Barrier;