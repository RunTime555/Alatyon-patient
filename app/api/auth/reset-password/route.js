// app/api/auth/reset-password/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // ✅ Find user by token AND check it hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken:       token,
        resetTokenExpiry: { gt: new Date() }, // must be in the future
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // ✅ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // ✅ Save new password and clear token so link can't be reused
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password:         hashedPassword,
        resetToken:       null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}