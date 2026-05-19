import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const pendingResults = await prisma.labResult.findMany({
      where: {
        status: "PENDING_DOCTOR",
      },
      include: {
        patient: {
          select: {
            name: true,
            mrn: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pendingResults);
  } catch (error) {
    console.error("GET_PENDING_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}