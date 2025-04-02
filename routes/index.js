const express = require('express');
const router = express.Router();

// Import delle route
const totemRoutes = require('./totemRoutes');
const adminRoutes = require('./adminRoutes');

// Monta le route
router.use('/api', totemRoutes);
router.use('/admin', adminRoutes);

module.exports = router; 