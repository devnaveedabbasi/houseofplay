import { verifyOtpController } from '@/controllers/auth.controller';

/**
 * POST /api/auth/verify-otp
 * Public route — no authentication required.
 * Body: { email, otp }
 */
export async function POST(request) {
  return verifyOtpController(request);
}
