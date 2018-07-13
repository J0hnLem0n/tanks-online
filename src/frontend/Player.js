import * as PIXI from 'pixi.js'
import { isEqual } from 'lodash'
import { PLAYER_ACTIONS, KEYBOARD_CODES, WS_CLIENT_ACTIONS, WS_SERVER_ACTIONS } from '../utils/constants'
import tankImage from './assests/tank.png'
import GameManager from "./GameManager";

const Application = PIXI.Application;
const loader = PIXI.loader;
const resources = loader.resources;
const Sprite = PIXI.Sprite;

export default class Player {
    constructor(socketService) {
        this.id = null;
        this.app = null;
        this.tank = null;
        this.socketService = socketService;
        this.previousPlayerMoveObject = {};
        this.playerMoves = PLAYER_ACTIONS;
    }
    init() {
        this.addKeyboardListeners()
            .addPixiApp()
            .addedSocketHandlers();
        return this;
    }
    addPixiApp() {
        this.app = new Application({
                width: 1024,
                height: 1024,
                antialias: true,
                transparent: false,
                resolution: 1
            }
        );
        document.body.appendChild(this.app.view);
        return this;
    }
    setup(data) {
        const {id, xPos, yPos} = data;
        this.id = id;
        const setup = ()=> {
            this.tank = new Sprite(resources[tankImage].texture);
            this.tank.x = xPos;
            this.tank.y = yPos;
            this.app.stage.addChild(this.tank);
        };
        loader
            .add(tankImage)
            .load(setup);

        return this;
    }
    addedSocketHandlers() {
        this.socketService.socket.onopen = (data) => {
            console.log("Соединение установлено.", data);
        };
        this.socketService.socket.onmessage = (event) => {
            const { ACTION, DATA } = JSON.parse(event.data);
            /**TODO: своеобразный подход, проверить new Map([...DATA])*/
            const mapData = new Map([...DATA])

            switch(ACTION) {
                case WS_SERVER_ACTIONS.INITIAL_PLAYER:
                    this.setup(DATA);
                    break;
                case WS_SERVER_ACTIONS.UPDATE_PLAYERS:
                    let { yPos } = mapData.get(this.id);
                    this.tank && mapData.get(this.id) ? this.tank.y = yPos : null;
                    break;
                default:
                    console.info('received: %s', event.data);
            }
        };
        return this;
    }
    move() {
        if(isEqual(this.previousPlayerMoveObject, this.playerMoves)) return;
        this.previousPlayerMoveObject = {...this.playerMoves};

        const msg = {
            SENDER_ID: this.id,
            ACTION: WS_CLIENT_ACTIONS.CLIENT_MOVE,
            DATA: this.playerMoves
        };
        this.socketService.sendMessage(msg)
    }
    addKeyboardListeners() {
        window.addEventListener(
            "keydown", (a)=>{
                switch (a.keyCode) {
                    case KEYBOARD_CODES.UP:
                        this.playerMoves.UP = true;
                        this.move();
                        console.log('UP', this.playerMoves);
                        break;
                    case KEYBOARD_CODES.DOWN:
                        this.playerMoves.DOWN = true;
                        console.log('DOWN', this.playerMoves);
                        break;
                    case KEYBOARD_CODES.RIGHT:
                        this.playerMoves.RIGHT = true;
                        console.log('RIGHT', this.playerMoves);
                        break;
                    case KEYBOARD_CODES.LEFT:
                        this.playerMoves.LEFT = true;
                        console.log('LEFT', this.playerMoves);
                        break;
                    default: console.log(a.keyCode)
                }
            }, false
        );
        window.addEventListener(
            "keyup", (a)=>{
                switch (a.keyCode) {
                    case KEYBOARD_CODES.UP:
                        this.playerMoves.UP = false;
                        this.move();
                        console.log('UP', this.playerMoves);
                        break;
                    case KEYBOARD_CODES.DOWN:
                        this.playerMoves.DOWN = false;
                        console.log('DOWN', this.playerMoves);
                        break;
                    case KEYBOARD_CODES.RIGHT:
                        this.playerMoves.RIGHT = false;
                        console.log('RIGHT', this.playerMoves);
                        break;
                    case KEYBOARD_CODES.LEFT:
                        this.playerMoves.LEFT = false;
                        console.log('LEFT', this.playerMoves);
                        break;
                    default: console.log(a.keyCode)
                }
            }, false
        );
        return this;
    }
}