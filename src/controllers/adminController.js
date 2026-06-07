const User = require('../models/userModel');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Get all users
// @route   GET /api/
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json({
            success: true,
            message: 'All users fetched successfully',
            count: users.length,
            data: users
        });
    } 
    catch (error) {
        console.error('Fetch Users Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch users. Please try again later.',
            error: error.message 
        });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }).select('-password');

        if (updatedUser) {
            res.status(200).json({
                success: true,
                statusCode:200,
                message: `User role has been successfully updated to ${updatedUser.role}`,
                data: updatedUser
            });

            // Audit Log
            await createAuditLog({
                user: req.user,
                action: 'USER_ROLE_UPDATED',
                details: `Role for user ${updatedUser.name} (${updatedUser.email}) updated to ${updatedUser.role}`,
                targetType: 'user',
                targetId: updatedUser._id,
                req
            });
        } 
        else {
            res.status(404).json({ 
                success: false,
                statusCode:404,
                message: 'User matching the provided ID was not found.' 
            });
        }
    } 
    catch (error) {
        console.error('Update Role Error:', error.message);
        res.status(500).json({ 
            success: false,
            statusCode:500,
            message: 'An error occurred while updating the user role.',
            error: error.message 
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                statusCode:404,
                message: 'User not found' 
            });
        }

        // Prevent self-deletion
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ 
                success: false, 
                statusCode:400,
                message: 'Administrators cannot delete themselves' 
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            statusCode:200,
            message: 'User deleted successfully',
            data:[]
        });

        // Audit Log
        await createAuditLog({
            user: req.user,
            action: 'USER_DELETED',
            details: `User ${user.name} (${user.email}) deleted from system`,
            targetType: 'user',
            targetId: user._id,
            req
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            statusCode:500,
            message: error.message });
    }
};

module.exports = {getUsers, updateUserRole, deleteUser};
