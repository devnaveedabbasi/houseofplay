import { NextResponse } from 'next/server';
import { resendResetOtpController } from '@/controllers/password.controller';

/**
 * POST /api/auth/resend-reset-otp
 * Public — no auth required.
 * Body: { email }
 */
export async function POST(request) {
  try {
    return await resendResetOtpController(request);
  } catch (error) {
    const status = error?.statusCode || 500;
    const message = error?.message || 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
