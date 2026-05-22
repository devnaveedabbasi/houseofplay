import {
  forgotPasswordService,
  verifyResetOtpService,
  resendResetOtpService,
  resetPasswordService,
  changePasswordService,
} from '@/services/password.service';
import { ApiError } from '@/utils/ApiError';
import { NextResponse } from 'next/server';

// ─── Shared error handler ──────────────────────────────────────────────────────

async function handleRequest(serviceCall) {
  try {
    const result = await serviceCall();
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    console.error('Unhandled password controller error:', error);
    return NextResponse.json(
      { success: false, statusCode: 500, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 */
export async function forgotPasswordController(request) {
  return handleRequest(async () => {
    const { email } = await request.json();
    if (!email) throw new ApiError(400, 'Email is required.');
    return forgotPasswordService(email);
  });
}

// ─── Verify Reset OTP ─────────────────────────────────────────────────────────

/**
 * POST /api/auth/verify-reset-otp
 * Body: { email, otp }
 */
export async function verifyResetOtpController(request) {
  return handleRequest(async () => {
    const { email, otp } = await request.json();
    if (!email || !otp) throw new ApiError(400, 'Email and OTP are required.');
    return verifyResetOtpService(email, otp);
  });
}

// ─── Resend Reset OTP ─────────────────────────────────────────────────────────

/**
 * POST /api/auth/resend-reset-otp
 * Body: { email }
 */
export async function resendResetOtpController(request) {
  return handleRequest(async () => {
    const { email } = await request.json();
    if (!email) throw new ApiError(400, 'Email is required.');
    return resendResetOtpService(email);
  });
}

// ─── Reset Password ───────────────────────────────────────────────────────────

/**
 * POST /api/auth/reset-password
 * Body: { email, resetToken, newPassword }
 */
export async function resetPasswordController(request) {
  return handleRequest(async () => {
    const { email, resetToken, newPassword } = await request.json();
    if (!email || !resetToken || !newPassword) {
      throw new ApiError(400, 'Email, reset token, and new password are required.');
    }
    if (newPassword.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters.');
    }
    return resetPasswordService(email, resetToken, newPassword);
  });
}

// ─── Change Password (Authenticated) ─────────────────────────────────────────

/**
 * POST /api/auth/change-password
 * Protected via withAuth middleware.
 * Body: { currentPassword, newPassword }
 */
export async function changePasswordController(request, { user }) {
  return handleRequest(async () => {
    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Current password and new password are required.');
    }
    if (newPassword.length < 8) {
      throw new ApiError(400, 'New password must be at least 8 characters.');
    }
    return changePasswordService(user.userId, currentPassword, newPassword);
  });
}
