const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Server = sequelize.define('Server', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_email: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'email'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  game_type: {
    type: DataTypes.ENUM('minecraft', 'cs16', 'tf2'),
    allowNull: false
  },
  plan: {
    type: DataTypes.ENUM('starter', 'gaming_pro', 'elite'),
    allowNull: false,
    defaultValue: 'starter'
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'pending', 'terminated'),
    allowNull: false,
    defaultValue: 'pending'
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIP: true
    }
  },
  port: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1024,
      max: 65535
    }
  },
  max_players: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    validate: {
      min: 1,
      max: 200
    }
  },
  ram_gb: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 64
    }
  },
  monthly_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 3.99
  },
  next_billing_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  server_config: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'servers',
  indexes: [
    {
      fields: ['user_email']
    },
    {
      fields: ['game_type']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Server; 