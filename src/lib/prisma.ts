// Prisma client singleton.
//
// In development, Next.js hot-reloads server code which would otherwise
// create many PrismaClient instances and exhaust the DB connection pool.
// We cache the client on the `globalThis` so only one instance exists.

import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
