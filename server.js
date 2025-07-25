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

// Routes
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Web Herald', 
        message: 'Welcome to Web Herald!' 
    });
});

app.get('/about', (req, res) => {
    res.render('about', { 
        title: 'About - Web Herald',
        content: 'This is a sample web application built with Express.js and EJS templates.'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { 
        title: '404 - Page Not Found',
        url: req.url
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        title: 'Error - Web Herald',
        error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app; 