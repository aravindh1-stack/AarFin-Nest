import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isRouteAllowed, normalizeRole, UserRole } from '@/lib/auth/rbac';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith('/dashboard');

  if (!isDashboardRoute) {
    return NextResponse.next();
  }

  const legacySession = request.cookies.get('aarfin_session')?.value;
  const nexfixSessionCookie = request.cookies.get('nexfix_session')?.value;

  // Unauthenticated check
  if (legacySession !== 'authenticated' && !nexfixSessionCookie) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Determine user role
  let role: UserRole = "ADMIN";
  if (nexfixSessionCookie) {
    try {
      const parsed = JSON.parse(nexfixSessionCookie);
      role = normalizeRole(parsed.role);
    } catch {
      role = "ADMIN";
    }
  }

  // Enforce Route Protection based on RBAC
  if (!isRouteAllowed(role, pathname)) {
    // If field officer tries to access root dashboard, redirect to their home (Collections)
    if (role === "FIELD_OFFICER") {
      const collectionsUrl = new URL('/dashboard/collections', request.url);
      return NextResponse.redirect(collectionsUrl);
    }

    // Otherwise redirect to dashboard root with restricted flag
    const fallbackUrl = new URL('/dashboard', request.url);
    fallbackUrl.searchParams.set('unauthorized', '1');
    return NextResponse.redirect(fallbackUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard'],
};
