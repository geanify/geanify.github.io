#!/bin/bash

echo "🛑 Stopping Web Herald Gaming Server Platform"
echo "============================================="

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    
    # Kill Node.js processes
    echo "📴 Stopping Node.js processes..."
    pkill -f "node server.js" 2>/dev/null
    pkill -f "npm start" 2>/dev/null
    
    # Force kill processes on ports 3000 and 3001
    echo "🔌 Freeing ports 3000 and 3001..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    
    # Stop and remove all CS 1.6 Docker containers
    echo "🐳 Stopping CS 1.6 Docker containers..."
    docker ps --filter "label=web-herald.service=cs16-server" --format "{{.Names}}" | while read container; do
        if [ ! -z "$container" ]; then
            echo "   Stopping container: $container"
            docker stop "$container" 2>/dev/null
            docker rm "$container" 2>/dev/null
        fi
    done
    
    # Stop any other game server containers
    echo "🎮 Stopping other game server containers..."
    docker ps --filter "name=cs16-server" --format "{{.Names}}" | while read container; do
        if [ ! -z "$container" ]; then
            echo "   Stopping container: $container"
            docker stop "$container" 2>/dev/null
            docker rm "$container" 2>/dev/null
        fi
    done
    
    # Clean up any dangling containers
    echo "🧹 Cleaning up dangling containers..."
    docker container prune -f 2>/dev/null
    
    echo "✅ All services stopped and cleaned up"
    exit 0
}

# Handle Ctrl+C
trap cleanup SIGINT SIGTERM

# Run cleanup
cleanup 