class GameObject {
    ctx;
    x;
    y;

    constructor(ctx, x, y) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
    }

    init() {}

    update() {}

    render() {}

    getHitbox() {}
}

export default GameObject;