import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // 1. bcrypt አስገቢ

export async function POST(request) {
    try {
        const { identifier, password } = await request.json();

        // 2. ሰራተኛውን መፈለግ
        const user = await prisma.user.findFirst({
            where: {
                email: identifier.toLowerCase(),
                NOT: { role: 'Patient' }
            }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "ተጠቃሚው አልተገኘም" }, 
                { status: 401 }
            );
        }

        // 3. ፓስወርዱን በ bcrypt ማወዳደር (አስፈላጊው ክፍል ይሄ ነው!)
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, error: "የገቡት ፓስወርድ ስህተት ነው" }, 
                { status: 401 }
            );
        }

        // 4. Token ማመንጨት
        const token = signToken({ id: user.id, email: user.email, role: user.role });

        const response = NextResponse.json({ 
            success: true, 
            role: user.role, 
            name: user.name 
        });

        // 5. ኩኪ ላይ ማስቀመጥ
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error("STAFF_LOGIN_ERROR:", error);
        return NextResponse.json({ error: "የሰራተኛ ሎጊን አልተሳካም" }, { status: 500 });
    }
}