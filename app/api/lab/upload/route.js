import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    // 1. የላክነውን የዳታ Structure መቀበል (patientMrn እና results array)
    const { patientMrn, results } = await req.json();

    // 2. ታካሚውን በ MRN ፈልገን ማግኘት
    const patient = await prisma.user.findUnique({
      where: { mrn: patientMrn },
    });

    if (!patient) {
      return NextResponse.json({ error: "ታካሚው አልተገኘም" }, { status: 404 });
    }

    // 3. ብዙ ምርመራዎችን በአንድ ጊዜ በዳታቤዝ ውስጥ መመዝገብ
    // Promise.all ሁሉንም ምርመራዎች ጎን ለጎን ፈጥኖ እንዲመዘግብ ይረዳናል
    const createdResults = await Promise.all(
  results.map((test) =>
    prisma.labResult.create({
      data: {
        testName: test.testName,
        testValue: String(test.resultValue), // String መሆኑን እናረጋግጥ
        status: "PENDING_DOCTOR", // አሁን ከ Schemaው ጋር ይመሳሰላል
        patientId: patient.id,
      },
    })
  )
);

    // 4. የኢሜይል ማሳወቂያ (ለታካሚው አንድ ጊዜ ብቻ መላክ ይበቃል)
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: patient.email,
        subject: "Lab Result Ready - Alatyon Hospital",
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb;">ሰላም ${patient.name}</h2>
            <p>የላብራቶሪ ምርመራ ውጤቶችሽ ተሞልተው ዶክተር እንዲያያቸው ተልከዋል።</p>
            <p><strong>የምርመራ ብዛት:</strong> ${results.length}</p>
            <hr />
            <p style="font-size: 12px; color: #666;">Alatyon Patient Lab System</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email Error (Ignored):", emailError);
      // ኢሜይል ባይላክ እንኳ ዳታው ስለተመዘገበ ለተጠቃሚው Error አናሳይም
    }

    return NextResponse.json({ success: true, data: createdResults });
  } catch (error) {
    console.error("UPLOAD_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}