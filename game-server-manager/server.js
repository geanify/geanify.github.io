require('dotenv').config();
const express = require('express');
const cors = require('cors');
const DockerService = require('./services/dockerService');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Docker service
const dockerService = new DockerService();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to inject Docker service into requests
app.use((req, res, next) => {
    req.dockerService = dockerService;
    next();
});

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
const serverRoutes = require('./routes/servers');
app.use('/api/servers', serverRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Web Herald Game Server Manager',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/servers/health',
            listServers: 'GET /api/servers',
            createCS16: 'POST /api/servers/cs16',
            stopServer: 'DELETE /api/servers/:serverId',
            serverStatus: 'GET /api/servers/:serverId/status',
            restartServer: 'POST /api/servers/:serverId/restart'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        dockerConnected: dockerService.dockerConnected
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: NODE_ENV === 'development' ? err.message : 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Initialize and start server
const startServer = async () => {
    try {
        // Initialize Docker service (scan for existing containers)
        await dockerService.initialize();
        
        // Start HTTP server
        app.listen(PORT, HOST, () => {
            console.log('🐳 Game Server Manager started successfully!');
            console.log(`🚀 Server running on http://${HOST}:${PORT}`);
            console.log(`📝 Environment: ${NODE_ENV}`);
            console.log(`🎮 Port range: ${process.env.MIN_PORT || 27015}-${process.env.MAX_PORT || 27100}`);
            console.log(`🎯 CS 1.6 Docker Image: ${process.env.CS16_IMAGE || 'cs16ds:latest'}`);
            console.log('');
            console.log('Available endpoints:');
            console.log('  GET  / - API info');
            console.log('  GET  /health - Health check');
            console.log('  GET  /api/servers - List all servers');
            console.log('  POST /api/servers/cs16 - Create CS 1.6 server');
            console.log('  GET  /api/servers/:id/status - Get server status');
            console.log('  POST /api/servers/:id/restart - Restart server');
            console.log('  DELETE /api/servers/:id - Stop and remove server');
        });
        
    } catch (error) {
        console.error('❌ Failed to start Game Server Manager:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('📴 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('📴 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer().catch(error => {
    console.error('💥 Startup error:', error);
    process.exit(1);
}); 