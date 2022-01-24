import CONFIG from "./CONFIG.js";
import Player from "./Player.js";

class Collision {

    objectA;
    objectB;

    constructor(objectA, objectB) {
        this.objectA = objectA;
        this.objectB = objectB;
    }

    isColliding() {
        let hbA = this.objectA.getHitBox();
        let hbB = this.objectB.getHitBox();

        //return if objects hit each other or not
        return hbA.x < hbB.x + hbB.w &&
            hbA.x + hbA.w > hbB.x &&
            hbA.y < hbB.y + hbB.h &&
            hbA.y + hbA.h > hbB.y;
    }

    //on which side is objectB hitting objectA when object a is a player
    getCollisionDirection() {
        if(!(this.objectA instanceof Player)) {
            return null;
        }

        //Make checks on which side the object is hit; highest distance an object can intersect is by the half of
        let objectAHit = this.objectA.getHitBox();
        let objectBHit = this.objectB.getHitBox();

        let rightDistance = objectAHit.x - objectBHit.x
        let bottomDistance = objectAHit.y - objectBHit.y
        let leftDistance = objectAHit.x - objectBHit.x
        let topDistance = objectAHit.y - objectBHit.y

        //check if intersecting                                 check if object is already fully inside the player
        let hitRight = Math.abs(rightDistance) <= objectAHit.w && (rightDistance) < -(objectAHit.w - objectBHit.w) && (rightDistance) < 0;
        //                                                      check if object is already fully inside the player
        let hitBottom = Math.abs(bottomDistance) <= objectAHit.h && (bottomDistance) < -(objectAHit.h - objectBHit.h) && (bottomDistance) < 0;
        let hitLeft =  Math.abs(leftDistance) <= objectBHit.w && (leftDistance) < CONFIG.tileSize && (leftDistance) > 0;
        let hitTop =  Math.abs(topDistance) <= objectBHit.h && (topDistance) < CONFIG.tileSize && (topDistance) > 0;

        let twoDirections = ((hitLeft && hitTop) || (hitTop && hitRight) || (hitRight && hitBottom) || (hitBottom && hitLeft))

        //Check if object is intersecting with the player on a corner, that means two expressions are true

        if(!twoDirections) {
            if(hitRight) { CONFIG.allowKey.right = false; }
            if(hitBottom) { CONFIG.allowKey.bottom = false; }
            if(hitLeft) { CONFIG.allowKey.left = false; }
            if(hitTop) { CONFIG.allowKey.top = false; }
        }


        return null;
    }
}

export default Collision;