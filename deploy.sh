#!/bin/bash

# Web Herald Deployment Script
# Usage: ./deploy.sh user@hostname [port]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check arguments
if [ $# -lt 1 ]; then
    print_error "Usage: $0 user@hostname [port]"
    print_error "Example: $0 ubuntu@192.168.1.100 3000"
    exit 1
fi

USER_HOST=$1
PORT=${2:-3000}
APP_NAME="web-herald"
REMOTE_PATH="/opt/$APP_NAME"

print_status "Starting deployment to $USER_HOST..."

# Check if we can connect to the remote host
print_status "Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 "$USER_HOST" "echo 'Connection successful'"; then
    print_error "Cannot connect to $USER_HOST"
    exit 1
fi

print_success "SSH connection established"

# Build the application locally
print_status "Installing dependencies locally..."
npm install

# Create deployment package
print_status "Creating deployment package..."
DEPLOY_DIR="deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copy necessary files
cp -r views "$DEPLOY_DIR/"
cp -r public "$DEPLOY_DIR/"
cp server.js "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"

# Create archive
tar -czf "${DEPLOY_DIR}.tar.gz" "$DEPLOY_DIR"
rm -rf "$DEPLOY_DIR"

print_success "Deployment package created: ${DEPLOY_DIR}.tar.gz"

# Upload to remote server
print_status "Uploading files to $USER_HOST..."
scp "${DEPLOY_DIR}.tar.gz" "$USER_HOST:/tmp/"

# Deploy on remote server
print_status "Deploying on remote server..."
ssh "$USER_HOST" << EOF
    set -e
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Install PM2 if not present
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        sudo npm install -g pm2
    fi
    
    # Create application directory
    sudo mkdir -p $REMOTE_PATH
    sudo chown \$(whoami):\$(whoami) $REMOTE_PATH
    
    # Extract and deploy
    cd $REMOTE_PATH
    tar -xzf /tmp/${DEPLOY_DIR}.tar.gz --strip-components=1
    
    # Install dependencies
    npm install --production
    
    # Stop existing application
    pm2 delete $APP_NAME 2>/dev/null || true
    
    # Start application with PM2
    PORT=$PORT pm2 start server.js --name $APP_NAME
    
    # Save PM2 configuration
    pm2 save
    pm2 startup | tail -1 | sudo bash || true
    
    # Clean up
    rm -f /tmp/${DEPLOY_DIR}.tar.gz
    
    echo "Deployment completed successfully!"
    echo "Application is running on port $PORT"
    echo "PM2 status:"
    pm2 list
EOF

# Clean up local files
rm -f "${DEPLOY_DIR}.tar.gz"

print_success "Deployment completed successfully!"
print_status "Your application is now running at: http://$USER_HOST:$PORT"
print_status "To manage the application on the remote server:"
print_status "  - View logs: ssh $USER_HOST 'pm2 logs $APP_NAME'"
print_status "  - Restart:   ssh $USER_HOST 'pm2 restart $APP_NAME'"
print_status "  - Stop:      ssh $USER_HOST 'pm2 stop $APP_NAME'"
print_status "  - Status:    ssh $USER_HOST 'pm2 list'" 