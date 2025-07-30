const express = require('express');
const { requireAuthAPI } = require('../middleware/auth');
const UserService = require('../services/userService');
const GameServerService = require('../services/gameServerService');
const router = express.Router();

// Initialize game server service
const gameServerService = new GameServerService();

// Apply authentication middleware to all API routes
router.use(requireAuthAPI);

// Get user's servers
router.get('/servers', async (req, res) => {
  try {
    const servers = await UserService.getUserServers(req.user.email);
    
    // For CS 1.6 servers, also get real-time status from game server manager
    const serversWithStatus = await Promise.all(
      servers.map(async (server) => {
        if (server.game_type === 'cs16' && server.status === 'active') {
          try {
            const statusResult = await gameServerService.getServerStatus(server.id);
            if (statusResult.success) {
              return {
                ...server.toJSON(),
                realTimeStatus: statusResult.data.status,
                connectionInfo: statusResult.data.port ? {
                  host: process.env.GAME_SERVER_HOST || 'localhost',
                  port: statusResult.data.port,
                  connectionString: `${process.env.GAME_SERVER_HOST || 'localhost'}:${statusResult.data.port}`
                } : null
              };
            }
          } catch (error) {
            console.error(`Error getting real-time status for server ${server.id}:`, error);
          }
        }
        return server.toJSON();
      })
    );
    
    res.json({
      success: true,
      servers: serversWithStatus
    });
  } catch (error) {
    console.error('Error fetching servers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch servers'
    });
  }
});

// Create a new server
router.post('/servers', async (req, res) => {
  try {
    const { name, game_type, max_players, server_password } = req.body;
    
    // Validate required fields
    if (!name || !game_type) {
      return res.status(400).json({
        success: false,
        error: 'Name and game_type are required'
      });
    }

    const serverData = {
      name,
      game_type,
      plan: 'starter', // Default plan
      max_players: max_players || 10,
      ram_gb: 1, // Default RAM
      monthly_price: 3.99, // Default price
      status: 'pending'
    };

    // Create server record in database
    const server = await UserService.createServer(req.user.email, serverData);
    
    // For CS 1.6 servers, also create Docker container
    if (game_type === 'cs16') {
      try {
        console.log(`Creating CS 1.6 Docker container for server ${server.id}`);
        
        const gameServerConfig = {
          serverName: name,
          maxPlayers: max_players || 16,
          ramLimit: '1g', // Default RAM
          serverPassword: server_password || ''
        };
        
        const dockerResult = await gameServerService.createCS16Server(server.id, gameServerConfig);
        
        if (dockerResult.success) {
          // Update server status to active and add connection info
          const updateData = {
            status: 'active',
            ip_address: process.env.GAME_SERVER_HOST || 'localhost',
            port: dockerResult.data.port
          };
          
          const updatedServer = await UserService.updateServer(server.id, req.user.email, updateData);
          
          res.status(201).json({
            success: true,
            server: {
              ...updatedServer.toJSON(),
              connectionInfo: {
                host: updateData.ip_address,
                port: updateData.port,
                connectionString: `${updateData.ip_address}:${updateData.port}`
              }
            },
            message: 'CS 1.6 server created and deployed successfully'
          });
        } else {
          // Docker creation failed, update server status to error
          await UserService.updateServer(server.id, req.user.email, { 
            status: 'error',
            server_config: JSON.stringify({ error: dockerResult.error })
          });
          
          res.status(500).json({
            success: false,
            error: `Server created but deployment failed: ${dockerResult.error}`,
            server: server
          });
        }
      } catch (error) {
        console.error('Error deploying CS 1.6 server:', error);
        
        // Update server status to error
        await UserService.updateServer(server.id, req.user.email, { 
          status: 'error',
          server_config: JSON.stringify({ error: error.message })
        });
        
        res.status(500).json({
          success: false,
          error: `Server created but deployment failed: ${error.message}`,
          server: server
        });
      }
    } else {
      // For non-CS16 servers, just return the created server
      res.status(201).json({
        success: true,
        server: server
      });
    }
  } catch (error) {
    console.error('Error creating server:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create server'
    });
  }
});

// Update server
router.put('/servers/:id', async (req, res) => {
  try {
    const serverId = req.params.id;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.user_email;
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;

    const server = await UserService.updateServer(serverId, req.user.email, updateData);
    
    res.json({
      success: true,
      server: server
    });
  } catch (error) {
    console.error('Error updating server:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update server'
    });
  }
});

// Delete server
router.delete('/servers/:id', async (req, res) => {
  try {
    const serverId = req.params.id;
    
    // Get server info before deletion
    const servers = await UserService.getUserServers(req.user.email);
    const server = servers.find(s => s.id === parseInt(serverId));
    
    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Server not found'
      });
    }
    
    // For CS 1.6 servers, also stop Docker container
    if (server.game_type === 'cs16' && server.status === 'active') {
      try {
        console.log(`Stopping CS 1.6 Docker container for server ${serverId}`);
        const dockerResult = await gameServerService.stopServer(parseInt(serverId));
        
        if (!dockerResult.success) {
          console.error(`Failed to stop Docker container for server ${serverId}:`, dockerResult.error);
          // Continue with deletion even if Docker stop fails
        }
      } catch (error) {
        console.error(`Error stopping Docker container for server ${serverId}:`, error);
        // Continue with deletion even if Docker stop fails
      }
    }
    
    // Delete server from database
    await UserService.deleteServer(serverId, req.user.email);
    
    res.json({
      success: true,
      message: 'Server deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting server:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete server'
    });
  }
});

// Start/Stop server actions
router.post('/servers/:id/start', async (req, res) => {
  try {
    const serverId = parseInt(req.params.id);
    
    // Get server info
    const servers = await UserService.getUserServers(req.user.email);
    const server = servers.find(s => s.id === serverId);
    
    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Server not found'
      });
    }
    
    if (server.game_type === 'cs16') {
      const gameServerConfig = {
        serverName: server.name,
        maxPlayers: server.max_players,
        ramLimit: `${server.ram_gb}g`
      };
      
      const result = await gameServerService.startServer(serverId, 'cs16', gameServerConfig);
      
      if (result.success) {
        // Update server status
        await UserService.updateServer(serverId, req.user.email, { 
          status: 'active',
          ip_address: process.env.GAME_SERVER_HOST || 'localhost',
          port: result.data.port
        });
        
        res.json({
          success: true,
          message: 'Server started successfully',
          connectionInfo: {
            host: process.env.GAME_SERVER_HOST || 'localhost',
            port: result.data.port
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: 'Server type not supported for start/stop operations'
      });
    }
  } catch (error) {
    console.error('Error starting server:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start server'
    });
  }
});

router.post('/servers/:id/stop', async (req, res) => {
  try {
    const serverId = parseInt(req.params.id);
    
    // Get server info
    const servers = await UserService.getUserServers(req.user.email);
    const server = servers.find(s => s.id === serverId);
    
    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Server not found'
      });
    }
    
    if (server.game_type === 'cs16') {
      const result = await gameServerService.stopServer(serverId);
      
      if (result.success) {
        // Update server status
        await UserService.updateServer(serverId, req.user.email, { 
          status: 'stopped',
          port: null
        });
        
        res.json({
          success: true,
          message: 'Server stopped successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: 'Server type not supported for start/stop operations'
      });
    }
  } catch (error) {
    console.error('Error stopping server:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop server'
    });
  }
});

router.post('/servers/:id/restart', async (req, res) => {
  try {
    const serverId = parseInt(req.params.id);
    
    // Get server info
    const servers = await UserService.getUserServers(req.user.email);
    const server = servers.find(s => s.id === serverId);
    
    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Server not found'
      });
    }
    
    if (server.game_type === 'cs16') {
      const result = await gameServerService.restartServer(serverId);
      
      res.json({
        success: result.success,
        message: result.success ? 'Server restarted successfully' : result.error
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Server type not supported for restart operations'
      });
    }
  } catch (error) {
    console.error('Error restarting server:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restart server'
    });
  }
});

// Get server status
router.get('/servers/:id/status', async (req, res) => {
  try {
    const serverId = parseInt(req.params.id);
    
    // Get server info
    const servers = await UserService.getUserServers(req.user.email);
    const server = servers.find(s => s.id === serverId);
    
    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Server not found'
      });
    }
    
    if (server.game_type === 'cs16' && server.status === 'active') {
      const result = await gameServerService.getServerStatus(serverId);
      
      if (result.success) {
        res.json({
          success: true,
          status: result.data,
          connectionInfo: result.data.port ? {
            host: process.env.GAME_SERVER_HOST || 'localhost',
            port: result.data.port,
            connectionString: `${process.env.GAME_SERVER_HOST || 'localhost'}:${result.data.port}`
          } : null
        });
      } else {
        res.json({
          success: false,
          error: result.error
        });
      }
    } else {
      res.json({
        success: true,
        status: {
          status: server.status,
          message: 'Server is not actively running'
        }
      });
    }
  } catch (error) {
    console.error('Error getting server status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get server status'
    });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const servers = await UserService.getUserServers(req.user.email);
    
    // Check game server manager health
    const gameServerHealth = await gameServerService.checkHealth();
    
    const stats = {
      totalServers: servers.length,
      activeServers: servers.filter(s => s.status === 'active').length,
      pendingServers: servers.filter(s => s.status === 'pending').length,
      totalMonthlyPrice: servers.reduce((sum, s) => sum + parseFloat(s.monthly_price), 0).toFixed(2),
      gameServerManagerStatus: gameServerHealth.success ? 'healthy' : 'unavailable'
    };
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats'
    });
  }
});

module.exports = router; 