import {PLAYER_ACTIONS} from "../utils/constants";

export default class Player {
    constructor(id) {
        this.xPos = 400;
        this.yPos = 400;
        this.angle = 0;
        /**TODO: Подумать куда лучше запихнуть id тут или на клиенте*/
        this.id = id;
        this.playerMoves = PLAYER_ACTIONS;
    }
}