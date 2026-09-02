import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of routes that require authentication
const protectedRoutes = [
  "/growth", 
  "/nutrition", 
  "/account", 
  "/address",
  "/appointments", 
  "/baby-profile", 
  "/health-records", 
  "/orders", 
  "/profile", 
  "/settings", 
  "/subscriptions", 
  "/notifications",
  "/shop/cart",
  "/shop/wishlist",
  "/doctor/book"
];

// List of authentication routes (should not be accessible if already logged in)
const authRoutes = [
  "/login",
  "/signup",
  "/forgot-password"
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Check if it's a protected route (exact match or starts with route/)
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if it's an auth route
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If trying to access a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname); // Optional: redirect back after login
    return NextResponse.redirect(url);
  }

  // If trying to access an auth route while already logged in, redirect to home
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Define which paths this middleware should run on.
  // We exclude static files, api routes, and Next.js internals to improve performance.
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons, logos (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)).*)',
  ],
};
