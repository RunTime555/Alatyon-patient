import { PrismaClient } from "@prisma/client";

// በ JavaScript 'as unknown as' አይሰራም፣ ስለዚህ እንዲህ እናቀላጥለዋለን
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // ለዴቨሎፕመንት ጊዜ ኳሪዎችን (SQL) ተርሚናል ላይ ለማየት
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;