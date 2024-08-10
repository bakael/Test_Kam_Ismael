const redisClient = require('../config/redis');

// Fonction pour vérifier le statut d'un agent 
//Pourra apres etre adapter pour plus de type d'utilisateur
function getAgentStatus(agentId, callback) {
  redisClient.hget('agents', agentId, (err, status) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, status);
  });
}

module.exports = {
  getAgentStatus
};
