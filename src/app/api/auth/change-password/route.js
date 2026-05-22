import { NextResponse } from 'next/server';
import { changePasswordController } from '@/controllers/password.controller';
import { withAuth } from '@/middleware/authMiddleware';

/**
 * POST /api/auth/change-password
 * Protected — requires valid JWT.
 * Body: { currentPassword, newPassword }
 */
export const POST = withAuth(changePasswordController);
