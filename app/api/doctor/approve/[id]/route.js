import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
  try {
    const { finalComment } = await req.json();
    await prisma.labResult.update({
      where: { id: params.id },
      data: {
        doctorComment: finalComment,
        status: "COMPLETED",
        reviewedAt: new Date(),
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Update Failed" }, { status: 500 });
  }
}