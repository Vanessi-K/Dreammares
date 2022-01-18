import GameObject from "./GameObject.js";

class Monster extends GameObject {

    image = new Image();

    constructor(ctx, x, y, imagePath) {
        super(ctx, x, y);
        this.image.src = imagePath;
    }

    render() {
        this.ctx.translate(this.x, this.y);
        this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height)
        this.ctx.resetTransform();
    }

}

export default Monster;