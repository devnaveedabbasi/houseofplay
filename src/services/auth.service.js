import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/services/mailer.service';
import { signToken, verifyToken } from '@/utils/jwt';
import { ApiError } from '@/utils/ApiError';
import { ApiResponse } from '@/utils/ApiResponse';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate a 6-digit OTP and its 10-minute expiry timestamp.
 */
function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  return { otp, otpExpires };
}

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * If an unverified account with the same email exists, replace it.
 */
export const registerUser = async ({ fullName, email, password, role }) => {
  await dbConnect();

  const existingUser = await User.findOne({ email });

  if (existingUser && existingUser.isVerified) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  // Remove stale unverified account
  if (existingUser && !existingUser.isVerified) {
    await User.deleteOne({ email });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const { otp, otpExpires } = generateOtp();

  const newUser = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role: role || 'user',
    otp,
    otpExpires,
    isVerified: false,
    resendOtpCount: 0,
    limitResendOtp: 5,
  });

  await sendOtpEmail(email, otp);

  return new ApiResponse(
    201,
    { email: newUser.email },
    'Registration successful. Please check your email for the OTP.'
  );
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────

/**
 * Verify the OTP sent to the user's email.
 * On success, marks the user as verified and issues a JWT.
 */
export const verifyOtpService = async (email, otp) => {
  await dbConnect();

  const user = await User.findOne({ email }).select('+otp +otpExpires +token');

  if (!user) throw new ApiError(404, 'User not found.');
  if (user.isVerified) throw new ApiError(400, 'This account is already verified.');
  if (user.otp !== otp) throw new ApiError(400, 'Invalid OTP. Please check and try again.');
  if (Date.now() > user.otpExpires.getTime()) {
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  const token = signToken(user._id.toString(), user.role);
  user.token = token;

  await user.save();

  return new ApiResponse(
    200,
    {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: true,
      },
      token,
    },
    'Email verified successfully! Welcome to House Of Play.'
  );
};

// ─── Resend OTP ───────────────────────────────────────────────────────────────

/**
 * Resend an OTP to the user's email, respecting the resend limit.
 */
export const resendOtpService = async (email) => {
  await dbConnect();

  const user = await User.findOne({ email }).select(
    '+otp +otpExpires +resendOtpCount +limitResendOtp'
  );

  if (!user) throw new ApiError(404, 'User not found.');
  if (user.isVerified) throw new ApiError(400, 'This account is already verified.');

  const limit = user.limitResendOtp ?? 5;
  if (user.resendOtpCount >= limit) {
    throw new ApiError(
      429,
      `OTP resend limit (${limit}) reached. Please try again later.`
    );
  }

  const { otp, otpExpires } = generateOtp();
  user.otp = otp;
  user.otpExpires = otpExpires;
  user.resendOtpCount = (user.resendOtpCount ?? 0) + 1;

  await user.save();
  await sendOtpEmail(email, otp);

  return new ApiResponse(
    200,
    { email: user.email, attemptsRemaining: limit - user.resendOtpCount },
    'A new OTP has been sent to your email.'
  );
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Authenticate a user with email + password.
 * If the account is unverified, auto-send a new OTP.
 */
export const loginUserService = async (email, password) => {
  await dbConnect();

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const user = await User.findOne({ email }).select('+password +token');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Unverified — auto-send OTP and prompt verification
  if (!user.isVerified) {
    const { otp, otpExpires } = generateOtp();
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
    await sendOtpEmail(email, otp);

    return new ApiResponse(
      403,
      { email: user.email, requiresVerification: true },
      'Please verify your email first. A new OTP has been sent.'
    );
  }

  const token = signToken(user._id.toString(), user.role);
  user.token = token;
  await user.save();

  return new ApiResponse(
    200,
    {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    },
    'Login successful. Welcome back!'
  );
};

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Invalidate the user's stored token.
 */
export const logoutUserService = async (userId) => {
  await dbConnect();

  if (!userId) throw new ApiError(400, 'User ID is required.');

  await User.findByIdAndUpdate(userId, { token: null });

  return new ApiResponse(200, null, 'You have been logged out successfully.');
};

// ─── Get Current User ─────────────────────────────────────────────────────────

/**
 * Fetch the currently authenticated user by their decoded JWT payload.
 * @param {string} userId — from verified JWT payload
 */
export const getCurrentUserService = async (userId) => {
  await dbConnect();

  const user = await User.findById(userId);

  if (!user) throw new ApiError(404, 'User not found.');

  return new ApiResponse(
    200,
    {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    },
    'User fetched successfully.'
  );
};
