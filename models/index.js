const sequelize = require('../config/database');

const Agent = require('./agent');
const Conversation = require('./conversation');
const Message = require('./message');
const Assignment = require('./assignment');
const Closure = require('./closure');
const Channel = require('./channel');

// Associations
Conversation.belongsTo(Channel, { foreignKey: 'channel_id' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });
Assignment.belongsTo(Conversation, { foreignKey: 'conversation_id' });
Assignment.belongsTo(Agent, { foreignKey: 'agent_id' });
Closure.belongsTo(Conversation, { foreignKey: 'conversation_id' });

// Sync avec la base de données
sequelize.sync({ alter: true })
  .then(() => console.log('Base de données synchronisée'))
  .catch(error => console.log('Erreur de synchronisation:', error));

module.exports = {
  Agent,
  Conversation,
  Message,
  Assignment,
  Closure,
  Channel,
  sequelize
};
