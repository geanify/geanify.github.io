const express = require('express');
const { passport } = require('../middleware/auth');
const { getBaseUrl } = require('../utils/url');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
    res.render('login', {
        title: `Login - ${process.env.SITE_TITLE || 'Web Herald'}`,
        description: 'Login to access your Web Herald dashboard',
        keywords: 'login, dashboard, web herald',
        canonicalUrl: `${getBaseUrl()}/auth/login`,
        ogTitle: `Login - ${process.env.SITE_TITLE || 'Web Herald'}`,
        ogDescription: 'Login to access your Web Herald dashboard',
        ogImage: process.env.OG_IMAGE || '/images/web-herald-og.jpg',
        ogUrl: `${getBaseUrl()}/auth/login`,
        user: req.user || null
    });
});

// Google OAuth2 login
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Google OAuth2 callback
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/auth/login?error=oauth_failed' }),
    (req, res) => {
        // Successful authentication, redirect to dashboard
        res.redirect('/dashboard');
    }
);

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

module.exports = router; 