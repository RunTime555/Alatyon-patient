// FILE 2:  app/api/doctor/analyze/[id]/route.js
// GET /api/doctor/analyze/:id
// Runs Gemini AI on the lab result — returns structured analysis
// ============================================================
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
 
export async function GET(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 
    const decoded = verifyToken(token);
    if (!decoded?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
 
    const { id } = await params;
 
    const result = await prisma.labResult.findUnique({
      where: { id },
      include: { patient: { select: { name: true } } },
    });
 
    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }
 
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
 
    const prompt = `
You are a clinical decision-support AI assistant helping a doctor review a lab result.
 
Patient: ${result.patient?.name ?? "Unknown"}
Test: ${result.testName}
Result Value: ${result.testValue ?? "N/A"} ${result.unit ?? ""}
 
Please provide a structured analysis with these sections:
 
1. INTERPRETATION
   - What does this value indicate? Is it normal, elevated, or critically abnormal?
 
2. CLINICAL IMPLICATIONS
   - What conditions or diagnoses should the doctor consider?
 
3. RECOMMENDED ACTIONS
   - What follow-up tests or actions do you recommend?
 
4. PATIENT MESSAGE (plain language, max 60 words)
   - A simple, reassuring explanation the doctor can share with the patient.
 
Keep the response professional, concise, and clinically accurate.
    `.trim();
 
    const aiRes    = await model.generateContent(prompt);
    const analysis = aiRes.response.text();
 
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("AI_ANALYZE:", err);
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
  }
}
 