import GameManager from './GameManager'

const WebSocket = require('ws');
const guid = require('uuid/v1');

export default class WSService {
    constructor() {
        /**Прокинуть порт в константы*/
        this.socket = new WebSocket.Server({ port: 7000 });
    }

    sentMessageSingleClient(client, data) {
        client.send(JSON.stringify(data));
    }
    sendBroadcastMessage(msg) {
        this.socket.clients.forEach((client)=>{
            client.send(JSON.stringify(msg));
        })
    }
}

