const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  sender_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Message;
