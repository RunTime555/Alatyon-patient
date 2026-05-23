// FILE 3:  app/api/doctor/approve/[id]/route.js
// POST /api/doctor/approve/:id
// Approves a result — saves doctor note + AI analysis → COMPLETED
// ============================================================
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
 
export async function POST(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 
    const decoded = verifyToken(token);
    if (!decoded?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
 
    const { id } = await params;
    const { finalComment, doctorNote } = await req.json();
 
    // Build combined interpretation stored in DB
    // Format:  "DOCTOR_NOTE: ...\n\n---\n\nAI_ANALYSIS: ..."
    // This format is parsed by the patient dashboard to show both sections
    const parts = [];
    if (doctorNote?.trim())   parts.push(`DOCTOR_NOTE: ${doctorNote.trim()}`);
    if (finalComment?.trim()) parts.push(`AI_ANALYSIS: ${finalComment.trim()}`);
    const interpretation = parts.join("\n\n---\n\n") || null;
 
    await prisma.labResult.update({
      where: { id },
      data: {
        doctorComment:   doctorNote   ?? null,
        interpretation:  interpretation,
        status:          "COMPLETED",
        reviewedAt:      new Date(),
      },
    });
 
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("APPROVE:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}