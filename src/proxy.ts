import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public routes
  const publicRoutes = ["/login", "/register"];
  const isPublic = publicRoutes.some((r) => pathname.startsWith(r));

  // Allow public routes
  if (isPublic) {
    // If already logged in, redirect away from login/register
    if (isLoggedIn && isPublic) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|api/uploadthing|.*\\.(?:png|jpg|jpeg|svg|ico|webp|gif|css|js|woff|woff2|ttf)$).*)",
  ],
};
