const CONNECTION_SOCKET_URL = 'ws://localhost:7000/ws'

export default class WSService {
    constructor(socket) {
        this.socket = new WebSocket(CONNECTION_SOCKET_URL);
    }
    sendMessage(msg) {
        this.socket.send(JSON.stringify(msg));
    }
}