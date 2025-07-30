const Docker = require('dockerode');

class DockerService {
    constructor() {
        // Try different Docker connection methods
        const dockerOptions = this.getDockerConnectionOptions();
        this.docker = new Docker(dockerOptions);
        this.usedPorts = new Set();
        this.containers = new Map(); // serverId -> container info
        this.dockerConnected = false;
    }

    // Get Docker connection options with fallbacks
    getDockerConnectionOptions() {
        // Try different connection methods in order of preference
        const options = [
            // Default socket path
            { socketPath: '/var/run/docker.sock' },
            // Alternative socket path
            { socketPath: process.env.DOCKER_HOST || '/var/run/docker.sock' },
            // TCP connection as fallback
            ...(process.env.DOCKER_HOST && process.env.DOCKER_HOST.startsWith('tcp://') 
                ? [{ host: process.env.DOCKER_HOST.replace('tcp://', '').split(':')[0], port: process.env.DOCKER_HOST.replace('tcp://', '').split(':')[1] || 2376 }] 
                : [])
        ];

        return options[0]; // Start with the first option
    }

    // Get next available port in range
    getAvailablePort() {
        const minPort = parseInt(process.env.MIN_PORT) || 27015;
        const maxPort = parseInt(process.env.MAX_PORT) || 27100;
        
        for (let port = minPort; port <= maxPort; port++) {
            if (!this.usedPorts.has(port)) {
                this.usedPorts.add(port);
                return port;
            }
        }
        
        throw new Error('No available ports in range');
    }

    // Release a port
    releasePort(port) {
        this.usedPorts.delete(port);
    }

    // Create CS 1.6 server container
    async createCS16Server(serverId, config = {}, specificPort = null) {
        try {
            if (!this.dockerConnected) {
                throw new Error('Docker service is not available. Please check Docker installation and permissions.');
            }

            const port = specificPort || this.getAvailablePort();
            const containerName = `cs16-server-${serverId}`;
            
            const containerConfig = {
                Image: process.env.CS16_IMAGE || 'cs16ds:latest',
                name: containerName,
                Hostname: containerName,
                ExposedPorts: {
                    '27015/udp': {}
                },
                HostConfig: {
                    PortBindings: {
                        '27015/udp': [{ HostPort: port.toString() }]
                    },
                    Memory: this.parseMemory(config.ramLimit || process.env.DEFAULT_RAM_LIMIT || '512m'),
                    CpuQuota: parseInt(process.env.DEFAULT_CPU_LIMIT || 1) * 100000,
                    CpuPeriod: 100000,
                    RestartPolicy: {
                        Name: 'unless-stopped'
                    }
                },
                Env: [
                    `SERVER_NAME=${config.serverName || 'CS 1.6 Server'}`,
                    `MAX_PLAYERS=${config.maxPlayers || 16}`,
                    `START_MAP=${config.startMap || process.env.CS16_DEFAULT_MAP || 'de_dust2'}`,
                    `RCON_PASSWORD=${this.generateRconPassword()}`,
                    `SERVER_PASSWORD=${config.serverPassword || ''}`
                ],
                Labels: {
                    'web-herald.service': 'cs16-server',
                    'web-herald.server-id': serverId.toString(),
                    'web-herald.port': port.toString()
                }
            };

            console.log(`Creating CS 1.6 server container: ${containerName} on port ${port}`);
            console.log('Server configuration:', {
                serverName: config.serverName,
                maxPlayers: config.maxPlayers,
                serverPassword: config.serverPassword ? '***SET***' : 'NOT SET',
                ramLimit: config.ramLimit
            });
            
            const container = await this.docker.createContainer(containerConfig);
            await container.start();
            
            const containerInfo = {
                id: container.id,
                name: containerName,
                port: port,
                status: 'starting',
                serverId: serverId,
                gameType: 'cs16'
            };
            
            this.containers.set(serverId, containerInfo);
            
            // Wait a moment for container to start
            setTimeout(async () => {
                try {
                    const info = await container.inspect();
                    if (info.State.Running) {
                        containerInfo.status = 'running';
                        containerInfo.ipAddress = info.NetworkSettings.IPAddress;
                    }
                } catch (error) {
                    console.error(`Error inspecting container ${containerName}:`, error);
                }
            }, 5000);
            
            return {
                success: true,
                containerId: container.id,
                containerName: containerName,
                port: port,
                status: 'starting'
            };
            
        } catch (error) {
            console.error('Error creating CS 1.6 server:', error);
            // Release the port if it was allocated
            if (error.port) {
                this.releasePort(error.port);
            }
            throw error;
        }
    }

    // Start an existing stopped server
    async startExistingServer(serverId) {
        try {
            if (!this.dockerConnected) {
                throw new Error('Docker service is not available. Please check Docker installation and permissions.');
            }

            const containerName = `cs16-server-${serverId}`;
            
            // Check if container exists
            const containers = await this.docker.listContainers({ 
                all: true,
                filters: {
                    name: [containerName]
                }
            });

            if (containers.length === 0) {
                throw new Error(`Container ${containerName} not found`);
            }

            const containerData = containers[0];
            const container = this.docker.getContainer(containerData.Id);

            // Check if container is already running
            const containerInfo = await container.inspect();
            if (containerInfo.State.Running) {
                return {
                    success: true,
                    data: {
                        containerId: containerData.Id,
                        containerName: containerName,
                        port: parseInt(containerInfo.Config.Labels['web-herald.port']),
                        status: 'running'
                    }
                };
            }

            // Start the container
            console.log(`Starting existing container: ${containerName}`);
            console.log('Container configuration preserved from original creation');
            
            await container.start();

            // Get updated container info
            const updatedInfo = await container.inspect();
            const port = parseInt(updatedInfo.Config.Labels['web-herald.port']);

            // Add port back to used ports
            this.usedPorts.add(port);

            return {
                success: true,
                data: {
                    containerId: containerData.Id,
                    containerName: containerName,
                    port: port,
                    status: 'running'
                }
            };

        } catch (error) {
            console.error(`Error starting existing server ${serverId}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to start existing server'
            };
        }
    }

    // Stop server
    async stopServer(serverId) {
        try {
            const containerInfo = this.containers.get(serverId);
            if (!containerInfo) {
                throw new Error('Server container not found');
            }

            const container = this.docker.getContainer(containerInfo.id);
            
            console.log(`Stopping server ${serverId} (${containerInfo.name})`);
            
            // Stop container
            await container.stop();
            
            // Remove container
            await container.remove();
            
            // Release port
            this.releasePort(containerInfo.port);
            
            // Remove from tracking
            this.containers.delete(serverId);
            
            return {
                success: true,
                message: `Server ${serverId} stopped and removed`
            };
            
        } catch (error) {
            console.error(`Error stopping server ${serverId}:`, error);
            throw error;
        }
    }

    // Get server status
    async getServerStatus(serverId) {
        try {
            const containerInfo = this.containers.get(serverId);
            if (!containerInfo) {
                return { status: 'not_found' };
            }

            const container = this.docker.getContainer(containerInfo.id);
            const info = await container.inspect();
            
            return {
                status: info.State.Running ? 'running' : 'stopped',
                port: containerInfo.port,
                containerId: containerInfo.id,
                containerName: containerInfo.name,
                ipAddress: info.NetworkSettings.IPAddress,
                startedAt: info.State.StartedAt,
                memory: info.HostConfig.Memory,
                cpuQuota: info.HostConfig.CpuQuota
            };
            
        } catch (error) {
            console.error(`Error getting server status ${serverId}:`, error);
            return { status: 'error', error: error.message };
        }
    }

    // List all managed servers
    async listServers() {
        const servers = [];
        
        for (const [serverId, containerInfo] of this.containers) {
            try {
                const status = await this.getServerStatus(serverId);
                servers.push({
                    serverId,
                    ...containerInfo,
                    ...status
                });
            } catch (error) {
                servers.push({
                    serverId,
                    ...containerInfo,
                    status: 'error',
                    error: error.message
                });
            }
        }
        
        return servers;
    }

    // Restart server
    async restartServer(serverId, newConfig = null) {
        try {
            const containerInfo = this.containers.get(serverId);
            if (!containerInfo) {
                throw new Error('Server container not found');
            }

            const container = this.docker.getContainer(containerInfo.id);
            
            // If no new configuration is provided, just restart the container
            if (!newConfig || Object.keys(newConfig).length === 0) {
                console.log(`Restarting server ${serverId} (${containerInfo.name})`);
                await container.restart();
                
                return {
                    success: true,
                    message: `Server ${serverId} restarted`
                };
            }
            
            // If new configuration is provided, stop and recreate the container
            console.log(`Recreating server ${serverId} with new configuration`);
            
            // Stop and remove the old container
            await container.stop({ t: 10 }); // 10 second timeout
            await container.remove();
            
            // Remove from our tracking
            this.containers.delete(serverId);
            
            // Create new container with updated configuration
            const config = {
                serverName: newConfig.serverName || `CS 1.6 Server ${serverId}`,
                maxPlayers: newConfig.maxPlayers || 16,
                serverPassword: newConfig.serverPassword || '',
                ramLimit: newConfig.ramLimit || 1,
                startMap: newConfig.startMap || 'de_dust2'
            };
            
            // Reuse the same port
            const port = containerInfo.port;
            const result = await this.createCS16Server(serverId, config, port);
            
            return {
                success: true,
                message: `Server ${serverId} recreated with new configuration`,
                config: config
            };
            
        } catch (error) {
            console.error(`Error restarting server ${serverId}:`, error);
            throw error;
        }
    }

    // Helper: Parse memory string to bytes
    parseMemory(memStr) {
        const units = { 'b': 1, 'k': 1024, 'm': 1024*1024, 'g': 1024*1024*1024 };
        const match = memStr.toLowerCase().match(/^(\d+)([bkmg]?)$/);
        if (!match) return 512 * 1024 * 1024; // Default 512MB
        
        const value = parseInt(match[1]);
        const unit = match[2] || 'b';
        return value * units[unit];
    }

    // Helper: Generate random RCON password
    generateRconPassword() {
        return Math.random().toString(36).substring(2, 15);
    }

    // Initialize: Scan for existing containers on startup
    async initialize() {
        try {
            console.log('Initializing Docker service...');
            
            // Test Docker connection first
            await this.testDockerConnection();
            
            const containers = await this.docker.listContainers({ 
                all: true,
                filters: {
                    label: ['web-herald.service=cs16-server']
                }
            });
            
            for (const containerData of containers) {
                const labels = containerData.Labels;
                const serverId = parseInt(labels['web-herald.server-id']);
                const port = parseInt(labels['web-herald.port']);
                
                if (serverId && port) {
                    this.usedPorts.add(port);
                    this.containers.set(serverId, {
                        id: containerData.Id,
                        name: containerData.Names[0].substring(1), // Remove leading slash
                        port: port,
                        status: containerData.State,
                        serverId: serverId,
                        gameType: 'cs16'
                    });
                    
                    console.log(`Found existing server ${serverId} on port ${port}`);
                }
            }
            
            this.dockerConnected = true;
            console.log(`✅ Docker service initialized successfully. Tracking ${this.containers.size} servers.`);
            
        } catch (error) {
            console.error('❌ Error initializing Docker service:', error.message);
            console.log('⚠️  Docker functionality will be limited. Please check Docker installation and permissions.');
            this.dockerConnected = false;
            
            // Don't throw error - allow server to start without Docker functionality
        }
    }

    // Test Docker connection
    async testDockerConnection() {
        try {
            await this.docker.ping();
            console.log('✅ Docker connection successful');
            return true;
        } catch (error) {
            console.error('❌ Docker connection failed:', error.message);
            throw new Error(`Docker connection failed: ${error.message}`);
        }
    }
}

module.exports = DockerService; 