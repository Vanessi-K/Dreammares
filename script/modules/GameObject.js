class GameObject {
    ctx;
    x;
    y;
    width;
    height;

    constructor(ctx, x, y, width, height) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    init() {}

    update() {}

    render() {

    }

    getHitBox() {
        return {
            x: this.x,
            y: this.y,
            w: this.width,
            h: this.height
        }
    }

    drawHitBox() {
        //debug bounding box
        let hitBox = this.getHitBox();
        this.ctx.translate(hitBox.x, hitBox.y);
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(0, 0, hitBox.w, hitBox.h);
        this.ctx.resetTransform();
    }
}

export default GameObject;