import GameManager from './GameManager'

const WebSocket = require('ws');
const guid = require('uuid/v1');

export default class WSService {
    constructor() {
        /**Прокинуть порт в константы*/
        this.socket = new WebSocket.Server({ port: 3001 });
    }

    sentMessageSingleClient(client, msg) {
        client.send(JSON.stringify(msg));
    }
    sentMessageEveryoneExceptSender(ws, msg) {
        this.socket.clients.forEach((client)=>{
            if (client !== ws) client.send(JSON.stringify(msg));
        })
    }
    sendBroadcastMessage(msg) {
        this.socket.clients.forEach((client)=>{
            client.send(JSON.stringify(msg));
        })
    }
}

