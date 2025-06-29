# web-herald.com

To install dependencies:

```bash
bun install
```

To run in development:

```bash
bun run dev
```

To run in production:

```bash
bun run start
```

To run with automatic restart (process manager):

```bash
bun run start:managed
```

## Process Manager

The process manager (`process-manager.ts`) automatically restarts the server if it crashes:

- **Max restarts**: 10 attempts
- **Restart delay**: 2 seconds between restarts
- **Graceful shutdown**: Handles SIGINT and SIGTERM signals
- **Logging**: Clear logging with timestamps

## Systemd Service

To run as a system service, copy the `web-herald.service` file to `/etc/systemd/system/` and update the paths:

```bash
# Edit the service file to match your paths
sudo cp web-herald.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable web-herald
sudo systemctl start web-herald
sudo systemctl status web-herald
```

## SSL/HTTPS Configuration

To run the production server with HTTPS, set the following environment variables:

```bash
# SSL Certificate paths
SSL_CERT_PATH=/path/to/your/certificate.crt
SSL_KEY_PATH=/path/to/your/private.key
SSL_CA_PATH=/path/to/your/ca_bundle.crt  # Optional

# Stock API key
STOCK_API_KEY=your_twelve_data_api_key_here
```

The server will automatically detect SSL certificates and start an HTTPS server. If SSL certificates are not provided, it will fall back to HTTP.

## Video Serving Troubleshooting

If videos are not displaying properly on the server:

### Quick Fix
```bash
# Run the video fix script (requires sudo)
sudo ./deploy-video-fix.sh
```

### Manual Steps
1. **Update nginx configuration**:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/web-herald
   sudo nginx -t
   sudo systemctl reload nginx
   ```

2. **Fix permissions**:
   ```bash
   sudo chown -R www-data:www-data /opt/web-herald/public
   sudo chmod -R 755 /opt/web-herald/public
   ```

3. **Test video serving**:
   - Visit: `https://web-herald.com/video-test.html`
   - Try direct video links: `https://web-herald.com/videos/subscriptions.mp4`

### Debugging Video Display Issues

If videos are served by nginx but not showing up on the page:

1. **Check browser console** for JavaScript errors
2. **Test banner ad videos**: Visit `https://web-herald.com/video-debug.html`
3. **Check autoplay policy**: Modern browsers block autoplay without user interaction
4. **Verify video paths**: Ensure `/videos/geisha.mp4` and `/videos/ice.mp4` exist

### Common Issues and Solutions

#### Videos not autoplaying
- **Cause**: Browser autoplay policy
- **Solution**: Videos are muted and should autoplay. If not, check browser settings

#### Videos not loading at all
- **Cause**: File permissions or nginx configuration
- **Solution**: Run `sudo ./deploy-video-fix.sh`

#### Videos load but don't display
- **Cause**: CSS issues or JavaScript errors
- **Solution**: Check browser console and test with `video-debug.html`

#### Banner ads not showing videos
- **Cause**: Translation configuration or template issues
- **Solution**: Check `locales/en.json` and `views/banner-ad.ejs`

### Debugging Commands
```bash
# Check nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Check file permissions
ls -la /opt/web-herald/public/videos/

# Check disk space
df -h

# Test video files directly
curl -I https://web-herald.com/videos/geisha.mp4
curl -I https://web-herald.com/videos/ice.mp4
```

This project was created using `bun init` in bun v1.2.16. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
