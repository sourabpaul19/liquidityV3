// src/middleware.ts  (or middleware.ts at root)
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const publicRoutes = [
  '/welcome',
  '/choose',
  '/login',
  '/otp-verify',
  '/new-account',
  '/outlet',
  '/restaurant',
  '/restaurant-cart',
  '/table',
  '/guest',
  '/my-table',
  '/table-order-success',
  '/bar-order-success',
  '/bar-order-status',
  '/bar-guest',
  '/bar-cart',
  '/bar-order',
  '/bar-order-details',
  '/order-choose',
  '/order-login',
  '/order-otp-verify',
  '/order-new-account',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('MIDDLEWARE HIT:', pathname);

  // Allow Next internals and API
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  // Check auth cookie
  const token = request.cookies.get('auth-token')?.value;
  console.log('TOKEN IN MW:', token);

  if (!token) {
    const loginUrl = new URL('/welcome', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
