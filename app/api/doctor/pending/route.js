// GET /api/doctor/pending
// Returns all PENDING_DOCTOR results with patient info
// ============================================================
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
 
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 
    const decoded = verifyToken(token);
    if (!decoded?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
 
    const results = await prisma.labResult.findMany({
      where:   { status: "PENDING_DOCTOR" },
      orderBy: { createdAt: "desc" },
      include: {
        patient: { select: { name: true, mrn: true } },
      },
    });
 
    return NextResponse.json(results);
  } catch (err) {
    console.error("GET_PENDING:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
 