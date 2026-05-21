import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/jwt';
import { ApiError } from '@/utils/ApiError';

/**
 * Higher-order function that protects a route handler with JWT auth.
 *
 * Reads the `token` cookie, verifies it, and injects `req.user` into
 * a plain context object passed as the second argument to the handler.
 *
 * @param {Function} handler  (request: NextRequest, ctx: { user }) => NextResponse
 * @returns {Function}        (request: NextRequest) => NextResponse
 *
 * @example
 *   export const GET = withAuth(async (req, { user }) => {
 *     return NextResponse.json({ userId: user.userId });
 *   });
 */
export function withAuth(handler) {
  return async (request) => {
    try {
      const token =
        request.cookies.get('token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json(
          { success: false, statusCode: 401, message: 'Authentication required. Please log in.' },
          { status: 401 }
        );
      }

      let decoded;
      try {
        decoded = verifyToken(token);
      } catch {
        return NextResponse.json(
          { success: false, statusCode: 401, message: 'Invalid or expired token. Please log in again.' },
          { status: 401 }
        );
      }

      // Attach user info to context
      const ctx = { user: { userId: decoded.userId, role: decoded.role } };
      return await handler(request, ctx);

    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(error.toJSON(), { status: error.statusCode });
      }
      return NextResponse.json(
        { success: false, statusCode: 500, message: 'Internal server error.' },
        { status: 500 }
      );
    }
  };
}
