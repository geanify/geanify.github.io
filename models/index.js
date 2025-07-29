const User = require('./User');
const Server = require('./Server');

// Define relationships
User.hasMany(Server, {
  foreignKey: 'user_email',
  sourceKey: 'email',
  as: 'servers'
});

Server.belongsTo(User, {
  foreignKey: 'user_email',
  targetKey: 'email',
  as: 'user'
});

module.exports = {
  User,
  Server
}; 