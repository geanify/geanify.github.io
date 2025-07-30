require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const { passport } = require('./middleware/auth');
const { getBaseUrl } = require('./utils/url');
const { sequelize, testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize database
const initializeDatabase = async () => {
  try {
    await testConnection();
    
    // Force sync database models (drops and recreates tables cleanly)
    await sequelize.sync({ force: true });
    console.log('✅ Database models synchronized successfully.');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
const apiRoutes = require('./routes/api');
const viewRoutes = require('./routes/views');
const authRoutes = require('./routes/auth');

app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/', viewRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - Page Not Found',
    description: 'The page you are looking for could not be found.',
    keywords: '404, page not found',
    canonicalUrl: `${getBaseUrl()}${req.path}`,
    ogTitle: '404 - Page Not Found',
    ogDescription: 'The page you are looking for could not be found.',
    ogImage: process.env.OG_IMAGE || '/images/web-herald-og.jpg',
    ogUrl: `${getBaseUrl()}${req.path}`,
    user: req.user || null
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: '500 - Server Error',
    description: 'An internal server error occurred.',
    keywords: '500, server error',
    canonicalUrl: `${getBaseUrl()}${req.path}`,
    ogTitle: '500 - Server Error',
    ogDescription: 'An internal server error occurred.',
    ogImage: process.env.OG_IMAGE || '/images/web-herald-og.jpg',
    ogUrl: `${getBaseUrl()}${req.path}`,
    user: req.user || null
  });
});

// Start server after database initialization
const startServer = async () => {
  await initializeDatabase();
  
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    console.log(`📝 Environment: ${NODE_ENV}`);
    console.log(`📁 Static files: ${path.join(__dirname, 'public')}`);
    console.log(`🎨 Views: ${path.join(__dirname, 'views')}`);
    console.log(`🔐 OAuth2 callback: ${getBaseUrl()}/auth/google/callback`);
    console.log(`🗄️  Database: ${path.join(__dirname, 'database.sqlite')}`);
  });
};

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 