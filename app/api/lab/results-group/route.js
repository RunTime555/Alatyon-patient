import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mrn = searchParams.get("mrn");
  const dateStr = searchParams.get("date");

  if (!mrn || !dateStr || dateStr === "null") {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: "Invalid Date Format" }, { status: 400 });
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const tests = await prisma.labResult.findMany({
      where: {
        patient: { mrn: mrn },
        createdAt: { gte: startOfDay, lte: endOfDay }
      },
      include: { patient: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      patient: tests[0]?.patient || { name: "Unknown", mrn: mrn },
      tests: tests || []
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}