class Coordinates {
    ctx;
    x;
    y;
    width;
    height;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getX() {
        return this.x
    }

    getY() {
        return this.y;
    }
}

export default Coordinates;