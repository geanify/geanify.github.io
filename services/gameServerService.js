const axios = require('axios');

class GameServerService {
    constructor() {
        this.gameServerManagerUrl = process.env.GAME_SERVER_MANAGER_URL || 'http://localhost:3001';
        this.timeout = 30000; // 30 seconds timeout
    }

    // Create CS 1.6 server
    async createCS16Server(serverId, config = {}) {
        try {
            console.log(`Creating CS 1.6 server for ID ${serverId}`);
            
            const response = await axios.post(
                `${this.gameServerManagerUrl}/api/servers/cs16`,
                {
                    serverId: serverId,
                    serverName: config.serverName || `CS 1.6 Server ${serverId}`,
                    maxPlayers: config.maxPlayers || 16,
                    ramLimit: config.ramLimit || '512m',
                    serverPassword: config.serverPassword || ''
                },
                { timeout: this.timeout }
            );

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.server,
                    message: 'CS 1.6 server created successfully'
                };
            } else {
                throw new Error(response.data.error || 'Failed to create server');
            }

        } catch (error) {
            console.error(`Error creating CS 1.6 server ${serverId}:`, error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Failed to create CS 1.6 server'
            };
        }
    }

    // Stop server
    async stopServer(serverId) {
        try {
            console.log(`Stopping server ${serverId}`);
            
            const response = await axios.delete(
                `${this.gameServerManagerUrl}/api/servers/${serverId}`,
                { timeout: this.timeout }
            );

            if (response.data.success) {
                return {
                    success: true,
                    message: `Server ${serverId} stopped successfully`
                };
            } else {
                throw new Error(response.data.error || 'Failed to stop server');
            }

        } catch (error) {
            console.error(`Error stopping server ${serverId}:`, error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Failed to stop server'
            };
        }
    }

    // Get server status
    async getServerStatus(serverId) {
        try {
            const response = await axios.get(
                `${this.gameServerManagerUrl}/api/servers/${serverId}/status`,
                { timeout: this.timeout }
            );

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.status
                };
            } else {
                return {
                    success: false,
                    error: response.data.error || 'Failed to get server status'
                };
            }

        } catch (error) {
            console.error(`Error getting server status ${serverId}:`, error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Failed to get server status'
            };
        }
    }

    // Restart server
    async restartServer(serverId) {
        try {
            console.log(`Restarting server ${serverId}`);
            
            const response = await axios.post(
                `${this.gameServerManagerUrl}/api/servers/${serverId}/restart`,
                {},
                { timeout: this.timeout }
            );

            if (response.data.success) {
                return {
                    success: true,
                    message: `Server ${serverId} restarted successfully`
                };
            } else {
                throw new Error(response.data.error || 'Failed to restart server');
            }

        } catch (error) {
            console.error(`Error restarting server ${serverId}:`, error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Failed to restart server'
            };
        }
    }

    // List all servers
    async listServers() {
        try {
            const response = await axios.get(
                `${this.gameServerManagerUrl}/api/servers`,
                { timeout: this.timeout }
            );

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.servers
                };
            } else {
                throw new Error(response.data.error || 'Failed to list servers');
            }

        } catch (error) {
            console.error('Error listing servers:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Failed to list servers'
            };
        }
    }

    // Check if game server manager is available
    async checkHealth() {
        try {
            const response = await axios.get(
                `${this.gameServerManagerUrl}/health`,
                { timeout: 5000 } // Shorter timeout for health check
            );

            return {
                success: true,
                status: response.data.status || 'unknown',
                uptime: response.data.uptime || 0
            };

        } catch (error) {
            console.error('Game Server Manager health check failed:', error);
            return {
                success: false,
                error: 'Game Server Manager is not available'
            };
        }
    }

    // Get connection info for a server
    async getConnectionInfo(serverId) {
        try {
            const statusResult = await this.getServerStatus(serverId);
            
            if (!statusResult.success) {
                return statusResult;
            }

            const status = statusResult.data;
            
            if (status.status !== 'running') {
                return {
                    success: false,
                    error: `Server is ${status.status}, not running`
                };
            }

            // For CS 1.6, the connection info is the host IP + mapped port
            const host = process.env.GAME_SERVER_HOST || 'localhost';
            
            return {
                success: true,
                data: {
                    host: host,
                    port: status.port,
                    connectionString: `${host}:${status.port}`,
                    status: status.status,
                    containerName: status.containerName
                }
            };

        } catch (error) {
            console.error(`Error getting connection info for server ${serverId}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to get connection info'
            };
        }
    }

    // Start a server (if it exists but is stopped)
    async startServer(serverId, gameType = 'cs16', config = {}) {
        try {
            if (gameType === 'cs16') {
                // First, try to start an existing container
                const startResponse = await axios.post(
                    `${this.gameServerManagerUrl}/api/servers/${serverId}/start`,
                    {},
                    { timeout: 30000 }
                );

                if (startResponse.data.success) {
                    return {
                        success: true,
                        data: startResponse.data.data
                    };
                } else {
                    // If starting existing container fails, create a new one
                    console.log(`No existing container found for server ${serverId}, creating new one`);
                    return await this.createCS16Server(serverId, config);
                }
            } else {
                return {
                    success: false,
                    error: `Unsupported game type: ${gameType}`
                };
            }
        } catch (error) {
            console.error(`Error starting server ${serverId}:`, error);
            
            // If the start endpoint fails (container doesn't exist), create a new one
            if (error.response?.status === 500 || error.code === 'ECONNREFUSED') {
                console.log(`Creating new container for server ${serverId}`);
                return await this.createCS16Server(serverId, config);
            }
            
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Failed to start server'
            };
        }
    }
}

module.exports = GameServerService; 