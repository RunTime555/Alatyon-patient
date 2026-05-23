// middleware.js — project ROOT (next to package.json)
// ⚠️  Do NOT import verifyToken here — jsonwebtoken doesn't work on Edge runtime.
//     We just check if the cookie EXISTS here; full verification happens in each API route.

import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/api/auth",
];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Always allow public paths, static files, and API routes
  if (
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  // Check if token cookie exists
  const token = req.cookies.get("token")?.value;

  if (!token) {
    // Not logged in — redirect to login
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists — allow through
  // (each API route does full JWT verification via verifyToken)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};