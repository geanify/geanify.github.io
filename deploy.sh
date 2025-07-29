#!/bin/bash

# Configuration
APP_NAME="gameservers-pro"
DEPLOY_DIR="deploy_temp"

# Check if user@host argument is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 user@host"
    echo "Example: $0 user@example.com"
    exit 1
fi

USER_HOST=$1

echo "🚀 Starting deployment of $APP_NAME to $USER_HOST..."

# Clean up any existing deployment directory
rm -rf $DEPLOY_DIR

# Create deployment directory
mkdir -p $DEPLOY_DIR

echo "📦 Copying application files..."

# Copy main application files
cp package.json $DEPLOY_DIR/
cp server.js $DEPLOY_DIR/

# Copy views and public directories
cp -r views $DEPLOY_DIR/
cp -r public $DEPLOY_DIR/

echo "📁 Packaged files:"
find $DEPLOY_DIR -type f | head -10
echo "... and more"

# Create deployment package
echo "🗜️  Creating deployment package..."
tar --exclude="node_modules" --exclude="*/node_modules/*" -czf "${DEPLOY_DIR}.tar.gz" "$DEPLOY_DIR"

echo "🚁 Uploading to $USER_HOST..."

# Upload the package
scp "${DEPLOY_DIR}.tar.gz" "$USER_HOST:~/"

echo "🔧 Installing on remote server..."

# Execute deployment commands on remote server
ssh "$USER_HOST" << EOF
    echo "📂 Extracting deployment package..."
    rm -rf $APP_NAME
    tar -xzf ${DEPLOY_DIR}.tar.gz
    mv $DEPLOY_DIR $APP_NAME
    
    echo "📦 Installing dependencies..."
    cd $APP_NAME
    npm install --production
    
    echo "🔄 Restarting application..."
    pm2 delete $APP_NAME 2>/dev/null || true
    pm2 start server.js --name $APP_NAME
    pm2 save
    
    echo "🧹 Cleaning up..."
    rm -f ~/${DEPLOY_DIR}.tar.gz
    
    echo "✅ Deployment completed successfully!"
    pm2 status
EOF

# Clean up local files
echo "🧹 Cleaning up local deployment files..."
rm -rf $DEPLOY_DIR
rm -f "${DEPLOY_DIR}.tar.gz"

echo "🎉 Deployment to $USER_HOST completed!"
echo "🌐 Your application should be running on the remote server"
echo "📊 Check status with: ssh $USER_HOST 'pm2 status'" 