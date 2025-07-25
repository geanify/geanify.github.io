# Web Herald

A modern web application built with Express.js and EJS templates, featuring a complete deployment solution.

## Features

- ⚡ **Express.js** - Fast, minimalist web framework
- 🎨 **EJS Templates** - Dynamic content generation with embedded JavaScript
- 📱 **Bootstrap 5** - Responsive, mobile-first design
- 🚀 **One-click Deployment** - Automated deployment script for remote servers
- 🔧 **PM2 Integration** - Process management for production
- 💻 **Development Ready** - Hot reload with nodemon

## Quick Start

### Installation

```bash
# Clone or initialize the project
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Development Commands

```bash
# Start production server
npm start

# Start development server with hot reload
npm run dev

# Deploy to remote server
npm run deploy
```

## Project Structure

```
web-herald/
├── views/                  # EJS templates
│   ├── partials/           # Reusable template components
│   │   ├── navbar.ejs      # Navigation bar
│   │   └── footer.ejs      # Footer
│   ├── index.ejs           # Homepage
│   ├── about.ejs           # About page
│   ├── 404.ejs             # 404 error page
│   └── error.ejs           # Error page
├── public/                 # Static files
│   └── css/
│       └── style.css       # Custom styles
├── server.js               # Express server
├── package.json            # Dependencies and scripts
├── deploy.sh               # Deployment script
└── README.md               # This file
```

## Deployment

The project includes an automated deployment script that can deploy your application to any remote server with SSH access.

### Prerequisites

- SSH access to the target server
- The target server should have Ubuntu/Debian (for automatic Node.js installation)

### Deploy to Remote Server

```bash
# Deploy with default port (3000)
./deploy.sh user@hostname

# Deploy with custom port
./deploy.sh user@hostname 8080
```

### What the deployment script does:

1. Tests SSH connection to the remote server
2. Installs dependencies locally
3. Creates a deployment package
4. Uploads the package to the remote server
5. Installs Node.js and PM2 on the remote server (if not present)
6. Extracts and installs the application
7. Starts the application with PM2 process manager
8. Configures PM2 to restart on server reboot

### Managing the deployed application:

```bash
# View application logs
ssh user@hostname 'pm2 logs web-herald'

# Restart the application
ssh user@hostname 'pm2 restart web-herald'

# Stop the application
ssh user@hostname 'pm2 stop web-herald'

# Check application status
ssh user@hostname 'pm2 list'
```

## Customization

### Adding New Routes

Edit `server.js` to add new routes:

```javascript
app.get('/new-page', (req, res) => {
    res.render('new-page', { 
        title: 'New Page',
        data: 'Your data here'
    });
});
```

### Adding New Templates

Create new EJS files in the `views/` directory:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><%= title %></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <%- include('partials/navbar') %>
    
    <main class="container mt-4">
        <!-- Your content here -->
    </main>
    
    <%- include('partials/footer') %>
</body>
</html>
```

### Styling

Add custom CSS to `public/css/style.css` or modify the existing styles.

## Environment Variables

The application supports the following environment variables:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## License

MIT License - feel free to use this project for your own applications.

## Support

For issues and questions, please check the application logs:

```bash
# Local development
npm run dev

# Production (via PM2)
pm2 logs web-herald
``` 