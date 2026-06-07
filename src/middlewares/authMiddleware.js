const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token and attach to request object
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    statusCode: 401,
                    message: 'User not found, authentication failed'
                });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({
                success:false,
                statusCode:401,
                message: 'Not authorized, token failed' 
                });
        }
    }

    if (!token) {
        res.status(401).json({ 
            success:false,
            statusCode:401,
            message: 'Not authorized, no token, token required' 
        });
    }
};

// Role-based access middleware
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            success:false,
            statusCode:403,
            message: 'Access Denied: Admin privileges required for this action.' 
        });
    }
};

const adminOrManagerOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
        next();
    } else {
        res.status(403).json({ 
            success:false,
            statusCode:403,
            message: 'Access Denied: Admin or Manager role required.' 
        });
    }
};

module.exports = { protect, adminOnly, adminOrManagerOnly };
