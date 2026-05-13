import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    
    // በስኬማሽ መሰረት patientId የሚባለው የ User ሞዴል id (cuid) ነው
    // ነገር ግን የታካሚው MRN (AL-001) ከሆነ መጀመሪያ ተገቢውን User መፈለግ አለብን
    const patientUser = await prisma.user.findUnique({
      where: { mrn: body.patientId } // MRN ተጠቅመን ዩዘሩን እንፈልጋለን
    });

    if (!patientUser) {
      return NextResponse.json({ 
        success: false, 
        error: "ይህ MRN ያለው ታካሚ በሲስተሙ ውስጥ አልተገኘም።" 
      }, { status: 404 });
    }

    const newResult = await prisma.labResult.create({
      data: {
        testName: body.testName,
        category: body.category || "General",
        testValue: body.resultValue, // ስኬማሽ ላይ testValue ስለሆነ
        status: "Completed",
        patientId: patientUser.id, // የተገኘውን የዩዘር ID እዚህ እንጠቀማለን
      },
    });

    return NextResponse.json({ success: true, data: newResult });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "ዳታቤዝ ላይ መመዝገብ አልተቻለም። " + error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const tests = await prisma.labResult.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: { name: true, mrn: true } // የታካሚውን ስም እና MRN እንዲያመጣ
        }
      }
    });
    return NextResponse.json(tests);
  } catch (error) {
    return NextResponse.json({ error: "ዳታ ማምጣት አልተቻለም" }, { status: 500 });
  }
}