import GameObject from "./GameObject.js";
import CONFIG from "./CONFIG.js";

class Player extends GameObject {

    state = "idle";
    direction = "right";
    health;
    power;
    creationTime = 0;
    g = 0.13;
    sprites = {
        idle: {
            direction: {
                right: {
                    src: "../assets/sprites/Flynn-Sprites_idle-right.png",
                    image: null
                },
                left: {
                    src: "../assets/sprites/Flynn-Sprites_idle-left.png",
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
                    src: "../assets/sprites/Flynn-Sprites_movement-right.png",
                    image: null
                },
                left: {
                    src: "../assets/sprites/Flynn-Sprites_movement-left.png",
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

    constructor(ctx, x, y, width, height) {
        super(ctx, x, y, width, height);

        this.creationTime = performance.now();
        this.health = 3;
        this.power = 0;

        Object.values(this.sprites).forEach((sprite) => {
            sprite.direction.right.image = new Image();
            sprite.direction.right.image.src = sprite.direction.right.src;

            sprite.direction.left.image = new Image();
            sprite.direction.left.image.src = sprite.direction.left.src;
        });
    }

    init() {}

    update(timePassedSincelastRender, moving = {x: 0, y: 0}) {
        if (moving.x === 1) this.direction = "right";
        else if (moving.x === -1) this.direction = "left";

        //Change states
        (moving.x !== 0 || moving.y !== 0) ? this.state = "movement" : this.state = "idle";

        //If the player can still go down or the player moves up (calculate y-position)
        if(CONFIG.allowKey.bottom || moving.y === -1) {
            this.setY(this.coordinates.y + timePassedSincelastRender * moving.y * CONFIG.velocity + this.gravity(timePassedSincelastRender));
        }

        this.setX(this.coordinates.x + timePassedSincelastRender * moving.x * CONFIG.velocity);
    }

    render() {
        this.ctx.translate(this.coordinates.x, this.coordinates.y);

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

    getHitBox() {
        let minusXRight = 45;
        let minusXLeft = 20;
        let minusYTop = 35;
        let minusYBottom = 15;
        let hitBox = super.getHitBox();

        hitBox.x += minusXLeft;
        hitBox.y += minusYTop;
        hitBox.w -= minusXRight - minusXLeft;
        hitBox.h -= (minusYTop + minusYBottom);

        return hitBox;
    }

    decreaseHealth() {
        let heart = document.querySelector("#heart-" + this.health);
        heart.style.opacity = "0";
        this.health--;

        if(this.health === 0) {
            this.end()
        }
    }

    increasePower() {
        this.power++;
        let powerPoint = document.querySelector("#power-point-" + this.power);
        if(powerPoint !== null) powerPoint.style.opacity = "1";
    }

    gravity(t) {
        return (this.g * t^2 /2);
    }

    end() {

        CONFIG.run = false;

        localStorage.setItem("health", this.health);
        localStorage.setItem("power", this.power);
        localStorage.setItem("time", (performance.now() - this.creationTime).toString());

        window.location = "../html/end.html";
    }
}

export default Player;