import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "car_rental_access_token";
const PUBLIC_ROUTES = new Set(["/", "/login", "/signup"]);
const ADMIN_ROLE = "admin";

const isSafeInternalPath = (path: string | null): path is string =>
  Boolean(path && path.startsWith("/") && !path.startsWith("//"));

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(`${normalized}${padding}`);
};

const tokenHasRole = (token: string, role: string): boolean => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return false;

    const parsed = JSON.parse(decodeBase64Url(payload)) as {
      roles?: unknown;
    };

    return (
      Array.isArray(parsed.roles) && parsed.roles.some((item) => item === role)
    );
  } catch {
    return false;
  }
};

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const hasToken = Boolean(token);
  const authenticatedRedirectPath =
    token && tokenHasRole(token, ADMIN_ROLE) ? "/dashboard" : "/cars";
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);
  const isDashboardRoute =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (!hasToken && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isDashboardRoute && !tokenHasRole(token, ADMIN_ROLE)) {
    return NextResponse.redirect(new URL("/cars", request.url));
  }

  if (
    hasToken &&
    (pathname === "/login" || pathname === "/signup") &&
    isSafeInternalPath(request.nextUrl.searchParams.get("next"))
  ) {
    return NextResponse.redirect(
      new URL(
        request.nextUrl.searchParams.get("next") ?? authenticatedRedirectPath,
        request.url,
      ),
    );
  }

  if (hasToken && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(
      new URL(authenticatedRedirectPath, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
