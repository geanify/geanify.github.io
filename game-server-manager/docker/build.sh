#!/bin/bash

# Build script for CS 1.6 Docker image
echo "🐳 Building CS 1.6 Docker image..."

# Build the image
docker build -t cs16ds:latest ./cs16/

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ CS 1.6 Docker image built successfully!"
    echo "📋 Image: cs16ds:latest"
    
    # Show image info
    docker images cs16ds:latest
else
    echo "❌ Failed to build CS 1.6 Docker image"
    exit 1
fi

echo ""
echo "🎮 You can now create CS 1.6 servers using the Game Server Manager API"
echo "🚀 Example: POST http://localhost:3001/api/servers/cs16" 