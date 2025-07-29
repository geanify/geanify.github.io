const express = require('express');
const { requireAuthAPI } = require('../middleware/auth');
const UserService = require('../services/userService');
const router = express.Router();

// Apply authentication middleware to all API routes
router.use(requireAuthAPI);

// Get user's servers
router.get('/servers', async (req, res) => {
  try {
    const servers = await UserService.getUserServers(req.user.email);
    res.json({
      success: true,
      servers: servers
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
    const { name, game_type, plan, max_players, ram_gb } = req.body;
    
    // Validate required fields
    if (!name || !game_type || !plan) {
      return res.status(400).json({
        success: false,
        error: 'Name, game_type, and plan are required'
      });
    }

    // Set pricing based on plan
    const pricingMap = {
      'starter': 3.99,
      'gaming_pro': 7.99,
      'elite': 15.99
    };

    const serverData = {
      name,
      game_type,
      plan,
      max_players: max_players || 10,
      ram_gb: ram_gb || 1,
      monthly_price: pricingMap[plan] || 3.99,
      status: 'pending'
    };

    const server = await UserService.createServer(req.user.email, serverData);
    
    res.status(201).json({
      success: true,
      server: server
    });
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

// Get dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const servers = await UserService.getUserServers(req.user.email);
    
    const stats = {
      totalServers: servers.length,
      activeServers: servers.filter(s => s.status === 'active').length,
      pendingServers: servers.filter(s => s.status === 'pending').length,
      totalMonthlyPrice: servers.reduce((sum, s) => sum + parseFloat(s.monthly_price), 0).toFixed(2)
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