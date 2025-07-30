const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true
  },
  dialectOptions: {
    // Completely disable foreign key constraints
    foreignKeys: false
  }
});

// Disable foreign keys on connection
sequelize.addHook('afterConnect', async (connection) => {
  await connection.exec('PRAGMA foreign_keys = OFF;');
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection
}; 