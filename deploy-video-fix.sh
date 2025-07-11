#!/bin/bash

# Video Fix Deployment Script
# This script fixes video serving issues by updating nginx configuration

set -e

echo "🔧 Fixing video serving configuration..."

# Check if we're running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script must be run as root (use sudo)"
    exit 1
fi

# Backup current nginx configuration
echo "📋 Backing up current nginx configuration..."
cp /etc/nginx/sites-available/web-herald /etc/nginx/sites-available/web-herald.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "⚠️  No existing nginx config found"

# Copy the new nginx configuration
echo "📝 Installing new nginx configuration..."
cp nginx.conf /etc/nginx/sites-available/web-herald

# Enable the site if not already enabled
if [ ! -L /etc/nginx/sites-enabled/web-herald ]; then
    echo "🔗 Enabling nginx site..."
    ln -s /etc/nginx/sites-available/web-herald /etc/nginx/sites-enabled/
fi

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration is invalid. Restoring backup..."
    cp /etc/nginx/sites-available/web-herald.backup.* /etc/nginx/sites-available/web-herald
    exit 1
fi

# Set proper permissions for the public directory
echo "🔐 Setting proper permissions..."
chown -R www-data:www-data /opt/web-herald/public
chmod -R 755 /opt/web-herald/public

# Check if video files exist and are accessible
echo "📹 Checking video files..."
if [ -d "/opt/web-herald/public/videos" ]; then
    echo "✅ Videos directory exists"
    ls -la /opt/web-herald/public/videos/
else
    echo "❌ Videos directory not found at /opt/web-herald/public/videos"
fi

# Reload nginx
echo "🔄 Reloading nginx..."
systemctl reload nginx

# Check nginx status
echo "📊 Checking nginx status..."
systemctl status nginx --no-pager -l

echo ""
echo "✅ Video serving configuration updated!"
echo ""
echo "🧪 Test the video serving:"
echo "   1. Visit: https://web-herald.com/video-test.html"
echo "   2. Try direct video links:"
echo "      - https://web-herald.com/videos/subscriptions.mp4"
echo "      - https://web-herald.com/videos/ice.mp4"
echo "      - https://web-herald.com/videos/geisha.mp4"
echo ""
echo "📋 If videos still don't work, check:"
echo "   1. nginx error logs: sudo tail -f /var/log/nginx/error.log"
echo "   2. nginx access logs: sudo tail -f /var/log/nginx/access.log"
echo "   3. File permissions: ls -la /opt/web-herald/public/videos/"
echo "   4. Disk space: df -h"
echo "" 