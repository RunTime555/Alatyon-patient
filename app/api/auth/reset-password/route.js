import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server"; 
import bcrypt from "bcryptjs";

// TypeScript ካልሆነ (ፋይሉ .js ከሆነ) : NextRequest የሚለው መወገድ አለበት
export async function POST(request) { 
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email and new password are required" }, 
        { status: 400 }
      );
    }

    // 1. Hash the new password for security
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 2. Update the user password in the database
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Password has been reset successfully. You can now login." 
    });

  } catch (error) {
    console.error("RESET_PASSWORD_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." }, 
      { status: 500 }
    );
  }
}