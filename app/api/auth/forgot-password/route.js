import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { email } = await request.json();

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      return NextResponse.json({ error: "በዚህ ኢሜይል የተመዘገበ አካውንት የለም!" }, { status: 404 });
    }

    // ለጊዜው በቀላሉ ፓስወርድ መቀየሪያ ገጽ ሊንክ እንላክላቸው
    // ማሳሰቢያ፡ እውነተኛ ፕሮጀክት ላይ እዚህ ጋር 'Reset Token' ይፈጠራል
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?email=${email}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Alatyon Hospital" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'የይለፍ ቃል መቀየርያ (Password Reset)',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h3>ሰላም ${user.name}</h3>
          <p>የይለፍ ቃልዎን ለመቀየር ከታች ያለውን ሊንክ ይጫኑ፡</p>
          <a href="${resetLink}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">ፓስወርድ ቀይር</a>
          <p>ይህንን ጥያቄ እርስዎ ካልላኩ፣ እባክዎ ይህን ኢሜይል ችላ ይበሉት።</p>
        </div>`
    });

    return NextResponse.json({ success: true, message: "የፓስወርድ መቀየሪያ ሊንክ ወደ ኢሜይልዎ ተልኳል!" });

  } catch (error) {
    return NextResponse.json({ error: "ኢሜይል መላክ አልተቻለም" }, { status: 500 });
  }
}