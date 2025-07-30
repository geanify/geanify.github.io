const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getBaseUrl } = require('../utils/url');
const router = express.Router();

// Homepage
router.get('/', (req, res) => {
  res.render('index', {
    title: process.env.SITE_TITLE || 'Web Herald - Premium Minecraft, CS 1.6 & TF2 Hosting',
    description: process.env.SITE_DESCRIPTION || 'Professional game server hosting for Minecraft, Counter-Strike 1.6, and Team Fortress 2. 99.9% uptime, DDoS protection, and 24/7 support.',
    keywords: process.env.SITE_KEYWORDS || 'minecraft server hosting, cs 1.6 hosting, tf2 server hosting, game servers, dedicated servers',
    canonicalUrl: getBaseUrl(),
    ogTitle: process.env.OG_TITLE || 'Web Herald - Premium Game Server Hosting',
    ogDescription: process.env.OG_DESCRIPTION || 'Get your Minecraft, CS 1.6, or TF2 server running in minutes. Professional hosting with DDoS protection and 24/7 support.',
    ogImage: process.env.OG_IMAGE || '/images/web-herald-og.jpg',
    ogUrl: getBaseUrl(),
    user: req.user || null
  });
});

// About page
router.get('/about', (req, res) => {
  res.render('about', {
    title: `About Us - ${process.env.SITE_TITLE || 'Web Herald'}`,
    description: 'Learn about Web Herald - your trusted partner for premium game server hosting with years of experience in the gaming industry.',
    keywords: 'about web herald, game hosting company, server hosting experience',
    canonicalUrl: `${getBaseUrl()}/about`,
    ogTitle: `About Us - ${process.env.SITE_TITLE || 'Web Herald'}`,
    ogDescription: 'Learn about Web Herald - your trusted partner for premium game server hosting.',
    ogImage: process.env.OG_IMAGE || '/images/web-herald-og.jpg',
    ogUrl: `${getBaseUrl()}/about`,
    user: req.user || null
  });
});

// Services page
router.get('/services', (req, res) => {
  res.render('services', {
    title: `Our Services - ${process.env.SITE_TITLE || 'Web Herald'}`,
    description: 'Explore our comprehensive game server hosting services including Minecraft, CS 1.6, and TF2 servers with premium features.',
    keywords: 'game server services, minecraft hosting, cs 1.6 hosting, tf2 hosting',
    canonicalUrl: `${getBaseUrl()}/services`,
    ogTitle: `Our Services - ${process.env.SITE_TITLE || 'Web Herald'}`,
    ogDescription: 'Comprehensive game server hosting services with premium features and 24/7 support.',
    ogImage: process.env.OG_IMAGE || '/images/web-herald-og.jpg',
    ogUrl: `${getBaseUrl()}/services`,
    user: req.user || null
  });
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: `Contact Us - ${process.env.SITE_TITLE || 'Web Herald'}`,
    description: 'Get in touch with Web Herald for support, sales inquiries, or custom hosting solutions.',
    keywords: 'contact web herald, game server support, hosting support',
    canonicalUrl: `${getBaseUrl()}/contact`,
    ogTitle: `Contact Us - ${process.env.SITE_TITLE || 'Web Herald'}`,
    ogDescription: 'Get in touch with Web Herald for support and sales inquiries.',
    ogImage: process.env.OG_IMAGE || '/images/web-herald-og.jpg',
    ogUrl: `${getBaseUrl()}/contact`,
    user: req.user || null
  });
});

// Game-specific pages
router.get('/minecraft', (req, res) => {
  res.render('minecraft', {
    title: `Minecraft Server Hosting - ${process.env.SITE_TITLE || 'Web Herald'}`,
    description: 'Premium Minecraft server hosting with instant setup, mod support, and 24/7 uptime. Perfect for vanilla, modded, and custom Minecraft servers.',
    keywords: 'minecraft server hosting, minecraft hosting, bukkit, spigot, forge, fabric',
    canonicalUrl: `${getBaseUrl()}/minecraft`,
    ogTitle: `Minecraft Server Hosting - ${process.env.SITE_TITLE || 'Web Herald'}`,
    ogDescription: 'Premium Minecraft server hosting with instant setup and mod support.',
    ogImage: process.env.OG_IMAGE || '/images/minecraft-hosting.jpg',
    ogUrl: `${getBaseUrl()}/minecraft`,
    user: req.user || null
  });
});

router.get('/cs16', (req, res) => {
  res.render('cs16', {
    title: `Counter-Strike 1.6 Server Hosting - ${process.env.SITE_TITLE || 'Web Herald'}`,
    description: 'Professional CS 1.6 server hosting with low latency, custom maps support, and anti-cheat protection.',
    keywords: 'counter-strike 1.6 hosting, cs 1.6 server, counter-strike hosting',
    canonicalUrl: `${getBaseUrl()}/cs16`,
    ogTitle: `CS 1.6 Server Hosting - ${process.env.SITE_TITLE || 'Web Herald'}`,
    ogDescription: 'Professional Counter-Strike 1.6 server hosting with low latency and anti-cheat.',
    ogImage: process.env.OG_IMAGE || '/images/cs16-hosting.jpg',
    ogUrl: `${getBaseUrl()}/cs16`,
    user: req.user || null
  });
});

router.get('/tf2', (req, res) => {
  res.render('tf2', {
    title: `Team Fortress 2 Server Hosting - ${process.env.SITE_TITLE || 'Web Herald'}`,
    description: 'Reliable TF2 server hosting with custom game modes, maps, and plugins. Perfect for competitive and casual gameplay.',
    keywords: 'team fortress 2 hosting, tf2 server hosting, tf2 hosting',
    canonicalUrl: `${getBaseUrl()}/tf2`,
    ogTitle: `TF2 Server Hosting - ${process.env.SITE_TITLE || 'Web Herald'}`,
    ogDescription: 'Reliable Team Fortress 2 server hosting with custom game modes and maps.',
    ogImage: process.env.OG_IMAGE || '/images/tf2-hosting.jpg',
    ogUrl: `${getBaseUrl()}/tf2`,
    user: req.user || null
  });
});

// Pricing page
router.get('/pricing', (req, res) => {
  res.render('pricing', {
    title: `Pricing - ${process.env.SITE_TITLE || 'Web Herald'}`,
    description: 'Transparent pricing for game server hosting. Choose from our flexible plans for Minecraft, CS 1.6, and TF2 servers.',
    keywords: 'game server pricing, minecraft hosting price, server hosting cost',
    canonicalUrl: `${getBaseUrl()}/pricing`,
    ogTitle: `Pricing - ${process.env.SITE_TITLE || 'Web Herald'}`,
    ogDescription: 'Transparent pricing for premium game server hosting.',
    ogImage: process.env.OG_IMAGE || '/images/web-herald-og.jpg',
    ogUrl: `${getBaseUrl()}/pricing`,
    user: req.user || null
  });
});

// Order page
router.get('/order', (req, res) => {
  res.render('order', {
    title: `Order Server - ${process.env.SITE_TITLE || 'Web Herald'}`,
    description: 'Order your game server today. Simple setup process for Minecraft, CS 1.6, and TF2 servers.',
    keywords: 'order game server, buy minecraft server, order hosting',
    canonicalUrl: `${getBaseUrl()}/order`,
    ogTitle: `Order Server - ${process.env.SITE_TITLE || 'Web Herald'}`,
    ogDescription: 'Order your game server today with our simple setup process.',
    ogImage: process.env.OG_IMAGE || '/images/web-herald-og.jpg',
    ogUrl: `${getBaseUrl()}/order`,
    user: req.user || null
  });
});

// Support page
router.get('/support', (req, res) => {
  res.render('support', {
    title: `Support - ${process.env.SITE_TITLE || 'Web Herald'}`,
    description: '24/7 technical support for your game servers. Get help with setup, troubleshooting, and optimization.',
    keywords: 'game server support, technical support, server help',
    canonicalUrl: `${getBaseUrl()}/support`,
    ogTitle: `Support - ${process.env.SITE_TITLE || 'Web Herald'}`,
    ogDescription: '24/7 technical support for your game servers.',
    ogImage: process.env.OG_IMAGE || '/images/web-herald-og.jpg',
    ogUrl: `${getBaseUrl()}/support`,
    user: req.user || null
  });
});

// Servers management page - protected
router.get('/servers', requireAuth, (req, res) => {
  console.log('User in /servers route:', req.user);
  res.render('servers', {
    title: `Server Management - ${process.env.SITE_TITLE || 'Web Herald'}`,
    description: 'Manage your game servers - add, edit, and delete servers',
    keywords: 'server management, game servers, minecraft, cs16, tf2',
    canonicalUrl: `${getBaseUrl()}/servers`,
    ogTitle: `Server Management - ${process.env.SITE_TITLE || 'Web Herald'}`,
    ogDescription: 'Manage your game servers - add, edit, and delete servers',
    ogImage: process.env.OG_IMAGE || '/images/web-herald-og.jpg',
    ogUrl: `${getBaseUrl()}/servers`,
    user: req.user
  });
});

// Dashboard route - protected
router.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', {
    title: `Dashboard - ${process.env.SITE_TITLE || 'Web Herald'}`,
    description: 'Manage your game servers and view statistics',
    keywords: 'dashboard, server management, web herald',
    canonicalUrl: `${getBaseUrl()}/dashboard`,
    ogTitle: `Dashboard - ${process.env.SITE_TITLE || 'Web Herald'}`,
    ogDescription: 'Manage your game servers and view statistics',
    ogImage: process.env.OG_IMAGE || '/images/web-herald-og.jpg',
    ogUrl: `${getBaseUrl()}/dashboard`,
    user: req.user
  });
});

// Login page
router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login - Web Herald',
    description: 'Login to access your server management dashboard',
    keywords: 'login, authentication, web herald',
    canonicalUrl: `${getBaseUrl()}/login`,
    ogTitle: 'Login - Web Herald',
    ogDescription: 'Login to access your server management dashboard',
    ogImage: process.env.OG_IMAGE || '/images/web-herald-og.jpg',
    ogUrl: `${getBaseUrl()}/login`,
    user: req.user || null
  });
});

module.exports = router; 