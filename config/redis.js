const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

redisClient.on('connect', () => {
  console.log('Connecté à Redis');
});

redisClient.on('error', (err) => {
  console.error('Erreur Redis:', err);
});

module.exports = redisClient;
