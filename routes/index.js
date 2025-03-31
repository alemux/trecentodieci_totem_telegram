const express = require('express');
const router = express.Router();

// Import delle route
const totemRoutes = require('./totemRoutes');

// Monta le route
router.use('/api', totemRoutes);

module.exports = router; 