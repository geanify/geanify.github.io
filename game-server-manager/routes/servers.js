const express = require('express');
const router = express.Router();

// Create a new CS 1.6 server
router.post('/cs16', async (req, res) => {
    try {
        const { serverId, serverName, maxPlayers, ramLimit, serverPassword } = req.body;
        
        if (!serverId) {
            return res.status(400).json({
                success: false,
                error: 'Server ID is required'
            });
        }

        const config = {
            serverName: serverName || `CS 1.6 Server ${serverId}`,
            maxPlayers: maxPlayers || 16,
            ramLimit: ramLimit || '512m',
            serverPassword: serverPassword || ''
        };

        console.log(`Creating CS 1.6 server for ID ${serverId}`);
        
        const result = await req.dockerService.createCS16Server(serverId, config);
        
        res.json({
            success: true,
            message: 'CS 1.6 server created successfully',
            server: result
        });
        
    } catch (error) {
        console.error('Error creating CS 1.6 server:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create CS 1.6 server'
        });
    }
});

// Start an existing server
router.post('/:serverId/start', async (req, res) => {
    try {
        const serverId = parseInt(req.params.serverId);
        
        if (!serverId) {
            return res.status(400).json({
                success: false,
                error: 'Invalid server ID'
            });
        }

        console.log(`Starting server ${serverId}`);
        
        const result = await req.dockerService.startExistingServer(serverId);
        
        if (result.success) {
            res.json({
                success: true,
                message: `Server ${serverId} started successfully`,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
        
    } catch (error) {
        console.error(`Error starting server ${req.params.serverId}:`, error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to start server'
        });
    }
});

// Stop a server
router.delete('/:serverId', async (req, res) => {
    try {
        const serverId = parseInt(req.params.serverId);
        
        if (!serverId) {
            return res.status(400).json({
                success: false,
                error: 'Invalid server ID'
            });
        }

        console.log(`Stopping server ${serverId}`);
        
        const result = await req.dockerService.stopServer(serverId);
        
        res.json({
            success: true,
            message: `Server ${serverId} stopped successfully`,
            result: result
        });
        
    } catch (error) {
        console.error(`Error stopping server ${req.params.serverId}:`, error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to stop server'
        });
    }
});

// Get server status
router.get('/:serverId/status', async (req, res) => {
    try {
        const serverId = parseInt(req.params.serverId);
        
        if (!serverId) {
            return res.status(400).json({
                success: false,
                error: 'Invalid server ID'
            });
        }

        const status = await req.dockerService.getServerStatus(serverId);
        
        res.json({
            success: true,
            serverId: serverId,
            status: status
        });
        
    } catch (error) {
        console.error(`Error getting server status ${req.params.serverId}:`, error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get server status'
        });
    }
});

// Restart a server
router.post('/:serverId/restart', async (req, res) => {
    try {
        const serverId = parseInt(req.params.serverId);
        
        if (!serverId) {
            return res.status(400).json({
                success: false,
                error: 'Invalid server ID'
            });
        }

        console.log(`Restarting server ${serverId}`);
        
        const result = await req.dockerService.restartServer(serverId);
        
        res.json({
            success: true,
            message: `Server ${serverId} restarted successfully`,
            result: result
        });
        
    } catch (error) {
        console.error(`Error restarting server ${req.params.serverId}:`, error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to restart server'
        });
    }
});

// List all servers
router.get('/', async (req, res) => {
    try {
        const servers = await req.dockerService.listServers();
        
        res.json({
            success: true,
            servers: servers,
            count: servers.length
        });
        
    } catch (error) {
        console.error('Error listing servers:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to list servers'
        });
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Game Server Manager is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

module.exports = router; 