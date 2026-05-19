import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function GET(req, { params }) {
  try {
    const result = await prisma.labResult.findUnique({
      where: { id: params.id },
      include: { patient: true }
    });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze this lab result for Patient ${result.patient.name}. Test: ${result.testType}, Value: ${result.value}. Provide a structured interpretation, clinical implications, and lifestyle advice for the patient. Keep it professional.`;

    const aiRes = await model.generateContent(prompt);
    return NextResponse.json({ analysis: aiRes.response.text() });
  } catch (error) {
    return NextResponse.json({ error: "AI Failed" }, { status: 500 });
  }
}