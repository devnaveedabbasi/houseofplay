import { NextResponse } from 'next/server';
import {
  registerUser,
  loginUserService,
  verifyOtpService,
  resendOtpService,
  logoutUserService,
  getCurrentUserService,
} from '@/services/auth.service';
import { ApiError } from '@/utils/ApiError';

// ─── Shared error handler ──────────────────────────────────────────────────────

/**
 * Wraps a service call. The callback must return a plain ApiResponse object
 * (NOT a NextResponse). This function converts it to a NextResponse.
 */
async function handleRequest(serviceCall) {
  try {
    const result = await serviceCall();
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    console.error('Unhandled controller error:', error);
    return NextResponse.json(
      { success: false, statusCode: 500, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
export async function registerController(request) {
  return handleRequest(async () => {
    const body = await request.json();
    const { fullName, email, password, role } = body;

    if (!fullName || !email || !password) {
      throw new ApiError(400, 'fullName, email, and password are required.');
    }

    return registerUser({ fullName, email, password, role });
  });
}

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Returns token in JSON body. Frontend stores it in localStorage.
 */
export async function loginController(request) {
  return handleRequest(async () => {
    const { email, password } = await request.json();
    // Returns plain ApiResponse — no cookie, no NextResponse wrapping
    return loginUserService(email, password);
  });
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/verify-otp
 * Returns token in JSON body. Frontend stores it in localStorage.
 */
export async function verifyOtpController(request) {
  return handleRequest(async () => {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      throw new ApiError(400, 'email and otp are required.');
    }

    // Returns plain ApiResponse — no cookie wrapping
    return verifyOtpService(email, otp);
  });
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/resend-otp
 */
export async function resendOtpController(request) {
  return handleRequest(async () => {
    const { email } = await request.json();
    if (!email) throw new ApiError(400, 'email is required.');
    return resendOtpService(email);
  });
}

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/logout
 * Protected via withAuth — userId comes from decoded JWT.
 */
export async function logoutController(request, { user }) {
  return handleRequest(async () => {
    return logoutUserService(user.userId);
  });
}

// ─── Get Current User (me) ────────────────────────────────────────────────────

/**
 * GET /api/auth/me
 * Protected via withAuth — userId comes from decoded JWT.
 */
export async function getMeController(request, { user }) {
  return handleRequest(async () => {
    return getCurrentUserService(user.userId);
  });
}
