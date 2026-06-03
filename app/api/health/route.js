// app/api/health/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status:      "ok",
      timestamp:   new Date().toISOString(),
      database:    "connected",
      responseMs:  Date.now() - start,
      instance:    process.env.HOSTNAME ?? "unknown",
    });
  } catch {
    return NextResponse.json({
      status:    "error",
      database:  "disconnected",
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}