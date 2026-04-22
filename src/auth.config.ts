// Edge-safe subset of the NextAuth config.
//
// This file MUST NOT import anything that relies on Node.js APIs
// (bcrypt, Prisma, fs, etc.) because it is loaded from `proxy.ts`
// which runs on the Edge runtime. The full providers (with Credentials,
// bcrypt and the Prisma adapter) live in `src/auth.ts`.

import type { NextAuthConfig } from "next-auth";

export default {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const pathname = request.nextUrl.pathname;
      const isProtected = pathname.startsWith("/dashboard");
      const isAuthPage = pathname === "/login" || pathname === "/register";

      if (isProtected && !isLoggedIn) return false;
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user && "id" in user && user.id) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
