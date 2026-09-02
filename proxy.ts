import { NextRequest, NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(token);

  if (!user || user.role !== 'admin') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
