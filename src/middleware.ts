// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const role = (req.auth?.user as any)?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};