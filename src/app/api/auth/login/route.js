import { loginController } from '@/controllers/auth.controller';

/**
 * POST /api/auth/login
 * Public route — no authentication required.
 * Sets an httpOnly JWT cookie on success.
 */
export async function POST(request) {
  return loginController(request);
}
