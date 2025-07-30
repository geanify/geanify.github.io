# Game Server Manager

A scalable Docker-based game server management service for Web Herald. Currently supports Counter-Strike 1.6 servers with dynamic port allocation.

## Features

- 🐳 **Docker-based**: Isolated game server containers
- 🎯 **Dynamic Port Allocation**: Automatic port management (27015-27100)
- 🔄 **Full Lifecycle Management**: Create, start, stop, restart, and monitor servers
- 📊 **Status Monitoring**: Real-time server status and resource monitoring
- 🎮 **CS 1.6 Support**: Counter-Strike 1.6 dedicated servers
- 🚀 **Scalable Architecture**: Separate service for game server management

## Prerequisites

- Docker installed and running
- Node.js 16+ 
- Access to Docker socket (`/var/run/docker.sock`)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build CS 1.6 Docker Image

```bash
cd docker
./build.sh
```

This will download and build the CS 1.6 dedicated server image (~2GB download).

### 3. Configure Environment

Edit `.env` file:

```env
PORT=3001
HOST=localhost
NODE_ENV=development

# Port Range for Game Servers
MIN_PORT=27015
MAX_PORT=27100

# CS 1.6 Configuration
CS16_IMAGE=cs16ds:latest
CS16_DEFAULT_MAP=de_dust2

# Server Resources
DEFAULT_RAM_LIMIT=512m
DEFAULT_CPU_LIMIT=1
```

### 4. Start the Service

```bash
npm start
# or for development
npm run dev
```

## API Endpoints

### Health Check
```http
GET /health
```

### List All Servers
```http
GET /api/servers
```

### Create CS 1.6 Server
```http
POST /api/servers/cs16
Content-Type: application/json

{
  "serverId": 123,
  "serverName": "My CS 1.6 Server",
  "maxPlayers": 16,
  "ramLimit": "512m",
  "serverPassword": ""
}
```

### Get Server Status
```http
GET /api/servers/{serverId}/status
```

### Restart Server
```http
POST /api/servers/{serverId}/restart
```

### Stop Server
```http
DELETE /api/servers/{serverId}
```

## Usage Examples

### Create a CS 1.6 Server

```bash
curl -X POST http://localhost:3001/api/servers/cs16 \
  -H "Content-Type: application/json" \
  -d '{
    "serverId": 1,
    "serverName": "Test Server",
    "maxPlayers": 16,
    "ramLimit": "512m"
  }'
```

### Check Server Status

```bash
curl http://localhost:3001/api/servers/1/status
```

### Stop Server

```bash
curl -X DELETE http://localhost:3001/api/servers/1
```

## Architecture

```
Web Herald Main App (port 3000)
        ↓ HTTP API calls
Game Server Manager (port 3001)
        ↓ Docker API
Docker Containers (CS 1.6 servers)
        ↓ Dynamic ports 27015-27100
```

## Server Configuration

CS 1.6 servers are configured with:

- **Default Map**: de_dust2
- **Max Players**: Configurable (default 16)
- **Game Mode**: Classic competitive
- **RCON**: Enabled with random password
- **Resources**: Configurable RAM and CPU limits
- **Maps**: Full map cycle with popular maps

## Port Management

- **Port Range**: 27015-27100 (configurable)
- **Dynamic Allocation**: Automatically assigns available ports
- **Port Tracking**: Prevents conflicts between servers
- **Port Release**: Automatically releases ports when servers stop

## Monitoring

Each server container includes:

- Health checks every 30 seconds
- Resource monitoring (RAM, CPU)
- Status tracking (starting, running, stopped, error)
- Container lifecycle management

## Integration with Main App

The main Web Herald application can call this service to:

1. Create servers when users order them
2. Monitor server status for dashboard
3. Start/stop/restart servers as needed
4. Get server connection details (IP + port)

## Development

### Running in Development Mode

```bash
npm run dev
```

### Logs

Server logs include:
- API requests and responses
- Docker container operations
- Server lifecycle events
- Error handling and debugging

### Testing

Test the service with curl or integrate with the main Web Herald application.

## Security Notes

- Service runs on internal network (localhost:3001)
- Docker socket access required
- Container isolation for security
- RCON passwords auto-generated
- Resource limits enforced

## Troubleshooting

### Docker Permission Issues
```bash
sudo usermod -aG docker $USER
# Then logout/login
```

### Port Already in Use
- Check port range configuration
- Ensure no other services using CS 1.6 ports
- Restart the service to reset port tracking

### Container Build Fails
- Ensure Docker has sufficient disk space
- Check internet connection for Steam downloads
- Verify Docker daemon is running 