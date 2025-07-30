# Web Herald

A modern gaming server hosting platform with dark UI theme. Specializes in Counter-Strike 1.6, Minecraft, and Team Fortress 2 server hosting with automated Docker-based deployment.

## 🎮 Features

- **Docker-Based CS 1.6 Servers**: Real Counter-Strike 1.6 dedicated servers in isolated Docker containers
- **Dynamic Port Management**: Automatic port allocation (27015-27100) for multiple servers
- **Real-Time Server Control**: Start, stop, restart, and monitor servers through web interface
- **User Authentication**: Google OAuth2 integration for secure access
- **Server Management Dashboard**: Complete CRUD operations for game servers
- **Responsive Dark UI**: Modern Bootstrap 5 design with gaming aesthetics
- **Database Integration**: SQLite with Sequelize ORM for data persistence

## 🏗️ Architecture

```
Web Herald Main App (port 3000)
├── Express.js + EJS templating
├── Google OAuth2 authentication
├── SQLite database
└── HTTP API calls ↓

Game Server Manager (port 3001)
├── Docker API integration
├── CS 1.6 container orchestration
├── Port management (27015-27100)
└── Docker containers ↓

CS 1.6 Dedicated Servers
├── Ubuntu-based containers
├── Steam + HLDS installation
├── Configurable game settings
└── Health monitoring
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 16+**
- **Docker** (running and accessible)
- **Git**

### 1. Clone and Setup

```bash
git clone <repository-url>
cd web-herald.com
npm install
cd game-server-manager
npm install
cd ..
```

### 2. Configure Environment

Create `.env` in the root directory:

```env
PORT=3000
HOST=localhost
NODE_ENV=development
BASE_URL=http://localhost:3000
SITE_TITLE=Web Herald

# Google OAuth2 (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret

# Game Server Manager
GAME_SERVER_MANAGER_URL=http://localhost:3001
GAME_SERVER_HOST=localhost
```

### 3. Start Everything

```bash
# Option 1: Use the startup script
./start-all.sh

# Option 2: Manual startup
# Terminal 1:
cd game-server-manager && npm start

# Terminal 2:
npm start
```

### 4. Access the Platform

- **Web Herald**: http://localhost:3000
- **Game Server Manager API**: http://localhost:3001

## 🎯 CS 1.6 Server Management

### Creating a CS 1.6 Server

1. Login with Google OAuth2
2. Navigate to "My Servers"
3. Click "Add New Server"
4. Select game type: "CS 1.6"
5. Configure settings:
   - Server name
   - Max players (1-32)
   - RAM allocation
   - Server password (optional)
6. Click "Create Server"

The system will:
- Create a Docker container with CS 1.6 dedicated server
- Allocate a dynamic port (27015-27100)
- Start the server automatically
- Provide connection details

### Server Controls

- **Start**: Deploy and start the Docker container
- **Stop**: Stop and remove the container (saves resources)
- **Restart**: Restart the running container
- **Status**: Get detailed server information
- **Connect**: Copy connection string to clipboard

### Connection Info

When a CS 1.6 server is running, you'll see:
```
Connect: localhost:27015
```

Players can connect using:
- In-game console: `connect localhost:27015`
- Steam server browser
- Direct IP connection

## 🛠️ Development

### Project Structure

```
web-herald.com/
├── config/           # Database configuration
├── middleware/       # Authentication middleware
├── models/          # Sequelize models (User, Server)
├── routes/          # Express routes (API, views, auth)
├── services/        # Business logic services
├── utils/           # Utility functions
├── views/           # EJS templates
├── public/          # Static assets
├── game-server-manager/  # Separate Node.js service
│   ├── services/    # Docker service
│   ├── routes/      # Game server API routes
│   └── docker/      # CS 1.6 Dockerfile and configs
└── start-all.sh     # Startup script
```

### Running in Development

```bash
# Main app with auto-reload
npm run dev

# Game server manager with auto-reload
cd game-server-manager
npm run dev
```

### Building CS 1.6 Docker Image

```bash
cd game-server-manager/docker
./build.sh
```

This downloads and configures:
- Ubuntu 20.04 base image
- SteamCMD
- CS 1.6 dedicated server files (~2GB download)
- Default maps and configurations

## 🔧 Configuration

### CS 1.6 Server Settings

Located in `game-server-manager/docker/cs16/configs/`:

- **server.cfg**: Main server configuration
- **mapcycle.txt**: Map rotation
- **banned.cfg**: Banned players/IPs

### Environment Variables

**Main Application (.env)**:
- `GOOGLE_CLIENT_ID/SECRET`: OAuth2 credentials
- `GAME_SERVER_MANAGER_URL`: API endpoint for game server manager
- `GAME_SERVER_HOST`: Public IP for server connections

**Game Server Manager (.env)**:
- `MIN_PORT/MAX_PORT`: Port range for game servers
- `CS16_IMAGE`: Docker image name
- `DEFAULT_RAM_LIMIT`: Default container memory limit

## 🚢 Deployment

### Building for Production

```bash
# Build CS 1.6 Docker image
cd game-server-manager/docker
./build.sh

# Deploy main application
./deploy.sh user@your-server.com
```

### Production Considerations

1. **Docker Security**: Run Docker daemon securely
2. **Port Management**: Ensure CS 1.6 port range is open
3. **Resource Limits**: Set appropriate CPU/memory limits
4. **Monitoring**: Implement container health monitoring
5. **Backup**: Database and server configurations

## 🎮 Game Server Features

### CS 1.6 Specific

- **Maps**: Full map cycle with popular maps (de_dust2, de_inferno, etc.)
- **Game Modes**: Classic competitive settings
- **RCON**: Remote console with auto-generated passwords
- **Customization**: Server name, player limits, passwords
- **Resource Control**: RAM and CPU limits per container

### Planned Features

- **Minecraft Servers**: Spigot/Paper server deployment
- **Team Fortress 2**: TF2 dedicated servers
- **Custom Maps**: Upload and manage custom maps
- **Plugins**: Plugin management for supported games
- **Statistics**: Player statistics and server analytics

## 🔒 Security

- **Container Isolation**: Each server runs in isolated Docker container
- **OAuth2 Authentication**: Secure Google-based login
- **Session Management**: Express sessions with secure cookies
- **API Protection**: Authenticated API endpoints
- **Resource Limits**: Container resource constraints

## 🐛 Troubleshooting

### Common Issues

**Docker Permission Denied**:
```bash
sudo usermod -aG docker $USER
# Then logout/login
```

**Port Already in Use**:
- Check if other CS 1.6 servers are running
- Restart the game server manager
- Check port range configuration

**CS 1.6 Docker Build Fails**:
- Ensure stable internet connection
- Check available disk space (>5GB recommended)
- Verify Docker daemon is running

**Server Creation Fails**:
- Check game server manager health: http://localhost:3001/health
- Verify Docker image exists: `docker images cs16ds`
- Check logs in game server manager console

### Logs

**Main Application**:
```bash
npm start  # or npm run dev
```

**Game Server Manager**:
```bash
cd game-server-manager
npm start  # or npm run dev
```

**Docker Container Logs**:
```bash
docker logs cs16-server-{id}
```

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review container logs
- Open an issue on GitHub 