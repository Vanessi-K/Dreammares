import GameObject from "./GameObject.js";

class Bixi extends GameObject {

    image = new Image();

    state = "flying";

    sprites = {
        flying: {
            src: "../../assets/sprites/Bixi-Sprites_flying.png",
            image: null,
            frames: 8,
            fps: 15,
            frameSize: {
                width: this.width,
                height: this.height
            }
        }
    }

    constructor(ctx, x, y, width, height) {
        super(ctx, x, y, width, height);

        Object.values(this.sprites).forEach((sprite) => {
            sprite.image = new Image();
            sprite.image.src = sprite.src;
        });
    }

    render() {
        this.ctx.translate(this.x, this.y);

        //get correct values for the sprite in the current direction
        let coordinates = this.getImageSpriteCoordinates(this.sprites[this.state]);

        //draw character and move center to center of image
        this.ctx.drawImage(
            this.sprites[this.state].image, //image
            coordinates.srcX,  //src x
            coordinates.srcY,  //src y
            coordinates.srcWidth,    //src width
            coordinates.srcHeight,   //src height
            0,  //destination x
            0,  //destination y
            this.width,    //destination width
            this.height,);   //destination width

        //reset the origin of the canvas
        this.ctx.resetTransform();
    }

    getImageSpriteCoordinates(sprite) {
        //getting the right frame
        let frameX = Math.floor(performance.now() / 1000 * sprite.fps % sprite.frames);

        return {
            srcX: frameX * sprite.frameSize.width,
            srcY: 0,
            srcWidth: sprite.frameSize.width,
            srcHeight: sprite.frameSize.height
        }
    }
}

export default Bixi;