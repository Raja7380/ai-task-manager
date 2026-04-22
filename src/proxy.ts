// Edge proxy (formerly "middleware" in Next.js ≤15).
//
// Runs BEFORE every matched request and can redirect, rewrite, or let the
// request through. We use it to guard the /dashboard routes.
//
// Only the edge-safe auth.config is imported here (no Prisma/bcrypt).

import NextAuth from "next-auth";
import authConfig from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Skip static files, Next internals, and the auth API routes.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
