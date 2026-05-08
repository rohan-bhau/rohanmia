import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isOnAdmin = nextUrl.pathname.startsWith('/admin');

  if (isOnAdmin && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }
  
  return NextResponse.next();
})

export const config = {
  matcher: ["/admin/:path*"],
};
