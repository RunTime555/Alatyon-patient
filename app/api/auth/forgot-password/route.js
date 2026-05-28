// app/api/auth/forgot-password/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // ✅ Don't reveal whether email exists — always return success
    // This prevents attackers from knowing which emails are registered
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // ✅ Generate secure random token
    const token  = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // expires in 1 hour

    // ✅ Save token + expiry to DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken:       token,
        resetTokenExpiry: expiry,
      },
    });

    // ✅ Link now uses ?token= not ?email=
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from:    `"Alatyon Hospital" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject:  "Password Reset",
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 480px;">
          <h3 style="color: #1e3a5f;">ሰላም ${user.name},</h3>
          <p>Click the link below to reset your password.</p>
          <p style="color:#040609; font-size:13px;">
            This link will expire in 1 hour.
          </p>
          <a href="${resetLink}"
            style="display:inline-block; background:#2563eb; color:white;
                   padding:12px 24px; text-decoration:none; border-radius:6px;
                   font-weight:bold; margin: 16px 0;">
            ፓስወርድ ቀይር
          </a>
          <p style="color:#64748b; font-size:12px; margin-top:16px;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Password reset link sent to your email!",
    });

  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}