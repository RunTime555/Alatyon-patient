import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { testName, value, unit } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `As a friendly medical lab assistant, explain this result in 1 simple sentence for a patient: 
    Test: ${testName}, Result: ${value} ${unit}. 
    Is it normal or does it need a doctor's visit? Keep it very simple.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return Response.json({ interpretation: response.text() });
  } catch (error) {
    return Response.json({ error: "AI Error" }, { status: 500 });
  }
}