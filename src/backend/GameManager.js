import WSService from './WSService';
import Player from './Player'
import { WS_CLIENT_ACTIONS, WS_SERVER_ACTIONS } from "../utils/constants";

const WebSocket = require('ws');
const guid = require('uuid/v1');

const FPS = 60;


export default class GameManager {
    constructor() {
        this.socketService = new WSService();
        this.playersList = new Map();
    }

    newGame() {
        this.initHandlerSockets()
            .startTicks();
        console.log('Game Starting...')
    }

    initHandlerSockets() {
        this.socketService.socket.on('connection', (ws) => {
            const playerId = guid();
            const player = new Player(playerId);
            this.playersList.set(playerId, player);

            const msg = {
                ACTION: WS_SERVER_ACTIONS.INITIAL_PLAYER,
                DATA: {...player, playersList: this.playersList}
            };

            this.socketService.sentMessageSingleClient(ws, msg)

            ws.on('message', (message) => {
                const msg = JSON.parse(message);
                const {ACTION, SENDER_ID, DATA} = msg;

                switch (ACTION) {
                    case WS_CLIENT_ACTIONS.CLIENT_MOVE:
                        /**TODO: позырить как покрасивее работать с Map :) */
                        this.playersList.get(SENDER_ID) ? this.playersList.get(SENDER_ID).playerMoves =  DATA : null
                        break;
                    default:
                        console.log('received: %s', message);
                }
            });
        });
        return this;
    }


    startTicks() {
        setInterval(() => {
            this.playersList.forEach((player, key, myMap) => {
                /**TODO: Что то странное с координатами, проверить*/
                player.playerMoves.UP ? player.moveUp() : null;
                player.playerMoves.DOWN ? player.moveDown() : null;
                player.playerMoves.LEFT ? player.moveLeft() : null;
                player.playerMoves.RIGHT ? player.moveRight() : null;
            });
            const msg = {
                ACTION: WS_SERVER_ACTIONS.UPDATE_PLAYERS,
                DATA: this.playersList
            };
            this.socketService.sendBroadcastMessage(msg)
        }, 1000 / FPS);
        return this;
    }
}
