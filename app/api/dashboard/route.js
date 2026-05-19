import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

// '!' ምልክቱን አስወግደነዋል (ለ JavaScript እንዲሆን)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET(request) {
  try {
    // 1. ኩኪውን አንብብ
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. ቶከኑን አረጋግጥ
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 3. የተጠቃሚውን መረጃ እና የላብ ውጤቶችን ከዳታቤዝ አምጣ
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { 
        labResults: { 
          orderBy: { createdAt: 'desc' } 
        } 
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. AI Interpretation: ውጤቱ ካለ ግን ትርጉም ካልተጻፈለት Gemini እንዲጽፈው እናደርጋለን
    const resultsWithAI = await Promise.all(user.labResults.map(async (res) => {
      // ውጤቱ አልቆ (Completed) ከሆነ ግን ገና AI ካልተረጎመው ብቻ ነው AI የሚጠራው
      if (res.status === "Completed" && !res.interpretation) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const prompt = `As a friendly medical assistant at Alatyon Hospital, explain this lab result to a patient in simple terms: 
                          Test: ${res.testName}, Value: ${res.testValue} ${res.unit}. 
                          Is it normal? What should they do next? Keep it short, encouraging, and clear.`;
          
          const aiResult = await model.generateContent(prompt);
          const explanation = aiResult.response.text();

          // ትርጉሙን ዳታቤዝ ላይ ሴቭ እናድርገው (በሚቀጥለው ጊዜ AI እንዳይጠየቅ ለፍጥነት እና ለኮስት)
          await prisma.labResult.update({
            where: { id: res.id },
            data: { interpretation: explanation }
          });
          
          return { ...res, interpretation: explanation };
        } catch (aiErr) {
          console.error("Gemini AI Error:", aiErr);
          return res; // AI ካልሰራ ውጤቱን ብቻ ይመልስ
        }
      }
      return res;
    }));

    return NextResponse.json({
      name: user.name,
      mrn: user.mrn,
      results: resultsWithAI
    });

  } catch (error) {
    console.error("DASHBOARD_API_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}