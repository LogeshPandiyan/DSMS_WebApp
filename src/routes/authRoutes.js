const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    logoutUser, 
    forgotPassword, 
    resetPassword,
    getMe,
    updateProfile,
    updateSignature,
    updateNotifications,
    updatePassword,
    inviteUser,
    setupPassword
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.post('/setup-password/:token', setupPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/invite', protect, inviteUser);
router.put('/profile', protect, updateProfile);
router.put('/signature', protect, updateSignature);
router.put('/notifications', protect, updateNotifications);
router.put('/update-password', protect, updatePassword);

module.exports = router;
