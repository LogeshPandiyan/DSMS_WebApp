const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deleteUser, toggleUserStatus } = require('../controllers/adminController');
const { getAuditLogs } = require('../controllers/auditController');

const { protect, adminOnly } = require('../middlewares/authMiddleware');

// All routes here are protected
router.use(protect);

router.get('/users/get-all', adminOnly, getUsers);
router.put('/users/update-role/:id', adminOnly, updateUserRole);
router.delete('/users/delete/:id', adminOnly, deleteUser);
router.put('/users/toggle-status/:id', adminOnly, toggleUserStatus);
router.get('/logs/get-all', adminOnly, getAuditLogs);


module.exports = router;
