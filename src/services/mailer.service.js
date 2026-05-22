import nodemailer from 'nodemailer';
import config from '@/lib/config';

/**
 * Lazy-initialized transporter to avoid module-load errors
 * when email env vars are not set during build time.
 */
let _transporter = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }
  return _transporter;
}

/**
 * Send a 6-digit OTP verification email.
 * @param {string} to   recipient email address
 * @param {string} otp  6-digit code
 */
export const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `"House Of Play" <${config.email.user}>`,
    to,
    subject: 'Your verification code',
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 32px;">
        <h2 style="color: #111; margin-top: 0;">Verify your email</h2>
        <p style="color: #555;">Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size: 36px; letter-spacing: 8px; font-weight: bold; color: #4CA048; margin: 28px 0; text-align: center;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 13px;">If you did not sign up for House Of Play, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    await getTransporter().sendMail(mailOptions);
  } catch (error) {
    console.error('❌ OTP email failed:', error);
    throw new Error('Could not send verification email. Please try again.');
  }
};
