import { withAuth } from '@/middleware/authMiddleware';
import { logoutController } from '@/controllers/auth.controller';

/**
 * POST /api/auth/logout
 * Protected route — requires a valid JWT cookie.
 * Clears the httpOnly cookie and invalidates the token in the DB.
 */
export const POST = withAuth(logoutController);
