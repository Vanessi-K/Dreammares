import CONFIG from "./CONFIG.js";

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

    //on which side is objectB hitting objectA
    getCollisionDirection() {
        //Make checks on which side the object is hit; highest distance an object can intersect is by the half of
        let objectAHit = this.objectA.getHitBox();
        let objectBHit = this.objectB.getHitBox();

        let hitRight = Math.abs(objectAHit.x - objectBHit.x) <= objectAHit.w && (objectAHit.x - objectBHit.x) < -(objectAHit.w - objectBHit.w);
        let hitBottom = Math.abs(objectAHit.y - objectBHit.y) <= objectAHit.h && (objectAHit.y - objectBHit.y) < -(objectAHit.h - objectBHit.h);
        let hitLeft =  Math.abs(objectAHit.x - objectBHit.x) <= objectBHit.w && (objectAHit.x - objectBHit.x) < CONFIG.tileSize/2;
        let hitTop =  Math.abs(objectAHit.y - objectBHit.y) <= objectBHit.h;

        //Check if object is intersecting with the player on a corner, that means two expressions are true
        if(!((hitLeft && hitTop) || (hitTop && hitRight) || (hitRight && hitBottom) || (hitBottom && hitLeft))) {
            if(hitRight) { return "right"; }
            if(hitBottom) { return "bottom"; }
            if(hitLeft) { return "left"; }
            if(hitTop) { return "top"; }
        }

        return null;
    }


}

export default Collision;