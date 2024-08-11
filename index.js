const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const http = require('http');

const { sequelize } = require('./models');
const agentRoutes = require('./routes/agent');
const conversationRoutes = require('./routes/conversation');

const { wss } = require('./websocket');

const app = express();
app.use(bodyParser.json());

// Routes
app.use('/agents', agentRoutes);
app.use('/conversations', conversationRoutes);
app.use('/messages', messageRoutes);

// Routes de base
app.get('/', (req, res) => {
  res.send("Welcome to the Omnicanal KAMGOKO's API");
});

//Websocket
const server = http.createServer(app);

server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});


// Synchroniser la base de données et démarrer le serveur
sequelize.sync()
  .then(() => {
    app.listen(3000, () => {
      console.log('Serveur démarré sur le port 3000');
    });
  })
  .catch(error => {
    console.error('Erreur lors de la synchronisation de la base de données :', error);
  });
