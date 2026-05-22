import { NextResponse } from 'next/server';
import { resetPasswordController } from '@/controllers/password.controller';

/**
 * POST /api/auth/reset-password
 * Public — no auth required (uses short-lived reset token from OTP verify step).
 * Body: { email, resetToken, newPassword }
 */
export async function POST(request) {
  try {
    return await resetPasswordController(request);
  } catch (error) {
    const status = error?.statusCode || 500;
    const message = error?.message || 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
