import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req;
  const isOnAdmin = nextUrl.pathname.startsWith('/admin');
  const isApiRoute = nextUrl.pathname.startsWith('/api');

  if (isApiRoute) return NextResponse.next();

  // Strict Security: ONLY users authenticated as 'admin' via credentials form can access /admin
  const user = req.auth?.user;
  const isAdmin = user?.role === 'admin' || user?.id === 'admin';

  if (isOnAdmin && !isAdmin) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }
  
  return NextResponse.next();
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
