const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { getBaseUrl } = require('../utils/url');

// Configure Google OAuth2 strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${getBaseUrl()}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Here you would typically save the user to a database
        // For now, we'll just return the profile
        const user = {
            id: profile.id,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : 'No email',
            name: profile.displayName || 'Unknown User',
            picture: profile.photos && profile.photos[0] ? profile.photos[0].value : '/images/default-avatar.png'
        };
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
    done(null, user);
});

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
};

// Middleware to check if user is authenticated for API routes
const requireAuthAPI = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Authentication required' });
};

module.exports = {
    passport,
    requireAuth,
    requireAuthAPI
}; 