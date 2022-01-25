import Boundary from "./Boundary.js";
import CONFIG from "./CONFIG.js";
import Collision from "./Collision.js";

class Borders {

    borderTop;
    borderBottom;

    constructor(ctx) {
        this.borderTop = new Boundary(ctx, -200, 0, CONFIG.lastColumn * CONFIG.tileSize + 200, CONFIG.topOffset);
        this.borderBottom = new Boundary(ctx, -200, CONFIG.height - CONFIG.bottomOffset, CONFIG.lastColumn * CONFIG.tileSize + 200, CONFIG.bottomOffset);
    }

    update(player) {
        this.getBorders().forEach((gameBorder) => {
            gameBorder.update();
            let collision = new Collision(player, gameBorder)
            if (collision.isColliding()) {
                collision.getCollisionDirection();
            }
        });
    }

    render() {
        this.borderTop.render();
        this.borderBottom.render();
    }

    getBorders() {
        return [this.borderTop, this.borderBottom]
    }

}

export default Borders;