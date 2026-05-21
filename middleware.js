import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// ─── Route Classification ──────────────────────────────────────────────────────

const PUBLIC_AUTH_PAGES = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/verify-otp',
]);

const PROTECTED_PREFIXES = ['/dashboard'];
const LEGACY_REDIRECTS = ['/admin', '/manager'];

// ─── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Token is stored by the client as a regular cookie (set via document.cookie)
  const token = request.cookies.get('token')?.value;
  const tokenValid = token ? await isValidToken(token) : false;

  // ── Public auth pages: redirect logged-in users to dashboard ──────────────
  if (PUBLIC_AUTH_PAGES.has(pathname)) {
    if (tokenValid) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ── Protected pages: require valid token ──────────────────────────────────
  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!tokenValid) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Legacy route redirects ─────────────────────────────────────────────────
  if (LEGACY_REDIRECTS.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// ─── Token Verification ────────────────────────────────────────────────────────

async function isValidToken(token) {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// ─── Route Matcher ────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/manager/:path*',
    '/auth/:path*',
  ],
};
