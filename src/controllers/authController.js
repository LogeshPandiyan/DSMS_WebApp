const User = require('../models/userModel');
const generateToken = require('../utils/tokenUtils');
const { createAuditLog } = require('../utils/auditLogger');
const crypto = require('crypto');

// Register a new user // @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if all fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'All fields are required.'
            });
        }

        // 2. Name Validation: Minimum 3 characters, alphabets and spaces only
        const nameRegex = /^[a-zA-Z\s]{3,}$/;
        if (!nameRegex.test(name)) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'Name must be at least 3 characters long and contain only alphabets.'
            });
        }

        // 3. Email Validation: Regex for valid email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'Please provide a valid email address.'
            });
        }

        // 4. Password Validation: Length and Complexity
        const { confirmPassword } = req.body;
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'Password must be at least 6 characters'
            });
        }

        // 5. Password Match Check (if confirmPassword is provided)
        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'Passwords do not match.'
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ 
                success: false,
                statusCode: 400,
                message: 'User already exists. Please login to continue.' 
            });
        }

        const createRegisterUser = await User.create({ name, email, password, role: req.body.role || 'employee' });
        if (createRegisterUser) {
            await createAuditLog({
                user: createRegisterUser,
                action: 'REGISTER',
                details: `User ${createRegisterUser.name} registered with role ${createRegisterUser.role}`,
                targetType: 'user',
                targetId: createRegisterUser._id,
                req
            });

            res.status(201).json({
                success: true,
                statusCode: 201,
                message: 'User Registered Successfully',
                data: {
                    _id: createRegisterUser._id,
                    name: createRegisterUser.name,
                    email: createRegisterUser.email,
                    role: createRegisterUser.role,
                    token: generateToken(createRegisterUser._id),
                }
            });
        } else {
            res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'Invalid user data'
            });
        }
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: Object.values(error.errors).map(val => val.message)[0]
            });
        }
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: error.message || "Internal Server Error"
        });
    }
};

// Authenticate user & get token
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'All fields are required'
            })
        }

        const registeredUser = await User.findOne({ email }).select('+password');
        if (registeredUser && (await registeredUser.matchPassword(password))) {
            await createAuditLog({
                user: registeredUser,
                action: 'LOGIN',
                details: `User ${registeredUser.name} logged in`,
                targetType: 'auth',
                req
            });

            res.json({
                success: true,
                statusCode: 200,
                message: 'User Logged in Successfully',
                data: {
                    _id: registeredUser._id,
                    name: registeredUser.name,
                    email: registeredUser.email,
                    role: registeredUser.role,
                    token: generateToken(registeredUser._id),
                }
            });
        } 
        else {
            res.status(401).json({
                success: false,
                statusCode: 401,
                message: 'Invalid email or password'
            });
        }
    } 
    catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: error.message || 'Internal Server Error'
        });
    }
};

const sendEmail = require('../utils/sendEmail');

// Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'User not found with this email'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save({ validateBeforeSave: false });

        // Reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        // HTML Message
        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #12b79f; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">EliteSign Pro</h1>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h2 style="color: #1e293b; margin-top: 0;">Password Recovery Request</h2>
                    <p style="color: #475569; line-height: 1.6;">Hi ${user.name},</p>
                    <p style="color: #475569; line-height: 1.6;">We received a request to reset your password. Click the button below to choose a new one. This link will expire in 10 minutes.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #12b79f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset My Password</a>
                    </div>
                    <p style="color: #94a3b8; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
                </div>
            </div>
        `;
/*
<div style="background-color: #f8fafc; padding: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} EliteSign Technology. All rights reserved.
                </div>
*/                
        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Recovery - EliteSign Pro',
                message
            });

            res.json({
                success: true,
                statusCode: 200,
                message: 'Recovery link sent successfully to your email.'
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: 'Email could not be sent. Please try again later.'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: error.message
        });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'Invalid or expired recovery link'
            });
        }

        // Validate password
        const { password } = req.body;
        if (!password || password.length < 6) {
             return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'Password must be at least 6 characters'
            });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        await createAuditLog({
            user,
            action: 'PASSWORD_RESET',
            details: `User ${user.name} reset their password`,
            targetType: 'auth',
            req
        });

        res.json({
            success: true,
            statusCode: 200,
            message: 'Password reset successful. You can now login.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: error.message
        });
    }
};

// Logout user
const logoutUser = (req, res) => {
    try {
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0),
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: error.message || 'Internal Server Error'
        })
    }
};

// Get current user profile
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                success: true,
                statusCode:200,
                data: {
                    user
                }
            });
        } 
        else {
            res.status(404).json({
                success: false,
                statusCode:404,
                message: 'User not found'
            });
        }
    } 
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update profile details
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name !== undefined ? req.body.name : user.name;
            user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;
            user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
            user.jobTitle = req.body.jobTitle !== undefined ? req.body.jobTitle : user.jobTitle;
            user.department = req.body.department !== undefined ? req.body.department : user.department;
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            user.location = req.body.location !== undefined ? req.body.location : user.location;
            
            const updatedUser = await user.save();
            
            await createAuditLog({
                user: updatedUser,
                action: 'UPDATE_PROFILE',
                details: `User updated their profile details`,
                targetType: 'user',
                targetId: updatedUser._id,
                req
            });

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update signature
const updateSignature = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.signature = req.body.signature;
            const updatedUser = await user.save();

            await createAuditLog({
                user: updatedUser,
                action: 'UPDATE_SIGNATURE',
                details: `User updated their e-signature`,
                targetType: 'user',
                targetId: updatedUser._id,
                req
            });

            res.json({
                success: true,
                message: 'Signature updated successfully',
                data: updatedUser
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update notification settings
const updateNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.notificationSettings = {
                ...user.notificationSettings,
                ...req.body
            };
            const updatedUser = await user.save();

            res.json({
                success: true,
                message: 'Notification settings updated',
                data: updatedUser
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Password (Settings page)
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword;
            await user.save();

            await createAuditLog({
                user,
                action: 'UPDATE_PASSWORD',
                details: `User changed their password from settings`,
                targetType: 'auth',
                req
            });

            res.json({
                success: true,
                message: 'Password updated successfully'
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid current password'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    logoutUser, 
    forgotPassword, 
    resetPassword,
    getMe,
    updateProfile,
    updateSignature,
    updateNotifications,
    updatePassword
};
