import {PLAYER_ACTIONS} from "../utils/constants";
import Bullet from '../backend/Bullet'

export default class Player {
    constructor(id) {
        this.xPos = 400;
        this.yPos = 400;
        this.angle = 0;
        this.maxSpeed = 2;
        this.maxSpeedAngle = 5;
        this.maxSpeedBullet = 10;
        /**TODO: Подумать куда лучше запихнуть id тут или на клиенте*/
        this.id = id;
        this.playerMoves = PLAYER_ACTIONS;
        this.bulletList = new Map();
    }
    moveUp() {
        this.xPos += this.maxSpeed * Math.sin(this.angle);
        this.yPos -= this.maxSpeed * Math.cos(this.angle);
    }
    moveLeft() {
        this.angle -= this.maxSpeedAngle / 100;
    }
    moveRight() {
        this.angle += this.maxSpeedAngle /100;
    }
    moveDown() {
        this.xPos -= this.maxSpeed * Math.sin(this.angle);
        this.yPos += this.maxSpeed * Math.cos(this.angle);
    }
    shoot() {
        const bullet = new Bullet();
        bullet.angle = this.angle;
        bullet.xPos = this.xPos;
        bullet.yPos = this.yPos;
        this.bulletList.set(bullet.id, bullet)
    }
    updateBullets() {
        this.bulletList.forEach((bullet, key, myMap) => {
            bullet.xPos += this.maxSpeedBullet * Math.sin(bullet.angle);
            bullet.yPos -= this.maxSpeedBullet * Math.cos(bullet.angle);
        });
    }
}