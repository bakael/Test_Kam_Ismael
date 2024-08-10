const WebSocket = require('ws');
const redisClient = require('./config/redis');

const wss = new WebSocket.Server({ noServer: true });

const clients = new Map();

wss.on('connection', (ws, req) => {
  const agentId = req.url.split('/').pop();
  clients.set(agentId, ws);

  ws.on('message', (message) => {
    console.log(`Message reçu de ${agentId}: ${message}`);
  });

  ws.on('close', () => {
    clients.delete(agentId);
    redisClient.hset('agents', agentId, 'offline');
  });

  redisClient.hset('agents', agentId, 'online');
});

function notifyAgent(agentId, notification) {
  const client = clients.get(agentId);
  if (client) {
    client.send(JSON.stringify(notification));
  } else {
    console.log(`Agent ${agentId} non connecté`);
  }
}

module.exports = { wss, notifyAgent };
