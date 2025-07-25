const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Dashboard static files - serve assets first (before catch-all route)
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard/dist')));

// API endpoints (should come before dashboard catch-all route)
app.get('/api/servers', (req, res) => {
    res.json({
        games: [
            {
                name: 'Minecraft',
                icon: 'cube',
                starting_price: 4.99,
                features: ['Mod Support', 'Bukkit/Spigot', 'Unlimited Players']
            },
            {
                name: 'Counter-Strike 1.6',
                icon: 'crosshairs',
                starting_price: 3.99,
                features: ['Anti-Cheat', 'Custom Maps', 'Admin Panel']
            },
            {
                name: 'Team Fortress 2',
                icon: 'helmet-battle',
                starting_price: 3.99,
                features: ['Custom Modes', 'SourceMod', 'Fast Setup']
            }
        ]
    });
});

// Dashboard API endpoints
app.get('/api/dashboard/stats', (req, res) => {
    res.json({
        totalServers: 1247,
        onlineServers: 1198,
        totalPlayers: 15432,
        uptime: 99.97,
        revenue: {
            today: 2847.50,
            thisMonth: 68950.25,
            lastMonth: 72100.80
        }
    });
});

app.get('/api/dashboard/servers', (req, res) => {
    res.json([
        {
            id: 1,
            name: 'Epic Survival',
            game: 'Minecraft',
            status: 'online',
            players: 45,
            maxPlayers: 100,
            uptime: 99.8,
            plan: 'Gaming Pro'
        },
        {
            id: 2,
            name: 'Dust2 24/7',
            game: 'CS 1.6',
            status: 'online',
            players: 32,
            maxPlayers: 32,
            uptime: 100,
            plan: 'Elite'
        },
        {
            id: 3,
            name: 'TF2 Community',
            game: 'TF2',
            status: 'maintenance',
            players: 0,
            maxPlayers: 24,
            uptime: 98.5,
            plan: 'Starter'
        }
    ]);
});

// Dashboard route - catch-all for React Router (must come after static files and APIs)
app.get('/dashboard*', (req, res) => {
    const dashboardPath = path.join(__dirname, 'dashboard/dist/index.html');
    res.sendFile(dashboardPath, (err) => {
        if (err) {
            console.error('Dashboard not found:', err);
            res.status(404).render('404', {
                title: 'Dashboard Not Found | GameServers Pro',
                description: 'The dashboard is not available. Please ensure it has been built.',
                url: req.url,
                canonicalUrl: 'https://gameservers-pro.com' + req.url
            });
        }
    });
});

// Main app routes
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'GameServers Pro - Premium Gaming Server Hosting | Minecraft, CS 1.6, TF2',
        description: 'Premium gaming server hosting for Minecraft, Counter-Strike 1.6, and Team Fortress 2. High performance, DDoS protection, instant setup. Start gaming today!',
        keywords: 'minecraft server hosting, cs 1.6 servers, tf2 servers, gaming dedicated servers, game server rental, minecraft hosting',
        canonicalUrl: 'https://gameservers-pro.com',
        ogTitle: 'GameServers Pro - Premium Gaming Server Hosting',
        ogDescription: 'High performance gaming servers for Minecraft, CS 1.6, and TF2. Instant setup, DDoS protection, 24/7 support.',
        message: 'Premium Gaming Servers Ready in 60 Seconds'
    });
});

app.get('/about', (req, res) => {
    res.render('about', { 
        title: 'Support Center - GameServers Pro Gaming Server Hosting',
        description: 'Get help with your gaming servers. 24/7 support for Minecraft, CS 1.6, and TF2 servers. Knowledge base, tutorials, and live chat support.',
        content: 'GameServers Pro provides premium gaming server hosting with 24/7 support. Our team of gaming enthusiasts helps over 50,000 gamers worldwide run their perfect servers.',
        canonicalUrl: 'https://gameservers-pro.com/about',
        ogTitle: 'Support Center - GameServers Pro',
        ogDescription: 'Get help with your gaming servers. 24/7 support for Minecraft, CS 1.6, and TF2 servers.'
    });
});

// Game-specific server pages
app.get('/minecraft', (req, res) => {
    res.render('minecraft', {
        title: 'Minecraft Server Hosting - Premium Performance | GameServers Pro',
        description: 'High-performance Minecraft server hosting with mod support, Bukkit/Spigot, unlimited players. Starting at $4.99/month with instant setup.',
        canonicalUrl: 'https://gameservers-pro.com/minecraft',
        ogTitle: 'Minecraft Server Hosting - GameServers Pro',
        ogDescription: 'High-performance Minecraft servers with mod support and unlimited players.'
    });
});

app.get('/cs16', (req, res) => {
    res.render('cs16', {
        title: 'Counter-Strike 1.6 Server Hosting - Anti-Cheat Protection | GameServers Pro',
        description: 'Professional CS 1.6 server hosting with anti-cheat protection, custom maps, and admin tools. Perfect for competitive gaming.',
        canonicalUrl: 'https://gameservers-pro.com/cs16',
        ogTitle: 'Counter-Strike 1.6 Server Hosting - GameServers Pro',
        ogDescription: 'Professional CS 1.6 servers with anti-cheat protection and custom maps.'
    });
});

app.get('/tf2', (req, res) => {
    res.render('tf2', {
        title: 'Team Fortress 2 Server Hosting - Custom Modes & Maps | GameServers Pro',
        description: 'TF2 server hosting with SourceMod support, custom game modes, and fast setup. Perfect for competitive leagues and community servers.',
        canonicalUrl: 'https://gameservers-pro.com/tf2',
        ogTitle: 'Team Fortress 2 Server Hosting - GameServers Pro',
        ogDescription: 'TF2 servers with SourceMod support and custom game modes.'
    });
});

// Pricing and order pages
app.get('/pricing', (req, res) => {
    res.render('pricing', {
        title: 'Gaming Server Pricing - Affordable Plans | GameServers Pro',
        description: 'Simple pricing for gaming servers. No hidden fees, instant setup, 7-day money back guarantee. Plans starting at $3.99/month.',
        canonicalUrl: 'https://gameservers-pro.com/pricing',
        ogTitle: 'Gaming Server Pricing - GameServers Pro',
        ogDescription: 'Simple pricing for gaming servers starting at $3.99/month.'
    });
});

app.get('/order', (req, res) => {
    res.render('order', {
        title: 'Order Your Gaming Server - Instant Setup | GameServers Pro',
        description: 'Order your gaming server now! Instant setup in 60 seconds. Choose from Minecraft, CS 1.6, or TF2 servers with DDoS protection.',
        canonicalUrl: 'https://gameservers-pro.com/order',
        ogTitle: 'Order Your Gaming Server - GameServers Pro',
        ogDescription: 'Order your gaming server with instant setup in 60 seconds.'
    });
});

// Support and contact
app.get('/support', (req, res) => {
    res.render('support', {
        title: '24/7 Gaming Support - Help Center | GameServers Pro',
        description: 'Get help with your gaming servers 24/7. Live chat, email support, knowledge base, and Discord community for gamers.',
        canonicalUrl: 'https://gameservers-pro.com/support',
        ogTitle: '24/7 Gaming Support - GameServers Pro',
        ogDescription: 'Get help with your gaming servers 24/7. Live chat and email support.'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { 
        title: '404 - Server Not Found | GameServers Pro',
        description: 'The page you are looking for could not be found. Check out our gaming servers for Minecraft, CS 1.6, and TF2.',
        url: req.url,
        canonicalUrl: 'https://gameservers-pro.com' + req.url
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        title: 'Server Error - GameServers Pro',
        description: 'A server error occurred. Our technical team has been notified. Try again or contact support.',
        error: process.env.NODE_ENV === 'production' ? 'Server temporarily unavailable. Please try again.' : err.message,
        canonicalUrl: 'https://gameservers-pro.com'
    });
});

app.listen(PORT, () => {
    console.log(`🎮 GameServers Pro running on http://localhost:${PORT}`);
    console.log(`🚀 Gaming server hosting platform ready!`);
    console.log(`🎯 Serving Minecraft, CS 1.6, and TF2 communities`);
    console.log(`📊 Dashboard available at http://localhost:${PORT}/dashboard`);
});

module.exports = app; 