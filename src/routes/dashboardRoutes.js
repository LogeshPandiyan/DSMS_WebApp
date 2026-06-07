const express = require('express');
const router = express.Router();
const { getUserProfile, getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/get-profile', protect, getUserProfile);
router.get('/get-stats', protect, getDashboardStats);

module.exports = router;
