const { User, Server } = require('../models');

class UserService {
  // Find or create user from Google OAuth profile
  static async findOrCreateUser(googleProfile) {
    try {
      const userData = {
        google_id: googleProfile.id,
        email: googleProfile.emails && googleProfile.emails[0] ? googleProfile.emails[0].value : null,
        name: googleProfile.displayName || 'Unknown User',
        picture: googleProfile.photos && googleProfile.photos[0] ? googleProfile.photos[0].value : null,
        last_login: new Date()
      };

      if (!userData.email) {
        throw new Error('Email is required from Google profile');
      }

      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });

      // Update user info if they already exist
      if (!created) {
        await user.update({
          name: userData.name,
          picture: userData.picture,
          last_login: userData.last_login
        });
      }

      return user;
    } catch (error) {
      console.error('Error in findOrCreateUser:', error);
      throw error;
    }
  }

  // Get user by email
  static async getUserByEmail(email) {
    try {
      return await User.findOne({
        where: { email },
        include: [{
          model: Server,
          as: 'servers'
        }]
      });
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      throw error;
    }
  }

  // Get user's servers
  static async getUserServers(email) {
    try {
      return await Server.findAll({
        where: { user_email: email },
        order: [['created_at', 'DESC']]
      });
    } catch (error) {
      console.error('Error in getUserServers:', error);
      throw error;
    }
  }

  // Create a new server for user
  static async createServer(email, serverData) {
    try {
      return await Server.create({
        user_email: email,
        ...serverData
      });
    } catch (error) {
      console.error('Error in createServer:', error);
      throw error;
    }
  }

  // Update server
  static async updateServer(serverId, email, updateData) {
    try {
      const server = await Server.findOne({
        where: { 
          id: serverId,
          user_email: email 
        }
      });

      if (!server) {
        throw new Error('Server not found or not owned by user');
      }

      await server.update(updateData);
      return server;
    } catch (error) {
      console.error('Error in updateServer:', error);
      throw error;
    }
  }

  // Delete server
  static async deleteServer(serverId, email) {
    try {
      const result = await Server.destroy({
        where: { 
          id: serverId,
          user_email: email 
        }
      });

      if (result === 0) {
        throw new Error('Server not found or not owned by user');
      }

      return true;
    } catch (error) {
      console.error('Error in deleteServer:', error);
      throw error;
    }
  }
}

module.exports = UserService; 