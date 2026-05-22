import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const PUBLIC_AUTH_PAGES = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/verify-otp',
  '/auth/forgot-password',
  '/auth/reset-otp',
  '/auth/reset-password',
]);

const PROTECTED_PREFIXES = ['/dashboard'];
const LEGACY_REDIRECTS = ['/admin', '/manager'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('token')?.value;
  const tokenValid = token ? await isValidToken(token) : false;

  if (PUBLIC_AUTH_PAGES.has(pathname)) {
    if (tokenValid) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!tokenValid) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);   // ✅ Yahi asli guard hai
    }
    return NextResponse.next();
  }

  if (LEGACY_REDIRECTS.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

async function isValidToken(token) {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/manager/:path*',
    '/auth/:path*',
  ],
};