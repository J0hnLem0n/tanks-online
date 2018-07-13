import {PLAYER_ACTIONS} from "../utils/constants";

export default class Player {
    constructor(id) {
        this.xPos = 400;
        this.yPos = 400;
        this.angle = 0;
        this.maxSpeed = 2;
        this.maxSpeedAngle = 5;
        /**TODO: Подумать куда лучше запихнуть id тут или на клиенте*/
        this.id = id;
        this.playerMoves = PLAYER_ACTIONS;
    }
    /**Умножаем и делим на 100 для угол для pixi :( */
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
}