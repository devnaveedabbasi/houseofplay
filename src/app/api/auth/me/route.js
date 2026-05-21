import { withAuth } from '@/middleware/authMiddleware';
import { getMeController } from '@/controllers/auth.controller';

/**
 * GET /api/auth/me
 * Protected route — requires a valid JWT cookie.
 * Returns the currently authenticated user's profile.
 */
export const GET = withAuth(getMeController);
