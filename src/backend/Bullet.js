const guid = require('uuid/v1');

export default class Bullet {
    constructor(xPos, yPos, angle) {
        this.xPos = 400;
        this.yPos = 400;
        this.angle = 0;
        this.maxSpeed = 2;
        this.id = guid();
    }
}