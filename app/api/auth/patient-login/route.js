import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { identifier, password } = await request.json();

        // 1. ታካሚውን መፈለግ (role: 'Patient' መሆኑን በማረጋገጥ)
        const user = await prisma.user.findFirst({
            where: {
                role: 'Patient', // ታካሚ ብቻ
                OR: [
                    { email: identifier.toLowerCase() },
                    { mrn: identifier }
                ]
            }
        });

        // 2. ካልተገኘ
        if (!user || user.password !== password) {
            return NextResponse.json(
                { success: false, error: "የታካሚ መለያ መረጃው ስህተት ነው" }, 
                { status: 401 }
            );
        }

        // 3. Token
        const token = signToken({ id: user.id, email: user.email || user.mrn, role: 'Patient' });

        const response = NextResponse.json({ 
            success: true, 
            name: user.name 
        });

        // 4. ኩኪ (ለታካሚ ረዘም ያለ ጊዜ 7 ቀን ብንሰጠው ይመረጣል)
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