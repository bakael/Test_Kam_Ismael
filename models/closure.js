const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Closure = sequelize.define('Closure', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  closure_reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  closed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Closure;
