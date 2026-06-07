const nodemailer = require('nodemailer');

/**
 * Utility to send email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message body (HTML)
 */
const sendEmail = async (options) => {
    // Create a transporter
    // For Gmail: Use App Passwords if 2FA is enabled
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Define email options
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"EliteSign Pro" <noreply@elitesign.com>',
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
