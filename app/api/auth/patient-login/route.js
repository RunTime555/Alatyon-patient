import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // 1. bcryptjs እዚህ ጋር መጣ

export async function POST(request) {
    try {
        const { identifier, password } = await request.json();

        // ኮንሶል ላይ የመጣውን ዳታ ለማየት
        console.log("=== PATIENT LOGIN ATTEMPT ===");
        console.log("Identifier:", identifier);

        // 1. ታካሚውን መፈለግ (role: 'Patient' መሆኑን በማረጋገጥ)
        const user = await prisma.user.findFirst({
            where: {
                role: 'Patient', // በዳታቤዝሽ 'Patient' ስለሆነ ይገጥማል
                OR: [
                    { email: identifier.toLowerCase() },
                    { mrn: identifier }
                ]
            }
        });

        // ታካሚው ዳታቤዝ ውስጥ ከሌለ
        if (!user) {
            console.log("❌ Login Failed: Patient not found in DB.");
            return NextResponse.json(
                { success: false, error: "የታካሚ መለያ መረጃው ስህተት ነው" }, 
                { status: 401 }
            );
        }

        console.log("Found Patient:", user.email, "Hashed Password in DB:", user.password);

        // 2. በ Bcrypt አማካኝነት የተመሰጠረውን ፓስወርድ ማወዳደር
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("Is Password Valid?:", isPasswordValid);

        if (!isPasswordValid) {
            console.log("❌ Login Failed: Password Mismatch.");
            return NextResponse.json(
                { success: false, error: "የታካሚ መለያ መረጃው ስህተት ነው" }, 
                { status: 401 }
            );
        }

        console.log("✅ Login Success for:", user.name);

        // 3. Token
        const token = signToken({ id: user.id, email: user.email || user.mrn, role: 'Patient' });

        const response = NextResponse.json({ 
            success: true, 
            name: user.name 
        });

        // 4. ኩኪ
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 86400 * 7, 
            path: '/',
        });

        return response;

    } catch (error) {
        console.error("PATIENT_LOGIN_ERROR:", error);
        return NextResponse.json({ error: "የታካሚ ሎጊን አልተሳካም" }, { status: 500 });
    }
}