// FILE 4:  app/api/doctor/action/route.js
// PATCH /api/doctor/action
// Handles APPROVE or REJECT with optional doctor note
// Body: { resultId, action: "APPROVE" | "REJECT", doctorNote }
// ============================================================
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
 
export async function PATCH(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 
    const decoded = verifyToken(token);
    if (!decoded?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
 
    const { resultId, action, doctorNote } = await req.json();
 
    if (!resultId || !action) {
      return NextResponse.json({ error: "resultId and action are required" }, { status: 400 });
    }
 
    const result = await prisma.labResult.findUnique({
      where: { id: resultId },
      include: { patient: { select: { name: true } } },
    });
 
    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }
 
    // ── REJECT ──────────────────────────────────────────────
    if (action === "REJECT") {
      await prisma.labResult.update({
        where: { id: resultId },
        data: {
          status:         "REJECTED",
          interpretation: doctorNote ? `REJECTED: ${doctorNote}` : "Rejected by doctor.",
          reviewedAt:     new Date(),
        },
      });
      return NextResponse.json({ success: true });
    }
 
    // ── APPROVE with AI ──────────────────────────────────────
    if (action === "APPROVE") {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
Medical lab result: "${result.testName}" = ${result.testValue ?? "N/A"} ${result.unit ?? ""}.
Doctor note: ${doctorNote ?? "None"}.
Write a simple, reassuring patient explanation in plain language (max 80 words).
      `.trim();
 
      const aiRes  = await model.generateContent(prompt);
      const aiText = aiRes.response.text();
 
      const parts = [];
      if (doctorNote?.trim()) parts.push(`DOCTOR_NOTE: ${doctorNote.trim()}`);
      if (aiText?.trim())     parts.push(`AI_ANALYSIS: ${aiText.trim()}`);
 
      await prisma.labResult.update({
        where: { id: resultId },
        data: {
          status:          "COMPLETED",
          doctorComment:   doctorNote ?? null,
          interpretation:  parts.join("\n\n---\n\n") || null,
          reviewedAt:      new Date(),
        },
      });
 
      return NextResponse.json({ success: true, aiText });
    }
 
    return NextResponse.json({ error: "Invalid action. Use APPROVE or REJECT." }, { status: 400 });
  } catch (err) {
    console.error("DOCTOR_ACTION:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
 
 