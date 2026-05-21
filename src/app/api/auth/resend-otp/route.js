import { resendOtpController } from '@/controllers/auth.controller';

/**
 * POST /api/auth/resend-otp
 * Public route — no authentication required.
 * Body: { email }
 */
export async function POST(request) {
  return resendOtpController(request);
}
