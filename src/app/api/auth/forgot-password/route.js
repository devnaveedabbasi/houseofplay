import { NextResponse } from 'next/server';
import { forgotPasswordController } from '@/controllers/password.controller';

/**
 * POST /api/auth/forgot-password
 * Public — no auth required.
 * Body: { email }
 */
export async function POST(request) {
  try {
    return await forgotPasswordController(request);
  } catch (error) {
    const status = error?.statusCode || 500;
    const message = error?.message || 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
