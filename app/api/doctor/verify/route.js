import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function PATCH(req) {
  try {
    const { resultId, action, doctorNote } = await req.json();

    const resultData = await prisma.labResult.findUnique({
      where: { id: resultId },
    });

    if (!resultData) return NextResponse.json({ error: "Not Found" }, { status: 404 });

    if (action === "REJECT") {
      await prisma.labResult.update({
        where: { id: resultId },
        data: { status: "Rejected", interpretation: doctorNote || "Rejected" }
      });
      return NextResponse.json({ success: true });
    }

    // AI Analysis
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Medical Analysis: Test ${resultData.testName} is ${resultData.testValue}. Doctor Note: ${doctorNote}. Simple patient explanation (max 60 words).`;
    
    const aiRes = await model.generateContent(prompt);
    const aiText = aiRes.response.text();

    // ⚠️ ዶክተር ኖት እና AI ኢንሳይት በአንድ ላይ
    const combined = `DOCTOR_NOTE: ${doctorNote || "No note."} --- AI_INSIGHT: ${aiText}`;

    await prisma.labResult.update({
      where: { id: resultId },
      data: { 
        status: "Verified", 
        interpretation: combined,
        updatedAt: new Date()
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}