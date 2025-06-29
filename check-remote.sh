#!/bin/bash

# Remote Server Diagnostic Script
# Usage: ./check-remote.sh user@ip

set -e

if [ $# -eq 0 ]; then
    echo "❌ Usage: $0 user@ip"
    echo "Example: $0 root@192.168.1.100"
    exit 1
fi

TARGET="$1"

echo "🔍 Checking remote server: $TARGET"
echo "=================================="

# Test SSH connection
echo "1. Testing SSH connection..."
if ssh "$TARGET" "echo 'SSH connection successful'" 2>/dev/null; then
    echo "✅ SSH connection works"
else
    echo "❌ SSH connection failed"
    exit 1
fi

echo ""

# Check disk space
echo "2. Checking disk space..."
ssh "$TARGET" "df -h" 2>/dev/null || echo "❌ Could not check disk space"

echo ""

# Check available space in common directories
echo "3. Checking available space in upload directories..."
for dir in "/tmp" "/home/$(echo $TARGET | cut -d@ -f1)" "/var/tmp" "/opt"; do
    echo "   $dir:"
    ssh "$TARGET" "df -h $dir 2>/dev/null || echo 'Directory not accessible'" 2>/dev/null || echo "   ❌ Could not check $dir"
done

echo ""

# Check permissions
echo "4. Checking directory permissions..."
for dir in "/tmp" "/home/$(echo $TARGET | cut -d@ -f1)" "/var/tmp" "/opt"; do
    echo "   $dir permissions:"
    ssh "$TARGET" "ls -la $dir 2>/dev/null | head -5 || echo 'Directory not accessible'" 2>/dev/null || echo "   ❌ Could not check $dir"
done

echo ""

# Check if user can write to directories
echo "5. Testing write permissions..."
for dir in "/tmp" "/home/$(echo $TARGET | cut -d@ -f1)" "/var/tmp" "/opt"; do
    if ssh "$TARGET" "test -w $dir" 2>/dev/null; then
        echo "✅ Writable: $dir"
    else
        echo "❌ Not writable: $dir"
    fi
done

echo ""

# Check if bun is installed
echo "6. Checking if Bun is installed..."
if ssh "$TARGET" "which bun" 2>/dev/null; then
    echo "✅ Bun is installed"
    ssh "$TARGET" "bun --version" 2>/dev/null || echo "❌ Could not get Bun version"
else
    echo "❌ Bun is not installed"
fi

echo ""

# Check if nginx is running
echo "7. Checking if nginx is running..."
if ssh "$TARGET" "systemctl is-active nginx" 2>/dev/null; then
    echo "✅ Nginx is running"
else
    echo "⚠️  Nginx is not running or not installed"
fi

echo ""

echo "🔧 Recommendations:"
echo "   - If disk space is low, clean up unnecessary files"
echo "   - If permissions are wrong, check user ownership"
echo "   - If Bun is missing, install it: curl -fsSL https://bun.sh/install | bash"
echo "   - If nginx is missing, install it: sudo apt install nginx" 