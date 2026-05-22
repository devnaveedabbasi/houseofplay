import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { ApiError } from '@/utils/ApiError';
import { ApiResponse } from '@/utils/ApiResponse';
import { signToken, verifyToken } from '@/utils/jwt';
import nodemailer from 'nodemailer';
import config from '@/lib/config';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { otp, otpExpires };
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

/**
 * Step 1: User submits email → generate OTP, store on user, send email.
 */
export const forgotPasswordService = async (email) => {
  await dbConnect();

  const user = await User.findOne({ email }).select('+otp +otpExpires +resendOtpCount +limitResendOtp');

  if (!user) {
    // Return generic message to avoid email enumeration
    return new ApiResponse(
      200,
      { email },
      'If this email is registered, you will receive a password reset code.'
    );
  }

  if (!user.isVerified) {
    throw new ApiError(400, 'Your account is not verified. Please verify your email first.');
  }

  const { otp, otpExpires } = generateOtp();
  user.otp = otp;
  user.otpExpires = otpExpires;
  user.resendOtpCount = 0; // reset resend count on fresh forgot password
  await user.save();

  await sendPasswordResetOtpEmail(email, otp);

  return new ApiResponse(
    200,
    { email },
    'A password reset OTP has been sent to your email.'
  );
};

// ─── Resend Reset OTP ─────────────────────────────────────────────────────────

/**
 * Step 1b: User requests a resend of the reset OTP.
 */
export const resendResetOtpService = async (email) => {
  await dbConnect();

  const user = await User.findOne({ email }).select('+otp +otpExpires +resendOtpCount +limitResendOtp');

  if (!user) throw new ApiError(404, 'User not found.');
  if (!user.isVerified) throw new ApiError(400, 'Account not verified.');

  const limit = user.limitResendOtp ?? 5;
  if (user.resendOtpCount >= limit) {
    throw new ApiError(429, `OTP resend limit (${limit}) reached. Please try again later.`);
  }

  const { otp, otpExpires } = generateOtp();
  user.otp = otp;
  user.otpExpires = otpExpires;
  user.resendOtpCount = (user.resendOtpCount ?? 0) + 1;
  await user.save();

  await sendPasswordResetOtpEmail(email, otp);

  return new ApiResponse(
    200,
    { email, attemptsRemaining: limit - user.resendOtpCount },
    'A new reset OTP has been sent to your email.'
  );
};

// ─── Verify Reset OTP ─────────────────────────────────────────────────────────

/**
 * Step 2: User submits OTP → verify and return a short-lived reset token.
 */
export const verifyResetOtpService = async (email, otp) => {
  await dbConnect();

  const user = await User.findOne({ email }).select('+otp +otpExpires');

  if (!user) throw new ApiError(404, 'User not found.');
  if (!user.isVerified) throw new ApiError(400, 'Account not verified.');
  if (!user.otp) throw new ApiError(400, 'No OTP found. Please request a new one.');
  if (user.otp !== otp) throw new ApiError(400, 'Invalid OTP. Please check and try again.');
  if (Date.now() > user.otpExpires.getTime()) {
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  // Clear the OTP — it's single use
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  // Issue a short-lived reset token (re-uses the same JWT infrastructure)
  const resetToken = signToken(user._id.toString(), user.role);

  return new ApiResponse(
    200,
    { resetToken, email },
    'OTP verified. You can now reset your password.'
  );
};

// ─── Reset Password ───────────────────────────────────────────────────────────

/**
 * Step 3: User submits new password with the reset token.
 */
export const resetPasswordService = async (email, resetToken, newPassword) => {
  await dbConnect();

  // Verify the reset token
  let decoded;
  try {
    decoded = verifyToken(resetToken);
  } catch {
    throw new ApiError(400, 'Reset token is invalid or has expired. Please start over.');
  }

  const user = await User.findById(decoded.userId).select('+password');

  if (!user) throw new ApiError(404, 'User not found.');
  if (user.email !== email) throw new ApiError(400, 'Invalid reset request.');

  // Make sure new password is different
  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) {
    throw new ApiError(400, 'New password cannot be the same as your current password.');
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return new ApiResponse(200, null, 'Password reset successfully. You can now log in.');
};

// ─── Change Password (Authenticated) ─────────────────────────────────────────

/**
 * Authenticated user changes their own password.
 * @param {string} userId   — from decoded JWT
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export const changePasswordService = async (userId, currentPassword, newPassword) => {
  await dbConnect();

  const user = await User.findById(userId).select('+password');

  if (!user) throw new ApiError(404, 'User not found.');

  const isCorrect = await bcrypt.compare(currentPassword, user.password);
  if (!isCorrect) throw new ApiError(400, 'Current password is incorrect.');

  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) throw new ApiError(400, 'New password cannot be the same as your current password.');

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return new ApiResponse(200, null, 'Password changed successfully.');
};

// ─── Mailer helper ────────────────────────────────────────────────────────────

/**
 * Send a password reset OTP email.
 */
async function sendPasswordResetOtpEmail(to, otp) {
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });

  try {
    await transporter.sendMail({
      from: `"House Of Play" <${config.email.user}>`,
      to,
      subject: 'Reset Your Password — House Of Play',
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
          <div style="background: #383F43; padding: 32px 32px 24px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Password Reset Request</h2>
          </div>
          <div style="padding: 32px;">
            <p style="color: #555; font-size: 15px;">You requested to reset your password for your <strong>House Of Play</strong> account.</p>
            <p style="color: #555; font-size: 15px;">Use the code below to reset your password. It expires in <strong>10 minutes</strong>.</p>
            <div style="font-size: 40px; letter-spacing: 10px; font-weight: bold; color: #4CA048; margin: 28px 0; text-align: center; background: #f4f5f5; padding: 20px; border-radius: 8px;">
              ${otp}
            </div>
            <p style="color: #999; font-size: 13px;">If you did not request a password reset, you can safely ignore this email. Your password will not be changed.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('❌ Password reset email failed:', error);
    throw new Error('Could not send password reset email. Please try again.');
  }
}
