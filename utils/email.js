const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const APP_NAME = process.env.APP_NAME || 'Gov Services Platform';
const DEFAULT_FROM =
  process.env.EMAIL_FROM || `"${APP_NAME}" <no-reply@govplatform.com>`;

/**
 * Base HTML wrapper shared across all emails for a consistent, professional look.
 * @param {string} title - Heading shown at the top of the email
 * @param {string} bodyHtml - Inner HTML content specific to the email
 */
const baseTemplate = (title, bodyHtml) => `
  <div style="background-color:#f4f5f7; padding: 40px 16px; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
    <div style="max-width: 480px; margin: 0 auto; background:#ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

      <!-- Header -->
      <div style="background:#1e3a8a; padding: 24px 32px;">
        <h1 style="margin:0; color:#ffffff; font-size: 20px; font-weight: 600;">${APP_NAME}</h1>
      </div>

      <!-- Body -->
      <div style="padding: 32px;">
        <h2 style="margin:0 0 16px; color:#111827; font-size: 18px;">${title}</h2>
        ${bodyHtml}
      </div>

      <!-- Footer -->
      <div style="padding: 20px 32px; background:#f9fafb; border-top: 1px solid #e5e7eb;">
        <p style="margin:0; color:#9ca3af; font-size: 12px; text-align:center;">
          This is an automated message from ${APP_NAME}. Please do not reply to this email.
        </p>
      </div>
    </div>
  </div>
`;

/**
 * Sends a password reset email containing a secure reset link.
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Raw (unhashed) reset token
 */
const sendPasswordResetEmail = async (to, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const body = `
    <p style="color:#374151; font-size: 14px; line-height: 1.6;">
      We received a request to reset the password for your account. Click the button below to choose a new password.
    </p>
    <div style="text-align:center; margin: 28px 0;">
      <a href="${resetUrl}"
         style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none;
                padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;">
        Reset Password
      </a>
    </div>
    <p style="color:#6b7280; font-size: 13px; line-height: 1.6;">
      This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
    </p>
    <p style="color:#9ca3af; font-size: 12px; word-break: break-all; margin-top: 20px;">
      ${resetUrl}
    </p>
  `;

  await transporter.sendMail({
    from: DEFAULT_FROM,
    to,
    subject: 'Reset Your Password',
    html: baseTemplate('Password Reset Request', body),
  });
};

/**
 * Sends a 6-digit OTP for email/account verification.
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit verification code
 * @param {string} firstName - Recipient's first name
 */
const sendVerificationOTP = async (to, otp, firstName) => {
  const body = `
    <p style="color:#374151; font-size: 14px; line-height: 1.6;">
      Hi ${firstName},
    </p>
    <p style="color:#374151; font-size: 14px; line-height: 1.6;">
      Use the verification code below to activate your account:
    </p>
    <div style="background:#f3f4f6; border-radius:10px; padding: 20px; text-align:center; margin: 24px 0;">
      <span style="font-size: 32px; font-weight: 700; letter-spacing: 10px; color:#1e3a8a;">
        ${otp}
      </span>
    </div>
    <p style="color:#6b7280; font-size: 13px; line-height: 1.6;">
      This code will expire in <strong>10 minutes</strong>. If you didn't request this, please ignore this email.
    </p>
  `;

  await transporter.sendMail({
    from: DEFAULT_FROM,
    to,
    subject: 'Your Verification Code',
    html: baseTemplate('Verify Your Account', body),
  });
};

module.exports = { sendPasswordResetEmail, sendVerificationOTP };