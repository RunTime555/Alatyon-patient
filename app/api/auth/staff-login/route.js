import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { identifier, email, password } = await request.json();
        const loginEmail = identifier || email;

        // 1. የሶስቱንም ሰራተኞች ቋሚ መረጃዎች እዚህ ጋር ማስተካከል ትችያለሽ
        const STAFF_ACCOUNTS = {
            admin: {
                email: "admin@alatyon.com",
                password: "admin123",
                role: "Admin",
                name: "System Admin"
            },
            doctor: {
                email: "doctor@alatyon.com",
                password: "doctor123",
                role: "Doctor",
                name: "Dr. Almaz"
            },
            technician: {
                email: "lab@alatyon.com",
                password: "lab123",
                role: "LabTechnician",
                name: "Abebe (Lab Tech)"
            }
        };

        let matchedUser = null;
        const inputEmail = loginEmail?.toLowerCase().trim();

        // 2. የመጣው ኢሜይል ከየትኛው አካውንት ጋር እንደሚገጥም መፈለግ
        if (inputEmail === STAFF_ACCOUNTS.admin.email.toLowerCase()) {
            matchedUser = STAFF_ACCOUNTS.admin;
        } else if (inputEmail === STAFF_ACCOUNTS.doctor.email.toLowerCase()) {
            matchedUser = STAFF_ACCOUNTS.doctor;
        } else if (inputEmail === STAFF_ACCOUNTS.technician.email.toLowerCase()) {
            matchedUser = STAFF_ACCOUNTS.technician;
        }

        // 3. ኢሜይሉ ካልተገኘ ወይም የተሰጠው ፓስወርድ ካልገጠመ
        if (!matchedUser || password !== matchedUser.password) {
            return NextResponse.json(
                { success: false, error: "የገቡት የሰራተኛ መለያ ወይም ፓስወርድ ስህተት ነው" }, 
                { status: 401 }
            );
        }

        // 4. ከተሳካ የየራሳቸውን እውነተኛ መረጃ ይዞ Token ማመንጨት
        const token = signToken({ 
            id: `${matchedUser.role.toLowerCase()}-hardcoded-id`, 
            email: matchedUser.email, 
            role: matchedUser.role 
        });

        const response = NextResponse.json({ 
            success: true, 
            role: matchedUser.role, 
            name: matchedUser.name 
        });

        // 5. ኩኪ ላይ ማስቀመጥ
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400, // 1 ቀን
            path: '/',
        });

        return response;

    } catch (error) {
        console.error("STAFF_HARDCODED_LOGIN_ERROR:", error);
        return NextResponse.json({ error: "የሰራተኛ ሎጊን አልተሳካም" }, { status: 500 });
    }
}