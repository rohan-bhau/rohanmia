import { NextRequest, NextResponse } from "next/server";

const INTERNAL_ADMIN_PATH = "/control-room-internal";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const secretPath = process.env.ADMIN_ENTRY_PATH || "/arronhaan1841";

  // Direct internal route access -> 404
  if (
    pathname === INTERNAL_ADMIN_PATH ||
    pathname.startsWith(`${INTERNAL_ADMIN_PATH}/`)
  ) {
    const notFoundUrl = new URL('/not-found', request.url);
    return NextResponse.rewrite(notFoundUrl, { status: 404 });
  }

  // Secret URL -> internally serve admin route
  if (
    pathname === secretPath ||
    pathname.startsWith(`${secretPath}/`)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(secretPath, INTERNAL_ADMIN_PATH);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
