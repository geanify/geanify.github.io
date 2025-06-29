#!/bin/bash

# Web Herald Simple Deployment Script
# Usage: ./deploy-simple.sh user@ip

set -e

# Check if target argument is provided
if [ $# -eq 0 ]; then
    echo "❌ Usage: $0 user@ip"
    echo "Example: $0 root@192.168.1.100"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the project root directory."
    exit 1
fi

TARGET="$1"
PROJECT_NAME="web-herald"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ZIP_NAME="${PROJECT_NAME}_${TIMESTAMP}.zip"

echo "🚀 Deploying Web Herald to $TARGET..."

# Create temporary directory for packaging
TEMP_DIR=$(mktemp -d)
if [ ! -d "$TEMP_DIR" ]; then
    echo "❌ Error: Could not create temporary directory"
    exit 1
fi

echo "📦 Creating package in $TEMP_DIR..."

# Copy project files to temp directory (excluding node_modules)
echo "📋 Copying project files..."
cp -r . "$TEMP_DIR/" 2>/dev/null || {
    echo "❌ Error: Failed to copy project files"
    rm -rf "$TEMP_DIR"
    exit 1
}

# Remove unwanted directories and files
echo "🧹 Cleaning up package..."
cd "$TEMP_DIR" || {
    echo "❌ Error: Could not change to temporary directory"
    rm -rf "$TEMP_DIR"
    exit 1
}

# Remove unwanted files and directories
rm -rf node_modules .git dist 2>/dev/null || true
find . -name "*.zip" -delete 2>/dev/null || true
find . -name "*.log" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# Create zip file
echo "🗜️  Creating zip package..."
if ! zip -r "$ZIP_NAME" . -x "*.DS_Store" "*/.*"; then
    echo "❌ Error: Failed to create zip file"
    cd - > /dev/null
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Check zip file size
ZIP_SIZE=$(du -h "$ZIP_NAME" | cut -f1)
echo "📦 Package size: $ZIP_SIZE"

# Try multiple upload locations
echo "📤 Uploading to $TARGET..."

# Function to try upload to different locations
try_upload() {
    local locations=("/tmp/" "/home/$(echo $TARGET | cut -d@ -f1)/" "/var/tmp/" "/opt/")
    
    for location in "${locations[@]}"; do
        echo "   Trying $location..."
        if ssh "$TARGET" "test -w $location" 2>/dev/null; then
            if scp "$ZIP_NAME" "$TARGET:$location"; then
                echo "✅ Successfully uploaded to $location"
                REMOTE_PATH="$location$ZIP_NAME"
                return 0
            fi
        fi
    done
    return 1
}

if ! try_upload; then
    echo "❌ Error: Failed to upload to any location on remote server"
    echo ""
    echo "🔧 Troubleshooting tips:"
    echo "   1. Check disk space on remote server: ssh $TARGET 'df -h'"
    echo "   2. Check permissions: ssh $TARGET 'ls -la /tmp/'"
    echo "   3. Try manual upload: scp $ZIP_NAME $TARGET:/home/\$(whoami)/"
    echo "   4. Check SSH connection: ssh $TARGET 'echo test'"
    echo ""
    cd - > /dev/null
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Clean up local temp files
echo "🧹 Cleaning up local files..."
cd - > /dev/null
rm -rf "$TEMP_DIR"

echo "✅ Deployment package uploaded successfully!"
echo ""
echo "📋 Next steps on your VPS:"
echo "   1. SSH into your server: ssh $TARGET"
echo "   2. Extract the package: unzip $REMOTE_PATH -d /opt/web-herald"
echo "   3. Navigate to project: cd /opt/web-herald"
echo "   4. Install dependencies: bun install"
echo "   5. Set up environment: cp .env.example .env (if exists)"
echo "   6. Edit .env with your configuration"
echo "   7. Start the server: bun run start:managed"
echo "   8. Or set up systemd: sudo cp web-herald.service /etc/systemd/system/"
echo ""