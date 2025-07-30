const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { getBaseUrl } = require('../utils/url');
const UserService = require('../services/userService');

// Configure Google OAuth2 strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${getBaseUrl()}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Use UserService to find or create user in database
        const user = await UserService.findOrCreateUser(profile);
        
        // Convert Sequelize model to plain object for session
        const userSession = {
            id: user.id,
            google_id: user.google_id,
            email: user.email,
            name: user.name,
            picture: user.picture
        };
        
        return done(null, userSession);
    } catch (error) {
        console.error('OAuth error:', error);
        return done(error, null);
    }
}));

// Serialize user for session (store minimal data)
passport.serializeUser((user, done) => {
    done(null, user.email); // Store only email in session
});

// Deserialize user from session (fetch from database)
passport.deserializeUser(async (email, done) => {
    try {
        const user = await UserService.getUserByEmail(email);
        if (user) {
            // Convert to plain object for session
            const userSession = {
                id: user.id,
                google_id: user.google_id,
                email: user.email,
                name: user.name,
                picture: user.picture
            };
            done(null, userSession);
        } else {
            done(null, false);
        }
    } catch (error) {
        console.error('Deserialize error:', error);
        done(error, null);
    }
});

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // Redirect to login page instead of directly to Google OAuth
    res.redirect('/login');
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