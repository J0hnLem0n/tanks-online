import SocketsManager from "./WSService";
import Player from "./Player"

class GameManager {
    init() {
        this.socket = new SocketsManager();
        this.player = new Player(this.socket);
        this.player.init();
        return this;
    }
}

export default GameManager