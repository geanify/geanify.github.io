#!/bin/bash

echo "🎮 Starting Web Herald Gaming Server Platform"
echo "============================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Build CS 1.6 Docker image if it doesn't exist
if ! docker images | grep -q "cs16ds"; then
    echo "🐳 Building CS 1.6 Docker image..."
    cd game-server-manager/docker
    ./build.sh
    cd ../..
else
    echo "✅ CS 1.6 Docker image already exists"
fi

# Start Game Server Manager in background
echo "🚀 Starting Game Server Manager..."
cd game-server-manager
npm start &
GAME_SERVER_PID=$!
echo "Game Server Manager PID: $GAME_SERVER_PID"
cd ..

# Wait a moment for Game Server Manager to start
sleep 3

# Start Main Web Herald Application
echo "🌐 Starting Main Web Herald Application..."
npm start &
WEB_HERALD_PID=$!
echo "Web Herald PID: $WEB_HERALD_PID"

echo ""
echo "🎉 Both services are starting up!"
echo ""
echo "📋 Service URLs:"
echo "   Web Herald:          http://localhost:3000"
echo "   Game Server Manager: http://localhost:3001"
echo ""
echo "📝 To stop all services:"
echo "   kill $WEB_HERALD_PID $GAME_SERVER_PID"
echo "   or press Ctrl+C to stop this script"
echo ""
echo "🎮 CS 1.6 servers will be available on ports 27015-27100"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $WEB_HERALD_PID 2>/dev/null
    kill $GAME_SERVER_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Handle Ctrl+C
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait 