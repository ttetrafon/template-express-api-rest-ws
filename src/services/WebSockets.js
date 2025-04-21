import { WebSocketServer } from 'ws';
import { Logger } from './Logger.js';
import { cli } from 'winston/lib/winston/config/index.js';

export class WebSockets {
  constructor() {
    if (WebSockets._instance) {
      return WebSockets._instance;
    }
    WebSockets._instance = this;

    this.logger = new Logger();
    this.logger.info(`---> WebSockets`);

    this.$wss = null;
    this.$clients = {};
  }

  startWs(server) {
    if (this.$wss) return;

    this.$wss = new WebSocketServer({ server });

    this.$wss.on('connection', (ws, request) => {
      const urlParams = new URLSearchParams(request.url.split('?')[1]);
      let userId = urlParams.get('userId');
      if (!userId) userId = crypto.randomUUID();
      const token = urlParams.get('token');
      console.log(`Client ${userId}:${token} connected`, ws);

      this.$clients[userId] = ws;

      ws.on('message', message => {
        console.log(`Received message: ${message.toString()}`);

        // Echo the message back to the client
        ws.send(`Server received: ${message.toString()}`);
      });

      ws.on('close', () => {
        delete this.$clients[userId];
        console.log('Client disconnected');
      });

      ws.on('error', error => {
        console.error('WebSocket error:', error);
        delete this.$clients[userId];
      });

      // Send a welcome message to the client upon connection
      ws.send(`Welcome to the WebSocket server [${userId}]!`);
    });
  }

  broadcast(message) {
    Object.keys().forEach(userId => {
      let client = this.$clients[userId];
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(`Server broadcast: ${message}`);
      }
    });
  }

  sendMessageToClient(userId, message) {
    let client = this.$clients[userId];
    if (!client) return;

    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    } else {
      this.logger.warn('Client not connected, cannot send message.');
    }
  }
}
