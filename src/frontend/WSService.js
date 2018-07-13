const CONNECTION_SOCKET_URL = 'ws://172.31.41.62:7000/ws'

export default class WSService {
    constructor(socket) {
        this.socket = new WebSocket(CONNECTION_SOCKET_URL);
    }
    sendMessage(msg) {
        this.socket.send(JSON.stringify(msg));
    }
}