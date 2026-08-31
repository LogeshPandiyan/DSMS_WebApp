const nodemailer = require("nodemailer");

/**
 * Utility to send email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message body (HTML)
 */
const sendEmail = async (options) => {
  try {
    // Create a transporter using Gmail service configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || (process.env.EMAIL_USER ? `DSMS <${process.env.EMAIL_USER}>` : "DSMS <noreply@DSMS.com>"),
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("sendEmail success:", info.response);
    return true;
  } catch (err) {
    console.error("sendEmail Error:", err.message);
    return false;
  }
};

module.exports = sendEmail;
