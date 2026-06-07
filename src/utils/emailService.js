const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send email utility
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} replyTo - Optional reply-to email
 * @param {string} cc - Optional CC email
 */
const sendEmail = async (to, subject, html, replyTo = null, cc = null) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "DSMS <noreply@DSMS.com>",
      to,
      subject,
      html,
    };

    if (replyTo) mailOptions.replyTo = replyTo;
    if (cc) mailOptions.cc = cc;

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    return false;
  }
};

/**
 * Templates
 */
const templates = {
  documentAssigned: (userName, docTitle, docId, customMessage = null) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #0e9e8a;">DSMS</h1>
            </div>
            <p>Hi <b>${userName}</b>,</p>
            <p>You have been assigned a new document to sign: <b>${docTitle}</b>.</p>
            
            ${
              customMessage
                ? `
            <div style="background-color: #f8fafc; border-left: 4px solid #0e9e8a; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-style: italic; color: #475569;">"${customMessage}"</p>
            </div>
            `
                : ""
            }

            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/sign/${docId}" style="background-color: #0e9e8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Sign Document</a>
            </div>
            <p style="font-size: 12px; color: #64748b;">If the button doesn't work, copy this link: ${process.env.FRONTEND_URL}/sign/${docId}</p>
        </div>
    `,
  signatureProgress: (
    docTitle,
    signedCount,
    totalCount,
    remainingUsers,
    justSignedUser,
  ) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
            <h2 style="color: #0e9e8a;">Signature Update</h2>
            <p>Document: <b>${docTitle}</b></p>
            <p><b>${justSignedUser}</b> has just signed the document.</p>
            <p>Progress: <b>${signedCount} out of ${totalCount}</b> people have signed.</p>
            <p>Waiting for: <b>${remainingUsers.join(", ")}</b></p>
        </div>
    `,
  documentCompleted: (docTitle) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #10b981;">✅ Document Completed</h1>
            </div>
            <p>Great news! All participants have signed the document: <b>${docTitle}</b>.</p>
            <p>You can now download the fully signed version from your dashboard.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/documents" style="background-color: #0e9e8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Document</a>
            </div>
        </div>
    `,
};

module.exports = { sendEmail, templates };
