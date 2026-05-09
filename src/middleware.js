import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isOnAdmin = nextUrl.pathname.startsWith('/admin');
  const isApiRoute = nextUrl.pathname.startsWith('/api');

  if (isApiRoute) return NextResponse.next();

  if (isOnAdmin && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }
  
  return NextResponse.next();
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
