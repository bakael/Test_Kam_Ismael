const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  agent_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assigned_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  closed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Assignment;
