import GameObject from "./GameObject.js";

class Barrier extends GameObject {

    image = new Image();

    constructor(ctx, x, y, imagePath) {
        super(ctx, x, y);
        this.image.src = imagePath;
    }

    render() {
        this.ctx.translate(this.x, this.y);
        this.ctx.fillStyle = "#FFF"
        this.ctx.fillRect(0,0,this.image.width, this.image.height);
        this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height)

        this.ctx.resetTransform();
    }

}

export default Barrier;