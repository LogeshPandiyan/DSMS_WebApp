const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'User name is required.'],
            trim: true,
            minlength: [3, 'Name must be at least 3 characters'],
            maxlength: [40, 'Name cannot exceed 50 characters']
        },
        email: {
            type: String,
            required: [true, 'User email is required.'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please use a valid email address']
        },
        password: {
            type: String,
            required: [function() { return !this.isInvited; }, 'User password is required.'],
            minlength: [6, 'Password must be at least 6 characters long'],
            maxlength: [20, 'Password cannot exceed 20 characters'],
            trim: true,
            select: false, // hide password in queries
            match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, 'Password must contain uppercase, lowercase and number']
        },
        role: {
            type: String,
            enum: ['admin', 'manager', 'user'],
            default: 'user'
        },
        signature: {
            type: String, // Base64 or URL
            default: null
        },
        avatar: {
            type: String, // Base64 or URL
            default: null
        },
        phone: {
            type: String,
            default: ''
        },
        jobTitle: {
            type: String,
            default: ''
        },
        department: {
            type: String,
            default: ''
        },
        bio: {
            type: String,
            default: ''
        },
        location: {
            type: String,
            default: ''
        },
        notificationSettings: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            documentRequest: { type: Boolean, default: true },
            documentCompleted: { type: Boolean, default: true }
        },
        isInvited: { type: Boolean, default: false },
        inviteToken: String,
        inviteTokenExpire: Date,
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        isActive: { type: Boolean, default: true },
        passwordUpdatedAt: { type: Date },
        activatedBy: { type: String, default: '-' }
    },
    {
        timestamps: true,
    }
);

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password || !enteredPassword) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('authUserManagement', userSchema);
