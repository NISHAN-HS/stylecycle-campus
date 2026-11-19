const nodemailer = require('nodemailer');

// Create test or SMTP transporter
let transporter = null;

const getTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: test ethereal account or console logger
  return {
    sendMail: async (mailOptions) => {
      console.log('----------------------------------------------------');
      console.log(`[EMAIL DISPATCH] To: ${mailOptions.to}`);
      console.log(`[EMAIL DISPATCH] Subject: ${mailOptions.subject}`);
      console.log(`[EMAIL DISPATCH] Content:\n${mailOptions.text || mailOptions.html}`);
      console.log('----------------------------------------------------');
      return { messageId: 'simulated-' + Date.now() };
    },
  };
};

const sendVerificationEmail = async (email, otp, studentName) => {
  const mailer = await getTransporter();
  const mailOptions = {
    from: '"StyleCycle Campus" <no-reply@stylecycle.campus>',
    to: email,
    subject: `Your StyleCycle Student Verification Code: ${otp}`,
    text: `Hello ${studentName || 'Student'},\n\nYour 6-digit campus verification code is: ${otp}\n\nThis code will expire in 10 minutes. If you did not request this, please ignore this email.\n\nBest regards,\nStyleCycle Campus Circular Team`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background-color: #FAF9F5; border: 1px solid #E5E7E0; border-radius: 20px; padding: 32px; color: #20251F;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #234D3C; font-size: 26px; margin: 0;">STYLECYCLE</h2>
          <p style="color: #777D75; font-size: 13px; margin: 4px 0 0;">Campus Circular Wardrobe & Thrift Marketplace</p>
        </div>
        <div style="background-color: #ffffff; border-radius: 16px; border: 1px solid #E5E7E0; padding: 24px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <p style="font-size: 15px; margin: 0 0 16px;">Hello <strong>${studentName || 'Student'}</strong>,</p>
          <p style="font-size: 14px; color: #5C625A; margin: 0 0 20px;">Use the verification code below to verify your student account and unlock full campus thrift access:</p>
          <div style="display: inline-block; background-color: #F0F6F1; border: 2px dashed #234D3C; border-radius: 12px; padding: 12px 28px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #234D3C; margin: 10px 0 20px;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #9DA39B; margin: 12px 0 0;">Code valid for 10 minutes. Never share this code with anyone.</p>
        </div>
      </div>
    `,
  };

  return await mailer.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, resetToken, studentName) => {
  const mailer = await getTransporter();
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: '"StyleCycle Campus" <no-reply@stylecycle.campus>',
    to: email,
    subject: 'StyleCycle - Password Reset Request',
    text: `Hello ${studentName || 'Student'},\n\nYou requested a password reset. Please use the following link to set a new password:\n\n${resetUrl}\n\nThis link is valid for 1 hour.\n\nBest regards,\nStyleCycle Team`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background-color: #FAF9F5; border: 1px solid #E5E7E0; border-radius: 20px; padding: 32px; color: #20251F;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #234D3C; font-size: 26px; margin: 0;">STYLECYCLE</h2>
          <p style="color: #777D75; font-size: 13px; margin: 4px 0 0;">Password Reset Request</p>
        </div>
        <div style="background-color: #ffffff; border-radius: 16px; border: 1px solid #E5E7E0; padding: 24px; text-align: center;">
          <p style="font-size: 15px; margin: 0 0 16px;">Hello <strong>${studentName || 'Student'}</strong>,</p>
          <p style="font-size: 14px; color: #5C625A; margin: 0 0 24px;">Click the button below to reset your StyleCycle account password. This link is valid for 1 hour.</p>
          <a href="${resetUrl}" style="background-color: #234D3C; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">Reset Password</a>
          <p style="font-size: 11px; color: #9DA39B; margin: 24px 0 0;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  };

  return await mailer.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
