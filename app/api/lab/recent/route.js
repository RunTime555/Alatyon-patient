import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // 1. የቅርብ ጊዜ 10 ውጤቶችን ከዳታቤዝ መፈለግ
        const recentResults = await prisma.labResult.findMany({
            take: 10, // 10 ውጤቶችን ብቻ አምጣ
            orderBy: {
                createdAt: 'desc' // በአዲስነታቸው ቅደም ተከተል (ከአዲስ ወደ ቆየ)
            },
            include: {
                // የታካሚውን ስም እና MRN ከ User Table ላይ እንዲያካትት
                patient: {
                    select: {
                        name: true,
                        mrn: true
                    }
                }
            }
        });

        // 2. ዳታውን በ JSON መልኩ መመለስ
        return NextResponse.json({ 
            success: true, 
            data: recentResults 
        });

    } catch (error) {
        console.error("RECENT_LAB_FETCH_ERROR:", error);
        return NextResponse.json(
            { success: false, error: "የቅርብ ጊዜ መረጃዎችን ማግኘት አልተቻለም" }, 
            { status: 500 }
        );
    }
}