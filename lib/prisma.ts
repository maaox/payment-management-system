/* import { PrismaClient } from "@prisma/client";

declare global {
  // para evitar multiple clients al hacer hot-reload
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma; */
