import GameObject from "./GameObject.js";

class Player extends GameObject {

    state = "idle";
    direction = "right";
    width = 160;
    height = 290;
    velocity;
    sprites = {
        idle: {
            direction: {
                right: {
                    src: "../../assets/sprites/Flynn-Sprites_idle-right.png",
                    image: null
                },
                left: {
                    src: "../../assets/sprites/Flynn-Sprites_idle-left.png",
                    image: null
                }
            },
            frames: 6,
            fps: 10,
            frameSize: {
                width: this.width,
                height: this.height
            }
        },
        movement: {
            direction: {
                right: {
                    src: "../../assets/sprites/Flynn-Sprites_movement-right.png",
                    image: null
                },
                left: {
                    src: "../../assets/sprites/Flynn-Sprites_movement-left.png",
                    image: null
                }
            },
            frames: 14,
            fps: 20,
            frameSize: {
                width: this.width,
                height: this.height
            }
        }
    };
    movementX = 0;
    movementY = 0;

    constructor(ctx, x, y, velocity) {
        super(ctx, x, y);

        this.velocity = velocity;

        Object.values(this.sprites).forEach((sprite) => {
            sprite.direction.right.image = new Image();
            sprite.direction.right.image.src = sprite.direction.right.src;

            sprite.direction.left.image = new Image();
            sprite.direction.left.image.src = sprite.direction.left.src;
        });
    }

    init() {}

    update(moving = {x: 0, y: 0 }) {
        if (moving.x === 1) this.direction = "right";
        else if (moving.x === -1) this.direction = "left";

        //Change states
        (moving.x !== 0 || moving.y !== 0) ? this.state = "movement" : this.state = "idle";
    }

    render() {
        this.ctx.translate(this.x, this.y);

        //get correct values for the sprite in the current direction
        let coordinates = this.getImageSpriteCoordinates(this.sprites[this.state]);

        //draw character and move center to center of image
        this.ctx.drawImage(
            this.sprites[this.state].direction[this.direction].image, //image
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

export default Player;