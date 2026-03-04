// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;

  const isOnApp = pathname.startsWith("/app");
  const isOnAdmin = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  // ログイン済みが /login /signup に来たら /app
  if (isLoggedIn && (isLoginPage || isSignupPage)) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  // /app はログイン必須
  if (isOnApp && !isLoggedIn) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // /admin はログイン必須 + admin
  if (isOnAdmin) {
    if (!isLoggedIn) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    const role = req.auth?.user?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/login", "/signup"],
};