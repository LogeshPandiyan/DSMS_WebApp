const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const crypto = require('crypto');
const Document = require('../models/documentModel');

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

const protectOrSignToken = async (req, res, next) => {
    // Check if x-sign-token is provided in headers
    const signToken = req.headers['x-sign-token'];
    const signEmail = req.headers['x-sign-email'];

    if (signToken && signEmail) {
        try {
            const docId = req.params.id;
            if (!docId) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: 'Document ID is required for sign token verification'
                });
            }

            const document = await Document.findById(docId);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    statusCode: 404,
                    message: 'Document not found'
                });
            }

            // Hash the incoming token
            const hashedToken = crypto.createHash('sha256').update(signToken).digest('hex');

            // Find matching token in document.signTokens
            // For GET requests (viewing details), allow even if already used.
            // For POST/PUT requests (signing/actions), require it to be unused.
            const tokenEntry = document.signTokens.find(entry => 
                entry.token === hashedToken && 
                (req.method === 'GET' ? true : !entry.isUsed) && 
                entry.expiresAt > new Date()
            );

            if (!tokenEntry) {
                return res.status(401).json({
                    success: false,
                    statusCode: 401,
                    message: 'Invalid, expired, or already used sign token'
                });
            }

            // Verify user exists and matches the entry's user ID & email
            const user = await User.findById(tokenEntry.user);
            if (!user || user.email.toLowerCase() !== signEmail.toLowerCase()) {
                return res.status(401).json({
                    success: false,
                    statusCode: 401,
                    message: 'Sign token email mismatch or user not found'
                });
            }

            // Set user on request
            req.user = user;
            req.isGuestSigner = true;
            return next();
        } catch (error) {
            console.error('Sign token auth error:', error.message);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: 'Internal server error during token verification'
            });
        }
    }

    // Fallback to standard JWT protection if sign token is not present
    return protect(req, res, next);
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

module.exports = { protect, protectOrSignToken, adminOnly };
