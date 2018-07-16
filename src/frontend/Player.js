import * as PIXI from 'pixi.js'
import { isEqual } from 'lodash'
import { PLAYER_ACTIONS, KEYBOARD_CODES, WS_CLIENT_ACTIONS, WS_SERVER_ACTIONS } from '../utils/constants'
import tankImage from './assests/tank.png'
import bulletImage from './assests/bullet.png'

const Application = PIXI.Application;
const loader = PIXI.loader;
const resources = loader.resources;
const Sprite = PIXI.Sprite;

export default class Player {
    constructor(socketService) {
        this.id = null;
        this.app = null;
        this.tank = null;
        this.enemyList = null;
        this.bulletList = new Map();
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
                resolution: 1,
                forceCanvas: true
            }
        );
        document.body.appendChild(this.app.view);
        return this;
    }
    initialEnemyList(playersList) {
        this.enemyList = new Map(playersList);
        this.enemyList.delete(this.id);
    }
    setup(data) {
        const { id, xPos, yPos, playersList } = data;
        this.id = id;
        this.initialEnemyList(playersList);

        const setup = ()=> {
            this.tank = new Sprite(resources[tankImage].texture);
            this.tank.x = xPos;
            this.tank.y = yPos;
            this.tank.scale.x = 0.2;
            this.tank.scale.y  = 0.2;
            this.tank.anchor = {x: 0.5, y: 0.5};
            this.app.stage.addChild(this.tank);

            this.enemyList.forEach((val, key, map) => {
                const { id, xPos, yPos } = val;
                val.sprite = new Sprite(resources[tankImage].texture);
                val.sprite.x = xPos;
                val.sprite.y = yPos;
                val.sprite.scale.x = 0.2;
                val.sprite.scale.y  = 0.2;
                val.sprite.anchor = {x: 0.5, y: 0.5};
                this.app.stage.addChild(val.sprite);
            });
        };
        loader
            .add(tankImage)
            .add(bulletImage)
            .load(setup);

        return this;
    }
    addedSocketHandlers() {
        this.socketService.socket.onopen = (data) => {
            console.log("Соединение установлено.", data);
        };
        this.socketService.socket.onmessage = (event) => {
            const { ACTION, DATA } = JSON.parse(event.data);

            switch(ACTION) {
                case WS_SERVER_ACTIONS.INITIAL_PLAYER:
                    this.setup(DATA);
                    break;
                case WS_SERVER_ACTIONS.UPDATE_PLAYERS:
                    /**TODO: своеобразный подход, проверить new Map([...DATA])*/
                    const mapData = new Map([...DATA]);
                    let { xPos, yPos, angle, bulletList } = mapData.get(this.id);
                    this.tank && mapData.get(this.id) ? this.tank.y = yPos : null;
                    this.tank && mapData.get(this.id) ? this.tank.x = xPos : null;
                    this.tank && mapData.get(this.id) ? this.tank.rotation = angle : null;

                    /** Пока какое то костыльное решение*/
                    const bullets = new Map([...bulletList]);
                    bullets.forEach((val, key, map) => {
                        if (!this.bulletList.get(key)) {
                            val.sprite = new Sprite(resources[bulletImage].texture);
                            val.sprite.x = xPos;
                            val.sprite.y = yPos;
                            val.sprite.anchor = {x: 0.5, y: 0.5};
                            this.app.stage.addChild(val.sprite);

                            this.bulletList.set(key, val);
                            console.log(this.bulletList)
                        }
                        else {
                            const bullet = this.bulletList.get(key);
                            bullet.sprite.x = bullets.get(key).xPos;
                            bullet.sprite.y = bullets.get(key).yPos;
                            bullet.sprite.rotation = bullets.get(key).angle;
                        };
                    });
                    // console.log(bullets)

                    this.enemyList.forEach((val, key, map) => {
                        if(val.sprite) {
                            const {xPos, yPos, angle} = mapData.get(key);
                            val.sprite.x = xPos;
                            val.sprite.y = yPos;
                            val.sprite.rotation = angle;
                        }
                    });
                    break;
                case WS_SERVER_ACTIONS.NEW_PLAYER:
                    /**TODO: get и сразу set как то странно подумать над решением, может set уже возвращает*/
                    this.enemyList.set(DATA.id, DATA);
                    let newEnemy = this.enemyList.get(DATA.id);
                    newEnemy.sprite = new Sprite(resources[tankImage].texture);
                    newEnemy.sprite.x = xPos;
                    newEnemy.sprite.y = yPos;
                    newEnemy.sprite.scale.x = 0.2;
                    newEnemy.sprite.scale.y  = 0.2;
                    newEnemy.sprite.anchor = {x: 0.5, y: 0.5};
                    this.app.stage.addChild(newEnemy.sprite);
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
    shot(event) {
        const msg = {
            SENDER_ID: this.id,
            ACTION: WS_CLIENT_ACTIONS.CLIENT_SHOT,
            DATA: event
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
                        break;
                    case KEYBOARD_CODES.DOWN:
                        this.playerMoves.DOWN = true;
                        this.move();
                        break;
                    case KEYBOARD_CODES.RIGHT:
                        this.playerMoves.RIGHT = true;
                        this.move();
                        break;
                    case KEYBOARD_CODES.LEFT:
                        this.playerMoves.LEFT = true;
                        this.move();
                        break;
                    default:
                }
            }, false
        );
        window.addEventListener(
            "keyup", (a)=>{
                switch (a.keyCode) {
                    case KEYBOARD_CODES.UP:
                        this.playerMoves.UP = false;
                        this.move();
                        break;
                    case KEYBOARD_CODES.DOWN:
                        this.playerMoves.DOWN = false;
                        this.move();
                        break;
                    case KEYBOARD_CODES.RIGHT:
                        this.playerMoves.RIGHT = false;
                        this.move();
                        break;
                    case KEYBOARD_CODES.LEFT:
                        this.playerMoves.LEFT = false;
                        this.move();
                        break;
                    default:
                }
            }, false
        );
        window.addEventListener(
            "click", event => {
                this.shot(event)
            },
            false
        );
        return this;
    }
}