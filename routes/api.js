const express = require('express');
const { requireAuthAPI } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all API routes
router.use(requireAuthAPI);

// Add any future API endpoints here

module.exports = router; 