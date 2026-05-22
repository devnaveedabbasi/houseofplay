import { NextResponse } from 'next/server';
import { verifyResetOtpController } from '@/controllers/password.controller';

/**
 * POST /api/auth/verify-reset-otp
 * Public — no auth required.
 * Body: { email, otp }
 */
export async function POST(request) {
  try {
    return await verifyResetOtpController(request);
  } catch (error) {
    const status = error?.statusCode || 500;
    const message = error?.message || 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
