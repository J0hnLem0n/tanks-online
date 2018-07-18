import * as PIXI from 'pixi.js'
import { isEqual } from 'lodash'
import { PLAYER_ACTIONS, KEYBOARD_CODES, WS_CLIENT_ACTIONS, WS_SERVER_ACTIONS } from '../utils/constants'
import tankImage from './assests/tank.png'
import bulletImage from './assests/bullet.png'

import { get } from 'lodash'

const Application = PIXI.Application;
const loader = PIXI.loader;
const resources = loader.resources;
const Sprite = PIXI.Sprite;

export default class Player {
    constructor(socketService) {
        this.id = null;
        this.app = null;
        this.tank = null;
        this.playerList = new Map();
        // this.bulletList = new Map();
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
    initialPlayerList(playersList) {
        this.playerList = new Map(playersList);
        /**TODO как то костыльно добавлять тут bulletList*/
        this.playerList.forEach((player, playerKey, playerMap) => {
            player.bulletList = new Map ()
        });
    }
    setup(data) {
        const { id, xPos, yPos, playersList } = data;
        this.id = id;
        this.initialPlayerList(playersList);

        const setup = ()=> {
            this.playerList.forEach((val, key, map) => {
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
                    this.playerList.forEach((player, playerKey, playerMap) => {
                        if(player.sprite) {
                            const {xPos, yPos, angle, bulletList} = mapData.get(playerKey);
                            player.sprite.x = xPos;
                            player.sprite.y = yPos;

                            player.sprite.rotation = angle;

                            /** Пока какое то костыльное решение*/
                            const bullets = new Map([...bulletList]);
                            bullets.forEach((bullet, bulletKey, map) => {
                                const existBullet = player.bulletList.get(bulletKey);
                                console.log()
                                if (get(existBullet, 'sprite')) {
                                    existBullet.sprite.x = bullets.get(bulletKey).xPos;
                                    existBullet.sprite.y = bullets.get(bulletKey).yPos;
                                    existBullet.sprite.rotation = bullets.get(bulletKey).angle;
                                }
                                else {
                                    bullet.sprite = new Sprite(resources[bulletImage].texture);
                                    bullet.sprite.x = xPos;
                                    bullet.sprite.y = yPos;
                                    bullet.sprite.anchor = {x: 0.5, y: 0.5};
                                    this.app.stage.addChild(bullet.sprite);

                                    player.bulletList.set(bulletKey, bullet);
                                    console.log(this.bulletList)
                                };
                            });
                        }
                    });
                    break;
                case WS_SERVER_ACTIONS.NEW_PLAYER:
                    /**TODO: get и сразу set как то странно подумать над решением, может set уже возвращает*/
                    this.playerList.set(DATA.id, DATA);
                    let newEnemy = this.playerList.get(DATA.id);
                    newEnemy.sprite = new Sprite(resources[tankImage].texture);
                    newEnemy.sprite.x = xPos;
                    newEnemy.sprite.y = yPos;
                    newEnemy.sprite.scale.x = 0.2;
                    newEnemy.sprite.scale.y  = 0.2;
                    newEnemy.sprite.anchor = {x: 0.5, y: 0.5};
                    /**TODO как то костыльно добавлять тут bulletList*/
                    newEnemy.bulletList = new Map ()
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