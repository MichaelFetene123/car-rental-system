import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'car_rental_access_token';
const PUBLIC_ROUTES = new Set(['/', '/login', '/signup']);

const isSafeInternalPath = (path: string | null): path is string =>
  Boolean(path && path.startsWith('/') && !path.startsWith('//'));

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  if (!hasToken && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (
    hasToken &&
    (pathname === '/login' || pathname === '/signup') &&
    isSafeInternalPath(request.nextUrl.searchParams.get('next'))
  ) {
    return NextResponse.redirect(
      new URL(request.nextUrl.searchParams.get('next') ?? '/cars', request.url),
    );
  }

  if (hasToken && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/cars', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
